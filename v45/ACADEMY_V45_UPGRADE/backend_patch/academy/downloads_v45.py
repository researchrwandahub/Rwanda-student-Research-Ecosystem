from io import BytesIO
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone
from reportlab.lib.pagesizes import A4, landscape
from reportlab.pdfgen import canvas
from reportlab.lib.units import mm
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from .models import Module, ModuleCertificate
from .completion_v45 import is_module_unlocked, is_module_completed
from .services import certificate_settings


class ModulePackDownloadViewV45(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        module = get_object_or_404(Module.objects.select_related("level", "pathway").prefetch_related("lessons", "quiz__questions__choices"), pk=pk, active=True)
        if not is_module_unlocked(request.user, module):
            return HttpResponse("Module is locked.", status=403, content_type="text/plain")
        buf = BytesIO()
        c = canvas.Canvas(buf, pagesize=A4)
        width, height = A4
        y = height - 22 * mm
        def write(text, size=10, bold=False, gap=5):
            nonlocal y
            c.setFont("Helvetica-Bold" if bold else "Helvetica", size)
            for part in str(text or "").split("\n"):
                if y < 20 * mm:
                    c.showPage(); y = height - 20 * mm
                    c.setFont("Helvetica-Bold" if bold else "Helvetica", size)
                c.drawString(18 * mm, y, part[:115]); y -= gap * mm
        write("RSRE RESEARCH ACADEMY", 9, True, 6)
        write(module.title, 18, True, 8)
        write(module.summary, 10, False, 5)
        write("Learning objectives", 13, True, 6)
        for obj in module.objectives or []: write("• " + str(obj), 10, False, 5)
        write("Lessons", 13, True, 6)
        for lesson in module.lessons.filter(active=True).order_by("order"):
            write(f"Lesson {lesson.order}: {lesson.title}", 12, True, 6)
            write(lesson.body, 9, False, 4)
        quiz = getattr(module, "quiz", None)
        if quiz:
            write(f"Assessment — Pass {quiz.pass_mark}%", 13, True, 6)
            for i, q in enumerate(quiz.questions.all(), 1):
                write(f"{i}. {q.prompt}", 9, True, 4)
                for j, choice in enumerate(q.choices.all(), 1): write(f"   {chr(64+j)}. {choice.text}", 9, False, 4)
        c.save(); buf.seek(0)
        r = HttpResponse(buf.getvalue(), content_type="application/pdf")
        r["Content-Disposition"] = f'attachment; filename="{module.slug}-module-pack.pdf"'
        return r


class CertificateDownloadViewV45(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, certificate_id):
        cert = get_object_or_404(ModuleCertificate.objects.select_related("module", "user"), certificate_id=certificate_id, user=request.user, status="valid")
        brand = certificate_settings()
        buf = BytesIO(); c = canvas.Canvas(buf, pagesize=landscape(A4)); width, height = landscape(A4)
        c.setFillColorRGB(0.06, 0.09, 0.16); c.rect(0, 0, width, height, fill=1, stroke=0)
        c.setFillColorRGB(1,1,1); c.setFont("Helvetica-Bold", 28); c.drawCentredString(width/2, height-45*mm, brand.academy_name)
        c.setFillColorRGB(0.65,0.95,0.82); c.setFont("Helvetica-Bold", 16); c.drawCentredString(width/2, height-58*mm, "MODULE COMPLETION CERTIFICATE")
        c.setFillColorRGB(1,1,1); c.setFont("Helvetica", 13); c.drawCentredString(width/2, height-82*mm, "This credential recognizes demonstrated completion of")
        c.setFont("Helvetica-Bold", 22); c.drawCentredString(width/2, height-98*mm, cert.module.title)
        c.setFont("Helvetica", 13); c.drawCentredString(width/2, height-120*mm, "Awarded to")
        c.setFont("Helvetica-Bold", 22); c.drawCentredString(width/2, height-136*mm, cert.user.get_full_name() or cert.user.username)
        c.setFont("Helvetica", 10); c.drawString(25*mm, 24*mm, f"Certificate ID: {cert.certificate_id}")
        c.drawRightString(width-25*mm, 24*mm, f"{brand.organization_name} · {timezone.localdate()}")
        c.save(); buf.seek(0)
        r = HttpResponse(buf.getvalue(), content_type="application/pdf")
        r["Content-Disposition"] = f'attachment; filename="{cert.certificate_id}.pdf"'
        return r
