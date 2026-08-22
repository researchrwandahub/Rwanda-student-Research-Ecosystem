from pathlib import Path
root = Path('/mnt/data/v8work')

# 1) models
p = root/'backend/journal/models.py'
s = p.read_text()
insert = r'''

# =========================
# STUDENT GIFT / SPONSORSHIP
# =========================

GIFT_PURPOSE_CHOICES = [
    ("journal_support", "Journal / Publication Support"),
    ("academy_support", "Research Academy Support"),
    ("research_support", "Research Development Support"),
    ("general", "General RSRE Gift"),
]
GIFT_STATUS_CHOICES = [
    ("pending", "Pending payment"),
    ("paid", "Paid / ready to gift"),
    ("sent", "Gift code sent"),
    ("redeemed", "Redeemed"),
    ("expired", "Expired"),
    ("cancelled", "Cancelled"),
]
PAYMENT_METHOD_CHOICES = [
    ("mobile_money", "Mobile Money"),
    ("card", "Card"),
    ("bank_transfer", "Bank Transfer"),
    ("other", "Other sponsor payment"),
]

class StudentGift(models.Model):
    sponsor_name = models.CharField(max_length=255, blank=True)
    sponsor_email = models.EmailField(blank=True)
    recipient_email = models.EmailField()
    recipient_name = models.CharField(max_length=255, blank=True)
    purpose = models.CharField(max_length=30, choices=GIFT_PURPOSE_CHOICES, default="general")
    amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    currency = models.CharField(max_length=8, default="RWF")
    payment_method = models.CharField(max_length=30, choices=PAYMENT_METHOD_CHOICES, default="other")
    payment_reference = models.CharField(max_length=255, blank=True)
    status = models.CharField(max_length=20, choices=GIFT_STATUS_CHOICES, default="pending")
    gift_code = models.CharField(max_length=40, unique=True, blank=True)
    message = models.TextField(blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    sent_at = models.DateTimeField(null=True, blank=True)
    redeemed_at = models.DateTimeField(null=True, blank=True)
    redeemed_by = models.ForeignKey(User, null=True, blank=True, related_name="redeemed_gifts", on_delete=models.SET_NULL)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["recipient_email", "status"]),
            models.Index(fields=["gift_code"]),
        ]

    def __str__(self):
        return f"Gift {self.gift_code or 'pending'} → {self.recipient_email}"
'''
marker='class FoundingMember(models.Model):'
if insert.strip() not in s:
    s=s.replace(marker, insert+'\n'+marker)
p.write_text(s)

# 2) serializers
p=root/'backend/journal/serializers.py'; s=p.read_text()
s=s.replace('from .models import ', 'from .models import ', 1)  # no-op
# append serializer
if 'class StudentGiftSerializer' not in s:
    s += r'''

class StudentGiftSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentGift
        fields = "__all__"
        read_only_fields = ["gift_code", "status", "sent_at", "redeemed_at", "redeemed_by", "created_at", "updated_at"]
'''
p.write_text(s)

# Need add model import in serializers model import location
s=p.read_text()
if 'StudentGift,' not in s:
    s=s.replace('FoundingMember, PublicationSettings,', 'FoundingMember, PublicationSettings, StudentGift,')
p.write_text(s)

# 3) notifications
p=root/'backend/journal/notifications.py'; s=p.read_text()
if 'def send_student_gift_email' not in s:
    s += r'''


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
'''
p.write_text(s)

