from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import (
    Level, SpecialistPathway, Module, Lesson, Quiz,
    LessonProgress, QuizAttempt, Enrollment,
    LevelCertificate, ModuleCertificate, PathwayCertificate, NotificationMarker,
    AcademyCourse, ModulePrerequisite, Assignment, RubricCriterion, AssignmentSubmission, RubricScore,
    Badge, UserBadge, CourseEnrollment, LearningRecord, CourseAnnouncement,
)
from .serializers import (
    LevelSerializer, PathwaySerializer, ModuleSerializer,
    CertificateSerializer, ModuleCertificateSerializer, PathwayCertificateSerializer, CourseEnrollmentSerializer, LearningRecordSerializer, CourseAnnouncementSerializer,
)
from .services import notify_academy, issue_module_certificate, issue_level_certificate, issue_pathway_certificate, record_learning_event, sync_course_enrollment


def level_completed(user, level):
    modules = list(level.modules.filter(active=True, pathway__isnull=True, required=True).order_by("order"))
    return bool(modules) and all(module_completed(user, m) for m in modules)


def previous_core_module(module):
    if module.pathway_id:
        return module.pathway.modules.filter(active=True, required=True, order__lt=module.order).order_by("-order").first()
    return module.level.modules.filter(active=True, required=True, pathway__isnull=True, order__lt=module.order).order_by("-order").first() or Module.objects.filter(active=True, required=True, pathway__isnull=True, level__number__lt=module.level.number).order_by("-level__number", "-order").first()


def level_unlocked(user, level):
    if level.number == 1:
        return True
    prior = Level.objects.filter(active=True, number=level.number - 1).first()
    return bool(prior and level_completed(user, prior))


def pathway_unlocked(user, pathway):
    required = Level.objects.filter(active=True, number=pathway.prerequisite_level).first()
    return bool(required and level_completed(user, required))


def lesson_complete(user, lesson):
    return LessonProgress.objects.filter(user=user, lesson=lesson, completed_at__isnull=False).exists()


def module_completed(user, module):
    lessons = module.lessons.filter(active=True, required=True)
    if any(not lesson_complete(user, lesson) for lesson in lessons):
        return False
    quiz = getattr(module, "quiz", None)
    if quiz is not None and not QuizAttempt.objects.filter(user=user, quiz=quiz, passed=True).exists():
        return False
    required_assignments = module.assignments.filter(active=True, required=True)
    for assignment in required_assignments:
        if not AssignmentSubmission.objects.filter(user=user, assignment=assignment, status="graded", score__gte=assignment.pass_mark).exists():
            return False
    required_labs = module.practice_labs.filter(active=True, required=True)
    for lab in required_labs:
        if not LabSubmission.objects.filter(user=user, lab=lab, status="graded", score__gte=lab.pass_mark).exists():
            return False
    return True


def module_unlocked(user, module):
    if not user.is_authenticated:
        return module.level.number == 1 and module.order == 1 and module.pathway_id is None
    explicit = module.prerequisite_rules.select_related("prerequisite").all()
    for rule in explicit:
        if not module_completed(user, rule.prerequisite):
            return False
        quiz = getattr(rule.prerequisite, "quiz", None)
        if quiz and quiz.pass_mark > rule.minimum_quiz_score:
            required_score = quiz.pass_mark
        else:
            required_score = rule.minimum_quiz_score
        if quiz and not QuizAttempt.objects.filter(user=user, quiz=quiz, passed=True, score__gte=required_score).exists():
            return False
    if module.pathway_id:
        if not pathway_unlocked(user, module.pathway):
            return False
        prior = previous_core_module(module)
        return prior is None or module_completed(user, prior)
    return level_unlocked(user, module.level) and (previous_core_module(module) is None or module_completed(user, previous_core_module(module)))


def pathway_completed(user, pathway):
    modules = list(pathway.modules.filter(active=True, required=True).order_by("order"))
    return bool(modules) and all(module_completed(user, m) for m in modules)


def evaluate_badges(user):
    awards=[]
    rules = Badge.objects.filter(active=True).exclude(trigger_type="manual")
    for badge in rules:
        eligible=False
        if badge.trigger_type == "level_completed":
            level=Level.objects.filter(code=badge.trigger_value).first()
            eligible=bool(level and level_completed(user, level))
        elif badge.trigger_type == "module_completed":
            module=Module.objects.filter(slug=badge.trigger_value).first()
            eligible=bool(module and module_completed(user, module))
        elif badge.trigger_type == "course_completed":
            course=AcademyCourse.objects.filter(code=badge.trigger_value).first()
            eligible=bool(course and course.modules.exists() and all(module_completed(user,m) for m in course.modules.filter(active=True)))
        if eligible:
            award, created = UserBadge.objects.get_or_create(user=user,badge=badge,defaults={"evidence":f"Rule: {badge.trigger_type}={badge.trigger_value}"})
            awards.append(award)
            if created:
                notify_academy(user, f"Research Academy â€” badge earned: {badge.name}", badge.description or f"You earned the {badge.name} badge.", "/research-academy/dashboard", "View achievement")
    return awards


def issue_completed_credentials(user):
    issued = []
    for module in Module.objects.filter(active=True, required=True).select_related("level", "pathway").order_by("level__number", "order"):
        if module_completed(user, module):
            cert = issue_module_certificate(user, module)
            issued.append(cert)
    for level in Level.objects.filter(active=True).order_by("number"):
        if level_completed(user, level):
            cert = issue_level_certificate(user, level)
            issued.append(cert)
            marker, created = NotificationMarker.objects.get_or_create(user=user, level=level, pathway=None, kind="level_completed")
            if created:
                notify_academy(
                    user,
                    f"Research Academy â€” {level.name} completed",
                    f"Congratulations. You completed the {level.name} health-research pathway. Your certificate {cert.certificate_id} is now available.",
                    f"/research-academy/certificate/{cert.certificate_id}",
                    "View certificate",
                )
    for pathway in SpecialistPathway.objects.filter(active=True).order_by("id"):
        if pathway_completed(user, pathway):
            cert = issue_pathway_certificate(user, pathway)
            issued.append(cert)
            marker, created = NotificationMarker.objects.get_or_create(user=user, level=None, pathway=pathway, kind="pathway_completed")
            if created:
                notify_academy(
                    user,
                    f"Research Academy â€” {pathway.name} completed",
                    f"Congratulations. You completed the {pathway.name} specialist pathway. Your certificate {cert.certificate_id} is now available.",
                    f"/research-academy/certificate/{cert.certificate_id}",
                    "View certificate",
                )
    evaluate_badges(user)
    return issued


