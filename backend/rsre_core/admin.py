from django.contrib import admin
from .models import Application, PlatformSetting, ContentItem, FeatureComponent, NotificationPreference, SupportTicket, SupportMessage, NotificationOutbox, AdminAuditEvent, WhatsAppCommunity, WhatsAppCommunityMember, WhatsAppCommunityMessage, EthicsAssessment, EthicsResource, CollaborationRequest

@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display=('name','key','route','active','public','order')
    list_editable=('active','public','order')
    search_fields=('name','key','route')

@admin.register(PlatformSetting)
class PlatformSettingAdmin(admin.ModelAdmin):
    list_display=('platform_name','short_name','primary_email','whatsapp_enabled','updated_at')

@admin.register(ContentItem)
class ContentItemAdmin(admin.ModelAdmin):
    list_display=('title','application','content_type','active','order','updated_at')
    list_filter=('application','content_type','active')
    search_fields=('title','slug','body')

@admin.register(NotificationPreference)
class NotificationPreferenceAdmin(admin.ModelAdmin):
    list_display=('user','email_enabled','whatsapp_enabled','in_app_enabled')
    search_fields=('user__username','user__email')

@admin.register(SupportTicket)
class SupportTicketAdmin(admin.ModelAdmin):
    list_display=('id','subject','user','application','priority','status','created_at')
    list_filter=('application','priority','status')
    search_fields=('subject','description','user__username','user__email')

admin.site.register(SupportMessage)
admin.site.register(NotificationOutbox)
admin.site.register(AdminAuditEvent)

@admin.register(FeatureComponent)
class FeatureComponentAdmin(admin.ModelAdmin):
    list_display=('application','title','component_type','enabled','order','updated_at')
    list_filter=('application','component_type','enabled')
    search_fields=('title','key','description')

@admin.register(WhatsAppCommunity)
class WhatsAppCommunityAdmin(admin.ModelAdmin):
    list_display=('name','application','purpose','active','owner','created_at')
    list_filter=('application','purpose','active')
    search_fields=('name','description','invite_url')

admin.site.register(WhatsAppCommunityMember)
admin.site.register(WhatsAppCommunityMessage)


@admin.register(EthicsAssessment)
class EthicsAssessmentAdmin(admin.ModelAdmin):
    list_display=('title','user','target_type','risk_level','status','updated_at')
    list_filter=('target_type','risk_level','status')
    search_fields=('title','user__username','user__email')

@admin.register(EthicsResource)
class EthicsResourceAdmin(admin.ModelAdmin):
    list_display=('title','resource_type','active','order','updated_at')
    list_filter=('resource_type','active')
    search_fields=('title','summary')


@admin.register(CollaborationRequest)
class CollaborationRequestAdmin(admin.ModelAdmin):
    list_display=('requester','recipient','purpose','desired_role','status','created_at')
    list_filter=('purpose','status')
    search_fields=('requester__username','requester__email','recipient__username','recipient__email','message')
