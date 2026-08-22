import requests
from django.conf import settings
from django.core.mail import send_mail
from django.utils import timezone

from .models import NotificationOutbox, PlatformSetting, NotificationPreference


def platform_settings():
    obj, _ = PlatformSetting.objects.get_or_create(singleton_key=1)
    return obj


def send_email_notification(user, subject, body):
    if not user or not user.email:
        return NotificationOutbox.objects.create(user=user, channel='email', subject=subject, body=body, status='skipped', error_message='No email address')
    prefs, _ = NotificationPreference.objects.get_or_create(user=user)
    if not prefs.email_enabled:
        return NotificationOutbox.objects.create(user=user, channel='email', subject=subject, body=body, status='skipped', error_message='Email notifications disabled')
    row = NotificationOutbox.objects.create(user=user, channel='email', subject=subject, body=body)
    try:
        send_mail(subject, body, settings.DEFAULT_FROM_EMAIL, [user.email], fail_silently=False)
        row.status='sent'; row.sent_at=timezone.now(); row.save(update_fields=['status','sent_at'])
    except Exception as exc:
        row.status='failed'; row.error_message=str(exc); row.save(update_fields=['status','error_message'])
    return row



def send_in_app_notification(user, subject, body):
    if not user:
        return None
    try:
        from journal.models import Notification
        return Notification.objects.create(user=user, title=subject, message=body)
    except Exception as exc:
        return None

def send_whatsapp_notification(user, text):
    cfg = platform_settings()
    prefs, _ = NotificationPreference.objects.get_or_create(user=user)
    if not cfg.whatsapp_enabled or not prefs.whatsapp_enabled:
        return NotificationOutbox.objects.create(user=user, channel='whatsapp', body=text, status='skipped', error_message='WhatsApp disabled or unconfigured')
    row = NotificationOutbox.objects.create(user=user, channel='whatsapp', body=text)
    phone = getattr(user, 'whatsapp_number', '') or ''
    if not phone or not cfg.whatsapp_api_url:
        row.status='skipped'; row.error_message='Missing phone/provider configuration'; row.save(update_fields=['status','error_message']); return row
    try:
        headers={'Authorization': f'Bearer {cfg.whatsapp_token}', 'Content-Type': 'application/json'}
        if cfg.whatsapp_provider.lower() in {'meta', 'meta_cloud_api', 'whatsapp_cloud_api'}:
            endpoint = cfg.whatsapp_api_url
            if cfg.whatsapp_phone_number_id and '{phone_number_id}' in endpoint:
                endpoint = endpoint.replace('{phone_number_id}', cfg.whatsapp_phone_number_id)
            payload={'messaging_product':'whatsapp','to':phone,'type':'text','text':{'preview_url':False,'body':text}}
        else:
            payload={'to':phone,'message':text}
        resp=requests.post(endpoint,json=payload,headers=headers,timeout=20)
        resp.raise_for_status()
        data=resp.json() if resp.content else {}
        row.status='sent'; row.provider_message_id=str(data.get('messages',[{}])[0].get('id','')) if isinstance(data,dict) else ''; row.sent_at=timezone.now(); row.save(update_fields=['status','provider_message_id','sent_at'])
    except Exception as exc:
        row.status='failed'; row.error_message=str(exc); row.save(update_fields=['status','error_message'])
    return row

def dispatch_notification(user, subject, body, event_key='', application_key='', action_url='/', whatsapp_text=None):
    rows=[]
    rows.append(send_in_app_notification(user, subject, body))
    email=send_email_notification(user, subject, body)
    if email:
        email.event_key=event_key; email.metadata={'application': application_key, 'action_url': action_url}; email.save(update_fields=['event_key','metadata'])
    rows.append(email)
    rows.append(send_whatsapp_notification(user, whatsapp_text or f'{subject}: {body}'))
    return rows



def record_passport_evidence(user, evidence_type, title, description, source_model, source_object_id, evidence_date=None, metadata=None):
    """Idempotently append verified RSRE activity to the Research Passport."""
    if not user or not getattr(user, "is_authenticated", False):
        return None
    from journal.models import PassportEvidence
    from django.utils import timezone as _timezone
    obj, _ = PassportEvidence.objects.get_or_create(
        user=user,
        evidence_type=evidence_type,
        source_model=source_model,
        source_object_id=str(source_object_id),
        defaults={
            "title": title,
            "description": description,
            "source_type": "automatic",
            "evidence_date": evidence_date or _timezone.now().date(),
            "verification_code": f"RSRE-{user.pk}-{source_model}-{source_object_id}",
            "verified_at": _timezone.now(),
            "active": True,
        },
    )
    if metadata and obj.description == description:
        pass
    return obj


def emit_research_event(user, *, subject, message, event_key, application_key, action_url="/dashboard", evidence=None, whatsapp_text=None):
    """Single entry point for cross-pillar momentum: notification + optional Passport evidence."""
    if evidence:
        record_passport_evidence(user, **evidence)
    return dispatch_notification(
        user, subject, message, event_key=event_key,
        application_key=application_key, action_url=action_url,
        whatsapp_text=whatsapp_text,
    )

def create_whatsapp_group(name, description='', member_phone_numbers=None):
    cfg=platform_settings()
    if not cfg.whatsapp_enabled or not cfg.whatsapp_group_create_url:
        return {'created': False, 'supported': False, 'detail': 'WhatsApp group creation is not configured. Create the group in WhatsApp and save its invite URL in the RSRE community record.'}
    payload={'name':name,'description':description,'members':member_phone_numbers or []}
    try:
        resp=requests.post(cfg.whatsapp_group_create_url,json=payload,headers={'Authorization':f'Bearer {cfg.whatsapp_token}','Content-Type':'application/json'},timeout=20)
        resp.raise_for_status()
        data=resp.json() if resp.content else {}
        return {'created':True,'supported':True,'provider_group_id':data.get('group_id') or data.get('id',''),'invite_url':data.get('invite_url') or data.get('invite_link',''),'raw':data}
    except Exception as exc:
        return {'created':False,'supported':True,'detail':str(exc)}
