from django.conf import settings
from django.db import models

class PaymentSettings(models.Model):
    singleton_key = models.PositiveSmallIntegerField(default=1, unique=True)
    organisation_name = models.CharField(max_length=255, default='RSRE')
    support_message = models.TextField(blank=True, default='Support responsible student research, training and publication infrastructure in Rwanda.')
    currency = models.CharField(max_length=8, default='RWF')
    mtn_enabled = models.BooleanField(default=False)
    mtn_display_number = models.CharField(max_length=32, blank=True)
    airtel_enabled = models.BooleanField(default=False)
    airtel_display_number = models.CharField(max_length=32, blank=True)
    bank_enabled = models.BooleanField(default=False)
    bank_name = models.CharField(max_length=255, blank=True)
    bank_account_name = models.CharField(max_length=255, blank=True)
    bank_account_number = models.CharField(max_length=128, blank=True)
    bank_branch = models.CharField(max_length=255, blank=True)
    bank_swift = models.CharField(max_length=64, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.organisation_name

class SupportPayment(models.Model):
    METHOD_CHOICES = [('mtn_momo','MTN MoMo'),('airtel_money','Airtel Money'),('bank_transfer','Bank transfer')]
    STATUS_CHOICES = [('draft','Draft'),('submitted','Submitted'),('pending','Pending'),('verified','Verified'),('rejected','Rejected')]
    payer_user = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='support_payments')
    payer_name = models.CharField(max_length=255)
    payer_email = models.EmailField(blank=True)
    payer_phone = models.CharField(max_length=32, blank=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=8, default='RWF')
    method = models.CharField(max_length=32, choices=METHOD_CHOICES)
    purpose = models.CharField(max_length=255, blank=True)
    reference = models.CharField(max_length=255, blank=True)
    proof = models.FileField(upload_to='support/payments/', null=True, blank=True)
    provider_transaction_id = models.CharField(max_length=255, blank=True)
    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default='submitted')
    admin_note = models.TextField(blank=True)
    verified_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='verified_support_payments')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.payer_name} — {self.amount} {self.currency} — {self.status}'
