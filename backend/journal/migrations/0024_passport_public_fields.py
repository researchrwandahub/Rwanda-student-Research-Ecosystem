from django.db import migrations, models

class Migration(migrations.Migration):
    dependencies = [("journal", "0023_alter_researchidea_options_and_more")]
    operations = [migrations.AddField(
        model_name="researchpassport", name="public_fields",
        field=models.JSONField(blank=True, default=list),
    )]
