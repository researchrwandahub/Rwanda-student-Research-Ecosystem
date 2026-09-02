from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("journal", "0012_v25_research_ecosystem")]

    operations = [
        migrations.CreateModel(
            name="FoundingMember",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=255)),
                ("role", models.CharField(max_length=255)),
                ("biography", models.TextField(blank=True)),
                ("photo", models.ImageField(blank=True, null=True, upload_to="founders/")),
                ("display_order", models.PositiveIntegerField(default=1)),
                ("active", models.BooleanField(default=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={"ordering": ["display_order", "id"]},
        ),
    ]
