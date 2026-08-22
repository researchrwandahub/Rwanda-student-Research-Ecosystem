from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.utils.html import escape
from django.utils import timezone
from .models import LevelCertificate, PathwayCertificate, ModuleCertificate, CertificateSettings


def _send(user, subject, message, action_url, action_label):
    if not getattr(user, "email", None):
        return False
    sender = getattr(settings, "DEFAULT_FROM_EMAIL", "Research Academy")
    text = f"Rwanda Student Research Ecosystem — Research Academy\n\n{message}\n\n{action_label}: {action_url}"
    html = "".join([
        "<div style='font-family:Arial,sans-serif;max-width:720px;margin:auto;color:#0f172a'>",
        "<div style='background:#0f172a;color:#fff;padding:28px;border-radius:18px 18px 0 0'>",
        "<div style='font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#a7f3d0'>Research Academy</div>",
        f"<h2 style='margin:10px 0 0'>{escape(subject)}</h2>",
        "</div><div style='padding:30px;background:#fff;border:1px solid #e2e8f0;border-top:0'>",
        "".join(f"<p style='line-height:1.7'>{escape(line)}</p>" for line in message.split("\n") if line.strip()),
        f"<p><a href='{escape(action_url)}' style='display:inline-block;background:#0f766e;color:white;padding:12px 18px;border-radius:10px;text-decoration:none;font-weight:700'>{escape(action_label)}</a></p>",
        "<p style='color:#64748b;font-size:12px;border-top:1px solid #e2e8f0;padding-top:16px'>Rwanda Student Research Ecosystem · Health Research Academy</p>",
        "</div></div>",
    ])
    try:
        mail = EmailMultiAlternatives(subject, text, sender, [user.email])
        mail.attach_alternative(html, "text/html")
        mail.send(fail_silently=False)
        return True
    except Exception:
        return False


def notify_academy(user, subject, message, action_url="/research-academy", action_label="Continue learning"):
    from rsre_core.services import dispatch_notification
    return dispatch_notification(
        user, subject, message,
        event_key="academy_notification",
        application_key="academy",
        action_url=action_url,
        whatsapp_text=f"RSRE Research Academy — {subject}\n\n{message}",
    )

def issue_level_certificate(user, level):
    cert, created = LevelCertificate.objects.get_or_create(
        user=user, level=level,
        defaults={"certificate_id": f"RSRE-RA-L{level.number}-{timezone.now().year}-{user.pk:05d}"},
    )
    if created:
        from rsre_core.services import emit_research_event
        emit_research_event(
            user, subject="Research Academy — level certificate earned",
            message=f"Congratulations. You completed Level {level.number}: {level.name}. Certificate {cert.certificate_id} is now available.",
            event_key="academy_level_certificate", application_key="academy",
            action_url=f"/research-academy/certificate/{cert.certificate_id}",
            evidence={"evidence_type":"credential","title":f"Academy Level {level.number} certificate: {level.name}","description":"Research Academy level certificate earned.","source_model":"academy.level_certificate","source_object_id":cert.pk},
        )
    return cert


def issue_module_certificate(user, module):
    cert, created = ModuleCertificate.objects.get_or_create(
        user=user, module=module,
        defaults={"certificate_id": f"RSRE-RA-M-{module.id}-{timezone.now().year}-{user.pk:05d}"},
    )
    if created:
        record_learning_event(user, "certificate_issued", f"Module certificate: {module.title}", "module", module.id, {"certificate_id": cert.certificate_id, "certificate_type": "module"})
        from rsre_core.services import record_passport_evidence
        record_passport_evidence(
            user, "credential", f"Academy module certificate: {module.title}",
            "Research Academy module certificate earned.", "academy.module_certificate", cert.pk,
            metadata={"certificate_id": cert.certificate_id, "module_id": module.id},
        )
        notify_academy(
            user,
            "Research Academy — module certificate earned",
            f"Congratulations. You completed {module.title}. Your certificate {cert.certificate_id} is now available.",
            f"/research-academy/certificate/{cert.certificate_id}",
            "View certificate",
        )
    return cert


def issue_pathway_certificate(user, pathway):
    cert, created = PathwayCertificate.objects.get_or_create(
        user=user, pathway=pathway,
        defaults={"certificate_id": f"RSRE-RA-SP-{pathway.code[:8].upper()}-{timezone.now().year}-{user.pk:05d}"},
    )
    if created:
        from rsre_core.services import emit_research_event
        emit_research_event(
            user, subject="Research Academy — pathway certificate earned",
            message=f"Congratulations. You completed the {pathway.name} pathway. Certificate {cert.certificate_id} is now available.",
            event_key="academy_pathway_certificate", application_key="academy",
            action_url=f"/research-academy/certificate/{cert.certificate_id}",
            evidence={"evidence_type":"credential","title":f"Academy pathway certificate: {pathway.name}","description":"Research Academy specialist pathway certificate earned.","source_model":"academy.pathway_certificate","source_object_id":cert.pk},
        )
    return cert


def certificate_settings():
    obj = CertificateSettings.objects.order_by("id").first()
    if obj is None:
        obj = CertificateSettings.objects.create()
    return obj


def record_learning_event(user, event_type, title, evidence_type="", evidence_id=None, metadata=None):
    from .models import LearningRecord
    return LearningRecord.objects.create(user=user,event_type=event_type,title=title,evidence_type=evidence_type,evidence_id=evidence_id,metadata=metadata or {})

def course_progress(user, course):
    modules=list(course.modules.filter(active=True).order_by("order"))
    if not modules:
        return 0
    from .views import module_completed
    done=sum(1 for m in modules if module_completed(user,m))
    return round(done/len(modules)*100,2)

def sync_course_enrollment(user, course):
    from .models import CourseEnrollment
    pct=course_progress(user,course)
    obj,_=CourseEnrollment.objects.get_or_create(user=user,course=course)
    obj.progress_percent=pct
    obj.last_activity_at=timezone.now()
    if pct>=100 and obj.status!="completed":
        obj.status="completed"; obj.completed_at=timezone.now()
        record_learning_event(user,"course_completed",course.title,"course",course.id,{"course_code":course.code})
        from rsre_core.services import emit_research_event
        emit_research_event(
            user, subject="Research Academy — course completed",
            message=f"You completed {course.title}. Your next research-learning step is ready.",
            event_key="academy_course_completed", application_key="academy",
            action_url=f"/research-academy/course/{course.id}",
            evidence={"evidence_type":"learning","title":f"Academy course completed: {course.title}","description":"Research Academy course completed.","source_model":"academy.course_completion","source_object_id":f"{course.id}-{user.pk}"},
        )
    obj.save(update_fields=["progress_percent","last_activity_at","status","completed_at"]); return obj
