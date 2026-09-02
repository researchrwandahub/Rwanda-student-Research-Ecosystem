from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True
    dependencies = [('journal', '0016_user_whatsapp_number')]

    operations = [
        migrations.CreateModel(name='Application', fields=[
            ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
            ('key', models.SlugField(max_length=50, unique=True)), ('name', models.CharField(max_length=120)),
            ('short_name', models.CharField(blank=True, max_length=80)), ('description', models.TextField(blank=True)),
            ('route', models.CharField(max_length=120, unique=True)), ('icon', models.CharField(blank=True, max_length=20)),
            ('nav_label', models.CharField(blank=True, max_length=80)), ('active', models.BooleanField(default=True)),
            ('public', models.BooleanField(default=True)), ('order', models.PositiveIntegerField(default=0)),
            ('settings_json', models.JSONField(blank=True, default=dict)),
        ], options={'ordering':['order','name']}),
        migrations.CreateModel(name='PlatformSetting', fields=[
            ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
            ('singleton_key', models.PositiveSmallIntegerField(default=1, editable=False, unique=True)),
            ('platform_name', models.CharField(default='Rwanda Student Research Ecosystem', max_length=255)),
            ('short_name', models.CharField(default='RSRE', max_length=50)),
            ('tagline', models.CharField(default='Research. Connect. Build. Publish. Impact.', max_length=255)),
            ('footer_tagline', models.CharField(default='A student-centered health research ecosystem built in Rwanda with international standards and global collaboration ambitions.', max_length=500)),
            ('primary_email', models.EmailField(default='researchrwandahub@gmail.com', max_length=254)), ('phone', models.CharField(blank=True, max_length=50)),
            ('whatsapp_enabled', models.BooleanField(default=False)), ('whatsapp_provider', models.CharField(blank=True, max_length=80)),
            ('whatsapp_api_url', models.URLField(blank=True)), ('whatsapp_token', models.CharField(blank=True, max_length=500)),
            ('announcement_text', models.TextField(default='🤝 Collaboration & mentorship • 🧪 Student-led health research • 📣 Open research opportunities • 📚 New research articles')),
            ('theme_json', models.JSONField(blank=True, default=dict)), ('updated_at', models.DateTimeField(auto_now=True)),
        ]),
        migrations.CreateModel(name='ContentItem', fields=[
            ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
            ('slug', models.SlugField(max_length=150)), ('title', models.CharField(max_length=255)), ('body', models.TextField(blank=True)),
            ('content_type', models.CharField(choices=[('hero','Hero'),('page','Page'),('banner','Banner'),('resource','Resource'),('faq','FAQ'),('announcement','Announcement')], default='page', max_length=30)),
            ('active', models.BooleanField(default=True)), ('order', models.PositiveIntegerField(default=0)), ('metadata', models.JSONField(blank=True, default=dict)),
            ('updated_at', models.DateTimeField(auto_now=True)),
            ('application', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='content_items', to='rsre_core.application')),
        ], options={'ordering':['order','title'],'unique_together':{('application','slug')}}),
        migrations.CreateModel(name='NotificationPreference', fields=[
            ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
            ('email_enabled', models.BooleanField(default=True)), ('whatsapp_enabled', models.BooleanField(default=False)), ('in_app_enabled', models.BooleanField(default=True)),
            ('academy', models.BooleanField(default=True)), ('journal', models.BooleanField(default=True)), ('opportunities', models.BooleanField(default=True)),
            ('incubator', models.BooleanField(default=True)), ('support', models.BooleanField(default=True)), ('certificates', models.BooleanField(default=True)), ('critical_security', models.BooleanField(default=True)),
            ('updated_at', models.DateTimeField(auto_now=True)),
            ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='rsre_notification_preferences', to=settings.AUTH_USER_MODEL)),
        ]),
        migrations.CreateModel(name='SupportTicket', fields=[
            ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
            ('category', models.CharField(default='technical', max_length=80)), ('subject', models.CharField(max_length=255)), ('description', models.TextField()),
            ('priority', models.CharField(choices=[('low','Low'),('normal','Normal'),('high','High'),('urgent','Urgent')], default='normal', max_length=20)),
            ('status', models.CharField(choices=[('new','New'),('in_progress','In progress'),('waiting','Waiting for user'),('resolved','Resolved'),('closed','Closed')], default='new', max_length=20)),
            ('created_at', models.DateTimeField(auto_now_add=True)), ('updated_at', models.DateTimeField(auto_now=True)),
            ('application', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='rsre_core.application')),
            ('assigned_to', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='assigned_rsre_tickets', to=settings.AUTH_USER_MODEL)),
            ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='rsre_support_tickets', to=settings.AUTH_USER_MODEL)),
        ], options={'ordering':['-created_at']}),
        migrations.CreateModel(name='SupportMessage', fields=[
            ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')), ('message', models.TextField()), ('created_at', models.DateTimeField(auto_now_add=True)),
            ('author', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
            ('ticket', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='messages', to='rsre_core.supportticket')),
        ], options={'ordering':['created_at']}),
        migrations.CreateModel(name='NotificationOutbox', fields=[
            ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
            ('channel', models.CharField(choices=[('in_app','In-app'),('email','Email'),('whatsapp','WhatsApp')], max_length=20)), ('subject', models.CharField(blank=True, max_length=255)), ('body', models.TextField()),
            ('status', models.CharField(choices=[('queued','Queued'),('sent','Sent'),('failed','Failed'),('skipped','Skipped')], default='queued', max_length=20)),
            ('provider_message_id', models.CharField(blank=True, max_length=255)), ('error_message', models.TextField(blank=True)), ('created_at', models.DateTimeField(auto_now_add=True)), ('sent_at', models.DateTimeField(blank=True, null=True)),
            ('user', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
        ]),
        migrations.CreateModel(name='AdminAuditEvent', fields=[
            ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')), ('action', models.CharField(max_length=100)), ('target_type', models.CharField(blank=True, max_length=100)), ('target_id', models.CharField(blank=True, max_length=100)), ('metadata', models.JSONField(blank=True, default=dict)), ('created_at', models.DateTimeField(auto_now_add=True)),
            ('actor', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
        ], options={'ordering':['-created_at']}),
    ]
