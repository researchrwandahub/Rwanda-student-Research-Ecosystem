from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ("journal", "0011_article_co_authors"),
    ]

    operations = [
        migrations.AddField(
            model_name="article",
            name="handling_editor",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="handled_articles",
                to="journal.user",
            ),
        ),
        migrations.CreateModel(
            name="CoAuthorContribution",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("contribution_roles", models.JSONField(blank=True, default=list)),
                ("author_order", models.PositiveIntegerField(default=1)),
                ("article", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="coauthor_contributions", to="journal.article")),
                ("user", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="article_contributions", to="journal.user")),
            ],
            options={
                "ordering": ["author_order", "id"],
                "unique_together": {("article", "user")},
            },
        ),
    ]
