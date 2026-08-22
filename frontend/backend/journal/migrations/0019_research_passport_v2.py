from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [("journal", "0018_research_incubator")]

    operations = [
        migrations.AddField(model_name="researchpassport", name="headline", field=models.CharField(blank=True, max_length=255)),
        migrations.AddField(model_name="researchpassport", name="career_goal", field=models.CharField(blank=True, max_length=500)),
        migrations.AddField(model_name="researchpassport", name="competencies", field=models.JSONField(blank=True, default=list)),
        migrations.AddField(model_name="researchpassport", name="visibility", field=models.CharField(choices=[("private", "Private"), ("network", "RSRE network"), ("public", "Public")], default="network", max_length=20)),
        migrations.AddField(model_name="researchpassport", name="verification_version", field=models.PositiveIntegerField(default=1)),
        migrations.CreateModel(
            name="PassportEvidence",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("evidence_type", models.CharField(choices=[("learning", "Learning"), ("credential", "Credential"), ("project", "Research project"), ("publication", "Publication"), ("review", "Peer review"), ("mentorship", "Mentorship"), ("collaboration", "Collaboration"), ("opportunity", "Opportunity"), ("milestone", "Research milestone")], max_length=30)),
                ("title", models.CharField(max_length=255)),
                ("description", models.TextField(blank=True)),
                ("source_type", models.CharField(choices=[("automatic", "Automatically recorded"), ("manual", "Added by researcher"), ("verified", "Verified by administrator")], default="automatic", max_length=20)),
                ("source_model", models.CharField(blank=True, max_length=120)),
                ("source_object_id", models.CharField(blank=True, max_length=80)),
                ("evidence_date", models.DateField(blank=True, null=True)),
                ("verification_note", models.CharField(blank=True, max_length=500)),
                ("verification_code", models.CharField(blank=True, db_index=True, max_length=80)),
                ("verified_at", models.DateTimeField(blank=True, null=True)),
                ("active", models.BooleanField(default=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("user", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="passport_evidence", to="journal.user")),
            ],
            options={"ordering": ["-evidence_date", "-created_at"]},
        ),
        migrations.AddIndex(model_name="passportevidence", index=models.Index(fields=["user", "evidence_type"], name="journal_pas_user_id_eviden_5e8291_idx")),
    ]
