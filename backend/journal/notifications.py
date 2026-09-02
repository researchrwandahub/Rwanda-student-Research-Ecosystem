from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.utils.html import escape
from .models import Notification

DEFAULT_FROM = getattr(
    settings,
    "DEFAULT_FROM_EMAIL",
    "Rwanda Student Journal for Health <researchrwandahub@gmail.com>",
)
FRONTEND_URL = getattr(settings, "FRONTEND_URL", "http://localhost:3000")
JOURNAL_NAME = "Rwanda Student Journal for Health"
OFFICE_EMAIL = "researchrwandahub@gmail.com"
OFFICE_PHONE = "+250 792 447 121"
OFFICE_LOCATION = "Huye, Rwanda"
TAGLINE = "Scientific communication for Rwanda and Africa"


def _brand_footer_html():
    return f"""
    <div style='padding-top:24px;margin-top:28px;border-top:1px solid #e2e8f0;color:#475569;font-size:13px;line-height:1.6'>
      <strong style='color:#0f172a'>{JOURNAL_NAME}</strong><br>
      {TAGLINE}<br>
      {OFFICE_EMAIL}<br>
      {OFFICE_PHONE}<br>
      {OFFICE_LOCATION}
    </div>
    """


def _email(user, subject, message, action_url=None, action_label="Open RSJH Dashboard"):
    if not getattr(user, "email", None):
        return False

    text = (
        f"{JOURNAL_NAME}\n"
        f"{TAGLINE}\n\n"
        f"{message}\n\n"
        + (f"{action_label}: {action_url}\n\n" if action_url else "")
        + f"{JOURNAL_NAME}\n{OFFICE_EMAIL}\n{OFFICE_PHONE}\n{OFFICE_LOCATION}"
    )

    paragraphs = []
    for line in message.split("\n"):
        if not line.strip():
            paragraphs.append("<div style='height:8px'></div>")
        else:
            paragraphs.append(
                f"<p style='margin:0 0 12px;line-height:1.7'>{escape(line)}</p>"
            )

    action_html = ""
    if action_url:
        action_html = (
            "<div style='margin:26px 0 30px'>"
            f"<a href='{escape(action_url)}' "
            "style='display:inline-block;padding:13px 21px;background:#0f766e;"
            "color:#fff;text-decoration:none;border-radius:10px;font-weight:700'>"
            f"{escape(action_label)}</a></div>"
        )

    html = f"""<!doctype html>
<html>
<head><meta charset='utf-8'><meta name='viewport' content='width=device-width'></head>
<body style='margin:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;color:#0f172a'>
  <div style='max-width:680px;margin:28px auto;padding:0 12px'>
    <div style='background:#0f766e;color:#fff;border-radius:18px 18px 0 0;padding:24px 28px'>
      <div style='font-size:12px;letter-spacing:.12em;text-transform:uppercase;opacity:.9'>RSJH</div>
      <div style='font-size:24px;font-weight:700;margin-top:6px'>{escape(subject)}</div>
      <div style='font-size:13px;margin-top:7px;opacity:.92'>{escape(TAGLINE)}</div>
    </div>
    <div style='background:#fff;border:1px solid #e2e8f0;border-top:0;border-radius:0 0 18px 18px;padding:30px'>
      {''.join(paragraphs)}
      {action_html}
      {_brand_footer_html()}
    </div>
  </div>
</body>
</html>"""

    try:
        mail = EmailMultiAlternatives(subject, text, DEFAULT_FROM, [user.email])
        mail.attach_alternative(html, "text/html")
        mail.send(fail_silently=False)
        return True
    except Exception:
        return False


