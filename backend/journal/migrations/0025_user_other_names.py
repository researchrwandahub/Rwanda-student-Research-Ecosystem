from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("journal", "0024_passport_public_fields"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="other_names",
            field=models.CharField(blank=True, max_length=150),
        ),
    ]
