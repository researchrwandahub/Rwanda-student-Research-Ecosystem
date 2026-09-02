from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):
    initial = True
    dependencies = [migrations.swappable_dependency(settings.AUTH_USER_MODEL)]
    operations = [
        migrations.CreateModel(
            name="Level",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("number", models.PositiveIntegerField(unique=True)),
                ("name", models.CharField(max_length=80)),
                ("code", models.SlugField(max_length=80, unique=True)),
                ("description", models.TextField()),
                ("required_pass_mark", models.PositiveSmallIntegerField(default=80)),
                ("active", models.BooleanField(default=True)),
            ],
            options={"ordering": ["number"]},
        ),
        migrations.CreateModel(
            name="Module",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("order", models.PositiveIntegerField()),
                ("title", models.CharField(max_length=255)),
                ("slug", models.SlugField(unique=True)),
                ("summary", models.TextField()),
                ("objectives", models.JSONField(blank=True, default=list)),
                ("estimated_minutes", models.PositiveIntegerField(default=60)),
                ("required", models.BooleanField(default=True)),
                ("active", models.BooleanField(default=True)),
                ("level", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="modules", to="academy.level")),
            ],
            options={"ordering": ["level__number", "order"], "constraints": [models.UniqueConstraint(fields=["level", "order"], name="academy_unique_module_order_per_level")]},
        ),
        migrations.CreateModel(
            name="Lesson",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("order", models.PositiveIntegerField()),
                ("title", models.CharField(max_length=255)),
                ("lesson_type", models.CharField(choices=[("text", "Text"), ("video", "Video"), ("activity", "Activity")], default="text", max_length=30)),
                ("body", models.TextField(blank=True)),
                ("video_url", models.URLField(blank=True)),
                ("resource_urls", models.JSONField(blank=True, default=list)),
                ("estimated_minutes", models.PositiveIntegerField(default=15)),
                ("required", models.BooleanField(default=True)),
                ("active", models.BooleanField(default=True)),
                ("module", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="lessons", to="academy.module")),
            ],
            options={"ordering": ["module__level__number", "module__order", "order"], "constraints": [models.UniqueConstraint(fields=["module", "order"], name="academy_unique_lesson_order")]},
        ),
        migrations.CreateModel(
            name="Quiz",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("title", models.CharField(max_length=255)),
                ("pass_mark", models.PositiveSmallIntegerField(default=80)),
                ("attempts_allowed", models.PositiveIntegerField(default=0)),
                ("module", models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name="quiz", to="academy.module")),
            ],
        ),
        migrations.CreateModel(
            name="Question",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("order", models.PositiveIntegerField()),
                ("prompt", models.TextField()),
                ("question_type", models.CharField(choices=[("single", "Single choice"), ("multi", "Multiple choice")], default="single", max_length=20)),
                ("explanation", models.TextField(blank=True)),
                ("quiz", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="questions", to="academy.quiz")),
            ],
            options={"ordering": ["order"], "constraints": [models.UniqueConstraint(fields=["quiz", "order"], name="academy_unique_question_order")]},
        ),
        migrations.CreateModel(
            name="Choice",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("order", models.PositiveIntegerField()),
                ("text", models.CharField(max_length=500)),
                ("is_correct", models.BooleanField(default=False)),
                ("question", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="choices", to="academy.question")),
            ],
            options={"ordering": ["order"], "constraints": [models.UniqueConstraint(fields=["question", "order"], name="academy_unique_choice_order")]},
        ),
        migrations.CreateModel(
            name="Enrollment",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("enrolled_at", models.DateTimeField(auto_now_add=True)),
                ("email_updates", models.BooleanField(default=True)),
                ("progress_reminders", models.BooleanField(default=True)),
                ("user", models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name="academy_enrollment", to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name="LessonProgress",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("completed_at", models.DateTimeField(blank=True, null=True)),
                ("lesson", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="progress_records", to="academy.lesson")),
                ("user", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="academy_lesson_progress", to=settings.AUTH_USER_MODEL)),
            ],
            options={"constraints": [models.UniqueConstraint(fields=["user", "lesson"], name="academy_unique_user_lesson")]},
        ),
        migrations.CreateModel(
            name="QuizAttempt",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("score", models.DecimalField(decimal_places=2, max_digits=5)),
                ("passed", models.BooleanField(default=False)),
                ("answers", models.JSONField(default=dict)),
                ("submitted_at", models.DateTimeField(auto_now_add=True)),
                ("quiz", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="attempts", to="academy.quiz")),
                ("user", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="academy_quiz_attempts", to=settings.AUTH_USER_MODEL)),
            ],
            options={"ordering": ["-submitted_at"]},
        ),
        migrations.CreateModel(
            name="LevelCertificate",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("certificate_id", models.CharField(max_length=80, unique=True)),
                ("issued_at", models.DateTimeField(default=django.utils.timezone.now)),
                ("level", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="certificates", to="academy.level")),
                ("user", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="academy_certificates", to=settings.AUTH_USER_MODEL)),
            ],
            options={"constraints": [models.UniqueConstraint(fields=["user", "level"], name="academy_unique_level_certificate")]},
        ),
        migrations.CreateModel(
            name="NotificationMarker",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("kind", models.CharField(default="level_completed", max_length=80)),
                ("sent", models.BooleanField(default=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("level", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to="academy.level")),
                ("user", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="academy_notification_markers", to=settings.AUTH_USER_MODEL)),
            ],
            options={"constraints": [models.UniqueConstraint(fields=["user", "level", "kind"], name="academy_unique_notification_marker")]},
        ),
    ]
