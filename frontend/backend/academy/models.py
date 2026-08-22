from django.conf import settings
from django.db import models
from django.utils import timezone


class Level(models.Model):
    number = models.PositiveIntegerField(unique=True)
    name = models.CharField(max_length=80)
    code = models.SlugField(max_length=80, unique=True)
    description = models.TextField()
    required_pass_mark = models.PositiveSmallIntegerField(default=80)
    active = models.BooleanField(default=True)

    class Meta:
        ordering = ["number"]

    def __str__(self):
        return f"Level {self.number}: {self.name}"


class SpecialistPathway(models.Model):
    name = models.CharField(max_length=120)
    code = models.SlugField(max_length=120, unique=True)
    description = models.TextField()
    prerequisite_level = models.PositiveIntegerField(default=3, help_text="Highest core level that must be completed before this pathway unlocks.")
    required_pass_mark = models.PositiveSmallIntegerField(default=80)
    active = models.BooleanField(default=True)

    class Meta:
        ordering = ["id"]

    def __str__(self):
        return self.name


class AcademyCourse(models.Model):
    level = models.ForeignKey("Level", on_delete=models.CASCADE, related_name="courses", null=True, blank=True)
    pathway = models.ForeignKey("SpecialistPathway", on_delete=models.SET_NULL, related_name="courses", null=True, blank=True)
    code = models.SlugField(max_length=120, unique=True)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    learning_outcomes = models.JSONField(default=list, blank=True)
    estimated_hours = models.DecimalField(max_digits=6, decimal_places=2, default=10)
    pass_mark = models.PositiveSmallIntegerField(default=80)
    active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["order", "title"]

    def __str__(self):
        return self.title


class ModulePrerequisite(models.Model):
    module = models.ForeignKey("Module", on_delete=models.CASCADE, related_name="prerequisite_rules")
    prerequisite = models.ForeignKey("Module", on_delete=models.CASCADE, related_name="unlocks_modules")
    minimum_quiz_score = models.PositiveSmallIntegerField(default=80)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["module", "prerequisite"], name="academy_unique_module_prerequisite")]


class Module(models.Model):
    level = models.ForeignKey(Level, on_delete=models.CASCADE, related_name="modules")
    pathway = models.ForeignKey(SpecialistPathway, on_delete=models.CASCADE, related_name="modules", null=True, blank=True)
    course = models.ForeignKey("AcademyCourse", on_delete=models.SET_NULL, related_name="modules", null=True, blank=True)
    order = models.PositiveIntegerField()
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    summary = models.TextField()
    objectives = models.JSONField(default=list, blank=True)
    estimated_minutes = models.PositiveIntegerField(default=60)
    required = models.BooleanField(default=True)
    active = models.BooleanField(default=True)

    class Meta:
        ordering = ["level__number", "pathway_id", "order"]
        constraints = [models.UniqueConstraint(fields=["level", "order"], name="academy_unique_module_order_per_level")]

    def __str__(self):
        return self.title


class Lesson(models.Model):
    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name="lessons")
    order = models.PositiveIntegerField()
    title = models.CharField(max_length=255)
    lesson_type = models.CharField(max_length=30, choices=[("text", "Text"), ("video", "Video"), ("activity", "Activity")], default="text")
    body = models.TextField(blank=True)
    video_url = models.URLField(blank=True)
    resource_urls = models.JSONField(default=list, blank=True)
    estimated_minutes = models.PositiveIntegerField(default=15)
    required = models.BooleanField(default=True)
    active = models.BooleanField(default=True)

    class Meta:
        ordering = ["module__level__number", "module__order", "order"]
        constraints = [models.UniqueConstraint(fields=["module", "order"], name="academy_unique_lesson_order")]


class Quiz(models.Model):
    module = models.OneToOneField(Module, on_delete=models.CASCADE, related_name="quiz")
    title = models.CharField(max_length=255)
    pass_mark = models.PositiveSmallIntegerField(default=80)
    attempts_allowed = models.PositiveIntegerField(default=0)


