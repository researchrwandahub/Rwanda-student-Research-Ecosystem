from django.db import migrations, models
from django.utils import timezone
import django.db.models.deletion
from django.conf import settings


class Migration(migrations.Migration):
    dependencies = [("academy", "0003_admin_learning_and_branding")]

    operations = [
        migrations.CreateModel(
            name="Badge",
            fields=[("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")), ("name", models.CharField(max_length=180, unique=True)), ("code", models.SlugField(max_length=180, unique=True)), ("description", models.TextField(blank=True)), ("icon", models.CharField(default="🏅", max_length=30)), ("active", models.BooleanField(default=True))],
        ),
        migrations.CreateModel(
            name="DiagnosticAssessment",
            fields=[("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")), ("title", models.CharField(default="Research Academy Entry Assessment", max_length=255)), ("description", models.TextField(blank=True)), ("active", models.BooleanField(default=True)), ("pass_mark", models.PositiveSmallIntegerField(default=70)), ("questions", models.JSONField(blank=True, default=list))],
        ),
        migrations.CreateModel(
            name="CaseStudy",
            fields=[("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")), ("title", models.CharField(max_length=255)), ("country", models.CharField(default="Rwanda", max_length=100)), ("topic", models.CharField(max_length=160)), ("scenario", models.TextField()), ("questions", models.JSONField(blank=True, default=list)), ("active", models.BooleanField(default=True))],
        ),
        migrations.CreateModel(
            name="LiveSession",
            fields=[("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")), ("title", models.CharField(max_length=255)), ("description", models.TextField(blank=True)), ("starts_at", models.DateTimeField()), ("duration_minutes", models.PositiveIntegerField(default=60)), ("meeting_url", models.URLField(blank=True)), ("recording_url", models.URLField(blank=True)), ("registration_url", models.URLField(blank=True)), ("speaker", models.CharField(blank=True, max_length=255)), ("active", models.BooleanField(default=True))],
        ),
        migrations.CreateModel(
            name="PracticeLab",
            fields=[("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")), ("title", models.CharField(max_length=255)), ("description", models.TextField()), ("instructions", models.TextField(blank=True)), ("rubric", models.JSONField(blank=True, default=list)), ("active", models.BooleanField(default=True)), ("module", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name="practice_labs", to="academy.module"))],
        ),
        migrations.CreateModel(
            name="CourseVersion",
            fields=[("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")), ("version", models.CharField(default="1.0", max_length=30)), ("release_notes", models.TextField(blank=True)), ("active", models.BooleanField(default=True)), ("created_at", models.DateTimeField(auto_now_add=True)), ("level", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name="versions", to="academy.level")), ("module", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name="versions", to="academy.module"))],
        ),
        migrations.CreateModel(
            name="DiscussionPost",
            fields=[("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")), ("title", models.CharField(max_length=255)), ("body", models.TextField()), ("created_at", models.DateTimeField(auto_now_add=True)), ("active", models.BooleanField(default=True)), ("module", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name="discussion_posts", to="academy.module")), ("user", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="academy_discussion_posts", to=settings.AUTH_USER_MODEL))],
        ),
        migrations.CreateModel(
            name="DiagnosticAttempt",
            fields=[("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")), ("score", models.DecimalField(decimal_places=2, max_digits=5)), ("recommended_level", models.PositiveSmallIntegerField(default=1)), ("answers", models.JSONField(blank=True, default=dict)), ("submitted_at", models.DateTimeField(auto_now_add=True)), ("assessment", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="attempts", to="academy.diagnosticassessment")), ("user", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="academy_diagnostic_attempts", to=settings.AUTH_USER_MODEL))],
        ),
        migrations.CreateModel(
            name="LabSubmission",
            fields=[("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")), ("response", models.TextField()), ("score", models.DecimalField(blank=True, decimal_places=2, max_digits=5, null=True)), ("feedback", models.TextField(blank=True)), ("submitted_at", models.DateTimeField(auto_now_add=True)), ("lab", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="submissions", to="academy.practicelab")), ("user", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="academy_lab_submissions", to=settings.AUTH_USER_MODEL))],
        ),
        migrations.CreateModel(
            name="UserBadge",
            fields=[("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")), ("awarded_at", models.DateTimeField(default=timezone.now)), ("evidence", models.CharField(blank=True, max_length=255)), ("badge", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="awards", to="academy.badge")), ("user", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="academy_badges", to=settings.AUTH_USER_MODEL))],
            options={"constraints": [models.UniqueConstraint(fields=("user", "badge"), name="academy_unique_user_badge")]},
        ),
    ]
