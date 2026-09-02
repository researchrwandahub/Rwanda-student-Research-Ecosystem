from django.db import migrations, models


def preserve_existing_course_visibility(apps, schema_editor):
    Course = apps.get_model("academy", "AcademyCourse")
    Course.objects.filter(active=True).update(status="published")
    Course.objects.filter(active=False).update(status="archived")


class Migration(migrations.Migration):
    dependencies = [("academy", "0011_alter_casestudy_options_and_more")]

    operations = [
        migrations.AddField(
            model_name="academycourse",
            name="status",
            field=models.CharField(
                choices=[("draft", "Draft"), ("published", "Published"), ("archived", "Archived")],
                default="draft",
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name="academycourse",
            name="published_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="academycourse",
            name="archived_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.RunPython(preserve_existing_course_visibility, migrations.RunPython.noop),
    ]
