from django.db import migrations, models

def normalize_legacy_gift_purposes(apps, schema_editor):
    StudentGift = apps.get_model("journal", "StudentGift")
    StudentGift.objects.filter(purpose="journal_support").update(purpose="general")

class Migration(migrations.Migration):
    dependencies = [("journal", "0021_student_gift")]
    operations = [
        migrations.RunPython(normalize_legacy_gift_purposes, migrations.RunPython.noop),
        migrations.AlterField(
            model_name="studentgift",
            name="purpose",
            field=models.CharField(
                choices=[
                    ("academy_support", "Research Academy Support"),
                    ("research_support", "Research Development Support"),
                    ("general", "General RSRE Gift"),
                ],
                default="general", max_length=30,
            ),
        ),
    ]
