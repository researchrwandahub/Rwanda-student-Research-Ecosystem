from django.db import migrations, models
import django.db.models.deletion

class Migration(migrations.Migration):
    dependencies = [("journal", "0020_research_sandbox")]
    operations = [
        migrations.CreateModel(
            name="StudentGift",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("sponsor_name", models.CharField(blank=True, max_length=255)),
                ("sponsor_email", models.EmailField(blank=True, max_length=254)),
                ("recipient_email", models.EmailField(max_length=254)),
                ("recipient_name", models.CharField(blank=True, max_length=255)),
                ("purpose", models.CharField(choices=[("journal_support", "Journal / Publication Support"), ("academy_support", "Research Academy Support"), ("research_support", "Research Development Support"), ("general", "General RSRE Gift")], default="general", max_length=30)),
                ("amount", models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                ("currency", models.CharField(default="RWF", max_length=8)),
                ("payment_method", models.CharField(choices=[("mobile_money", "Mobile Money"), ("card", "Card"), ("bank_transfer", "Bank Transfer"), ("other", "Other sponsor payment")], default="other", max_length=30)),
                ("payment_reference", models.CharField(blank=True, max_length=255)),
                ("status", models.CharField(choices=[("pending", "Pending payment"), ("paid", "Paid / ready to gift"), ("sent", "Gift code sent"), ("redeemed", "Redeemed"), ("expired", "Expired"), ("cancelled", "Cancelled")], default="pending", max_length=20)),
                ("gift_code", models.CharField(blank=True, max_length=40, unique=True)),
                ("message", models.TextField(blank=True)),
                ("expires_at", models.DateTimeField(blank=True, null=True)),
                ("sent_at", models.DateTimeField(blank=True, null=True)),
                ("redeemed_at", models.DateTimeField(blank=True, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("redeemed_by", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="redeemed_gifts", to="journal.user")),
            ],
            options={"ordering": ["-created_at"]},
        ),
        migrations.AddIndex(model_name="studentgift", index=models.Index(fields=["recipient_email", "status"], name="journal_stud_recipient_3e1c6e_idx")),
        migrations.AddIndex(model_name="studentgift", index=models.Index(fields=["gift_code"], name="journal_stud_gift_co_5b6f5e_idx")),
    ]
