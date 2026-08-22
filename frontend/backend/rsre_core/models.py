from django.conf import settings
from django.db import models


APPLICATIONS = [
    ("academy", "Research Academy"),
    ("passport", "Research Passport"),
    ("incubator", "Research Incubator"),
    ("opportunities", "Research Opportunities"),
    ("discovery", "Research Discovery"),
    ("analytics", "Research Analytics"),
    ("journal", "RSJH Journal"),
    ("sandbox", "Research Sandbox"),
    ("ai", "MedTech AI"),
    ("ethics", "Ethics & Compliance"),
    ("collaboration", "Collaboration Network"),
]


class Application(models.Model):
    key = models.SlugField(max_length=50, unique=True)
    name = models.CharField(max_length=120)
    short_name = models.CharField(max_length=80, blank=True)
    description = models.TextField(blank=True)
    route = models.CharField(max_length=120, unique=True)
    icon = models.CharField(max_length=20, blank=True)
    nav_label = models.CharField(max_length=80, blank=True)
    active = models.BooleanField(default=True)
    public = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)
    settings_json = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ["order", "name"]

    def __str__(self):
        return self.name


class PlatformSetting(models.Model):
    singleton_key = models.PositiveSmallIntegerField(default=1, unique=True, editable=False)
    platform_name = models.CharField(max_length=255, default="Rwanda Student Research Ecosystem")
    short_name = models.CharField(max_length=50, default="RSRE")
    tagline = models.CharField(max_length=255, default="Research. Connect. Build. Publish. Impact.")
    footer_tagline = models.CharField(max_length=500, default="A student-centered health research ecosystem built in Rwanda with international standards and global collaboration ambitions.")
    primary_email = models.EmailField(default="researchrwandahub@gmail.com")
    phone = models.CharField(max_length=50, blank=True)
    whatsapp_enabled = models.BooleanField(default=False)
    whatsapp_provider = models.CharField(max_length=80, blank=True)
    whatsapp_api_url = models.URLField(blank=True)
    whatsapp_token = models.CharField(max_length=500, blank=True)
    whatsapp_phone_number_id = models.CharField(max_length=120, blank=True)
    whatsapp_business_account_id = models.CharField(max_length=120, blank=True)
    whatsapp_api_version = models.CharField(max_length=30, default='v23.0', blank=True)
    whatsapp_group_create_url = models.URLField(blank=True)
    announcement_text = models.TextField(default="🤝 Collaboration & mentorship • 🧪 Student-led health research • 📣 Open research opportunities • 📚 New research articles")
    theme_json = models.JSONField(default=dict, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.platform_name


class FeatureComponent(models.Model):
    COMPONENT_TYPES = [("section", "Section"), ("card", "Card"), ("tool", "Tool"), ("widget", "Widget"), ("navigation", "Navigation"), ("cta", "Call to action")]
    application = models.ForeignKey(Application, on_delete=models.CASCADE, related_name="feature_components")
    key = models.SlugField(max_length=100)
    title = models.CharField(max_length=180)
    description = models.TextField(blank=True)
    component_type = models.CharField(max_length=30, choices=COMPONENT_TYPES, default="section")
    route = models.CharField(max_length=180, blank=True)
    enabled = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)
    config_json = models.JSONField(default=dict, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["order", "title"]
        constraints = [models.UniqueConstraint(fields=["application", "key"], name="rsre_unique_feature_component")]

    def __str__(self):
        return f"{self.application.name}: {self.title}"


class ContentItem(models.Model):
    CONTENT_TYPES = [("hero", "Hero"), ("page", "Page"), ("banner", "Banner"), ("resource", "Resource"), ("faq", "FAQ"), ("announcement", "Announcement")]
    application = models.ForeignKey(Application, on_delete=models.CASCADE, related_name="content_items")
    slug = models.SlugField(max_length=150)
    title = models.CharField(max_length=255)
    body = models.TextField(blank=True)
    content_type = models.CharField(max_length=30, choices=CONTENT_TYPES, default="page")
    active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)
    metadata = models.JSONField(default=dict, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = [("application", "slug")]
        ordering = ["order", "title"]

    def __str__(self):
        return f"{self.application.name}: {self.title}"


class NotificationPreference(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="rsre_notification_preferences")
    email_enabled = models.BooleanField(default=True)
    whatsapp_enabled = models.BooleanField(default=False)
    in_app_enabled = models.BooleanField(default=True)
    academy = models.BooleanField(default=True)
    journal = models.BooleanField(default=True)
    opportunities = models.BooleanField(default=True)
    incubator = models.BooleanField(default=True)
    support = models.BooleanField(default=True)
    certificates = models.BooleanField(default=True)
    critical_security = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)


class SupportTicket(models.Model):
    PRIORITIES = [("low", "Low"), ("normal", "Normal"), ("high", "High"), ("urgent", "Urgent")]
    STATUSES = [("new", "New"), ("in_progress", "In progress"), ("waiting", "Waiting for user"), ("resolved", "Resolved"), ("closed", "Closed")]
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="rsre_support_tickets")
    application = models.ForeignKey(Application, on_delete=models.SET_NULL, null=True, blank=True)
    category = models.CharField(max_length=80, default="technical")
    subject = models.CharField(max_length=255)
    description = models.TextField()
    priority = models.CharField(max_length=20, choices=PRIORITIES, default="normal")
    status = models.CharField(max_length=20, choices=STATUSES, default="new")
    assigned_to = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="assigned_rsre_tickets")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]


class SupportMessage(models.Model):
    ticket = models.ForeignKey(SupportTicket, on_delete=models.CASCADE, related_name="messages")
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]


