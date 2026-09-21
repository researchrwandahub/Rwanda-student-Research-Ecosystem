from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ("journal", "0025_user_other_names"),
    ]

    operations = [
        migrations.RunSQL("DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'journal_user'::regclass AND contype = 'p') THEN ALTER TABLE journal_user ADD CONSTRAINT journal_user_pkey PRIMARY KEY (id); END IF; END $$;",migrations.RunSQL.noop),
        migrations.CreateModel(
            name="PolicyAcceptance",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("policy_type", models.CharField(choices=[
                    ("terms", "Terms of Use"),
                    ("privacy", "Privacy Notice"),
                    ("research_guidelines", "Research Community Guidelines"),
                    ("publication_ethics", "Publication Ethics & Editorial Policy"),
                    ("reviewer_guidelines", "Reviewer / Editorial Guidelines"),
                ], max_length=40)),
                ("policy_version", models.CharField(max_length=40)),
                ("accepted_at", models.DateTimeField(default=django.utils.timezone.now)),
                ("source", models.CharField(default="registration", max_length=40)),
                ("user", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="policy_acceptances", to="journal.user")),
            ],
            options={
                "ordering": ["policy_type", "-accepted_at"],
                "constraints": [
                    models.UniqueConstraint(
                        fields=("user", "policy_type", "policy_version"),
                        name="journal_unique_policy_acceptance",
                    )
                ],
            },
        ),
    ]