def send_invitation_email(
    email,
    contact_name,
    role,
    organization,
    invitation_code,
    invitation_url,
    expires_at=None,
    invited_by=None,
):
    """Send the unified RSJH invitation email used for Reviewer, Editor, EIC and Partner invitations."""
    role_labels = {
        "reviewer": "Reviewer",
        "editor": "Editor",
        "editor_in_chief": "Editor-in-Chief",
        "partner": "Partner",
    }
    role_label = role_labels.get(role, role.replace("_", " ").title())
    greeting = contact_name or "Colleague"
    sender = getattr(invited_by, "full_name", None) or getattr(invited_by, "username", None) or "RSJH Editorial Office"
    expiry_text = expires_at.strftime("%d %B %Y") if expires_at else "14 days from the date of this email"
    organization_line = organization or "Not provided"

    subject = f"You're invited to join the Rwanda Student Journal for Health as a {role_label}"
    body = (
        f"Dear {greeting},\n\n"
        f"The {JOURNAL_NAME} (RSJH) is pleased to invite you to become part of our research, editorial and scientific communication journey as a {role_label}.\n\n"
        f"RSJH is a student-centred research and publishing platform helping health sciences students and researchers move from research ideas to development, peer review, publication and impact across Rwanda and Africa.\n\n"
        "Your invitation\n"
        f"Role: {role_label}\n"
        f"Organisation: {organization_line}\n"
        f"Invitation code: {invitation_code}\n"
        f"Invited by: {sender}\n"
        f"Expires: {expiry_text}\n\n"
        f"Use the button below to create or connect your RSJH account and complete your profile.\n\n"
        f"This invitation is linked to {email} and is intended for a single acceptance.\n"
    )

    html_button = (
        f"<div style='margin:8px 0 26px'><a href='{escape(invitation_url)}' "
        "style='display:inline-block;padding:14px 22px;background:#0f766e;color:#fff;"
        "text-decoration:none;border-radius:10px;font-weight:700'>"
        f"Accept {escape(role_label)} Invitation</a></div>"
    )

    details_html = f"""
    <div style='margin:20px 0;padding:18px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px'>
      <div style='font-size:13px;color:#64748b;margin-bottom:8px;text-transform:uppercase;letter-spacing:.08em'>Invitation details</div>
      <div><strong>Role:</strong> {escape(role_label)}</div>
      <div><strong>Organisation:</strong> {escape(organization_line)}</div>
      <div><strong>Invitation code:</strong> {escape(invitation_code)}</div>
      <div><strong>Expires:</strong> {escape(expiry_text)}</div>
    </div>
    {html_button}
    <p style='margin:0 0 14px;line-height:1.7'>We would be honoured to welcome you to the RSJH journey.</p>
    """

    text = (
        f"{JOURNAL_NAME}\n{TAGLINE}\n\n"
        f"You're invited to join RSJH as a {role_label}.\n\n"
        f"Dear {greeting},\n\n"
        f"The {JOURNAL_NAME} (RSJH) is pleased to invite you to become part of our research, editorial and scientific communication journey as a {role_label}.\n\n"
        "Your invitation\n"
        f"Role: {role_label}\n"
        f"Organisation: {organization_line}\n"
        f"Invitation code: {invitation_code}\n"
        f"Invited by: {sender}\n"
        f"Expires: {expiry_text}\n\n"
        f"Accept your invitation: {invitation_url}\n\n"
        "This invitation is linked to the invited email address and is intended for a single acceptance.\n\n"
        "We would be honoured to welcome you to the RSJH journey.\n\n"
        f"{JOURNAL_NAME}\n{OFFICE_EMAIL}\n{OFFICE_PHONE}\n{OFFICE_LOCATION}"
    )

    html = f"""<!doctype html>
<html><head><meta charset='utf-8'><meta name='viewport' content='width=device-width'></head>
<body style='margin:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;color:#0f172a'>
  <div style='max-width:700px;margin:28px auto;padding:0 12px'>
    <div style='background:#0f766e;color:#fff;border-radius:18px 18px 0 0;padding:26px 30px'>
      <div style='font-size:12px;letter-spacing:.14em;text-transform:uppercase;opacity:.9'>Rwanda Student Journal for Health</div>
      <div style='font-size:26px;font-weight:700;margin-top:8px'>You're invited to join RSJH as a {escape(role_label)}</div>
      <div style='font-size:13px;margin-top:8px;opacity:.92'>{escape(TAGLINE)}</div>
    </div>
    <div style='background:#fff;border:1px solid #e2e8f0;border-top:0;border-radius:0 0 18px 18px;padding:30px'>
      <p style='font-size:16px;line-height:1.7;margin:0 0 14px'>Dear <strong>{escape(greeting)}</strong>,</p>
      <p style='line-height:1.7;margin:0 0 14px'>The <strong>{escape(JOURNAL_NAME)}</strong> (RSJH) is pleased to invite you to become part of our research, editorial and scientific communication journey as a <strong>{escape(role_label)}</strong>.</p>
      <p style='line-height:1.7;margin:0 0 18px'>RSJH is a student-centred research and publishing platform helping health sciences students and researchers move from research ideas to development, peer review, publication and impact across Rwanda and Africa.</p>
      {details_html}
      {_brand_footer_html()}
    </div>
  </div>
</body></html>"""

    try:
        mail = EmailMultiAlternatives(
            subject,
            text,
            DEFAULT_FROM,
            [email],
        )
        mail.attach_alternative(html, "text/html")
        mail.send(fail_silently=False)
        return True
    except Exception:
        return False