class AcademyOverviewView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        levels = Level.objects.filter(active=True).prefetch_related("modules", "modules__lessons", "modules__quiz").order_by("number")
        pathways = SpecialistPathway.objects.filter(active=True).prefetch_related("modules", "modules__lessons", "modules__quiz").order_by("id")
        level_data = LevelSerializer(levels, many=True).data
        path_data = PathwaySerializer(pathways, many=True).data
        if request.user.is_authenticated:
            Enrollment.objects.get_or_create(user=request.user)
            for row, level in zip(level_data, levels):
                for module_row, module in zip(row["modules"], level.modules.filter(active=True, pathway__isnull=True).order_by("order")):
                    module_row["unlocked"] = module_unlocked(request.user, module)
                    module_row["completed"] = module_completed(request.user, module)
                    module_row["lesson_completed"] = LessonProgress.objects.filter(user=request.user, lesson__module=module, completed_at__isnull=False).count()
                    module_row["lesson_total"] = module.lessons.filter(active=True, required=True).count()
                row["completed"] = level_completed(request.user, level)
                row["unlocked"] = level_unlocked(request.user, level)
            for prow, pathway in zip(path_data, pathways):
                for module_row, module in zip(prow["modules"], pathway.modules.filter(active=True).order_by("order")):
                    module_row["unlocked"] = module_unlocked(request.user, module)
                    module_row["completed"] = module_completed(request.user, module)
                    module_row["lesson_completed"] = LessonProgress.objects.filter(user=request.user, lesson__module=module, completed_at__isnull=False).count()
                    module_row["lesson_total"] = module.lessons.filter(active=True, required=True).count()
                prow["unlocked"] = pathway_unlocked(request.user, pathway)
                prow["completed"] = pathway_completed(request.user, pathway)
        else:
            for row in level_data:
                row["unlocked"] = row["number"] == 1
                row["completed"] = False
                for module_row in row["modules"]:
                    module_row["unlocked"] = row["number"] == 1 and module_row["order"] == 1
                    module_row["completed"] = False
            for row in path_data:
                row["unlocked"] = False
                row["completed"] = False
                for module_row in row["modules"]:
                    module_row["unlocked"] = False
                    module_row["completed"] = False
        return Response({
            "platform": "Rwanda Student Research Ecosystem",
            "title": "Research Academy",
            "levels": level_data,
            "specialist_pathways": path_data,
            "progression": ["Beginner", "Intermediate", "Advanced", "Research Practitioner", "Research Leader"],
        })


class ModuleDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        module = get_object_or_404(Module.objects.select_related("level", "pathway").prefetch_related("lessons__resources", "quiz__questions__choices"), pk=pk, active=True)
        if not request.user.is_authenticated:
            unlocked = module.level.number == 1 and module.order == 1 and module.pathway_id is None
        else:
            unlocked = module_unlocked(request.user, module)
        if not unlocked:
            return Response({"detail": "Complete the required previous learning before accessing this module."}, status=403)
        payload = ModuleSerializer(module).data
        payload["completed"] = module_completed(request.user, module) if request.user.is_authenticated else False
        payload["quiz_required"] = bool(getattr(module, "quiz", None))
        payload["resources"] = [
            {
                "id": r.id, "title": r.title, "resource_type": r.resource_type,
                "url": r.url, "description": r.description, "source": r.source,
                "required": r.required, "order": r.order,
            } for lesson in module.lessons.filter(active=True).order_by("order") for r in lesson.resources.filter(active=True).order_by("order", "title")
        ]
        payload["learning_components"] = {
            "lessons": module.lessons.filter(active=True).count(),
            "required_lessons": module.lessons.filter(active=True, required=True).count(),
            "resources": LessonResource.objects.filter(lesson__module=module, active=True).count(),
            "practice_labs": PracticeLab.objects.filter(module=module, active=True).count(),
            "discussions": DiscussionPost.objects.filter(module=module, active=True).count(),
        }
        return Response(payload)


class EnrollmentView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        enrollment, created = Enrollment.objects.get_or_create(user=request.user)
        if created:
            notify_academy(request.user, "Welcome to the Research Academy", "Your Academy progress is now enabled. Start with Beginner â€” Foundations for Health Research.", "/research-academy", "Start learning")
        return Response({"enrolled": True, "created": created, "email_updates": enrollment.email_updates, "progress_reminders": enrollment.progress_reminders})
    def patch(self, request):
        enrollment, _ = Enrollment.objects.get_or_create(user=request.user)
        for field in ("email_updates", "progress_reminders"):
            if field in request.data:
                setattr(enrollment, field, bool(request.data[field]))
        enrollment.save(update_fields=["email_updates", "progress_reminders"])
        return Response({"email_updates": enrollment.email_updates, "progress_reminders": enrollment.progress_reminders})


class CompleteLessonView(APIView):
    permission_classes = [IsAuthenticated]
    @transaction.atomic
    def post(self, request, pk):
        lesson = get_object_or_404(Lesson.objects.select_related("module", "module__level", "module__pathway"), pk=pk, active=True)
        if not module_unlocked(request.user, lesson.module):
            return Response({"detail": "This module is locked."}, status=403)
        progress, _ = LessonProgress.objects.get_or_create(user=request.user, lesson=lesson)
        if progress.completed_at is None:
            progress.completed_at = timezone.now()
            progress.save(update_fields=["completed_at"])
        module_done = module_completed(request.user, lesson.module)
        if module_done:
            next_module = None
            if lesson.module.pathway_id:
                next_module = lesson.module.pathway.modules.filter(active=True, required=True, order__gt=lesson.module.order).order_by("order").first()
            else:
                next_module = Module.objects.filter(active=True, required=True, pathway__isnull=True, level__number=lesson.module.level.number, order__gt=lesson.module.order).order_by("order").first()
                if not next_module:
                    next_level = Level.objects.filter(active=True, number=lesson.module.level.number + 1).first()
                    if next_level:
                        next_module = next_level.modules.filter(active=True, required=True, pathway__isnull=True).order_by("order").first()
            if next_module:
                notify_academy(request.user, "Research Academy â€” next module unlocked", f"You completed {lesson.module.title}. The next module, {next_module.title}, is now available.", f"/research-academy/module/{next_module.id}", "Continue learning")
        certs = issue_completed_credentials(request.user)
        return Response({"lesson_completed": True, "module_completed": module_done, "certificates": [getattr(c, "certificate_id", "") for c in certs]})


