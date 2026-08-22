from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion

class Migration(migrations.Migration):
    dependencies = [("rsre_core", "0002_rsre_features_whatsapp")]
    operations = [
        migrations.CreateModel(
            name="EthicsAssessment",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("target_type", models.CharField(choices=[("project","Research project"),("sandbox","Sandbox workspace"),("academy_lab","Academy practical lab"),("other","Other research activity")], default="other", max_length=30)),
                ("target_id", models.PositiveIntegerField(blank=True, null=True)),
                ("title", models.CharField(max_length=255)),
                ("involves_human_participants", models.BooleanField(default=False)),
                ("involves_vulnerable_groups", models.BooleanField(default=False)),
                ("uses_identifiable_or_sensitive_data", models.BooleanField(default=False)),
                ("uses_existing_public_data", models.BooleanField(default=False)),
                ("biological_samples_or_interventions", models.BooleanField(default=False)),
                ("ai_or_automated_decision_support", models.BooleanField(default=False)),
                ("informed_consent_status", models.CharField(default="not_applicable", max_length=80)),
                ("institutional_review_status", models.CharField(default="not_started", max_length=80)),
                ("risk_level", models.CharField(choices=[("low","Low"),("moderate","Moderate"),("high","High")], default="low", max_length=20)),
                ("status", models.CharField(choices=[("draft","Draft"),("guidance","Guidance provided"),("ready_for_review","Ready for institutional review"),("referred","Referred to appropriate authority"),("closed","Closed")], default="draft", max_length=30)),
                ("guidance", models.TextField(blank=True)),
                ("user_notes", models.TextField(blank=True)),
                ("reviewed_by_id", models.PositiveIntegerField(blank=True, null=True)),
                ("reviewed_at", models.DateTimeField(blank=True, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("user", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="ethics_assessments", to=settings.AUTH_USER_MODEL)),
            ],
            options={"ordering":["-updated_at"]},
        ),
        migrations.CreateModel(
            name="EthicsResource",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("title", models.CharField(max_length=255)),
                ("resource_type", models.CharField(choices=[("guide","Guidance"),("checklist","Checklist"),("template","Template"),("policy","Policy"),("training","Training resource")], default="guide", max_length=30)),
                ("summary", models.TextField(blank=True)),
                ("url", models.URLField(blank=True)),
                ("active", models.BooleanField(default=True)),
                ("order", models.PositiveIntegerField(default=0)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={"ordering":["order","title"]},
        ),
    ]