class Question(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name="questions")
    order = models.PositiveIntegerField()
    prompt = models.TextField()
    question_type = models.CharField(
        max_length=20,
        choices=[("single", "Single choice"), ("multi", "Multiple choice"), ("true_false", "True / false")],
        default="single",
    )
    explanation = models.TextField(blank=True)

    class Meta:
        ordering = ["order"]
        constraints = [models.UniqueConstraint(fields=["quiz", "order"], name="academy_unique_question_order")]


class Choice(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name="choices")
    order = models.PositiveIntegerField()
    text = models.CharField(max_length=500)
    is_correct = models.BooleanField(default=False)

    class Meta:
        ordering = ["order"]
        constraints = [models.UniqueConstraint(fields=["question", "order"], name="academy_unique_choice_order")]


class Enrollment(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="academy_enrollment")
    enrolled_at = models.DateTimeField(auto_now_add=True)
    email_updates = models.BooleanField(default=True)
    progress_reminders = models.BooleanField(default=True)


class LessonProgress(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="academy_lesson_progress")
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name="progress_records")
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["user", "lesson"], name="academy_unique_user_lesson")]


class QuizAttempt(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="academy_quiz_attempts")
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name="attempts")
    score = models.DecimalField(max_digits=5, decimal_places=2)
    passed = models.BooleanField(default=False)
    answers = models.JSONField(default=dict)
    submitted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-submitted_at"]


class LevelCertificate(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="academy_certificates")
    level = models.ForeignKey(Level, on_delete=models.CASCADE, related_name="certificates")
    certificate_id = models.CharField(max_length=80, unique=True)
    issued_at = models.DateTimeField(default=timezone.now)
    status = models.CharField(max_length=20, default="valid")

    class Meta:
        constraints = [models.UniqueConstraint(fields=["user", "level"], name="academy_unique_level_certificate")]


class ModuleCertificate(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="academy_module_certificates")
    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name="certificates")
    certificate_id = models.CharField(max_length=100, unique=True)
    issued_at = models.DateTimeField(default=timezone.now)
    status = models.CharField(max_length=20, default="valid")

    class Meta:
        constraints = [models.UniqueConstraint(fields=["user", "module"], name="academy_unique_module_certificate")]


class PathwayCertificate(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="academy_pathway_certificates")
    pathway = models.ForeignKey(SpecialistPathway, on_delete=models.CASCADE, related_name="certificates")
    certificate_id = models.CharField(max_length=90, unique=True)
    issued_at = models.DateTimeField(default=timezone.now)
    status = models.CharField(max_length=20, default="valid")

    class Meta:
        constraints = [models.UniqueConstraint(fields=["user", "pathway"], name="academy_unique_pathway_certificate")]


class CertificateSettings(models.Model):
    singleton_key = models.PositiveSmallIntegerField(default=1, unique=True, editable=False)
    organization_name = models.CharField(max_length=255, default="Rwanda Student Research Ecosystem")
    academy_name = models.CharField(max_length=255, default="Research Academy")
    logo_url = models.URLField(blank=True)
    signature_name = models.CharField(max_length=255, default="Prof. Dr. [NAME]")
    signature_credentials = models.CharField(max_length=255, default="PhD, [FIELD]")
    signature_title = models.CharField(max_length=255, default="Academic Director / Academic Advisor")
    signature_image_url = models.URLField(blank=True)
    institutional_seal_url = models.URLField(blank=True)
    stamp_url = models.URLField(blank=True)
    organization_logo = models.ImageField(upload_to="academy/branding/", blank=True, null=True)
    signature_image = models.ImageField(upload_to="academy/branding/signatures/", blank=True, null=True)
    institutional_seal = models.ImageField(upload_to="academy/branding/seals/", blank=True, null=True)
    official_stamp = models.ImageField(upload_to="academy/branding/stamps/", blank=True, null=True)
    signatory_institution = models.CharField(max_length=255, blank=True)
    certificate_template = models.CharField(max_length=50, default="modern_research")
    certificate_footer = models.CharField(max_length=500, default="This credential recognizes demonstrated achievement in an RSRE Research Academy learning pathway.")
    verification_base_url = models.URLField(blank=True)
    updated_at = models.DateTimeField(auto_now=True)


