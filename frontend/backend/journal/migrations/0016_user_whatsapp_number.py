from django.db import migrations, models

class Migration(migrations.Migration):
    dependencies = [("journal", "0015_article_publication_number")]
    operations = [migrations.AddField(model_name="user", name="whatsapp_number", field=models.CharField(blank=True, max_length=30))]
