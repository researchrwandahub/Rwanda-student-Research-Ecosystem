from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion

class Migration(migrations.Migration):
    dependencies=[('rsre_core','0003_ethics'),('journal','0016_user_whatsapp_number')]
    operations=[
        migrations.CreateModel(
            name='CollaborationRequest',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('purpose', models.CharField(choices=[('research_project','Research project'),('mentorship','Mentorship'),('coauthor','Co-authorship'),('methods_support','Methods / statistics support'),('peer_learning','Peer learning')], default='research_project', max_length=30)),
                ('desired_role', models.CharField(blank=True, max_length=120)),
                ('message', models.TextField(blank=True)),
                ('status', models.CharField(choices=[('pending','Pending'),('accepted','Accepted'),('declined','Declined'),('cancelled','Cancelled')], default='pending', max_length=20)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('responded_at', models.DateTimeField(blank=True, null=True)),
                ('project', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='collaboration_requests', to='journal.researchproject')),
                ('recipient', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='collaboration_requests_received', to=settings.AUTH_USER_MODEL)),
                ('requester', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='collaboration_requests_sent', to=settings.AUTH_USER_MODEL)),
            ],
            options={'ordering':['-created_at']},
        ),
        migrations.AddConstraint(model_name='collaborationrequest', constraint=models.UniqueConstraint(fields=('requester','recipient','project','purpose'), name='rsre_unique_collaboration_request')),
    ]
