from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion

class Migration(migrations.Migration):
    dependencies = [("academy", "0002_academy_v2"), migrations.swappable_dependency(settings.AUTH_USER_MODEL)]
    operations = [
        migrations.AddField(model_name="certificatesettings", name="official_stamp", field=models.ImageField(blank=True, null=True, upload_to="academy/branding/stamps/")),
        migrations.AddField(model_name="certificatesettings", name="institutional_seal", field=models.ImageField(blank=True, null=True, upload_to="academy/branding/seals/")),
        migrations.AddField(model_name="certificatesettings", name="organization_logo", field=models.ImageField(blank=True, null=True, upload_to="academy/branding/")),
        migrations.AddField(model_name="certificatesettings", name="signatory_institution", field=models.CharField(blank=True, max_length=255)),
        migrations.AddField(model_name="certificatesettings", name="signature_image", field=models.ImageField(blank=True, null=True, upload_to="academy/branding/signatures/")),
        migrations.AddField(model_name="certificatesettings", name="stamp_url", field=models.URLField(blank=True)),
        migrations.AddField(model_name="certificatesettings", name="certificate_template", field=models.CharField(default="modern_research", max_length=50)),
        migrations.AlterField(model_name="certificatesettings", name="signature_name", field=models.CharField(default="Programme Lead", max_length=255)),
        migrations.AlterField(model_name="certificatesettings", name="signature_credentials", field=models.CharField(default="", max_length=255)),
        migrations.AlterField(model_name="certificatesettings", name="signature_title", field=models.CharField(default="Programme Lead", max_length=255)),
        migrations.AlterField(model_name="certificatesettings", name="certificate_footer", field=models.CharField(default="This credential recognizes demonstrated achievement in an RSRE Research Academy learning pathway.", max_length=500)),
        migrations.CreateModel(name="StudentQuestion", fields=[
            ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
            ("subject", models.CharField(max_length=255)),
            ("question", models.TextField()),
            ("answer", models.TextField(blank=True)),
            ("status", models.CharField(choices=[("open", "Open"), ("answered", "Answered"), ("closed", "Closed")], default="open", max_length=20)),
            ("created_at", models.DateTimeField(auto_now_add=True)),
            ("answered_at", models.DateTimeField(blank=True, null=True)),
            ("answered_by", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="answered_academy_questions", to=settings.AUTH_USER_MODEL)),
            ("lesson", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="student_questions", to="academy.lesson")),
            ("user", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="academy_questions", to=settings.AUTH_USER_MODEL)),
        ], options={"ordering":["-created_at"]}),
        migrations.CreateModel(name="AcademyAnnouncement", fields=[
            ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
            ("title", models.CharField(max_length=255)),
            ("message", models.TextField()),
            ("audience", models.CharField(default="all", max_length=50)),
            ("active", models.BooleanField(default=True)),
            ("created_at", models.DateTimeField(auto_now_add=True)),
        ], options={"ordering":["-created_at"]}),
    ]
