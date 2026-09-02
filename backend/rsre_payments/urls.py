from django.urls import path
from .views import PaymentSettingsView, SupportPaymentCreateView, MySupportPaymentsView, AdminSupportPaymentsView, MTNMomoRequestPaymentView
urlpatterns = [
    path('settings/', PaymentSettingsView.as_view()),
    path('', SupportPaymentCreateView.as_view()),
    path('my/', MySupportPaymentsView.as_view()),
    path('admin/', AdminSupportPaymentsView.as_view()),
    path('mtn/request-payment/', MTNMomoRequestPaymentView.as_view()),
    path('admin/<int:pk>/', AdminSupportPaymentsView.as_view()),
]
