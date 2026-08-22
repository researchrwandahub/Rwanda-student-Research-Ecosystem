from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Article, Review, ReviewAssignment, ArticleRevision, EditorialDecision, AIUsageLog, Partner, FoundingMember, ResearchIdea, ResearchProject, ResearchProjectMember, ResearchProjectMilestone, ResearchOpportunity, PassportEvidence
from .models import StudentGift

class UserAdmin(BaseUserAdmin):
    fieldsets = BaseUserAdmin.fieldsets + (
        ('RSJH Profile', {'fields': ('role', 'full_name', 'institution', 'university', 'department', 'discipline', 'academic_stage', 'orcid', 'biography', 'research_interests', 'country')}),
    )

admin.site.register(User, UserAdmin)
admin.site.register(Article)
admin.site.register(Review)
admin.site.register(ReviewAssignment)

admin.site.register(ArticleRevision)
admin.site.register(EditorialDecision)
admin.site.register(AIUsageLog)

admin.site.register(Partner)
admin.site.register(FoundingMember)


@admin.register(ResearchOpportunity)
class ResearchOpportunityAdmin(admin.ModelAdmin):
    list_display = ("title", "kind", "deadline", "source_type", "source_name", "active", "last_synced_at")
    list_filter = ("source_type", "active", "kind")
    search_fields = ("title", "description", "source_name", "external_id")
    readonly_fields = ("external_id", "last_synced_at", "created_at", "updated_at")

@admin.register(ResearchIdea)
class ResearchIdeaAdmin(admin.ModelAdmin):
    list_display = ("title", "owner", "discipline", "status", "updated_at")
    list_filter = ("status", "discipline")
    search_fields = ("title", "problem", "research_question", "tags")

@admin.register(ResearchProject)
class ResearchProjectAdmin(admin.ModelAdmin):
    list_display = ("title", "owner", "status", "readiness_score", "ethics_status", "mentor", "updated_at")
    list_filter = ("status", "ethics_status", "visibility", "discipline")
    search_fields = ("title", "research_question", "objectives", "discipline")
    readonly_fields = ("readiness_score", "created_at", "updated_at")

@admin.register(ResearchProjectMember)
class ResearchProjectMemberAdmin(admin.ModelAdmin):
    list_display = ("project", "user", "role", "status", "joined_at")
    list_filter = ("role", "status")
    search_fields = ("project__title", "user__username", "user__email")

@admin.register(ResearchProjectMilestone)
class ResearchProjectMilestoneAdmin(admin.ModelAdmin):
    list_display = ("title", "project", "status", "due_date", "order")
    list_filter = ("status",)
    search_fields = ("title", "project__title")

@admin.register(PassportEvidence)
class PassportEvidenceAdmin(admin.ModelAdmin):
    list_display = ("title", "user", "evidence_type", "source_type", "evidence_date", "verified_at", "active")
    list_filter = ("evidence_type", "source_type", "active")
    search_fields = ("title", "description", "user__username", "user__email", "verification_code")
    readonly_fields = ("created_at", "updated_at", "verified_at")


@admin.register(StudentGift)
class StudentGiftAdmin(admin.ModelAdmin):
    list_display = ("recipient_email", "purpose", "amount", "currency", "payment_method", "status", "gift_code", "created_at")
    list_filter = ("status", "purpose", "payment_method", "currency")
    search_fields = ("recipient_email", "sponsor_email", "sponsor_name", "gift_code", "payment_reference")
    readonly_fields = ("gift_code", "sent_at", "redeemed_at", "redeemed_by", "created_at", "updated_at")

# RSRE Research Sandbox (additive pillar)
from .models import ResearchSandboxWorkspace, ResearchSandboxNote, ResearchSandboxDataset
for _model in (ResearchSandboxWorkspace, ResearchSandboxNote, ResearchSandboxDataset):
    try:
        admin.site.register(_model)
    except admin.sites.AlreadyRegistered:
        pass
