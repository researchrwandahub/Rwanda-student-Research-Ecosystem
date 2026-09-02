from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

from .models import PaymentSettings, SupportPayment


class SupportPaymentApiTests(APITestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username='support-user', email='support@example.com', password='ValidPass!123'
        )
        self.admin = get_user_model().objects.create_user(
            username='support-admin', password='ValidPass!123', role='administrator'
        )
        PaymentSettings.objects.create(singleton_key=1, mtn_enabled=True, mtn_display_number='0780000000')

    def test_public_settings_expose_configured_instructions_and_whatsapp(self):
        response = self.client.get('/api/payments/settings/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['mtn_display_number'], '0780000000')
        self.assertNotIn('admin_note', response.data)

    def test_anonymous_submission_is_pending_and_does_not_expose_admin_fields(self):
        response = self.client.post('/api/payments/', {
            'payer_name': 'A Contributor', 'amount': '1000', 'method': 'mtn_momo',
            'reference': 'TX-1',
        })
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['status'], 'pending')
        self.assertNotIn('admin_note', response.data)
        self.assertEqual(SupportPayment.objects.get().status, 'pending')

    def test_user_history_is_scoped_to_authenticated_user(self):
        SupportPayment.objects.create(
            payer_user=self.user, payer_name='A Contributor', amount=1000,
            method='mtn_momo', status='pending',
        )
        other = get_user_model().objects.create_user(username='other-user', password='ValidPass!123')
        SupportPayment.objects.create(
            payer_user=other, payer_name='Other Contributor', amount=2000,
            method='mtn_momo', status='pending',
        )
        self.client.force_authenticate(self.user)
        response = self.client.get('/api/payments/my/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['payer_name'], 'A Contributor')

    def test_non_admin_cannot_review_payment(self):
        payment = SupportPayment.objects.create(
            payer_name='A Contributor', amount=1000, method='mtn_momo', status='pending',
        )
        self.client.force_authenticate(self.user)
        response = self.client.patch(f'/api/payments/admin/{payment.id}/', {'status': 'verified'})
        self.assertEqual(response.status_code, 403)

    def test_admin_can_verify_payment(self):
        payment = SupportPayment.objects.create(
            payer_name='A Contributor', amount=1000, method='mtn_momo', status='pending',
        )
        self.client.force_authenticate(self.admin)
        response = self.client.patch(f'/api/payments/admin/{payment.id}/', {'status': 'verified'})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['status'], 'verified')
        self.assertEqual(SupportPayment.objects.get(id=payment.id).verified_by_id, self.admin.id)
