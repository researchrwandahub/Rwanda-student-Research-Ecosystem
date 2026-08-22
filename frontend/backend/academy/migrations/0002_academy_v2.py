from django.conf import settings
from django.db import migrations, models
from django.utils import timezone
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [("academy", "0001_initial"), migrations.swappable_dependency(settings.AUTH_USER_MODEL)]

    operations = [
        migrations.CreateModel(
            name="SpecialistPathway",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=120)),
                ("code", models.SlugField(max_length=120, unique=True)),
                ("description", models.TextField()),
                ("prerequisite_level", models.PositiveIntegerField(default=3, help_text="Highest core level that must be completed before this pathway unlocks.")),
                ("required_pass_mark", models.PositiveSmallIntegerField(default=80)),
                ("active", models.BooleanField(default=True)),
            ],
            options={"ordering": ["id"]},
        ),
        migrations.AddField(
            model_name="module",
            name="pathway",
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name="modules", to="academy.specialistpathway"),
        ),
        migrations.AlterField(
            model_name="question",
            name="question_type",
            field=models.CharField(choices=[("single", "Single choice"), ("multi", "Multiple choice"), ("true_false", "True / false")], default="single", max_length=20),
        ),
        migrations.CreateModel(
            name="PathwayCertificate",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("certificate_id", models.CharField(max_length=90, unique=True)),
                ("issued_at", models.DateTimeField(default=timezone.now)),
                ("status", models.CharField(default="valid", max_length=20)),
                ("pathway", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="certificates", to="academy.specialistpathway")),
                ("user", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="academy_pathway_certificates", to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name="CertificateSettings",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("singleton_key", models.PositiveSmallIntegerField(default=1, editable=False, unique=True)),
                ("organization_name", models.CharField(default="Rwanda Student Research Ecosystem", max_length=255)),
                ("academy_name", models.CharField(default="Research Academy", max_length=255)),
                ("logo_url", models.URLField(blank=True)),
                ("signature_name", models.CharField(default="Prof. Dr. [NAME]", max_length=255)),
                ("signature_credentials", models.CharField(default="PhD, [FIELD]", max_length=255)),
                ("signature_title", models.CharField(default="Academic Director / Academic Advisor", max_length=255)),
                ("signature_image_url", models.URLField(blank=True)),
                ("institutional_seal_url", models.URLField(blank=True)),
                ("certificate_footer", models.CharField(default="Certificate of completion of an RSRE Research Academy learning pathway.", max_length=500)),
                ("verification_base_url", models.URLField(blank=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
        ),
        migrations.AddField(
            model_name="levelcertificate",
            name="status",
            field=models.CharField(default="valid", max_length=20),
        ),
        migrations.AddField(
            model_name="notificationmarker",
            name="pathway",
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to="academy.specialistpathway"),
        ),
        migrations.AlterField(
            model_name="notificationmarker",
            name="level",
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to="academy.level"),
        ),
        migrations.RemoveConstraint(
            model_name="notificationmarker",
            name="academy_unique_notification_marker",
        ),
        migrations.AddConstraint(
            model_name="notificationmarker",
            constraint=models.UniqueConstraint(fields=("user", "level", "pathway", "kind"), name="academy_unique_notification_marker"),
        ),
        migrations.AddConstraint(
            model_name="pathwaycertificate",
            constraint=models.UniqueConstraint(fields=("user", "pathway"), name="academy_unique_pathway_certificate"),
        ),
    ]
