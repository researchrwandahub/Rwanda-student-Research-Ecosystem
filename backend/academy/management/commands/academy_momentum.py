from datetime import timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from academy.models import Enrollment, CourseEnrollment
from academy.services import notify_academy

class Command(BaseCommand):
    help = "Send gentle RSRE Academy momentum reminders to learners who have opted in."
    def handle(self, *args, **options):
        now=timezone.now(); cutoff=now-timedelta(days=3); sent=0
        for enrollment in Enrollment.objects.filter(progress_reminders=True).select_related("user"):
            active = CourseEnrollment.objects.filter(user=enrollment.user, status="active").order_by("-last_activity_at").first()
            last = active.last_activity_at if active and active.last_activity_at else enrollment.enrolled_at
            if last and last < cutoff:
                notify_academy(enrollment.user, "RSRE — keep your research momentum", "Your Academy workspace is waiting for you. Even 15 focused minutes today can move your research skills forward.", "/research-academy/dashboard", "Continue learning")
                sent += 1
        self.stdout.write(self.style.SUCCESS(f"Sent {sent} Academy momentum reminders."))
