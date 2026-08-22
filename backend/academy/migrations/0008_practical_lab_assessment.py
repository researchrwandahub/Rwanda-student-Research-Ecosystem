from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion

class Migration(migrations.Migration):
    dependencies=[("academy","0007_learning_engine")]
    operations=[
        migrations.AddField(model_name="practicelab", name="pass_mark", field=models.PositiveSmallIntegerField(default=80)),
        migrations.AddField(model_name="practicelab", name="required", field=models.BooleanField(default=False)),
        migrations.AddField(model_name="practicelab", name="attempts_allowed", field=models.PositiveIntegerField(default=1)),
        migrations.AddField(model_name="labsubmission", name="status", field=models.CharField(default="submitted", max_length=20)),
        migrations.AddField(model_name="labsubmission", name="graded_at", field=models.DateTimeField(blank=True, null=True)),
        migrations.AddField(model_name="labsubmission", name="graded_by", field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="graded_academy_labs", to=settings.AUTH_USER_MODEL)),
    ]