class SubmitQuizView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, pk):
        quiz = get_object_or_404(
            Quiz.objects.select_related("module", "module__level", "module__pathway").prefetch_related("questions__choices"),
            pk=pk,
        )
        if not module_unlocked(request.user, quiz.module):
            return Response({"detail": "This module is locked."}, status=403)

        answers = request.data.get("answers") or {}
        questions = list(quiz.questions.all())
        selected_ids = {str(k) for k in answers.keys()}
        selected = [q for q in questions if str(q.id) in selected_ids]

        if not selected:
            return Response({"detail": "Please answer at least one question."}, status=400)

        correct = 0
        per_question = []
        for q in selected:
            expected = {str(c.id) for c in q.choices.filter(is_correct=True)}
            supplied = answers.get(str(q.id), answers.get(q.id, []))
            if not isinstance(supplied, list):
                supplied = [supplied]
            supplied = {str(v) for v in supplied}
            is_correct = supplied == expected
            correct += int(is_correct)
            per_question.append({"question": q.id, "correct": is_correct, "explanation": q.explanation})

        score = round(100 * correct / len(selected), 2)
        passed = score >= quiz.pass_mark
        QuizAttempt.objects.create(user=request.user, quiz=quiz, score=score, passed=passed, answers=answers)
        if passed:
            issue_completed_credentials(request.user)
            notify_academy(request.user, "Research Academy - quiz passed", f"You passed {quiz.title} with {score:.0f}%. Your next required learning is now available.", "/research-academy", "Continue learning")
        else:
            notify_academy(request.user, "Research Academy - quiz attempt", f"You scored {score:.0f}% on {quiz.title}. The required pass mark is {quiz.pass_mark}%. Review the lesson material and try again.", f"/research-academy/module/{quiz.module.id}", "Review module")
        return Response({"score": float(score), "passed": passed, "pass_mark": quiz.pass_mark, "results": per_question, "questions_answered": len(selected)})

class CohortListView(APIView):
    permission_classes=[IsAuthenticated]
    def get(self, request):
        qs=CourseCohort.objects.filter(active=True).select_related("level","pathway","whatsapp_community").order_by("starts_at","name")
        return Response([{
            "id": c.id, "name": c.name, "code": c.code, "description": c.description,
            "level": c.level.name if c.level else None, "pathway": c.pathway.name if c.pathway else None,
            "starts_at": c.starts_at, "ends_at": c.ends_at, "capacity": c.capacity,
            "members": c.members.filter(status="active").count(),
            "whatsapp": ({"id": c.whatsapp_community.id, "name": c.whatsapp_community.name, "invite_url": c.whatsapp_community.invite_url} if c.whatsapp_community_id else None),
        } for c in qs])
    def post(self, request):
        level=Level.objects.filter(pk=request.data.get("level_id")).first() if request.data.get("level_id") else None
        pathway=SpecialistPathway.objects.filter(pk=request.data.get("pathway_id")).first() if request.data.get("pathway_id") else None
        cohort=CourseCohort.objects.create(
            level=level, pathway=pathway, name=request.data.get("name","RSRE Research Cohort"),
            code=request.data.get("code") or f"cohort-{timezone.now().strftime('%Y%m%d%H%M%S')}",
            description=request.data.get("description", ""), capacity=int(request.data.get("capacity",50)),
            starts_at=request.data.get("starts_at") or None, ends_at=request.data.get("ends_at") or None, active=True
        )
        CourseCohortMember.objects.get_or_create(cohort=cohort,user=request.user,defaults={"status":"active"})
        return Response({"id":cohort.id,"name":cohort.name,"code":cohort.code},status=201)

class CohortDetailView(APIView):
    permission_classes=[IsAuthenticated]
    def post(self, request, pk):
        cohort=get_object_or_404(CourseCohort,pk=pk,active=True)
        action=request.data.get("action","join")
        if action == "join":
            if cohort.capacity and cohort.members.filter(status="active").count() >= cohort.capacity:
                return Response({"detail":"Cohort is full."},status=409)
            member,_=CourseCohortMember.objects.update_or_create(cohort=cohort,user=request.user,defaults={"status":"active"})
            from .services import notify_academy
            notify_academy(request.user, f"RSRE cohort â€” {cohort.name}", f"You joined {cohort.name}. Use the cohort WhatsApp community when available for peer discussion and announcements.", "/research-academy/dashboard", "Open Academy dashboard")
            return Response({"joined":True,"cohort_id":cohort.id,"status":member.status,"whatsapp_invite":cohort.whatsapp_community.invite_url if cohort.whatsapp_community_id else ""})
        if action == "leave":
            CourseCohortMember.objects.filter(cohort=cohort,user=request.user).update(status="left")
            return Response({"joined":False})
        return Response({"detail":"Unsupported action"},status=400)


class CertificateListView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        return Response({
            "modules": ModuleCertificateSerializer(ModuleCertificate.objects.filter(user=request.user).select_related("module"), many=True).data,
            "levels": CertificateSerializer(LevelCertificate.objects.filter(user=request.user).select_related("level"), many=True).data,
            "pathways": PathwayCertificateSerializer(PathwayCertificate.objects.filter(user=request.user).select_related("pathway"), many=True).data,
        })


class CertificateVerifyView(APIView):
    permission_classes = [AllowAny]
    def get(self, request, certificate_id):
        module = ModuleCertificate.objects.filter(certificate_id=certificate_id).select_related("user", "module").first()
        level = LevelCertificate.objects.filter(certificate_id=certificate_id).select_related("user", "level").first()
        pathway = PathwayCertificate.objects.filter(certificate_id=certificate_id).select_related("user", "pathway").first()
        if not module and not level and not pathway:
            return Response({"valid": False, "detail": "Certificate not found."}, status=404)
        cert = module or level or pathway
        program = module.module.title if module else (level.level.name if level else pathway.pathway.name)
        from .services import certificate_settings
        brand = certificate_settings()
        return Response({
            "valid": cert.status == "valid",
            "certificate_id": cert.certificate_id,
            "holder": cert.user.get_full_name() or cert.user.username,
            "program": program,
            "issued_at": cert.issued_at,
            "status": cert.status,
            "issuer": brand.organization_name,
            "academy_name": brand.academy_name,
            "logo_url": brand.logo_url,
            "signature_name": brand.signature_name,
            "signature_credentials": brand.signature_credentials,
            "signature_title": brand.signature_title,
            "signature_image_url": brand.signature_image_url,
            "institutional_seal_url": request.build_absolute_uri(brand.institutional_seal.url) if getattr(brand, "institutional_seal", None) else brand.institutional_seal_url,
            "official_stamp_url": request.build_absolute_uri(brand.official_stamp.url) if getattr(brand, "official_stamp", None) else brand.stamp_url,
            "signatory_institution": brand.signatory_institution,
            "certificate_template": brand.certificate_template,
            "certificate_footer": brand.certificate_footer,
            "organization_logo": request.build_absolute_uri(brand.organization_logo.url) if getattr(brand, "organization_logo", None) else brand.logo_url,
        })