# 4) views imports
p=root/'backend/journal/views.py'; s=p.read_text()
s=s.replace('CoAuthorContribution, Partner, FoundingMember, PublicationSettings,', 'CoAuthorContribution, Partner, FoundingMember, PublicationSettings, StudentGift,')
s=s.replace('from .notifications import notify, verification, welcome, send_invitation_email', 'from .notifications import notify, verification, welcome, send_invitation_email, send_student_gift_email')
if 'class StudentGiftView' not in s:
    s += r'''


class StudentGiftView(APIView):
    """Sponsor-side gift request + student-side redemption. Students never pay through this flow."""
    permission_classes = [AllowAny]

    def post(self, request):
        action = (request.data.get("action") or "request").strip().lower()
        if action == "request":
            recipient_email = (request.data.get("recipient_email") or "").strip().lower()
            if not recipient_email:
                return Response({"detail": "Recipient email is required."}, status=400)
            amount = request.data.get("amount") or 0
            try:
                amount = float(amount)
            except (TypeError, ValueError):
                return Response({"detail": "Amount must be numeric."}, status=400)
            if amount < 0:
                return Response({"detail": "Amount cannot be negative."}, status=400)
            gift = StudentGift.objects.create(
                sponsor_name=(request.data.get("sponsor_name") or "").strip(),
                sponsor_email=(request.data.get("sponsor_email") or "").strip().lower(),
                recipient_email=recipient_email,
                recipient_name=(request.data.get("recipient_name") or "").strip(),
                purpose=request.data.get("purpose") or "general",
                amount=amount,
                currency=request.data.get("currency") or "RWF",
                payment_method=request.data.get("payment_method") or "other",
                message=(request.data.get("message") or "").strip(),
            )
            return Response({
                "id": gift.id,
                "status": gift.status,
                "message": "Gift request recorded. The recipient is not asked to pay. A gift code is sent only after the sponsor payment is confirmed."
            }, status=201)

        if action == "redeem":
            if not request.user.is_authenticated:
                return Response({"detail": "Sign in to redeem a gift code."}, status=401)
            code = (request.data.get("gift_code") or "").strip().upper()
            gift = StudentGift.objects.filter(gift_code=code).first()
            if not gift:
                return Response({"detail": "Gift code not found."}, status=404)
            if gift.status not in {"sent", "paid"}:
                return Response({"detail": "This gift is not available for redemption."}, status=400)
            if gift.expires_at and gift.expires_at <= timezone.now():
                gift.status = "expired"; gift.save(update_fields=["status", "updated_at"])
                return Response({"detail": "This gift code has expired."}, status=400)
            if gift.redeemed_by_id and gift.redeemed_by_id != request.user.id:
                return Response({"detail": "This gift has already been redeemed."}, status=400)
            gift.redeemed_by = request.user
            gift.redeemed_at = timezone.now()
            gift.status = "redeemed"
            gift.save(update_fields=["redeemed_by", "redeemed_at", "status", "updated_at"])
            return Response({"message": "Gift redeemed successfully.", "purpose": gift.get_purpose_display(), "amount": str(gift.amount), "currency": gift.currency})

        return Response({"detail": "Unsupported gift action."}, status=400)


class AdminGiftPaymentConfirmView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        if getattr(request.user, "role", None) != "administrator" and not request.user.is_staff:
            raise PermissionDenied("Administrator access required.")
        gift = StudentGift.objects.get(pk=pk)
        if gift.status in {"redeemed", "cancelled", "expired"}:
            return Response({"detail": "Gift cannot be confirmed in its current state."}, status=400)
        gift.status = "paid"
        gift.payment_reference = (request.data.get("payment_reference") or gift.payment_reference).strip()
        gift.gift_code = gift.gift_code or f"RSG-{secrets.token_hex(5).upper()}"
        gift.save(update_fields=["status", "payment_reference", "gift_code", "updated_at"])
        sent = send_student_gift_email(gift)
        if sent:
            gift.status = "sent"
            gift.sent_at = timezone.now()
            gift.save(update_fields=["status", "sent_at", "updated_at"])
        return Response({"status": gift.status, "gift_code": gift.gift_code, "email_sent": sent})
'''
p.write_text(s)

# 5) URL routes
p=root/'backend/journal/urls.py'; s=p.read_text()
# add import
if 'StudentGiftView' not in s.split('\n', 45)[0:45].__str__():
    s=s.replace('ResearchPassportView, PassportEvidenceView, PassportEvidenceDetailView, ResearchIdeaViewSet, ResearchProjectViewSet, ResearchOpportunityViewSet, EditorialBoardViewSet,', 'ResearchPassportView, PassportEvidenceView, PassportEvidenceDetailView, ResearchIdeaViewSet, ResearchProjectViewSet, ResearchOpportunityViewSet, EditorialBoardViewSet, StudentGiftView, AdminGiftPaymentConfirmView,')
# add routes before router include
needle='    path(\n        "",\n        include(router.urls),\n    ),'
if 'gift/request/' not in s:
    add='''    path("gift/request/", StudentGiftView.as_view(), name="student-gift"),\n    path("gift/redeem/", StudentGiftView.as_view(), name="student-gift-redeem"),\n    path("admin/gifts/<int:pk>/confirm/", AdminGiftPaymentConfirmView.as_view(), name="admin-gift-confirm"),\n\n'''
    s=s.replace('    path(\n        "",\n        include(router.urls),\n    ),', add+'    path(\n        "",\n        include(router.urls),\n    ),')
p.write_text(s)

