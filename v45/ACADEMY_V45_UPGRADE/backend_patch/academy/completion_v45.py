from django.db.models import Q
from django.utils import timezone

from .models import Module, LessonProgress, ModuleCertificate, Badge, UserBadge, QuizAttempt
from .services import issue_module_certificate, issue_completed_credentials, notify_academy


def active_sequential_modules(module):
    qs = Module.objects.filter(active=True, required=True, pathway=module.pathway).select_related("level")
    if module.pathway_id is None:
        qs = qs.filter(pathway__isnull=True)
    return qs.order_by("level__number", "order", "id")


def is_module_completed(user, module):
    return ModuleCertificate.objects.filter(
        user=user, module=module, status="valid"
    ).exists()


def is_module_unlocked(user, module):
    if not user or not user.is_authenticated or not module.active:
        return False

    # First required active module is available immediately.
    ordered = list(active_sequential_modules(module))
    try:
        idx = next(i for i, m in enumerate(ordered) if m.id == module.id)
    except StopIteration:
        return False

    if idx == 0:
        return True

    previous = ordered[idx - 1]
    return is_module_completed(user, previous)


def required_lessons_complete(user, module):
    required_ids = set(
        module.lessons.filter(active=True, required=True).values_list("id", flat=True)
    )
    if not required_ids:
        return True, []
    completed_ids = set(
        LessonProgress.objects.filter(
            user=user, lesson_id__in=required_ids, completed_at__isnull=False
        ).values_list("lesson_id", flat=True)
    )
    missing = sorted(required_ids - completed_ids)
    return not missing, missing


def latest_passed_score(user, module):
    quiz = getattr(module, "quiz", None)
    if not quiz:
        return 100.0
    attempt = (
        QuizAttempt.objects.filter(user=user, quiz=quiz, passed=True)
        .order_by("-created_at", "-id")
        .first()
    )
    return float(attempt.score) if attempt else None


def award_module_badges(user, module):
    awarded = []
    try:
        badges = Badge.objects.filter(
            active=True,
            trigger_type="module_completed",
        ).filter(Q(trigger_value=module.slug) | Q(trigger_value=str(module.id)))
    except Exception:
        badges = []

    for badge in badges:
        try:
            obj, created = UserBadge.objects.get_or_create(
                user=user,
                badge=badge,
                defaults={
                    "awarded_at": timezone.now(),
                    "evidence": f"module_completed={module.slug}",
                },
            )
            if created:
                awarded.append(badge)
                notify_academy(
                    user,
                    f"Research Academy — badge earned: {badge.name}",
                    badge.description or f"You earned the {badge.name} badge.",
                    "/research-academy/certificates",
                    "View achievement",
                )
        except Exception:
            # Badge problems must never prevent the academic credential itself.
            continue
    return awarded


def finalize_module(user, module):
    if not is_module_unlocked(user, module):
        return {"completed": False, "reason": "locked", "message": "Module is locked."}

    complete, missing = required_lessons_complete(user, module)
    if not complete:
        return {
            "completed": False,
            "reason": "lessons_incomplete",
            "missing_lesson_ids": missing,
            "message": "Complete every required lesson before finishing the module.",
        }

    score = latest_passed_score(user, module)
    quiz = getattr(module, "quiz", None)
    if quiz and score is None:
        return {
            "completed": False,
            "reason": "assessment_not_passed",
            "score": None,
            "pass_mark": quiz.pass_mark,
            "message": "Pass the module assessment before completing this module.",
        }

    cert = issue_module_certificate(user, module)
    badges = award_module_badges(user, module)
    try:
        issued = issue_completed_credentials(user) or []
    except Exception:
        issued = []

    ordered = list(active_sequential_modules(module))
    next_module = None
    for candidate in ordered:
        if candidate.level.number == module.level.number and candidate.order > module.order:
            next_module = candidate
            break
    if next_module is None:
        for candidate in ordered:
            if candidate.level.number > module.level.number:
                next_module = candidate
                break

    next_info = None
    if next_module:
        next_info = {
            "id": next_module.id,
            "title": next_module.title,
            "level": next_module.level.number,
            "unlocked": is_module_unlocked(user, next_module),
            "url": f"/research-academy/module/{next_module.id}",
        }
        if next_info["unlocked"]:
            notify_academy(
                user,
                "Research Academy — next module unlocked",
                f"You completed {module.title}. {next_module.title} is now available.",
                next_info["url"],
                "Continue learning",
            )

    notify_academy(
        user,
        "Research Academy — module completed",
        f"Congratulations. You completed {module.title} and earned your module credential.",
        f"/research-academy/module/{module.id}",
        "View credential",
    )

    return {
        "completed": True,
        "score": score,
        "certificate_id": cert.certificate_id,
        "badges": [{"id": b.id, "name": b.name, "icon": getattr(b, "icon", "🏅")} for b in badges],
        "credentials_issued": [getattr(c, "certificate_id", "") for c in issued if getattr(c, "certificate_id", "")],
        "next_module": next_info,
    }
