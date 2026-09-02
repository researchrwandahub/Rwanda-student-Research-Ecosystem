from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [("journal", "0019_research_passport_v2")]
    operations = [
        migrations.CreateModel(
            name="ResearchSandboxWorkspace",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("title", models.CharField(max_length=255)),
                ("description", models.TextField(blank=True)),
                ("research_topic", models.CharField(blank=True, max_length=255)),
                ("visibility", models.CharField(choices=[("private", "Private"), ("team", "Team")], default="private", max_length=20)),
                ("status", models.CharField(choices=[("active", "Active"), ("archived", "Archived")], default="active", max_length=20)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("owner", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="sandbox_workspaces", to="journal.user")),
            ],
            options={"ordering": ["-updated_at", "-created_at"]},
        ),
        migrations.CreateModel(
            name="ResearchSandboxNote",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("title", models.CharField(max_length=255)),
                ("body", models.TextField(blank=True)),
                ("note_type", models.CharField(default="research_note", max_length=30)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("author", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="sandbox_notes", to="journal.user")),
                ("workspace", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="notes", to="journal.researchsandboxworkspace")),
            ],
            options={"ordering": ["-updated_at", "-created_at"]},
        ),
        migrations.CreateModel(
            name="ResearchSandboxDataset",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=255)),
                ("description", models.TextField(blank=True)),
                ("data_type", models.CharField(choices=[("public", "Public"), ("synthetic", "Synthetic"), ("authorized", "Authorized research data")], default="synthetic", max_length=20)),
                ("source", models.CharField(blank=True, max_length=255)),
                ("authorization_reference", models.CharField(blank=True, max_length=255)),
                ("safety_status", models.CharField(choices=[("review", "Review required"), ("approved", "Approved for sandbox"), ("blocked", "Blocked")], default="review", max_length=20)),
                ("contains_direct_identifiers", models.BooleanField(default=False)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("workspace", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="datasets", to="journal.researchsandboxworkspace")),
            ],
            options={"ordering": ["-updated_at", "-created_at"]},
        ),
    ]