# 6) admin
p=root/'backend/journal/admin.py'; s=p.read_text()
s=s.replace('ResearchOpportunity, PassportEvidence)', 'ResearchOpportunity, PassportEvidence, StudentGift)') if 'StudentGift)' not in s else s
if '@admin.register(StudentGift)' not in s:
    s += r'''

@admin.register(StudentGift)
class StudentGiftAdmin(admin.ModelAdmin):
    list_display = ("recipient_email", "purpose", "amount", "currency", "payment_method", "status", "gift_code", "created_at")
    list_filter = ("status", "purpose", "payment_method", "currency")
    search_fields = ("recipient_email", "sponsor_email", "sponsor_name", "gift_code", "payment_reference")
    readonly_fields = ("gift_code", "sent_at", "redeemed_at", "redeemed_by", "created_at", "updated_at")
'''
p.write_text(s)

# 7) migration
mig=root/'backend/journal/migrations/0020_student_gift.py'
if not mig.exists():
    mig.write_text('''from django.db import migrations, models\nimport django.db.models.deletion\n\nclass Migration(migrations.Migration):\n    dependencies = [("journal", "0019_research_passport_v2")]\n    operations = [\n        migrations.CreateModel(\n            name="StudentGift",\n            fields=[\n                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),\n                ("sponsor_name", models.CharField(blank=True, max_length=255)),\n                ("sponsor_email", models.EmailField(blank=True, max_length=254)),\n                ("recipient_email", models.EmailField(max_length=254)),\n                ("recipient_name", models.CharField(blank=True, max_length=255)),\n                ("purpose", models.CharField(choices=[("journal_support", "Journal / Publication Support"), ("academy_support", "Research Academy Support"), ("research_support", "Research Development Support"), ("general", "General RSRE Gift")], default="general", max_length=30)),\n                ("amount", models.DecimalField(decimal_places=2, default=0, max_digits=12)),\n                ("currency", models.CharField(default="RWF", max_length=8)),\n                ("payment_method", models.CharField(choices=[("mobile_money", "Mobile Money"), ("card", "Card"), ("bank_transfer", "Bank Transfer"), ("other", "Other sponsor payment")], default="other", max_length=30)),\n                ("payment_reference", models.CharField(blank=True, max_length=255)),\n                ("status", models.CharField(choices=[("pending", "Pending payment"), ("paid", "Paid / ready to gift"), ("sent", "Gift code sent"), ("redeemed", "Redeemed"), ("expired", "Expired"), ("cancelled", "Cancelled")], default="pending", max_length=20)),\n                ("gift_code", models.CharField(blank=True, max_length=40, unique=True)),\n                ("message", models.TextField(blank=True)),\n                ("expires_at", models.DateTimeField(blank=True, null=True)),\n                ("sent_at", models.DateTimeField(blank=True, null=True)),\n                ("redeemed_at", models.DateTimeField(blank=True, null=True)),\n                ("created_at", models.DateTimeField(auto_now_add=True)),\n                ("updated_at", models.DateTimeField(auto_now=True)),\n                ("redeemed_by", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="redeemed_gifts", to="journal.user")),\n            ],\n            options={"ordering": ["-created_at"]},\n        ),\n        migrations.AddIndex(model_name="studentgift", index=models.Index(fields=["recipient_email", "status"], name="journal_stud_recipient_3e1c6e_idx")),\n        migrations.AddIndex(model_name="studentgift", index=models.Index(fields=["gift_code"], name="journal_stud_gift_co_5b6f5e_idx")),\n    ]\n''')

