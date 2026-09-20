from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [("journal", "0026_policy_acceptance")]

    operations = [
        migrations.CreateModel(
            name="ResearchSandboxRun",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("title", models.CharField(max_length=255)),
                ("method", models.TextField(blank=True)),
                ("result_summary", models.TextField(blank=True)),
                ("reproducibility_note", models.TextField(blank=True)),
                ("status", models.CharField(choices=[("planned", "Planned"), ("complete", "Complete"), ("failed", "Failed")], default="complete", max_length=20)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("workspace", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="runs", to="journal.researchsandboxworkspace")),
            ],
            options={"ordering": ["-updated_at", "-created_at"]},
        ),
    ]
