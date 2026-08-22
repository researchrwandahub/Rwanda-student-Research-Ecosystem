from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone

class Migration(migrations.Migration):
    dependencies = [("academy", "0009_course_learning_records")]
    operations = [migrations.CreateModel(name="ModuleCertificate", fields=[
        ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
        ("certificate_id", models.CharField(max_length=100, unique=True)),
        ("issued_at", models.DateTimeField(default=django.utils.timezone.now)),
        ("status", models.CharField(default="valid", max_length=20)),
        ("module", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="certificates", to="academy.module")),
        ("user", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="academy_module_certificates", to=settings.AUTH_USER_MODEL)),
    ], options={"constraints":[models.UniqueConstraint(fields=["user","module"], name="academy_unique_module_certificate")]})]
