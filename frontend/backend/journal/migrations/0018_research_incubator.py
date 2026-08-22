from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [("journal", "0017_research_opportunity_sources")]

    operations = [
        migrations.AddField(model_name="researchidea", name="research_question", field=models.TextField(blank=True)),
        migrations.AddField(model_name="researchidea", name="objectives", field=models.TextField(blank=True)),
        migrations.AddField(model_name="researchidea", name="discipline", field=models.CharField(blank=True, max_length=120)),
        migrations.AddField(model_name="researchidea", name="updated_at", field=models.DateTimeField(auto_now=True)),
        migrations.AlterField(
            model_name="researchidea", name="status",
            field=models.CharField(choices=[("idea", "Idea"), ("refining", "Refining"), ("ready", "Ready for project"), ("converted", "Converted to project"), ("archived", "Archived")], default="idea", max_length=30),
        ),
        migrations.CreateModel(
            name="ResearchProject",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("title", models.CharField(max_length=255)),
                ("research_question", models.TextField(blank=True)),
                ("objectives", models.TextField(blank=True)),
                ("background", models.TextField(blank=True)),
                ("methodology", models.TextField(blank=True)),
                ("discipline", models.CharField(blank=True, max_length=120)),
                ("study_type", models.CharField(blank=True, max_length=120)),
                ("status", models.CharField(choices=[("developing", "Developing"), ("protocol", "Protocol development"), ("ethics", "Ethics & governance"), ("data_collection", "Data collection"), ("analysis", "Analysis"), ("manuscript", "Manuscript"), ("publication", "Publication"), ("completed", "Completed"), ("paused", "Paused")], default="developing", max_length=30)),
                ("ethics_status", models.CharField(choices=[("not_started", "Not started"), ("planning", "Planning"), ("submitted", "Submitted"), ("approved", "Approved"), ("not_required", "Not required")], default="not_started", max_length=30)),
                ("data_governance_status", models.CharField(choices=[("not_started", "Not started"), ("planning", "Planning"), ("ready", "Ready")], default="not_started", max_length=30)),
                ("visibility", models.CharField(choices=[("private", "Private"), ("team", "Team"), ("public_summary", "Public summary")], default="private", max_length=20)),
                ("readiness_score", models.PositiveSmallIntegerField(default=0)),
                ("target_completion_date", models.DateField(blank=True, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("mentor", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="mentored_research_projects", to="journal.user")),
                ("owner", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="research_projects", to="journal.user")),
                ("source_idea", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="projects", to="journal.researchidea")),
            ],
            options={"ordering": ["-updated_at", "-created_at"]},
        ),
        migrations.CreateModel(
            name="ResearchProjectMember",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("role", models.CharField(choices=[("co_investigator", "Co-investigator"), ("research_assistant", "Research assistant"), ("data_analyst", "Data analyst"), ("advisor", "Advisor")], default="co_investigator", max_length=30)),
                ("status", models.CharField(choices=[("invited", "Invited"), ("active", "Active"), ("left", "Left")], default="active", max_length=20)),
                ("joined_at", models.DateTimeField(auto_now_add=True)),
                ("project", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="members", to="journal.researchproject")),
                ("user", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="research_project_memberships", to="journal.user")),
            ],
            options={"ordering": ["role", "joined_at"]},
        ),
        migrations.CreateModel(
            name="ResearchProjectMilestone",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("title", models.CharField(max_length=255)),
                ("description", models.TextField(blank=True)),
                ("due_date", models.DateField(blank=True, null=True)),
                ("status", models.CharField(choices=[("todo", "To do"), ("in_progress", "In progress"), ("done", "Done"), ("blocked", "Blocked")], default="todo", max_length=20)),
                ("order", models.PositiveIntegerField(default=1)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("project", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="milestones", to="journal.researchproject")),
            ],
            options={"ordering": ["order", "due_date", "id"]},
        ),
        migrations.AddConstraint(
            model_name="researchprojectmember",
            constraint=models.UniqueConstraint(fields=("project", "user"), name="unique_research_project_member"),
        ),
    ]
