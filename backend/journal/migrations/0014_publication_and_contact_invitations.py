from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("journal", "0013_founding_member")]

    operations = [
        migrations.AddField(model_name="reviewerinvitation", name="contact_name", field=models.CharField(blank=True, max_length=255)),
        migrations.AddField(model_name="reviewerinvitation", name="organization", field=models.CharField(blank=True, max_length=255)),
        migrations.AddField(model_name="reviewerinvitation", name="status", field=models.CharField(default="pending", max_length=20)),
        migrations.AddField(model_name="reviewerinvitation", name="token", field=models.CharField(blank=True, max_length=128, null=True, unique=True)),
        migrations.CreateModel(
            name="PublicationSettings",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("journal_name", models.CharField(default="Rwanda Student Journal for Health", max_length=255)),
                ("current_volume", models.PositiveIntegerField(default=1)),
                ("current_issue", models.PositiveIntegerField(default=1)),
                ("publication_year", models.PositiveIntegerField(default=2026)),
                ("next_article_number", models.PositiveIntegerField(default=1)),
                ("journal_code", models.CharField(default="rsjh", max_length=50)),
                ("doi_prefix", models.CharField(blank=True, max_length=100)),
                ("automatic_numbering", models.BooleanField(default=True)),
                ("automatic_volume_issue", models.BooleanField(default=True)),
                ("automatic_citation", models.BooleanField(default=True)),
                ("automatic_doi", models.BooleanField(default=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={"verbose_name": "Journal Publication Settings", "verbose_name_plural": "Journal Publication Settings"},
        ),
    ]
