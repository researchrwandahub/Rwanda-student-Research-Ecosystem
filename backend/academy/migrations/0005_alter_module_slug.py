from django.db import migrations, models

class Migration(migrations.Migration):
    dependencies = [('academy', '0004_academy_enhancements')]
    operations = [migrations.AlterField(model_name='module', name='slug', field=models.SlugField(max_length=255, unique=True))]