class LabSubmitView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, pk):
        lab=get_object_or_404(PracticeLab.objects.select_related("module"),pk=pk,active=True)
        if not module_unlocked(request.user, lab.module):
            return Response({"detail":"Complete prerequisite learning before attempting this lab."},status=403)
        attempt=LabSubmission.objects.filter(user=request.user,lab=lab).count()+1
        if lab.attempts_allowed and attempt>lab.attempts_allowed:
            return Response({"detail":"No attempts remaining."},status=409)
        sub=LabSubmission.objects.create(user=request.user,lab=lab,response=request.data.get("response","") )
        notify_academy(request.user,"Research Academy â€” practical lab submitted",f"Your submission for {lab.title} was received.",f"/research-academy/module/{lab.module_id}","Open module")
        return Response({"id":sub.id,"status":sub.status,"submitted_at":sub.submitted_at},status=201)


class AdminLabGradeView(APIView):
    permission_classes = [IsAuthenticated]
    def patch(self, request, pk):
        if not is_academy_admin(request.user): return Response({"detail":"Forbidden"},status=403)
        sub=get_object_or_404(LabSubmission.objects.select_related("lab","user"),pk=pk)
        score=float(request.data.get("score",0))
        sub.score=score; sub.feedback=request.data.get("feedback",""); sub.status="graded"; sub.graded_by=request.user; sub.graded_at=timezone.now(); sub.save(update_fields=["score","feedback","status","graded_by","graded_at"])
        if score>=sub.lab.pass_mark:
            notify_academy(sub.user,"Research Academy â€” lab passed",f"You passed {sub.lab.title} with {score:.0f}%.",f"/research-academy/module/{sub.lab.module_id}","Continue learning")
            issue_completed_credentials(sub.user)
        else:
            notify_academy(sub.user,"Research Academy â€” lab feedback",f"Your {sub.lab.title} lab received {score:.0f}%. Review the feedback and try again if allowed.",f"/research-academy/module/{sub.lab.module_id}","View feedback")
        issue_completed_credentials(sub.user)
        return Response({"id":sub.id,"score":float(sub.score),"status":sub.status,"feedback":sub.feedback})


class CourseListView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        qs = AcademyCourse.objects.filter(active=True).select_related("level", "pathway").prefetch_related("modules")
        data = AcademyCourseSerializer(qs, many=True).data
        for row, course in zip(data, qs):
            row["modules"] = ModuleSerializer(course.modules.filter(active=True).order_by("order"), many=True).data
            if request.user.is_authenticated:
                row["module_progress"] = [
                    {"id": m.id, "completed": module_completed(request.user, m), "unlocked": module_unlocked(request.user, m)}
                    for m in course.modules.filter(active=True).order_by("order")
                ]
        return Response(data)


class CourseDetailView(APIView):
    permission_classes = [AllowAny]
    def get(self, request, pk):
        course = get_object_or_404(AcademyCourse.objects.select_related("level", "pathway"), pk=pk, active=True)
        modules = course.modules.filter(active=True).order_by("order")
        data = AcademyCourseSerializer(course).data
        data["modules"] = []
        for module in modules:
            item = ModuleSerializer(module).data
            item["unlocked"] = module_unlocked(request.user, module) if request.user.is_authenticated else (module.level.number == 1 and module.order == 1 and module.pathway_id is None)
            item["completed"] = module_completed(request.user, module) if request.user.is_authenticated else False
            item["assignments"] = AssignmentSerializer(module.assignments.filter(active=True), many=True).data
            data["modules"].append(item)
        return Response(data)


class AssignmentSubmitView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, pk):
        assignment = get_object_or_404(Assignment.objects.select_related("module"), pk=pk, active=True)
        if not module_unlocked(request.user, assignment.module):
            return Response({"detail":"Complete the required previous learning before submitting this assignment."}, status=403)
        previous = AssignmentSubmission.objects.filter(user=request.user, assignment=assignment).order_by("-attempt_number").first()
        attempt = (previous.attempt_number + 1) if previous else 1
        if assignment.attempts_allowed and attempt > assignment.attempts_allowed:
            return Response({"detail":"No attempts remaining."}, status=409)
        submission = AssignmentSubmission.objects.create(
            assignment=assignment, user=request.user, response_text=str(request.data.get("response_text", "")),
            file_url=request.data.get("file_url", ""), external_url=request.data.get("external_url", ""), attempt_number=attempt
        )
        notify_academy(request.user, "Research Academy â€” assignment submitted", f"Your submission for {assignment.title} was received and is awaiting grading.", f"/research-academy/module/{assignment.module_id}", "Open module")
        return Response(AssignmentSubmissionSerializer(submission).data, status=201)


class MyAssignmentSubmissionsView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        qs = AssignmentSubmission.objects.filter(user=request.user).select_related("assignment", "assignment__module").prefetch_related("rubric_scores")
        return Response(AssignmentSubmissionSerializer(qs, many=True).data)


class AdminAssignmentView(APIView):
    permission_classes = [IsAuthenticated]
    def _guard(self, request):
        return is_academy_admin(request.user)
    def post(self, request):
        if not self._guard(request): return Response({"detail":"Forbidden"},status=403)
        assignment = AssignmentSerializer(data=request.data); assignment.is_valid(raise_exception=True); obj=assignment.save();
        for criterion in request.data.get("rubric_criteria", []):
            RubricCriterion.objects.create(assignment=obj, **{k:v for k,v in criterion.items() if k in {"title","description","max_points","order"}})
        return Response(AssignmentSerializer(obj).data,status=201)


class AdminAssignmentGradeView(APIView):
    permission_classes = [IsAuthenticated]
    def patch(self, request, pk):
        if not is_academy_admin(request.user): return Response({"detail":"Forbidden"},status=403)
        submission = get_object_or_404(AssignmentSubmission.objects.select_related("assignment", "user"), pk=pk)
        scores = request.data.get("rubric_scores", [])
        total = 0
        for item in scores:
            criterion = get_object_or_404(RubricCriterion, pk=item.get("criterion_id"), assignment=submission.assignment)
            score = float(item.get("points",0))
            RubricScore.objects.update_or_create(submission=submission, criterion=criterion, defaults={"points":score,"feedback":item.get("feedback","")})
            total += score
        max_total = sum(float(c.max_points) for c in submission.assignment.rubric_criteria.all()) or submission.assignment.max_score
        pct = round((total / max_total) * 100, 2) if max_total else 0
        submission.score=pct; submission.status="graded"; submission.feedback=request.data.get("feedback",""); submission.graded_by=request.user; submission.graded_at=timezone.now(); submission.save(update_fields=["score","status","feedback","graded_by","graded_at"])
        if pct >= submission.assignment.pass_mark:
            notify_academy(submission.user, "Research Academy â€” assignment graded", f"You passed {submission.assignment.title} with {pct:.0f}%.", f"/research-academy/module/{submission.assignment.module_id}", "Continue learning")
            issue_completed_credentials(submission.user)
        else:
            notify_academy(submission.user, "Research Academy â€” feedback available", f"Your {submission.assignment.title} submission received {pct:.0f}%. Review the feedback and resubmit if permitted.", f"/research-academy/module/{submission.assignment.module_id}", "View feedback")
        issue_completed_credentials(submission.user)
        return Response(AssignmentSubmissionSerializer(submission).data)