# 8) frontend gift page
fp=root/'frontend/pages/gift.tsx'
fp.write_text('''import { useState } from "react";\nimport api from "../lib/api";\n\nexport default function GiftPage(){\n const [tab,setTab]=useState("give"); const [msg,setMsg]=useState(""); const [busy,setBusy]=useState(false);\n const [form,setForm]=useState({sponsor_name:"",sponsor_email:"",recipient_name:"",recipient_email:"",purpose:"general",amount:"",currency:"RWF",payment_method:"mobile_money",message:""});\n const [code,setCode]=useState("");\n async function give(e:any){e.preventDefault();setBusy(true);setMsg("");try{const r=await api.post("/gift/request/",form);setMsg(r.data.message+" You can then complete the sponsor payment through the payment method arranged by RSRE.");}catch(e:any){setMsg(e?.response?.data?.detail||"Could not create gift request.")}finally{setBusy(false)}}\n async function redeem(e:any){e.preventDefault();setBusy(true);setMsg("");try{const r=await api.post("/gift/redeem/",{action:"redeem",gift_code:code});setMsg(r.data.message+" Gift: "+r.data.purpose+" — "+r.data.amount+" "+r.data.currency);}catch(e:any){setMsg(e?.response?.data?.detail||"Could not redeem gift code.")}finally{setBusy(false)}}\n return <main className="min-h-screen bg-slate-50 px-6 py-12"><div className="mx-auto max-w-4xl"><div className="rounded-3xl bg-slate-950 p-8 text-white"><div className="text-xs font-black uppercase tracking-[.2em] text-emerald-300">RSRE Gifting</div><h1 className="mt-3 text-4xl font-black">Students learn and publish. Supporters can fund the journey.</h1><p className="mt-4 max-w-3xl text-slate-300">Students are not charged through this gift flow. A supporter can sponsor a researcher and the recipient receives a gift code by email after the sponsor payment is confirmed.</p></div><div className="mt-6 flex gap-2"><button onClick={()=>setTab("give")} className={`rounded-xl px-5 py-3 text-sm font-black ${tab==='give'?'bg-emerald-600 text-white':'bg-white border'}`}>Give a gift</button><button onClick={()=>setTab("redeem")} className={`rounded-xl px-5 py-3 text-sm font-black ${tab==='redeem'?'bg-emerald-600 text-white':'bg-white border'}`}>Redeem a gift</button></div>{msg&&<div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-800">{msg}</div>}{tab==='give'?<form onSubmit={give} className="mt-6 rounded-3xl bg-white p-7 shadow-sm border space-y-4">{[['sponsor_name','Your name'],['sponsor_email','Your email'],['recipient_name','Student / researcher name'],['recipient_email','Recipient email'],['amount','Gift amount']].map(([k,l])=><label key={k} className="block text-sm font-black">{l}<input required={k==='recipient_email'} value={(form as any)[k]} onChange={e=>setForm({...form,[k]:e.target.value})} className="mt-2 w-full rounded-xl border px-4 py-3 font-normal" /></label>)}<label className="block text-sm font-black">Purpose<select value={form.purpose} onChange={e=>setForm({...form,purpose:e.target.value})} className="mt-2 w-full rounded-xl border px-4 py-3 font-normal"><option value="general">General RSRE Gift</option><option value="journal_support">Journal / Publication Support</option><option value="academy_support">Research Academy Support</option><option value="research_support">Research Development Support</option></select></label><label className="block text-sm font-black">Payment method<select value={form.payment_method} onChange={e=>setForm({...form,payment_method:e.target.value})} className="mt-2 w-full rounded-xl border px-4 py-3 font-normal"><option value="mobile_money">Mobile Money</option><option value="card">Card</option><option value="bank_transfer">Bank Transfer</option><option value="other">Other sponsor payment</option></select></label><label className="block text-sm font-black">Message<textarea value={form.message} onChange={e=>setForm({...form,message:e.target.value})} rows={3} className="mt-2 w-full rounded-xl border px-4 py-3 font-normal" /></label><button disabled={busy} className="rounded-xl bg-slate-950 px-5 py-3 text-white font-black">{busy?'Creating…':'Create sponsorship gift'}</button></form>:<form onSubmit={redeem} className="mt-6 rounded-3xl bg-white p-7 shadow-sm border"><label className="block text-sm font-black">Gift code<input value={code} onChange={e=>setCode(e.target.value.toUpperCase())} placeholder="RSG-XXXXXXXXXX" className="mt-2 w-full rounded-xl border px-4 py-3 font-mono" /></label><p className="mt-3 text-sm text-slate-500">The code arrives by email and is linked to a sponsor-funded gift. Sign in before redeeming.</p><button disabled={busy} className="mt-5 rounded-xl bg-emerald-600 px-5 py-3 text-white font-black">{busy?'Redeeming…':'Redeem gift'}</button></form>}</div></main>\n}\n''')

# 9) Update architecture docs
(root/'RSRE_GIFT_SPONSORSHIP_PILLAR.md').write_text('''# RSRE Gift Sponsorship\n\nStudents are not asked to pay in the core RSRE/RSJH learning and research workflow. A separate sponsor-facing gift flow allows supporters to fund a student/researcher.\n\nFlow:\n1. Supporter clicks Give a Gift.\n2. Supporter provides recipient email and selects purpose/payment method.\n3. RSRE records a pending sponsorship.\n4. Payment is confirmed through the configured payment process (gateway or administrator).\n5. RSRE generates a gift code and emails it to the recipient.\n6. Recipient signs in and redeems the gift code.\n\nThe journal editorial workflow is untouched. Gift funding must never be used as a publication acceptance/reviewer decision shortcut.\n''')

# 10) package metadata / log
(root/'RSRE_PILLAR_UPGRADE_LOG.md').write_text((root/'RSRE_PILLAR_UPGRADE_LOG.md').read_text()+'\n\n## V9 — Student Gift Sponsorship\nAdded an additive sponsor-funded gift flow. Students are not charged; sponsors fund gifts, payment is confirmed, then a gift code is emailed to the recipient. RSJH editorial workflow unchanged.\n')
print('patched')
