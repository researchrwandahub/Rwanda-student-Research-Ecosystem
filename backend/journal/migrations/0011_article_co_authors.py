from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("journal", "0010_rsjh_roles_ecosystem"),
    ]

    operations = [
        migrations.AddField(
            model_name="article",
            name="co_authors",
            field=models.ManyToManyField(
                blank=True,
                related_name="coauthored_articles",
                to="journal.user",
            ),
        ),
    ]