class NotificationMarker(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="academy_notification_markers")
    level = models.ForeignKey(Level, on_delete=models.CASCADE, null=True, blank=True)
    pathway = models.ForeignKey(SpecialistPathway, on_delete=models.CASCADE, null=True, blank=True)
    kind = models.CharField(max_length=80, default="level_completed")
    sent = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["user", "level", "pathway", "kind"], name="academy_unique_notification_marker")]


class StudentQuestion(models.Model):
    STATUS_CHOICES = [("open", "Open"), ("answered", "Answered"), ("closed", "Closed")]
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="academy_questions")
    lesson = models.ForeignKey(Lesson, on_delete=models.SET_NULL, null=True, blank=True, related_name="student_questions")
    subject = models.CharField(max_length=255)
    question = models.TextField()
    answer = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="open")
    answered_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="answered_academy_questions")
    created_at = models.DateTimeField(auto_now_add=True)
    answered_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]


class AcademyAnnouncement(models.Model):
    title = models.CharField(max_length=255)
    message = models.TextField()
    audience = models.CharField(max_length=50, default="all")
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]


class Badge(models.Model):
    name = models.CharField(max_length=180, unique=True)
    code = models.SlugField(max_length=180, unique=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=30, default='🏅')
    trigger_type = models.CharField(max_length=40, default="manual")
    trigger_value = models.CharField(max_length=180, blank=True)
    active = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class UserBadge(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='academy_badges')
    badge = models.ForeignKey(Badge, on_delete=models.CASCADE, related_name='awards')
    awarded_at = models.DateTimeField(default=timezone.now)
    evidence = models.CharField(max_length=255, blank=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=['user','badge'], name='academy_unique_user_badge')]


class DiagnosticAssessment(models.Model):
    title = models.CharField(max_length=255, default='Research Academy Entry Assessment')
    description = models.TextField(blank=True)
    active = models.BooleanField(default=True)
    pass_mark = models.PositiveSmallIntegerField(default=70)
    questions = models.JSONField(default=list, blank=True)


class DiagnosticAttempt(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='academy_diagnostic_attempts')
    assessment = models.ForeignKey(DiagnosticAssessment, on_delete=models.CASCADE, related_name='attempts')
    score = models.DecimalField(max_digits=5, decimal_places=2)
    recommended_level = models.PositiveSmallIntegerField(default=1)
    answers = models.JSONField(default=dict)
    submitted_at = models.DateTimeField(auto_now_add=True)


class PracticeLab(models.Model):
    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name='practice_labs', null=True, blank=True)
    title = models.CharField(max_length=255)
    description = models.TextField()
    instructions = models.TextField(blank=True)
    rubric = models.JSONField(default=list, blank=True)
    pass_mark = models.PositiveSmallIntegerField(default=80)
    required = models.BooleanField(default=False)
    attempts_allowed = models.PositiveIntegerField(default=1)
    active = models.BooleanField(default=True)


class LabSubmission(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='academy_lab_submissions')
    lab = models.ForeignKey(PracticeLab, on_delete=models.CASCADE, related_name='submissions')
    response = models.TextField()
    score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    feedback = models.TextField(blank=True)
    status = models.CharField(max_length=20, default="submitted")
    graded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="graded_academy_labs")
    graded_at = models.DateTimeField(null=True, blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)


class Assignment(models.Model):
    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name="assignments")
    title = models.CharField(max_length=255)
    instructions = models.TextField()
    submission_type = models.CharField(max_length=30, default="text", choices=[("text","Text"),("file","File"),("url","URL"),("mixed","Mixed")])
    max_score = models.PositiveIntegerField(default=100)
    pass_mark = models.PositiveSmallIntegerField(default=80)
    due_after_days = models.PositiveIntegerField(default=7)
    attempts_allowed = models.PositiveIntegerField(default=1)
    required = models.BooleanField(default=True)
    active = models.BooleanField(default=True)

    class Meta:
        ordering = ["module__order", "title"]