def _expand_message(user, title, message):
    name = user.full_name or user.username
    if title == "Draft created successfully":
        return (
            f"Dear {name},\n\n"
            "Your manuscript draft has been created successfully in the Rwanda Student Journal for Health.\n\n"
            f"{message}\n\n"
            "You can continue editing the manuscript, add co-authors and integrity statements, upload or replace the manuscript PDF, and submit it when it is ready for editorial screening."
        )
    if title == "Manuscript submitted":
        return (
            f"Dear {name},\n\n"
            "Your manuscript has been successfully submitted to the Rwanda Student Journal for Health.\n\n"
            f"{message}\n\n"
            "The next stage is editorial screening. The editorial team will assess scope, completeness, ethical requirements and readiness for peer review."
        )
    if title == "New manuscript submitted":
        return (
            "Dear Editor,\n\n"
            "A new manuscript is waiting in the RSJH editorial queue.\n\n"
            f"{message}\n\n"
            "Please review the submission for scope, completeness, ethical requirements and readiness for peer review."
        )
    if title == "New Review Assignment":
        return (
            "Dear Reviewer,\n\n"
            "A manuscript has been assigned to you for peer review through RSJH.\n\n"
            f"{message}\n\n"
            "Please review the manuscript, declare any conflict of interest and submit your structured recommendation before the stated deadline."
        )
    if title == "Peer review started":
        return (
            f"Dear {name},\n\n"
            "Your manuscript has entered peer review.\n\n"
            f"{message}\n\n"
            "You will receive another notification when reviewer feedback becomes available."
        )
    if title == "Reviewer feedback available":
        return (
            f"Dear {name},\n\n"
            "Reviewer feedback is now available for your manuscript.\n\n"
            f"{message}\n\n"
            "Please open your RSJH dashboard to review the comments, decision status and any required revision."
        )
    if title == "Reviewer feedback submitted":
        return (
            "Dear Editor,\n\n"
            "A reviewer has completed a report for a manuscript in your editorial queue.\n\n"
            f"{message}\n\n"
            "Please review the report and determine the appropriate next editorial action."
        )
    if title == "Author revision received":
        return (
            "Dear Reviewer,\n\n"
            "A revised manuscript has been submitted for a paper assigned to you.\n\n"
            f"{message}\n\n"
            "Please review the revised version and the author's response before updating your recommendation."
        )
    if title == "Revision required":
        return (
            f"Dear {name},\n\n"
            "Your manuscript requires revision before a final editorial decision can be made.\n\n"
            f"{message}\n\n"
            "Please review the reviewer and editorial comments carefully and submit your revised manuscript through your RSJH dashboard."
        )
    if title == "Manuscript accepted":
        return (
            f"Dear {name},\n\n"
            "We are pleased to inform you that your manuscript has been accepted for publication in the Rwanda Student Journal for Health.\n\n"
            f"{message}\n\n"
            "Your article has now entered the publication stage, where the final bibliographic metadata will be prepared for the journal archive."
        )
    if title == "Article published":
        return (
            f"Dear {name},\n\n"
            "Congratulations. Your article has been published by the Rwanda Student Journal for Health.\n\n"
            f"{message}\n\n"
            "You can now share the published article with your academic community and research collaborators."
        )
    if title == "Manuscript rejected":
        return (
            f"Dear {name},\n\n"
            "The editorial team has completed the review of your manuscript.\n\n"
            f"{message}\n\n"
            "Please review the editorial rationale provided in your RSJH dashboard."
        )
    if title == "Editorial decision":
        return (
            f"Dear {name},\n\n"
            "The editorial team has completed an editorial decision on your manuscript.\n\n"
            f"{message}\n\n"
            "Please open your RSJH dashboard to read the full editorial rationale, reviewer feedback and next steps."
        )
    return f"Dear {name},\n\n{message}"


