from django.db import migrations, models
import django.db.models.deletion
from django.conf import settings


class Migration(migrations.Migration):
    dependencies = [('journal', '0001_initial')]

    operations = [
        migrations.RunSQL(
            "UPDATE journal_user SET role = 'administrator' WHERE role = 'admin'; UPDATE journal_user SET role = 'reviewer_editor' WHERE role IN ('reviewer', 'editor');",
            "UPDATE journal_user SET role = 'admin' WHERE role = 'administrator'; UPDATE journal_user SET role = 'reviewer' WHERE role = 'reviewer_editor';",
        ),
        migrations.AlterField(
            model_name='user', name='role',
            field=models.CharField(choices=[('reader', 'Reader'), ('author', 'Author'), ('reviewer_editor', 'Reviewer / Editor'), ('administrator', 'Administrator')], default='reader', max_length=20),
        ),
        migrations.AddField(model_name='user', name='full_name', field=models.CharField(blank=True, max_length=255)),
        migrations.AddField(model_name='user', name='institution', field=models.CharField(blank=True, max_length=255)),
        migrations.AddField(model_name='user', name='research_interests', field=models.TextField(blank=True)),
        migrations.AddField(model_name='user', name='country', field=models.CharField(blank=True, max_length=128)),
        migrations.CreateModel(
            name='Notification',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=255)), ('message', models.TextField()), ('is_read', models.BooleanField(default=False)), ('created_at', models.DateTimeField(auto_now_add=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='notifications', to=settings.AUTH_USER_MODEL)),
            ], options={'ordering': ['-created_at']},
        ),
        migrations.CreateModel(
            name='Bookmark',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('article', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='bookmarked_by', to='journal.article')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='bookmarks', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.AddConstraint(model_name='bookmark', constraint=models.UniqueConstraint(fields=('user', 'article'), name='unique_user_article_bookmark')),
        migrations.AlterModelOptions(name='user', options={'permissions': [('manage_assigned_reviews', 'Can manage assigned reviews'), ('make_editorial_recommendations', 'Can make editorial recommendations'), ('upload_article_revisions', 'Can upload article revisions'), ('bookmark_articles', 'Can bookmark articles')]}),
    ]