class RubricCriterion(models.Model):
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name="rubric_criteria")
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    max_points = models.PositiveIntegerField(default=10)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "id"]


class AssignmentSubmission(models.Model):
    STATUS_CHOICES = [("submitted","Submitted"),("graded","Graded"),("returned","Returned"),("resubmit","Resubmission requested")]
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name="submissions")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="academy_assignment_submissions")
    response_text = models.TextField(blank=True)
    file_url = models.URLField(blank=True)
    external_url = models.URLField(blank=True)
    attempt_number = models.PositiveIntegerField(default=1)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="submitted")
    score = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    feedback = models.TextField(blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)
    graded_at = models.DateTimeField(null=True, blank=True)
    graded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="graded_academy_assignments")

    class Meta:
        ordering = ["-submitted_at"]
        constraints = [models.UniqueConstraint(fields=["assignment","user","attempt_number"], name="academy_unique_assignment_attempt")]


class RubricScore(models.Model):
    submission = models.ForeignKey(AssignmentSubmission, on_delete=models.CASCADE, related_name="rubric_scores")
    criterion = models.ForeignKey(RubricCriterion, on_delete=models.CASCADE, related_name="scores")
    points = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    feedback = models.TextField(blank=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["submission","criterion"], name="academy_unique_rubric_score")]


class CaseStudy(models.Model):
    title = models.CharField(max_length=255)
    country = models.CharField(max_length=100, default='Rwanda')
    topic = models.CharField(max_length=160)
    scenario = models.TextField()
    questions = models.JSONField(default=list, blank=True)
    active = models.BooleanField(default=True)

    class Meta:
        ordering = ['country','title']


class LiveSession(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    starts_at = models.DateTimeField()
    duration_minutes = models.PositiveIntegerField(default=60)
    meeting_url = models.URLField(blank=True)
    recording_url = models.URLField(blank=True)
    registration_url = models.URLField(blank=True)
    speaker = models.CharField(max_length=255, blank=True)
    active = models.BooleanField(default=True)

    class Meta:
        ordering = ['starts_at']


class DiscussionPost(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='academy_discussion_posts')
    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name='discussion_posts', null=True, blank=True)
    title = models.CharField(max_length=255)
    body = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    active = models.BooleanField(default=True)

    class Meta:
        ordering = ['-created_at']


class CourseVersion(models.Model):
    level = models.ForeignKey(Level, on_delete=models.CASCADE, related_name='versions', null=True, blank=True)
    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name='versions', null=True, blank=True)
    version = models.CharField(max_length=30, default='1.0')
    release_notes = models.TextField(blank=True)
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']


class LessonResource(models.Model):
    RESOURCE_TYPES=[("reading","Reading"),("video","Video"),("tool","Tool"),("guideline","Guideline"),("template","Template"),("dataset","Dataset")]
    lesson=models.ForeignKey(Lesson,on_delete=models.CASCADE,related_name='resources')
    title=models.CharField(max_length=255)
    resource_type=models.CharField(max_length=30,choices=RESOURCE_TYPES,default='reading')
    url=models.URLField(blank=True)
    description=models.TextField(blank=True)
    source=models.CharField(max_length=255,blank=True)
    required=models.BooleanField(default=False)
    order=models.PositiveIntegerField(default=0)
    active=models.BooleanField(default=True)
    class Meta:
        ordering=['order','title']

class CourseCohort(models.Model):
    level=models.ForeignKey(Level,on_delete=models.CASCADE,related_name='cohorts',null=True,blank=True)
    pathway=models.ForeignKey(SpecialistPathway,on_delete=models.SET_NULL,null=True,blank=True,related_name='cohorts')
    name=models.CharField(max_length=180)
    code=models.SlugField(max_length=120,unique=True)
    description=models.TextField(blank=True)
    starts_at=models.DateTimeField(null=True,blank=True)
    ends_at=models.DateTimeField(null=True,blank=True)
    capacity=models.PositiveIntegerField(default=50)
    active=models.BooleanField(default=True)
    whatsapp_community=models.ForeignKey('rsre_core.WhatsAppCommunity',on_delete=models.SET_NULL,null=True,blank=True,related_name='academy_cohorts')
    created_at=models.DateTimeField(auto_now_add=True)