def notify(user, title, message, email_subject=None, action_url=None, action_label="Open RSJH Dashboard"):
    from rsre_core.services import dispatch_notification
    expanded = _expand_message(user, title, message)
    rows = dispatch_notification(
        user, email_subject or f"RSRE — {title}", expanded,
        event_key="journal_notification", application_key="journal",
        action_url=action_url or f"{FRONTEND_URL}/dashboard",
        whatsapp_text=f"RSRE / RSJH — {title}\n\n{message}",
    )
    return next((r for r in rows if r.__class__.__name__ == 'Notification'), None) or Notification.objects.filter(user=user, title=title).order_by('-id').first()


def welcome(user):
    from rsre_core.services import dispatch_notification
    subject = "Welcome to Rwanda Student Research Ecosystem"
    message = (
        f"Dear {user.full_name or user.username},\n\n"
        "Welcome to the Rwanda Student Research Ecosystem. Your single RSRE account can access research learning, discovery, opportunities, project development and RSJH publishing.\n\n"
        "Please verify your email address and complete your profile before starting your research journey."
    )
    rows=dispatch_notification(user, subject, message, event_key="account_welcome", application_key="core", action_url=f"{FRONTEND_URL}/dashboard", action_label="Open RSRE Dashboard", whatsapp_text=f"RSRE — Welcome\n\n{message}")
    return next((r for r in rows if r.__class__.__name__ == 'Notification'), None)

def verification(user, token):
    from rsre_core.services import dispatch_notification
    url=f"{FRONTEND_URL}/auth/verify-email?token={token}"
    subject="Verify your RSRE email address"
    message=(
        f"Dear {user.full_name or user.username},\n\n"
        "Thank you for creating your RSRE account. Verify your email address to activate your account and continue using the research ecosystem.\n\n"
        "If you did not create this account, ignore this message."
    )
    rows=dispatch_notification(user,subject,message,event_key="email_verification",application_key="core",action_url=url,action_label="Verify Email Address",whatsapp_text=f"RSRE — Verify your email\n\n{message}\n\n{url}")
    return next((r for r in rows if r.__class__.__name__ == 'Notification'), None)



def send_student_gift_email(gift):
    """Send a sponsor-funded gift code to the recipient. Payment must already be confirmed."""
    from django.conf import settings
    if not gift.recipient_email or gift.status not in {"paid", "sent"} or not gift.gift_code:
        return False
    subject = "You received a research gift from RSRE"
    purpose = gift.get_purpose_display()
    message = (
        f"Dear {gift.recipient_name or 'Researcher'},\n\n"
        f"Someone has sponsored you through the Rwanda Student Research Ecosystem (RSRE).\n\n"
        f"Gift: {purpose}\n"
        f"Gift code: {gift.gift_code}\n\n"
        "This code is a sponsored gift. You are not being asked to pay for this gift. "
        "Keep the code safe and redeem it in your RSRE account.\n\n"
        f"RSRE / RSJH\n{OFFICE_EMAIL}"
    )
    try:
        mail = EmailMultiAlternatives(subject, message, settings.DEFAULT_FROM_EMAIL, [gift.recipient_email])
        mail.send(fail_silently=False)
        return True
    except Exception:
        return False