class AdminPrerequisiteView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        if not is_academy_admin(request.user): return Response({"detail":"Forbidden"},status=403)
        obj, _ = ModulePrerequisite.objects.update_or_create(module_id=request.data["module_id"], prerequisite_id=request.data["prerequisite_id"], defaults={"minimum_quiz_score":request.data.get("minimum_quiz_score",80)})
        return Response({"id":obj.id,"module_id":obj.module_id,"prerequisite_id":obj.prerequisite_id,"minimum_quiz_score":obj.minimum_quiz_score},status=201)
    def delete(self, request, pk):
        if not is_academy_admin(request.user): return Response({"detail":"Forbidden"},status=403)
        ModulePrerequisite.objects.filter(pk=pk).delete(); return Response(status=204)


# =========================================================
# ACADEMY ADMIN / LEARNING OPERATIONS
# =========================================================

from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .models import StudentQuestion, AcademyAnnouncement, CertificateSettings, Question, Choice, Badge, UserBadge, DiagnosticAssessment, DiagnosticAttempt, PracticeLab, LabSubmission, CaseStudy, LiveSession, DiscussionPost, CourseVersion, LessonResource, CourseCohort, CourseCohortMember


def is_academy_admin(user):
    return bool(
        user.is_authenticated
        and (getattr(user, "is_superuser", False) or getattr(user, "role", None) == "administrator")
    )


def admin_required(request):
    return is_academy_admin(request.user)



class CourseEnrollmentView(APIView):
    permission_classes=[IsAuthenticated]
    def post(self, request, pk):
        course=get_object_or_404(AcademyCourse,pk=pk,active=True)
        obj,_=CourseEnrollment.objects.get_or_create(user=request.user,course=course)
        if obj.status=="waitlisted": obj.status="active"; obj.save(update_fields=["status"])
        record_learning_event(request.user,"enrolled",course.title,"course",course.id,{"course_code":course.code})
        notify_academy(request.user,"Research Academy â€” enrolled",f"You are enrolled in {course.title}.",f"/research-academy/course/{course.id}","Open course")
        return Response(CourseEnrollmentSerializer(obj).data,status=201)

    def get(self, request):
        qs=CourseEnrollment.objects.filter(user=request.user).select_related("course")
        return Response(CourseEnrollmentSerializer(qs,many=True).data)

class LearningDashboardView(APIView):
    permission_classes=[IsAuthenticated]
    def get(self, request):
        enrollments=CourseEnrollment.objects.filter(user=request.user).select_related("course")
        for obj in enrollments:
            sync_course_enrollment(request.user,obj.course)
        enrollments=CourseEnrollment.objects.filter(user=request.user).select_related("course")
        records=LearningRecord.objects.filter(user=request.user)[:30]
        return Response({"enrollments":CourseEnrollmentSerializer(enrollments,many=True).data,"records":LearningRecordSerializer(records,many=True).data,"certificates":CertificateSerializer(LevelCertificate.objects.filter(user=request.user).select_related("level"),many=True).data})

class CourseAnnouncementView(APIView):
    permission_classes=[IsAuthenticated]
    def get(self, request, pk):
        course=get_object_or_404(AcademyCourse,pk=pk,active=True)
        items=course.announcements.filter(published=True).order_by("-created_at")[:20]
        return Response(CourseAnnouncementSerializer(items,many=True).data)

class AdminCourseAnnouncementView(APIView):
    permission_classes=[IsAuthenticated]
    def post(self,request,pk):
        if not is_academy_admin(request.user): return Response({"detail":"Forbidden"},status=403)
        course=get_object_or_404(AcademyCourse,pk=pk)
        obj=CourseAnnouncement.objects.create(course=course,created_by=request.user,**{k:request.data.get(k) for k in ["title","message","scheduled_for","published"] if k in request.data})
        return Response(CourseAnnouncementSerializer(obj).data,status=201)


class AcademyAdminDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not admin_required(request):
            return Response({"detail": "Academy administrator access required."}, status=403)
        enrollments = Enrollment.objects.select_related("user").all()
        return Response({
            "students": enrollments.count(),
            "active_students": enrollments.filter(user__is_active=True).count(),
            "levels": Level.objects.filter(active=True).count(),
            "modules": Module.objects.filter(active=True).count(),
            "lessons": Lesson.objects.filter(active=True).count(),
            "quizzes": Quiz.objects.count(),
            "questions": Question.objects.count(),
            "open_questions": StudentQuestion.objects.filter(status="open").count(),
            "answered_questions": StudentQuestion.objects.filter(status="answered").count(),
            "level_certificates": LevelCertificate.objects.filter(status="valid").count(),
            "pathway_certificates": PathwayCertificate.objects.filter(status="valid").count(),
        })


class AcademyAdminCoursesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not admin_required(request):
            return Response({"detail": "Academy administrator access required."}, status=403)
        rows = []
        for level in Level.objects.all().order_by("number"):
            modules = level.modules.filter(pathway__isnull=True).order_by("order")
            rows.append({
                "id": level.id, "number": level.number, "name": level.name,
                "description": level.description, "required_pass_mark": level.required_pass_mark,
                "active": level.active,
                "modules": [{
                    "id": m.id, "order": m.order, "title": m.title, "summary": m.summary,
                    "estimated_minutes": m.estimated_minutes, "required": m.required, "active": m.active,
                    "lesson_count": m.lessons.filter(active=True).count(),
                    "resources": [{"id":r.id,"lesson_id":r.lesson_id,"title":r.title,"resource_type":r.resource_type,"url":r.url,"description":r.description,"source":r.source,"required":r.required,"order":r.order,"active":r.active} for r in LessonResource.objects.filter(lesson__module=m).order_by("lesson__order","order","title")],
                    "practice_labs": list(m.practice_labs.filter(active=True).values("id","title","description")),
                    "discussion_posts": m.discussion_posts.filter(active=True).count(),
                    "has_quiz": hasattr(m, "quiz"),
                    "quiz": ({
                        "id": m.quiz.id, "title": m.quiz.title, "pass_mark": m.quiz.pass_mark,
                        "questions": [{
                            "id": q.id, "order": q.order, "prompt": q.prompt, "question_type": q.question_type,
                            "explanation": q.explanation, "choices": [{"id": c.id, "text": c.text, "is_correct": c.is_correct} for c in q.choices.all()]
                        } for q in m.quiz.questions.prefetch_related("choices").all()]
                    } if hasattr(m, "quiz") else None),
                } for m in modules],
            })
        pathways = [{
            "id": p.id, "name": p.name, "code": p.code,
            "description": p.description, "prerequisite_level": p.prerequisite_level,
            "required_pass_mark": p.required_pass_mark, "active": p.active,
            "modules": list(p.modules.filter(active=True).order_by("order").values("id", "order", "title", "summary", "estimated_minutes", "required", "active")),
        } for p in SpecialistPathway.objects.all().order_by("id")]
        return Response({"levels": rows, "pathways": pathways})

    def post(self, request):
        if not admin_required(request):
            return Response({"detail": "Academy administrator access required."}, status=403)
        level = Level.objects.create(
            number=request.data.get("number"),
            name=request.data.get("name"),
            code=request.data.get("code"),
            description=request.data.get("description", ""),
            required_pass_mark=int(request.data.get("required_pass_mark", 80)),
            active=bool(request.data.get("active", True)),
        )
        return Response({"id": level.id, "name": level.name}, status=201)


class AcademyAdminLevelDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        if not admin_required(request):
            return Response({"detail": "Academy administrator access required."}, status=403)
        level = get_object_or_404(Level, pk=pk)
        for field in ("number", "name", "code", "description", "required_pass_mark", "active"):
            if field in request.data:
                setattr(level, field, request.data[field])
        level.save()
        return Response({"id": level.id, "name": level.name, "active": level.active})


class AcademyAdminModuleView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        if not admin_required(request):
            return Response({"detail": "Academy administrator access required."}, status=403)
        module = get_object_or_404(Module, pk=pk)
        for field in ("order", "title", "slug", "summary", "objectives", "estimated_minutes", "required", "active"):
            if field in request.data:
                setattr(module, field, request.data[field])
        module.save()
        return Response({"id": module.id, "title": module.title, "active": module.active})

    def post(self, request, pk=None):
        if not admin_required(request):
            return Response({"detail": "Academy administrator access required."}, status=403)
        level = get_object_or_404(Level, pk=request.data.get("level_id"))
        pathway = SpecialistPathway.objects.filter(pk=request.data.get("pathway_id")).first() if request.data.get("pathway_id") else None
        module = Module.objects.create(
            level=level,
            pathway=pathway,
            order=int(request.data.get("order", 1)),
            title=request.data.get("title", "New Module"),
            slug=request.data.get("slug", request.data.get("title", "new-module").lower().replace(" ", "-")),
            summary=request.data.get("summary", ""),
            objectives=request.data.get("objectives", []),
            estimated_minutes=int(request.data.get("estimated_minutes", 60)),
            required=bool(request.data.get("required", True)),
            active=bool(request.data.get("active", True)),
        )
        return Response({"id": module.id, "title": module.title}, status=201)


class AcademyAdminLessonView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not admin_required(request):
            return Response({"detail": "Academy administrator access required."}, status=403)
        module = get_object_or_404(Module, pk=request.data.get("module_id"))
        lesson = Lesson.objects.create(
            module=module,
            order=int(request.data.get("order", 1)),
            title=request.data.get("title", "New Lesson"),
            lesson_type=request.data.get("lesson_type", "text"),
            body=request.data.get("body", ""),
            video_url=request.data.get("video_url", ""),
            resource_urls=request.data.get("resource_urls", []),
            estimated_minutes=int(request.data.get("estimated_minutes", 15)),
            required=bool(request.data.get("required", True)),
            active=bool(request.data.get("active", True)),
        )
        return Response({"id": lesson.id, "title": lesson.title}, status=201)

    def patch(self, request, pk):
        if not admin_required(request):
            return Response({"detail": "Academy administrator access required."}, status=403)
        lesson = get_object_or_404(Lesson, pk=pk)
        for field in ("order", "title", "lesson_type", "body", "video_url", "resource_urls", "estimated_minutes", "required", "active"):
            if field in request.data:
                setattr(lesson, field, request.data[field])
        lesson.save()
        return Response({"id": lesson.id, "title": lesson.title, "active": lesson.active})


class AcademyAdminQuizView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        if not admin_required(request):
            return Response({"detail": "Academy administrator access required."}, status=403)
        quiz = get_object_or_404(Quiz, pk=pk)
        if "title" in request.data:
            quiz.title = request.data["title"]
        if "pass_mark" in request.data:
            quiz.pass_mark = int(request.data["pass_mark"])
        if "attempts_allowed" in request.data:
            quiz.attempts_allowed = int(request.data["attempts_allowed"])
        quiz.save()
        return Response({"id": quiz.id, "title": quiz.title, "pass_mark": quiz.pass_mark})


class AcademyAdminQuestionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not admin_required(request):
            return Response({"detail": "Academy administrator access required."}, status=403)
        quiz = get_object_or_404(Quiz, pk=request.data.get("quiz_id"))
        q = Question.objects.create(
            quiz=quiz,
            order=int(request.data.get("order", quiz.questions.count() + 1)),
            prompt=request.data.get("prompt", ""),
            question_type=request.data.get("question_type", "single"),
            explanation=request.data.get("explanation", ""),
        )
        for idx, choice in enumerate(request.data.get("choices", []), start=1):
            Choice.objects.create(question=q, order=idx, text=choice.get("text", ""), is_correct=bool(choice.get("is_correct", False)))
        return Response({"id": q.id, "prompt": q.prompt}, status=201)

    def patch(self, request, pk):
        if not admin_required(request):
            return Response({"detail": "Academy administrator access required."}, status=403)
        q = get_object_or_404(Question, pk=pk)
        for field in ("order", "prompt", "question_type", "explanation"):
            if field in request.data:
                setattr(q, field, request.data[field])
        q.save()
        if "choices" in request.data:
            q.choices.all().delete()
            for idx, choice in enumerate(request.data.get("choices", []), start=1):
                Choice.objects.create(question=q, order=idx, text=choice.get("text", ""), is_correct=bool(choice.get("is_correct", False)))
        return Response({"id": q.id, "prompt": q.prompt})


class StudentQuestionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = StudentQuestion.objects.filter(user=request.user).select_related("lesson", "lesson__module")
        return Response([{
            "id": x.id, "subject": x.subject, "question": x.question, "answer": x.answer,
            "status": x.status, "created_at": x.created_at, "lesson": x.lesson.title if x.lesson else None,
        } for x in qs])

    def post(self, request):
        lesson = Lesson.objects.filter(pk=request.data.get("lesson_id"), active=True).first() if request.data.get("lesson_id") else None
        q = StudentQuestion.objects.create(user=request.user, lesson=lesson, subject=request.data.get("subject", "Academy question"), question=request.data.get("question", ""))
        return Response({"id": q.id, "status": q.status}, status=201)


class AcademyAdminStudentsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not admin_required(request):
            return Response({"detail": "Academy administrator access required."}, status=403)
        rows = []
        for enrollment in Enrollment.objects.select_related("user").order_by("-enrolled_at"):
            user = enrollment.user
            total_lessons = Lesson.objects.filter(active=True, required=True).count()
            done = LessonProgress.objects.filter(user=user, completed_at__isnull=False, lesson__active=True, lesson__required=True).count()
            attempts = QuizAttempt.objects.filter(user=user)
            avg = round(sum(float(a.score) for a in attempts) / attempts.count(), 1) if attempts.exists() else 0
            certs = LevelCertificate.objects.filter(user=user).count() + PathwayCertificate.objects.filter(user=user).count()
            rows.append({"id": user.id, "name": user.get_full_name() or user.username, "email": user.email, "enrolled_at": enrollment.enrolled_at, "progress": round(done / total_lessons * 100) if total_lessons else 0, "quiz_average": avg, "certificates": certs, "email_updates": enrollment.email_updates})
        return Response(rows)


class AcademyAdminQuestionsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not admin_required(request):
            return Response({"detail": "Academy administrator access required."}, status=403)
        qs = StudentQuestion.objects.select_related("user", "lesson", "answered_by").all()
        return Response([{
            "id": x.id, "student": x.user.get_full_name() or x.user.username, "email": x.user.email,
            "subject": x.subject, "question": x.question, "answer": x.answer, "status": x.status,
            "lesson": x.lesson.title if x.lesson else None, "created_at": x.created_at,
        } for x in qs])


class AcademyAdminQuestionReplyView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        if not admin_required(request):
            return Response({"detail": "Academy administrator access required."}, status=403)
        q = get_object_or_404(StudentQuestion, pk=pk)
        q.answer = request.data.get("answer", "")
        q.status = request.data.get("status", "answered")
        q.answered_by = request.user
        q.answered_at = timezone.now()
        q.save(update_fields=["answer", "status", "answered_by", "answered_at"])
        notify_academy(q.user, "Research Academy â€” your question was answered", f"Your Academy question '{q.subject}' has been answered. Open the Academy support area to view the response.", "/research-academy", "Open Research Academy")
        return Response({"id": q.id, "status": q.status})


class AcademyAdminCertificateSettingsView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request):
        if not admin_required(request):
            return Response({"detail": "Academy administrator access required."}, status=403)
        obj = certificate_settings()
        return Response(self.serialize(obj, request))

    def patch(self, request):
        if not admin_required(request):
            return Response({"detail": "Academy administrator access required."}, status=403)
        obj = certificate_settings()
        simple = ("organization_name", "academy_name", "signature_name", "signature_credentials", "signature_title", "signatory_institution", "certificate_footer", "verification_base_url", "certificate_template")
        for field in simple:
            if field in request.data:
                setattr(obj, field, request.data[field])
        for field in ("organization_logo", "signature_image", "institutional_seal", "official_stamp"):
            if field in request.FILES:
                setattr(obj, field, request.FILES[field])
        obj.save()
        return Response(self.serialize(obj, request))

    @staticmethod
    def serialize(obj, request):
        def url(field):
            f = getattr(obj, field, None)
            return request.build_absolute_uri(f.url) if f else ""
        return {
            "organization_name": obj.organization_name,
            "academy_name": obj.academy_name,
            "logo_url": url("organization_logo") or obj.logo_url,
            "signature_name": obj.signature_name,
            "signature_credentials": obj.signature_credentials,
            "signature_title": obj.signature_title,
            "signatory_institution": obj.signatory_institution,
            "signature_image_url": url("signature_image") or obj.signature_image_url,
            "institutional_seal_url": url("institutional_seal") or obj.institutional_seal_url,
            "official_stamp_url": url("official_stamp"),
            "certificate_footer": obj.certificate_footer,
            "verification_base_url": obj.verification_base_url,
            "certificate_template": obj.certificate_template,
        }


class AcademyEnhancementsView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        labs = list(PracticeLab.objects.filter(active=True).select_related('module').values('id','title','description','instructions','module_id'))
        cases = list(CaseStudy.objects.filter(active=True).values('id','title','country','topic','scenario','questions'))
        sessions = list(LiveSession.objects.filter(active=True).values('id','title','description','starts_at','duration_minutes','meeting_url','recording_url','registration_url','speaker'))
        badges = list(Badge.objects.filter(active=True).values('id','name','code','description','icon'))
        versions = list(CourseVersion.objects.filter(active=True).values('id','level_id','module_id','version','release_notes','created_at'))
        data={'practice_labs':labs,'case_studies':cases,'live_sessions':sessions,'badges':badges,'course_versions':versions,'guideline_map':[
            {'design':'Randomized controlled trial','guideline':'CONSORT','url':'https://www.consort-statement.org/'},
            {'design':'Observational study','guideline':'STROBE','url':'https://www.strobe-statement.org/'},
            {'design':'Systematic review/meta-analysis','guideline':'PRISMA','url':'https://www.prisma-statement.org/'},
            {'design':'Diagnostic accuracy','guideline':'STARD','url':'https://www.equator-network.org/reporting-guidelines/stard/'},
            {'design':'Prediction model','guideline':'TRIPOD','url':'https://www.tripod-statement.org/'},
            {'design':'Case report','guideline':'CARE','url':'https://www.care-statement.org/'},
            {'design':'Qualitative interview/focus group','guideline':'COREQ','url':'https://www.equator-network.org/reporting-guidelines/coreq/'},
        ],'resources':{'NIH':'https://ocreco.od.nih.gov/clinical_research_training.html','WHO Ethics':'https://www.who.int/southeastasia/our-work/research-and-innovation/research-capacity-building','EQUATOR':'https://www.equator-network.org/reporting-guidelines/','Rwanda Human Research Law':'https://rwandalii.org/akn/rw/act/law/2022/15/eng@2022-08-12'}}
        if request.user.is_authenticated:
            data['my_badges']=list(UserBadge.objects.filter(user=request.user).select_related('badge').values('badge__name','badge__code','badge__icon','awarded_at','evidence'))
            data['my_diagnostic']=list(DiagnosticAttempt.objects.filter(user=request.user).order_by('-submitted_at').values('score','recommended_level','submitted_at')[:5])
        return Response(data)