class CourseCohortMember(models.Model):
    cohort=models.ForeignKey(CourseCohort,on_delete=models.CASCADE,related_name='members')
    user=models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE,related_name='academy_cohort_memberships')
    joined_at=models.DateTimeField(auto_now_add=True)
    status=models.CharField(max_length=20,default='active')
    class Meta:
        constraints=[models.UniqueConstraint(fields=['cohort','user'],name='academy_unique_cohort_member')]


class CourseEnrollment(models.Model):
    STATUS_CHOICES=[("active","Active"),("completed","Completed"),("dropped","Dropped"),("waitlisted","Waitlisted")]
    user=models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE,related_name="academy_course_enrollments")
    course=models.ForeignKey(AcademyCourse,on_delete=models.CASCADE,related_name="enrollments")
    status=models.CharField(max_length=20,choices=STATUS_CHOICES,default="active")
    enrolled_at=models.DateTimeField(auto_now_add=True)
    completed_at=models.DateTimeField(null=True,blank=True)
    last_activity_at=models.DateTimeField(null=True,blank=True)
    progress_percent=models.DecimalField(max_digits=5,decimal_places=2,default=0)
    class Meta:
        constraints=[models.UniqueConstraint(fields=["user","course"],name="academy_unique_course_enrollment")]
        ordering=["-enrolled_at"]

class AssessmentFeedback(models.Model):
    submission_type=models.CharField(max_length=30)
    object_id=models.PositiveIntegerField()
    user=models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE,related_name="academy_assessment_feedback")
    reviewer=models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.SET_NULL,null=True,related_name="academy_feedback_given")
    summary=models.TextField(blank=True)
    strengths=models.JSONField(default=list,blank=True)
    improvements=models.JSONField(default=list,blank=True)
    next_steps=models.JSONField(default=list,blank=True)
    created_at=models.DateTimeField(auto_now_add=True)

class LearningRecord(models.Model):
    EVENT_CHOICES=[("enrolled","Enrolled"),("lesson_completed","Lesson completed"),("quiz_passed","Quiz passed"),("assignment_passed","Assignment passed"),("lab_passed","Lab passed"),("badge_awarded","Badge awarded"),("certificate_issued","Certificate issued"),("course_completed","Course completed")]
    user=models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE,related_name="academy_learning_records")
    event_type=models.CharField(max_length=40,choices=EVENT_CHOICES)
    title=models.CharField(max_length=255)
    application=models.CharField(max_length=50,default="research_academy")
    evidence_type=models.CharField(max_length=40,blank=True)
    evidence_id=models.PositiveIntegerField(null=True,blank=True)
    metadata=models.JSONField(default=dict,blank=True)
    occurred_at=models.DateTimeField(auto_now_add=True)
    verified=models.BooleanField(default=True)
    class Meta:
        ordering=["-occurred_at"]

class CourseCompletionRequirement(models.Model):
    course=models.ForeignKey(AcademyCourse,on_delete=models.CASCADE,related_name="completion_requirements")
    requirement_type=models.CharField(max_length=30,choices=[("modules","Modules"),("final_quiz","Final quiz"),("assignments","Assignments"),("labs","Labs")])
    required=models.BooleanField(default=True)
    minimum_score=models.PositiveSmallIntegerField(default=80)

class CourseAnnouncement(models.Model):
    course=models.ForeignKey(AcademyCourse,on_delete=models.CASCADE,related_name="announcements")
    title=models.CharField(max_length=255)
    message=models.TextField()
    scheduled_for=models.DateTimeField(null=True,blank=True)
    published=models.BooleanField(default=False)
    created_by=models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.SET_NULL,null=True,blank=True)
    created_at=models.DateTimeField(auto_now_add=True)
    updated_at=models.DateTimeField(auto_now=True)

