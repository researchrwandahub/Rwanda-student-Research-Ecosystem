from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion

class Migration(migrations.Migration):
    dependencies = [
        ("academy", "0006_course_resources_cohorts"),
    ]
    operations = [
        migrations.CreateModel(
            name="AcademyCourse",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("code", models.SlugField(max_length=120, unique=True)),
                ("title", models.CharField(max_length=255)),
                ("description", models.TextField(blank=True)),
                ("learning_outcomes", models.JSONField(blank=True, default=list)),
                ("estimated_hours", models.DecimalField(decimal_places=2, default=10, max_digits=6)),
                ("pass_mark", models.PositiveSmallIntegerField(default=80)),
                ("active", models.BooleanField(default=True)),
                ("order", models.PositiveIntegerField(default=0)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("level", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name="courses", to="academy.level")),
                ("pathway", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="courses", to="academy.specialistpathway")),
            ],
            options={"ordering": ["order", "title"]},
        ),
        migrations.CreateModel(
            name="ModulePrerequisite",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("minimum_quiz_score", models.PositiveSmallIntegerField(default=80)),
                ("module", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="prerequisite_rules", to="academy.module")),
                ("prerequisite", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="unlocks_modules", to="academy.module")),
            ],
        ),
        migrations.CreateModel(
            name="Assignment",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("title", models.CharField(max_length=255)),
                ("instructions", models.TextField()),
                ("submission_type", models.CharField(choices=[("text", "Text"), ("file", "File"), ("url", "URL"), ("mixed", "Mixed")], default="text", max_length=30)),
                ("max_score", models.PositiveIntegerField(default=100)),
                ("pass_mark", models.PositiveSmallIntegerField(default=80)),
                ("due_after_days", models.PositiveIntegerField(default=7)),
                ("attempts_allowed", models.PositiveIntegerField(default=1)),
                ("required", models.BooleanField(default=True)),
                ("active", models.BooleanField(default=True)),
                ("module", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="assignments", to="academy.module")),
            ],
            options={"ordering": ["module__order", "title"]},
        ),
        migrations.CreateModel(
            name="RubricCriterion",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("title", models.CharField(max_length=255)),
                ("description", models.TextField(blank=True)),
                ("max_points", models.PositiveIntegerField(default=10)),
                ("order", models.PositiveIntegerField(default=0)),
                ("assignment", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="rubric_criteria", to="academy.assignment")),
            ],
            options={"ordering": ["order", "id"]},
        ),
        migrations.CreateModel(
            name="AssignmentSubmission",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("response_text", models.TextField(blank=True)),
                ("file_url", models.URLField(blank=True)),
                ("external_url", models.URLField(blank=True)),
                ("attempt_number", models.PositiveIntegerField(default=1)),
                ("status", models.CharField(choices=[("submitted", "Submitted"), ("graded", "Graded"), ("returned", "Returned"), ("resubmit", "Resubmission requested")], default="submitted", max_length=20)),
                ("score", models.DecimalField(blank=True, decimal_places=2, max_digits=6, null=True)),
                ("feedback", models.TextField(blank=True)),
                ("submitted_at", models.DateTimeField(auto_now_add=True)),
                ("graded_at", models.DateTimeField(blank=True, null=True)),
                ("assignment", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="submissions", to="academy.assignment")),
                ("graded_by", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="graded_academy_assignments", to=settings.AUTH_USER_MODEL)),
                ("user", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="academy_assignment_submissions", to=settings.AUTH_USER_MODEL)),
            ],
            options={"ordering": ["-submitted_at"]},
        ),
        migrations.CreateModel(
            name="RubricScore",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("points", models.DecimalField(decimal_places=2, default=0, max_digits=6)),
                ("feedback", models.TextField(blank=True)),
                ("criterion", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="scores", to="academy.rubriccriterion")),
                ("submission", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="rubric_scores", to="academy.assignmentsubmission")),
            ],
        ),
        migrations.AddField(model_name="module", name="course", field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="modules", to="academy.academycourse")),
        migrations.AddField(model_name="badge", name="trigger_type", field=models.CharField(default="manual", max_length=40)),
        migrations.AddField(model_name="badge", name="trigger_value", field=models.CharField(blank=True, max_length=180)),
        migrations.AddConstraint(model_name="moduleprerequisite", constraint=models.UniqueConstraint(fields=("module", "prerequisite"), name="academy_unique_module_prerequisite")),
        migrations.AddConstraint(model_name="assignmentsubmission", constraint=models.UniqueConstraint(fields=("assignment", "user", "attempt_number"), name="academy_unique_assignment_attempt")),
        migrations.AddConstraint(model_name="rubricscore", constraint=models.UniqueConstraint(fields=("submission", "criterion"), name="academy_unique_rubric_score")),
    ]