class DiagnosticAssessmentView(APIView):
    permission_classes=[IsAuthenticated]
    def get(self,request):
        a=DiagnosticAssessment.objects.filter(active=True).first()
        if not a: return Response({'available':False,'message':'Entry assessment is not configured yet.'})
        return Response({'available':True,'title':a.title,'description':a.description,'pass_mark':a.pass_mark,'questions':a.questions})
    def post(self,request):
        a=get_object_or_404(DiagnosticAssessment,active=True)
        questions=a.questions or []
        answers=request.data.get('answers') or {}
        total=len(questions) or 1; correct=0
        for i,q in enumerate(questions):
            if str(answers.get(str(i), answers.get(i,''))) == str(q.get('answer')): correct += 1
        score=round(100*correct/total,2)
        recommended=1 if score < 60 else 2 if score < 75 else 3 if score < 90 else 4
        DiagnosticAttempt.objects.create(user=request.user,assessment=a,score=score,recommended_level=recommended,answers=answers)
        notify_academy(request.user,'Research Academy â€” entry assessment result',f'Your diagnostic assessment score is {score:.0f}%. Recommended starting level: {recommended}.','/research-academy','View Academy')
        return Response({'score':score,'recommended_level':recommended,'pass_mark':a.pass_mark})


class PracticeLabView(APIView):
    permission_classes=[IsAuthenticated]
    def get(self,request,pk):
        lab=get_object_or_404(PracticeLab,pk=pk,active=True)
        return Response({'id':lab.id,'title':lab.title,'description':lab.description,'instructions':lab.instructions,'rubric':lab.rubric})
    def post(self,request,pk):
        lab=get_object_or_404(PracticeLab,pk=pk,active=True)
        response=(request.data.get('response') or '').strip()
        if not response: return Response({'detail':'Response is required.'},status=400)
        sub=LabSubmission.objects.create(user=request.user,lab=lab,response=response)
        return Response({'id':sub.id,'status':'submitted'})


class PracticeLabGenerateQuestionsView(APIView):
    permission_classes=[IsAuthenticated]
    def post(self,request,pk):
        lab=get_object_or_404(PracticeLab,pk=pk,active=True)
        count=max(1,min(int(request.data.get("count",3)),5))
        rub=lab.rubric if isinstance(lab.rubric,list) else []
        prompts=[]
        for i in range(count):
            criterion=rub[i % len(rub)] if rub else {}
            focus=(criterion.get("title") or criterion.get("name") or "the method") if isinstance(criterion,dict) else "the method"
            prompts.append({"prompt": f"How would you demonstrate {focus.lower()} in the context of {lab.title}? State your reasoning and one check you would use to avoid a common error."})
        return Response({"questions":prompts,"mode":"guided_practice","notice":"These are practice prompts generated from the lab rubric; they are not graded assessment questions."})


class DiscussionView(APIView):
    permission_classes=[IsAuthenticated]
    def get(self,request,module_id):
        return Response(list(DiscussionPost.objects.filter(module_id=module_id,active=True).select_related('user').values('id','title','body','created_at','user__username')))
    def post(self,request,module_id):
        post=DiscussionPost.objects.create(user=request.user,module_id=module_id,title=request.data.get('title','Question'),body=request.data.get('body',''))
        return Response({'id':post.id,'title':post.title},status=201)


class AIResearchCoachView(APIView):
    permission_classes=[IsAuthenticated]
    def post(self,request):
        text=(request.data.get('text') or '').strip(); mode=(request.data.get('mode') or 'hint').strip()
        if not text: return Response({'detail':'Text is required.'},status=400)
        templates={
            'hint':'Think about the research question first. What population, exposure/intervention and outcome are you actually trying to define?',
            'explain':'Break the concept into: definition â†’ why it matters â†’ health-research example â†’ common mistake â†’ quick self-test.',
            'check':'Check whether your answer aligns with the study design, ethics requirements and evidence. Do not rely on an unsupported claim.',
        }
        return Response({'mode':mode,'response':templates.get(mode,templates['hint']),'accountability':'Use this as a learning hint. Verify important claims in authoritative sources and complete the assessment yourself.'})


class ReportingGuidelineWizardView(APIView):
    permission_classes=[AllowAny]
    def get(self,request):
        design=(request.query_params.get('design') or '').lower()
        mapping=[('random','CONSORT','https://www.consort-statement.org/'),('observational','STROBE','https://www.strobe-statement.org/'),('systematic','PRISMA','https://www.prisma-statement.org/'),('meta-analysis','PRISMA','https://www.prisma-statement.org/'),('diagnostic','STARD','https://www.equator-network.org/reporting-guidelines/stard/'),('prediction','TRIPOD','https://www.tripod-statement.org/'),('case report','CARE','https://www.care-statement.org/'),('qualitative','COREQ','https://www.equator-network.org/reporting-guidelines/coreq/') ]
        match=next((x for x in mapping if x[0] in design),None)
        return Response({'design':design,'guideline':match[1] if match else None,'url':match[2] if match else 'https://www.equator-network.org/reporting-guidelines/'})


class AcademyAdminEnhancementsView(APIView):
    permission_classes=[IsAuthenticated]
    def post(self,request):
        if not admin_required(request): return Response({'detail':'Academy administrator access required.'},status=403)
        kind=request.data.get('kind')
        if kind=='badge':
            obj=Badge.objects.create(name=request.data['name'],code=request.data.get('code',request.data['name'].lower().replace(' ','-')),description=request.data.get('description',''),icon=request.data.get('icon','ðŸ…'))
            return Response({'id':obj.id,'name':obj.name},status=201)
        if kind=='lab':
            obj=PracticeLab.objects.create(module_id=request.data.get('module_id') or None,title=request.data['title'],description=request.data.get('description',''),instructions=request.data.get('instructions',''),rubric=request.data.get('rubric',[]))
            return Response({'id':obj.id,'title':obj.title},status=201)
        if kind=='case':
            obj=CaseStudy.objects.create(title=request.data['title'],country=request.data.get('country','Rwanda'),topic=request.data.get('topic','Health research'),scenario=request.data.get('scenario',''),questions=request.data.get('questions',[]))
            return Response({'id':obj.id,'title':obj.title},status=201)
        if kind=='session':
            obj=LiveSession.objects.create(title=request.data['title'],description=request.data.get('description',''),starts_at=request.data['starts_at'],duration_minutes=int(request.data.get('duration_minutes',60)),meeting_url=request.data.get('meeting_url',''),recording_url=request.data.get('recording_url',''),registration_url=request.data.get('registration_url',''),speaker=request.data.get('speaker',''))
            return Response({'id':obj.id,'title':obj.title},status=201)
        return Response({'detail':'Unknown enhancement type.'},status=400)

