from django.db import migrations, models

class Migration(migrations.Migration):
    dependencies = [("journal", "0014_publication_and_contact_invitations")]
    operations = [
        migrations.AddField(
            model_name="article",
            name="publication_number",
            field=models.PositiveIntegerField(blank=True, null=True, unique=True),
        ),
    ]
