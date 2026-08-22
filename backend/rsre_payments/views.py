from decimal import Decimal, InvalidOperation
import os
from django.conf import settings
from django.core.mail import send_mail
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.shortcuts import get_object_or_404

from .models import PaymentSettings, SupportPayment


def is_admin(user):
    return bool(user and user.is_authenticated and (getattr(user, 'role', '') == 'administrator' or getattr(user, 'is_superuser', False)))

def public_settings(obj):
    return {
        'organisation_name': obj.organisation_name,
        'support_message': obj.support_message,
        'currency': obj.currency,
        'mtn_enabled': obj.mtn_enabled,
        'mtn_display_number': obj.mtn_display_number,
        'airtel_enabled': obj.airtel_enabled,
        'airtel_display_number': obj.airtel_display_number,
        'bank_enabled': obj.bank_enabled,
        'bank_name': obj.bank_name,
        'bank_account_name': obj.bank_account_name,
        'bank_account_number': obj.bank_account_number,
        'bank_branch': obj.bank_branch,
        'bank_swift': obj.bank_swift,
    }

def payment_data(obj):
    return {
        'id': obj.id, 'payer_name': obj.payer_name, 'payer_email': obj.payer_email,
        'payer_phone': obj.payer_phone, 'amount': str(obj.amount), 'currency': obj.currency,
        'method': obj.method, 'purpose': obj.purpose, 'reference': obj.reference,
        'proof_url': obj.proof.url if obj.proof else '', 'provider_transaction_id': obj.provider_transaction_id,
        'status': obj.status, 'admin_note': obj.admin_note, 'created_at': obj.created_at,
    }

class PaymentSettingsView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        obj, _ = PaymentSettings.objects.get_or_create(singleton_key=1)
        return Response(public_settings(obj))
    def put(self, request):
        if not is_admin(request.user): return Response({'detail':'Administrator access required.'}, status=403)
        obj, _ = PaymentSettings.objects.get_or_create(singleton_key=1)
        for field in public_settings(obj).keys():
            if field in request.data: setattr(obj, field, request.data[field])
        obj.save()
        return Response(public_settings(obj))

class SupportPaymentCreateView(APIView):
    permission_classes = [AllowAny]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    def post(self, request):
        d = request.data
        try: amount = Decimal(str(d.get('amount','0')))
        except (InvalidOperation, TypeError): return Response({'detail':'Enter a valid amount.'}, status=400)
        if amount <= 0: return Response({'detail':'Amount must be greater than zero.'}, status=400)
        method = d.get('method','')
        if method not in dict(SupportPayment.METHOD_CHOICES): return Response({'detail':'Choose a valid payment method.'}, status=400)
        settings_obj, _ = PaymentSettings.objects.get_or_create(singleton_key=1)
        if method == 'mtn_momo' and not settings_obj.mtn_enabled: return Response({'detail':'MTN MoMo support is not enabled yet.'}, status=400)
        if method == 'airtel_money' and not settings_obj.airtel_enabled: return Response({'detail':'Airtel Money support is not enabled yet.'}, status=400)
        if method == 'bank_transfer' and not settings_obj.bank_enabled: return Response({'detail':'Bank transfer support is not enabled yet.'}, status=400)
        obj = SupportPayment.objects.create(
            payer_user=request.user if request.user.is_authenticated else None,
            payer_name=(d.get('payer_name') or '').strip(), payer_email=(d.get('payer_email') or '').strip(),
            payer_phone=(d.get('payer_phone') or '').strip(), amount=amount, currency=settings_obj.currency,
            method=method, purpose=(d.get('purpose') or '').strip(), reference=(d.get('reference') or '').strip(),
            proof=request.FILES.get('proof'), status='submitted'
        )
        if obj.payer_email:
            send_mail('RSRE support submission received', f'Your RSRE support submission #{obj.id} has been received and is pending verification.', None, [obj.payer_email], fail_silently=True)
        return Response(payment_data(obj), status=201)

class MySupportPaymentsView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        return Response([payment_data(x) for x in SupportPayment.objects.filter(payer_user=request.user)])

class AdminSupportPaymentsView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        if not is_admin(request.user): return Response({'detail':'Administrator access required.'}, status=403)
        return Response([payment_data(x) for x in SupportPayment.objects.all()[:200]])
    def patch(self, request, pk):
        if not is_admin(request.user): return Response({'detail':'Administrator access required.'}, status=403)
        obj = get_object_or_404(SupportPayment, pk=pk)
        status = request.data.get('status')
        if status not in dict(SupportPayment.STATUS_CHOICES): return Response({'detail':'Invalid payment status.'}, status=400)
        obj.status = status; obj.admin_note = request.data.get('admin_note', obj.admin_note); obj.verified_by=request.user if status == 'verified' else obj.verified_by; obj.save()
        if status == 'verified' and obj.payer_email:
            send_mail('RSRE support payment verified', f'Your RSRE support payment #{obj.id} has been verified. Thank you for supporting the ecosystem.', None, [obj.payer_email], fail_silently=True)
        return Response(payment_data(obj))

class MTNMomoRequestPaymentView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        if not os.environ.get('MTN_MOMO_ENABLED','False').lower() == 'true':
            return Response({'detail':'MTN MoMo automated collection is not enabled. Use manual Mobile Money/Bank Transfer submission or complete MTN merchant/API onboarding first.'}, status=503)
        # Provider credentials and API calls belong here, server-side only. The production MTN API exposes
        # Get Paid capabilities including Request Payment and Payment Status.
        return Response({'detail':'MTN MoMo provider is enabled but credentials/merchant flow still need configuration.', 'provider':'mtn_momo'}, status=501)
