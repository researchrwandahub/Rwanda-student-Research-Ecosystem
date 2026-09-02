from django.core.management.base import BaseCommand
from django.core.mail import send_mail
from django.conf import settings


class Command(BaseCommand):
    help = "Send a test RSJH email using the configured SMTP settings."

    def add_arguments(self, parser):
        parser.add_argument("email", help="Recipient email address")

    def handle(self, *args, **options):
        recipient = options["email"]
        send_mail(
            "RSJH SMTP test",
            "This is a test email from the Rwanda Student Journal for Health.",
            settings.DEFAULT_FROM_EMAIL,
            [recipient],
            fail_silently=False,
        )
        self.stdout.write(self.style.SUCCESS(f"Test email sent to {recipient}"))
