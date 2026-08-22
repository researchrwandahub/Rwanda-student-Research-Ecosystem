from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("journal", "0016_user_whatsapp_number")]

    operations = [
        migrations.AddField(
            model_name="researchopportunity",
            name="external_id",
            field=models.CharField(blank=True, db_index=True, max_length=120),
        ),
        migrations.AddField(
            model_name="researchopportunity",
            name="last_synced_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="researchopportunity",
            name="source_name",
            field=models.CharField(blank=True, max_length=120),
        ),
        migrations.AddField(
            model_name="researchopportunity",
            name="source_type",
            field=models.CharField(choices=[("automatic", "Automatically imported"), ("manual", "Added by administrator")], default="manual", max_length=20),
        ),
        migrations.AddField(
            model_name="researchopportunity",
            name="updated_at",
            field=models.DateTimeField(auto_now=True),
        ),
        migrations.AddConstraint(
            model_name="researchopportunity",
            constraint=models.UniqueConstraint(fields=("source_name", "external_id"), name="unique_research_opportunity_external_record"),
        ),
    ]