class NotificationOutbox(models.Model):
    CHANNELS = [("in_app", "In-app"), ("email", "Email"), ("whatsapp", "WhatsApp")]
    STATUSES = [("queued", "Queued"), ("sent", "Sent"), ("failed", "Failed"), ("skipped", "Skipped")]
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True)
    channel = models.CharField(max_length=20, choices=CHANNELS)
    subject = models.CharField(max_length=255, blank=True)
    body = models.TextField()
    status = models.CharField(max_length=20, choices=STATUSES, default="queued")
    provider_message_id = models.CharField(max_length=255, blank=True)
    error_message = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    sent_at = models.DateTimeField(null=True, blank=True)
    event_key = models.CharField(max_length=120, blank=True)
    metadata = models.JSONField(default=dict, blank=True)


class WhatsAppCommunity(models.Model):
    application = models.ForeignKey(Application, on_delete=models.CASCADE, related_name="whatsapp_communities", null=True, blank=True)
    name = models.CharField(max_length=180)
    description = models.TextField(blank=True)
    purpose = models.CharField(max_length=120, default="learning")
    invite_url = models.URLField(blank=True)
    provider_group_id = models.CharField(max_length=180, blank=True)
    active = models.BooleanField(default=True)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="owned_whatsapp_communities")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.name


class WhatsAppCommunityMember(models.Model):
    STATUS = [("invited", "Invited"), ("joined", "Joined"), ("left", "Left"), ("removed", "Removed")]
    community = models.ForeignKey(WhatsAppCommunity, on_delete=models.CASCADE, related_name="members")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="whatsapp_community_memberships")
    status = models.CharField(max_length=20, choices=STATUS, default="invited")
    joined_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["community", "user"], name="rsre_unique_whatsapp_membership")]


class WhatsAppCommunityMessage(models.Model):
    community = models.ForeignKey(WhatsAppCommunity, on_delete=models.CASCADE, related_name="messages")
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    message = models.TextField()
    status = models.CharField(max_length=20, default="queued")
    created_at = models.DateTimeField(auto_now_add=True)


class AdminAuditEvent(models.Model):
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    action = models.CharField(max_length=100)
    target_type = models.CharField(max_length=100, blank=True)
    target_id = models.CharField(max_length=100, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

class EthicsAssessment(models.Model):
    TARGET_TYPES = [
        ("project", "Research project"),
        ("sandbox", "Sandbox workspace"),
        ("academy_lab", "Academy practical lab"),
        ("other", "Other research activity"),
    ]
    RISK_LEVELS = [("low", "Low"), ("moderate", "Moderate"), ("high", "High")]
    STATUS_CHOICES = [
        ("draft", "Draft"),
        ("guidance", "Guidance provided"),
        ("ready_for_review", "Ready for institutional review"),
        ("referred", "Referred to appropriate authority"),
        ("closed", "Closed"),
    ]
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="ethics_assessments")
    target_type = models.CharField(max_length=30, choices=TARGET_TYPES, default="other")
    target_id = models.PositiveIntegerField(null=True, blank=True)
    title = models.CharField(max_length=255)
    involves_human_participants = models.BooleanField(default=False)
    involves_vulnerable_groups = models.BooleanField(default=False)
    uses_identifiable_or_sensitive_data = models.BooleanField(default=False)
    uses_existing_public_data = models.BooleanField(default=False)
    biological_samples_or_interventions = models.BooleanField(default=False)
    ai_or_automated_decision_support = models.BooleanField(default=False)
    informed_consent_status = models.CharField(max_length=80, default="not_applicable")
    institutional_review_status = models.CharField(max_length=80, default="not_started")
    risk_level = models.CharField(max_length=20, choices=RISK_LEVELS, default="low")
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default="draft")
    guidance = models.TextField(blank=True)
    user_notes = models.TextField(blank=True)
    reviewed_by_id = models.PositiveIntegerField(null=True, blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self):
        return self.title


class EthicsResource(models.Model):
    RESOURCE_TYPES = [
        ("guide", "Guidance"),
        ("checklist", "Checklist"),
        ("template", "Template"),
        ("policy", "Policy"),
        ("training", "Training resource"),
    ]
    title = models.CharField(max_length=255)
    resource_type = models.CharField(max_length=30, choices=RESOURCE_TYPES, default="guide")
    summary = models.TextField(blank=True)
    url = models.URLField(blank=True)
    active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["order", "title"]

    def __str__(self):
        return self.title


class CollaborationRequest(models.Model):
    PURPOSE_CHOICES = [
        ('research_project', 'Research project'),
        ('mentorship', 'Mentorship'),
        ('coauthor', 'Co-authorship'),
        ('methods_support', 'Methods / statistics support'),
        ('peer_learning', 'Peer learning'),
    ]
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('declined', 'Declined'),
        ('cancelled', 'Cancelled'),
    ]
    requester = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='collaboration_requests_sent')
    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='collaboration_requests_received')
    purpose = models.CharField(max_length=30, choices=PURPOSE_CHOICES, default='research_project')
    desired_role = models.CharField(max_length=120, blank=True)
    message = models.TextField(blank=True)
    project = models.ForeignKey('journal.ResearchProject', on_delete=models.SET_NULL, null=True, blank=True, related_name='collaboration_requests')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    responded_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        constraints = [
            models.UniqueConstraint(fields=['requester','recipient','project','purpose'], name='rsre_unique_collaboration_request'),
        ]

    def __str__(self):
        return f'{self.requester} → {self.recipient} ({self.purpose})'
