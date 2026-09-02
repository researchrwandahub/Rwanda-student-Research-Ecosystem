from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone


# =========================
# USER ROLES
# =========================

ROLE_CHOICES=[("reader","Reader"),("author","Author"),("reviewer","Reviewer"),("editor","Editor"),("editor_in_chief","Editor-in-Chief"),("administrator","Administrator")]
class User(AbstractUser):
    role=models.CharField(max_length=30,choices=ROLE_CHOICES,default="reader")
    account_status=models.CharField(max_length=20,choices=[("active","Active"),("inactive","Inactive"),("suspended","Suspended")],default="active")
    email_verified=models.BooleanField(default=False)
    other_names=models.CharField(max_length=150,blank=True)
    full_name=models.CharField(max_length=255,blank=True)
    profile_picture=models.ImageField(upload_to="profiles/",blank=True,null=True)
    institution=models.CharField(max_length=255,blank=True); university=models.CharField(max_length=255,blank=True); department=models.CharField(max_length=255,blank=True); country=models.CharField(max_length=128,blank=True)
    discipline=models.CharField(max_length=40,blank=True); academic_stage=models.CharField(max_length=30,blank=True)
    whatsapp_number=models.CharField(max_length=30, blank=True)
    orcid=models.CharField(max_length=50,blank=True); biography=models.TextField(blank=True); research_interests=models.TextField(blank=True)
    academic_position=models.CharField(max_length=255,blank=True); research_field=models.CharField(max_length=255,blank=True); research_experience=models.TextField(blank=True)
    publications_count=models.PositiveIntegerField(default=0); is_verified_researcher=models.BooleanField(default=False)
    class Meta:
        permissions=[("manage_assigned_reviews","Can manage assigned reviews"),("make_editorial_recommendations","Can make editorial recommendations"),("upload_article_revisions","Can upload article revisions"),("bookmark_articles","Can bookmark articles")]
    def __str__(self): return self.username


# =========================
# ARTICLE STATUS
# =========================

ARTICLE_STATUS = [

    ('draft', 'Draft'),

    ('submitted', 'Submitted'),

    ('under_review', 'Under Review'),

    ('revision', 'Revision Required'),

    ('accepted', 'Accepted'),

    ('editor_decision', 'Editorial Decision'),

    ('rejected', 'Rejected'),

    ('published', 'Published'),

]



# =========================
# MEDICAL SPECIALTIES
# =========================

SPECIALTY_CHOICES = [

    ('anatomy', 'Anatomy'),

    ('physiology', 'Physiology'),

    ('biochemistry', 'Biochemistry'),

    ('cell_molecular', 'Cell & Molecular Biology'),

    ('histology', 'Histology'),

    ('embryology', 'Embryology'),

    ('genetics', 'Genetics'),

    ('microbiology', 'Microbiology'),

    ('immunology', 'Immunology'),

    ('pathology', 'Pathology'),

    ('pharmacology', 'Pharmacology'),

    ('medicine', 'Medicine'),

    ('surgery', 'Surgery'),

    ('paediatrics', 'Paediatrics'),

    ('obstetrics_gynaecology',
     'Obstetrics & Gynaecology'),

    ('public_health',
     'Public Health'),

    ('radiology',
     'Radiology'),

    ('mental_health',
     'Mental Health'),

    ('other',
     'Other'),

]





# =========================
# RSJH ARTICLE TYPES / DISCIPLINES
# =========================

ARTICLE_TYPE_CHOICES = [
    ("original_research", "Original Research"),
    ("review", "Review Article"),
    ("case_report", "Case Report / Case Series"),
    ("short_communication", "Short Communication"),
    ("health_communication", "Health Communication / Journalism"),
    ("commentary", "Commentary / Opinion"),
    ("student_research_note", "Student Research Note"),
]

HEALTH_DISCIPLINE_CHOICES = [
    ("medicine", "Medicine"),
    ("pharmacy", "Pharmacy"),
    ("dentistry", "Dentistry / Dental Surgery"),
    ("nursing", "Nursing"),
    ("public_health", "Public Health"),
    ("clinical_psychology", "Clinical Psychology"),
    ("biomedical_sciences", "Biomedical Sciences"),
    ("health_informatics", "Health Informatics"),
    ("health_communication", "Health Communication & Journalism"),
    ("interdisciplinary", "Interdisciplinary Health Research"),
    ("other", "Other Health Discipline"),
]


# =========================
# ARTICLES
# =========================


class Article(models.Model):

    title = models.CharField(
        max_length=512
    )

    article_type = models.CharField(
        max_length=40, choices=ARTICLE_TYPE_CHOICES, default="original_research"
    )

    discipline = models.CharField(
        max_length=40, choices=HEALTH_DISCIPLINE_CHOICES, default="medicine"
    )

    research_question = models.TextField(blank=True)
    supervisor_name = models.CharField(max_length=255, blank=True)
    student_initiated = models.BooleanField(default=True)


    abstract = models.TextField()


    full_text = models.TextField(
        blank=True
    )


    references = models.TextField(
        blank=True
    )


    published_date = models.DateField(
        null=True,
        blank=True
    )


    keywords = models.CharField(
        max_length=512,
        blank=True
    )


    specialty = models.CharField(
        max_length=255,
        blank=True
    )


    year = models.PositiveIntegerField(
        null=True,
        blank=True
    )


    pdf = models.FileField(
        upload_to='articles/pdfs/',
        blank=True,
        null=True
    )

    # Publication / indexing readiness
    slug = models.SlugField(max_length=300, blank=True, unique=True, null=True)
    doi = models.CharField(max_length=255, blank=True)
    license = models.CharField(max_length=255, blank=True, default="CC BY-NC 4.0")
    funding_statement = models.TextField(blank=True)
    conflict_of_interest = models.TextField(blank=True)
    ethics_statement = models.TextField(blank=True)
    data_availability = models.TextField(blank=True)
    ai_use_statement = models.TextField(blank=True)
    received_date = models.DateField(null=True, blank=True)
    accepted_date = models.DateField(null=True, blank=True)
    volume = models.PositiveIntegerField(null=True, blank=True)
    issue = models.PositiveIntegerField(null=True, blank=True)
    publication_number = models.PositiveIntegerField(null=True, blank=True, unique=True)
    pages = models.CharField(max_length=50, blank=True)
    citation_text = models.TextField(blank=True)


    author = models.ForeignKey(
        'User',
        related_name='articles',
        on_delete=models.CASCADE
    )

    handling_editor = models.ForeignKey(
        'User',
        related_name='handled_articles',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )

    co_authors = models.ManyToManyField(
        'User',
        related_name='coauthored_articles',
        blank=True,
    )


    status = models.CharField(
        max_length=20,
        choices=ARTICLE_STATUS,
        default='draft'
    )


    is_published = models.BooleanField(
        default=False
    )


    published_by = models.ForeignKey(
        'User',
        related_name='published_articles',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )


    created_at = models.DateTimeField(
        auto_now_add=True
    )


    updated_at = models.DateTimeField(
        auto_now=True
    )

    submitted_at = models.DateTimeField(null=True, blank=True)
    last_reviewed_at = models.DateTimeField(null=True, blank=True)
    revision_round = models.PositiveIntegerField(default=0)
    editorial_notes = models.TextField(blank=True)


    def __str__(self):

        return self.title
    # =========================
# REVIEWS
# =========================


REVIEW_RECOMMENDATIONS = [

    ('accept', 'Accept'),

    ('minor_revision', 'Minor Revision'),

    ('major_revision', 'Major Revision'),

    ('reject', 'Reject'),

]



class Review(models.Model):

    article = models.ForeignKey(
        Article,
        related_name='reviews',
        on_delete=models.CASCADE
    )


    reviewer = models.ForeignKey(
        'User',
        related_name='reviews',
        on_delete=models.CASCADE
    )


    content = models.TextField(blank=True)

    comments_to_author = models.TextField(blank=True)
    confidential_comments = models.TextField(blank=True)
    methods_rating = models.PositiveIntegerField(default=0)
    clarity_rating = models.PositiveIntegerField(default=0)
    ethics_rating = models.PositiveIntegerField(default=0)
    conflict_of_interest = models.BooleanField(default=False)
    ai_assistance_used = models.BooleanField(default=False)


    rating = models.IntegerField(
        default=0
    )


    recommendation = models.CharField(
        max_length=32,
        choices=REVIEW_RECOMMENDATIONS,
        blank=True
    )


    created_at = models.DateTimeField(
        auto_now_add=True
    )


    updated_at = models.DateTimeField(
        auto_now=True
    )


    def __str__(self):

        return f"Review for {self.article.title}"





# =========================
# REVIEW ASSIGNMENT
# =========================


class CoAuthorContribution(models.Model):
    article = models.ForeignKey(Article, related_name="coauthor_contributions", on_delete=models.CASCADE)
    user = models.ForeignKey(User, related_name="article_contributions", on_delete=models.CASCADE)
    contribution_roles = models.JSONField(default=list, blank=True)
    author_order = models.PositiveIntegerField(default=1)

    class Meta:
        unique_together = ["article", "user"]
        ordering = ["author_order", "id"]

    def __str__(self):
        return f"{self.article.title} — {self.user.username}"


# =========================
# REVIEW ASSIGNMENT
# =========================


class ReviewAssignment(models.Model):

    article = models.ForeignKey(
        Article,
        related_name='assignments',
        on_delete=models.CASCADE
    )


    reviewer = models.ForeignKey(
        'User',
        related_name='assignments',
        on_delete=models.CASCADE
    )


    assigned_at = models.DateTimeField(
        auto_now_add=True
    )

    deadline = models.DateTimeField(null=True, blank=True)
    accepted_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)


    accepted = models.BooleanField(
        default=False
    )


    completed = models.BooleanField(
        default=False
    )


    def __str__(self):

        return f"{self.article.title} -> {self.reviewer.username}"





# =========================
# REVISIONS / AUTHOR RESPONSES
# =========================

class ArticleRevision(models.Model):
    article = models.ForeignKey(Article, related_name="revisions", on_delete=models.CASCADE)
    round = models.PositiveIntegerField(default=1)
    manuscript_file = models.FileField(upload_to="articles/revisions/", blank=True, null=True)
    response_to_reviewers = models.TextField(blank=True)
    author_notes = models.TextField(blank=True)
    submitted_by = models.ForeignKey(User, related_name="submitted_revisions", on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]


# =========================
# EDITORIAL DECISIONS
# =========================

class EditorialDecision(models.Model):
    DECISION_CHOICES = [
        ("accept", "Accept"),
        ("minor_revision", "Minor Revision"),
        ("major_revision", "Major Revision"),
        ("reject", "Reject"),
    ]
    article = models.ForeignKey(Article, related_name="editorial_decisions", on_delete=models.CASCADE)
    editor = models.ForeignKey(User, related_name="editorial_decisions", on_delete=models.CASCADE)
    decision = models.CharField(max_length=32, choices=DECISION_CHOICES)
    rationale = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]


# =========================
# RESPONSIBLE AI AUDIT LOG
# =========================

class AIUsageLog(models.Model):
    TASK_CHOICES = [
        ("research", "Research assistance"),
        ("writing", "Scientific writing support"),
        ("grammar", "Language support"),
        ("keywords", "Keyword assistance"),
        ("summarize", "Summary"),
        ("plain_language", "Plain-language summary"),
        ("integrity_check", "Integrity / completeness check"),
        ("reviewer_support", "Reviewer support"),
        ("chat", "Research chat"),
    ]
    user = models.ForeignKey(User, related_name="ai_usage", on_delete=models.CASCADE)
    article = models.ForeignKey(Article, related_name="ai_usage", null=True, blank=True, on_delete=models.SET_NULL)
    task = models.CharField(max_length=40, choices=TASK_CHOICES)
    provider = models.CharField(max_length=80, default="mock")
    model = models.CharField(max_length=120, blank=True)
    input_characters = models.PositiveIntegerField(default=0)
    output_characters = models.PositiveIntegerField(default=0)
    disclosed = models.BooleanField(default=False)
    success = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]


# =========================
# BOOKMARKS
# =========================


class Bookmark(models.Model):

    user = models.ForeignKey(
        'User',
        related_name='bookmarks',
        on_delete=models.CASCADE
    )


    article = models.ForeignKey(
        Article,
        related_name='bookmarked_by',
        on_delete=models.CASCADE
    )


    created_at = models.DateTimeField(
        auto_now_add=True
    )


    class Meta:

        constraints = [

            models.UniqueConstraint(
                fields=['user', 'article'],
                name='unique_user_article_bookmark'
            )

        ]





# =========================
# NOTIFICATIONS
# =========================


class Notification(models.Model):

    user = models.ForeignKey(
        'User',
        related_name='notifications',
        on_delete=models.CASCADE
    )


    title = models.CharField(
        max_length=255
    )


    message = models.TextField()


    is_read = models.BooleanField(
        default=False
    )


    created_at = models.DateTimeField(
        auto_now_add=True
    )


    class Meta:

        ordering = ['-created_at']





# =========================
# REVIEWER INVITATION CODES
# =========================


class ReviewerInvitation(models.Model):

    code = models.CharField(
        max_length=100,
        unique=True
    )

    role = models.CharField(
        max_length=50,
        default="reviewer"
    )

    email = models.EmailField(
        blank=True,
        null=True
    )

    used = models.BooleanField(
        default=False
    )

    used_by = models.ForeignKey(
        User,
        null=True,
        blank=True,
        on_delete=models.SET_NULL
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    expires_at = models.DateTimeField(
        blank=True,
        null=True
    )

    contact_name = models.CharField(max_length=255, blank=True)
    organization = models.CharField(max_length=255, blank=True)
    status = models.CharField(max_length=20, default="pending")
    token = models.CharField(max_length=128, unique=True, blank=True, null=True)

    def __str__(self):
        return self.code


class PublicationSettings(models.Model):
    journal_name = models.CharField(max_length=255, default="Rwanda Student Journal for Health")
    current_volume = models.PositiveIntegerField(default=1)
    current_issue = models.PositiveIntegerField(default=1)
    publication_year = models.PositiveIntegerField(default=2026)
    next_article_number = models.PositiveIntegerField(default=1)
    journal_code = models.CharField(max_length=50, default="rsjh")
    doi_prefix = models.CharField(max_length=100, blank=True)
    automatic_numbering = models.BooleanField(default=True)
    automatic_volume_issue = models.BooleanField(default=True)
    automatic_citation = models.BooleanField(default=True)
    automatic_doi = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Journal Publication Settings"
        verbose_name_plural = "Journal Publication Settings"

    def __str__(self):
        return f"{self.journal_name} — Volume {self.current_volume}, Issue {self.current_issue}"




# =========================
# SPONSORS
# =========================


SPONSOR_CATEGORY_CHOICES = [

    ('academic', 'Academic Partner'),

    ('research', 'Research Partner'),

    ('healthcare', 'Healthcare Partner'),

    ('technology', 'Technology Partner'),

    ('funding', 'Funding Partner'),

    ('conference', 'Conference Partner'),

]


STATUS_CHOICES = [

    ('active', 'Active'),

    ('inactive', 'Inactive'),

]



class Sponsor(models.Model):

    name = models.CharField(
        max_length=255
    )


    logo = models.ImageField(
        upload_to='sponsors/logos/',
        blank=True,
        null=True
    )


    description = models.TextField(
        blank=True
    )


    website = models.URLField(
        blank=True
    )


    category = models.CharField(
        max_length=32,
        choices=SPONSOR_CATEGORY_CHOICES
    )


    display_position = models.PositiveIntegerField(
        default=100
    )


    status = models.CharField(
        max_length=16,
        choices=STATUS_CHOICES,
        default='active'
    )


    start_date = models.DateField(
        blank=True,
        null=True
    )


    end_date = models.DateField(
        blank=True,
        null=True
    )


    created_at = models.DateTimeField(
        auto_now_add=True
    )


    class Meta:

        ordering = [
            'display_position',
            'name'
        ]


    def __str__(self):

        return self.name





# =========================
# PARTNERS
# =========================


PARTNER_TYPE_CHOICES = [

    ('organization', 'Organization'),

    ('university', 'University'),

    ('hospital', 'Hospital'),

    ('research_institution',
     'Research Institution'),

]



class Partner(models.Model):

    name = models.CharField(
        max_length=255
    )


    logo = models.ImageField(
        upload_to='partners/logos/',
        blank=True,
        null=True
    )


    description = models.TextField(
        blank=True
    )


    website = models.URLField(
        blank=True
    )


    type = models.CharField(
        max_length=32,
        choices=PARTNER_TYPE_CHOICES
    )


    country = models.CharField(
        max_length=128,
        blank=True
    )


    status = models.CharField(
        max_length=16,
        choices=STATUS_CHOICES,
        default='active'
    )


    created_at = models.DateTimeField(
        auto_now_add=True
    )


    class Meta:

        ordering = [
            'name'
        ]


    def __str__(self):

        return self.name

class EmailVerificationToken(models.Model):
    user=models.ForeignKey(User,related_name="email_verification_tokens",on_delete=models.CASCADE); token=models.CharField(max_length=128,unique=True); created_at=models.DateTimeField(auto_now_add=True); expires_at=models.DateTimeField()
class ResearchIdea(models.Model):
    STATUS_CHOICES = [
        ("idea", "Idea"),
        ("refining", "Refining"),
        ("ready", "Ready for project"),
        ("converted", "Converted to project"),
        ("archived", "Archived"),
    ]
    title = models.CharField(max_length=255)
    problem = models.TextField()
    research_question = models.TextField(blank=True)
    objectives = models.TextField(blank=True)
    methodology = models.TextField(blank=True)
    tags = models.CharField(max_length=512, blank=True)
    discipline = models.CharField(max_length=120, blank=True)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default="idea")
    owner = models.ForeignKey(User, related_name="research_ideas", on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at", "-created_at"]

    def __str__(self):
        return self.title


class ResearchProject(models.Model):
    STATUS_CHOICES = [
        ("developing", "Developing"),
        ("protocol", "Protocol development"),
        ("ethics", "Ethics & governance"),
        ("data_collection", "Data collection"),
        ("analysis", "Analysis"),
        ("manuscript", "Manuscript"),
        ("publication", "Publication"),
        ("completed", "Completed"),
        ("paused", "Paused"),
    ]
    VISIBILITY_CHOICES = [("private", "Private"), ("team", "Team"), ("public_summary", "Public summary")]
    title = models.CharField(max_length=255)
    owner = models.ForeignKey(User, related_name="research_projects", on_delete=models.CASCADE)
    source_idea = models.ForeignKey(ResearchIdea, related_name="projects", on_delete=models.SET_NULL, null=True, blank=True)
    research_question = models.TextField(blank=True)
    objectives = models.TextField(blank=True)
    background = models.TextField(blank=True)
    methodology = models.TextField(blank=True)
    discipline = models.CharField(max_length=120, blank=True)
    study_type = models.CharField(max_length=120, blank=True)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default="developing")
    ethics_status = models.CharField(max_length=30, choices=[("not_started", "Not started"), ("planning", "Planning"), ("submitted", "Submitted"), ("approved", "Approved"), ("not_required", "Not required")], default="not_started")
    data_governance_status = models.CharField(max_length=30, choices=[("not_started", "Not started"), ("planning", "Planning"), ("ready", "Ready")], default="not_started")
    mentor = models.ForeignKey(User, related_name="mentored_research_projects", on_delete=models.SET_NULL, null=True, blank=True)
    visibility = models.CharField(max_length=20, choices=VISIBILITY_CHOICES, default="private")
    readiness_score = models.PositiveSmallIntegerField(default=0)
    target_completion_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at", "-created_at"]

    def __str__(self):
        return self.title

    def recalculate_readiness(self):
        checks = [self.research_question, self.objectives, self.background, self.methodology, self.discipline, self.study_type]
        score = sum(1 for value in checks if str(value).strip()) * 12
        score += 14 if self.mentor_id else 0
        score += 14 if self.ethics_status in {"approved", "not_required"} else 0
        self.readiness_score = min(score, 100)


class ResearchProjectMember(models.Model):
    ROLE_CHOICES = [("co_investigator", "Co-investigator"), ("research_assistant", "Research assistant"), ("data_analyst", "Data analyst"), ("advisor", "Advisor")]
    project = models.ForeignKey(ResearchProject, related_name="members", on_delete=models.CASCADE)
    user = models.ForeignKey(User, related_name="research_project_memberships", on_delete=models.CASCADE)
    role = models.CharField(max_length=30, choices=ROLE_CHOICES, default="co_investigator")
    status = models.CharField(max_length=20, choices=[("invited", "Invited"), ("active", "Active"), ("left", "Left")], default="active")
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["project", "user"], name="unique_research_project_member")]
        ordering = ["role", "joined_at"]


class ResearchProjectMilestone(models.Model):
    STATUS_CHOICES = [("todo", "To do"), ("in_progress", "In progress"), ("done", "Done"), ("blocked", "Blocked")]
    project = models.ForeignKey(ResearchProject, related_name="milestones", on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    due_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="todo")
    order = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["order", "due_date", "id"]

    def __str__(self):
        return self.title


class ResearchOpportunity(models.Model):
    SOURCE_TYPES = [
        ("automatic", "Automatically imported"),
        ("manual", "Added by administrator"),
    ]

    title = models.CharField(max_length=255)
    kind = models.CharField(max_length=30)
    description = models.TextField()
    # Internal provider link. The student-facing UI deliberately does not display this field.
    url = models.URLField(blank=True)
    deadline = models.DateField(null=True, blank=True)
    active = models.BooleanField(default=True)
    source_type = models.CharField(max_length=20, choices=SOURCE_TYPES, default="manual")
    source_name = models.CharField(max_length=120, blank=True)
    external_id = models.CharField(max_length=120, blank=True, db_index=True)
    last_synced_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["source_name", "external_id"],
                name="unique_research_opportunity_external_record",
            )
        ]
        ordering = ["deadline", "-created_at"]

    def __str__(self):
        return self.title
class EditorialBoardMember(models.Model):
    user=models.OneToOneField(User,related_name="editorial_board_profile",on_delete=models.CASCADE); board_role=models.CharField(max_length=30); specialty=models.CharField(max_length=255,blank=True); bio=models.TextField(blank=True); active=models.BooleanField(default=True)
class ResearchPassport(models.Model):
    VISIBILITY_CHOICES = [("private", "Private"), ("network", "RSRE network"), ("public", "Public")]
    user = models.OneToOneField(User, related_name="research_passport", on_delete=models.CASCADE)
    headline = models.CharField(max_length=255, blank=True)
    career_goal = models.CharField(max_length=500, blank=True)
    skills = models.TextField(blank=True)
    methods = models.TextField(blank=True)
    interests = models.TextField(blank=True)
    collaborations = models.TextField(blank=True)
    competencies = models.JSONField(default=list, blank=True)
    visibility = models.CharField(max_length=20, choices=VISIBILITY_CHOICES, default="network")
    verification_version = models.PositiveIntegerField(default=1)
    public_fields = models.JSONField(default=list, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Research Passport — {self.user.get_full_name() or self.user.username}"


class PassportEvidence(models.Model):
    SOURCE_TYPES = [("automatic", "Automatically recorded"), ("manual", "Added by researcher"), ("verified", "Verified by administrator")]
    EVIDENCE_TYPES = [
        ("learning", "Learning"), ("credential", "Credential"), ("project", "Research project"),
        ("publication", "Publication"), ("review", "Peer review"), ("mentorship", "Mentorship"),
        ("collaboration", "Collaboration"), ("opportunity", "Opportunity"), ("milestone", "Research milestone"),
    ]
    user = models.ForeignKey(User, related_name="passport_evidence", on_delete=models.CASCADE)
    evidence_type = models.CharField(max_length=30, choices=EVIDENCE_TYPES)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    source_type = models.CharField(max_length=20, choices=SOURCE_TYPES, default="automatic")
    source_model = models.CharField(max_length=120, blank=True)
    source_object_id = models.CharField(max_length=80, blank=True)
    evidence_date = models.DateField(null=True, blank=True)
    verification_note = models.CharField(max_length=500, blank=True)
    verification_code = models.CharField(max_length=80, blank=True, db_index=True)
    verified_at = models.DateTimeField(null=True, blank=True)
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-evidence_date", "-created_at"]
        indexes = [models.Index(fields=["user", "evidence_type"])]

    def __str__(self):
        return f"{self.title} — {self.user.username}"





# =========================
# RSRE RESEARCH SANDBOX
# =========================

class ResearchSandboxWorkspace(models.Model):
    STATUS_CHOICES = [("active", "Active"), ("archived", "Archived")]
    VISIBILITY_CHOICES = [("private", "Private"), ("team", "Team")]

    owner = models.ForeignKey(User, related_name="sandbox_workspaces", on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    research_topic = models.CharField(max_length=255, blank=True)
    visibility = models.CharField(max_length=20, choices=VISIBILITY_CHOICES, default="private")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="active")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at", "-created_at"]

    def __str__(self):
        return self.title


class ResearchSandboxNote(models.Model):
    workspace = models.ForeignKey(ResearchSandboxWorkspace, related_name="notes", on_delete=models.CASCADE)
    author = models.ForeignKey(User, related_name="sandbox_notes", on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    body = models.TextField(blank=True)
    note_type = models.CharField(max_length=30, default="research_note")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at", "-created_at"]


class ResearchSandboxDataset(models.Model):
    DATA_TYPES = [("public", "Public"), ("synthetic", "Synthetic"), ("authorized", "Authorized research data")]
    SAFETY_STATUS = [("review", "Review required"), ("approved", "Approved for sandbox"), ("blocked", "Blocked")]

    workspace = models.ForeignKey(ResearchSandboxWorkspace, related_name="datasets", on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    data_type = models.CharField(max_length=20, choices=DATA_TYPES, default="synthetic")
    source = models.CharField(max_length=255, blank=True)
    authorization_reference = models.CharField(max_length=255, blank=True)
    safety_status = models.CharField(max_length=20, choices=SAFETY_STATUS, default="review")
    contains_direct_identifiers = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at", "-created_at"]

    def __str__(self):
        return self.name
# =========================
# STUDENT GIFT / SPONSORSHIP
# =========================

GIFT_PURPOSE_CHOICES = [
    ("academy_support", "Research Academy Support"),
    ("research_support", "Research Development Support"),
    ("general", "General RSRE Gift"),
]
GIFT_STATUS_CHOICES = [
    ("pending", "Pending payment"),
    ("paid", "Paid / ready to gift"),
    ("sent", "Gift code sent"),
    ("redeemed", "Redeemed"),
    ("expired", "Expired"),
    ("cancelled", "Cancelled"),
]
PAYMENT_METHOD_CHOICES = [
    ("mobile_money", "Mobile Money"),
    ("card", "Card"),
    ("bank_transfer", "Bank Transfer"),
    ("other", "Other sponsor payment"),
]

class StudentGift(models.Model):
    sponsor_name = models.CharField(max_length=255, blank=True)
    sponsor_email = models.EmailField(blank=True)
    recipient_email = models.EmailField()
    recipient_name = models.CharField(max_length=255, blank=True)
    purpose = models.CharField(max_length=30, choices=GIFT_PURPOSE_CHOICES, default="general")
    amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    currency = models.CharField(max_length=8, default="RWF")
    payment_method = models.CharField(max_length=30, choices=PAYMENT_METHOD_CHOICES, default="other")
    payment_reference = models.CharField(max_length=255, blank=True)
    status = models.CharField(max_length=20, choices=GIFT_STATUS_CHOICES, default="pending")
    gift_code = models.CharField(max_length=40, unique=True, blank=True)
    message = models.TextField(blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    sent_at = models.DateTimeField(null=True, blank=True)
    redeemed_at = models.DateTimeField(null=True, blank=True)
    redeemed_by = models.ForeignKey(User, null=True, blank=True, related_name="redeemed_gifts", on_delete=models.SET_NULL)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["recipient_email", "status"]),
            models.Index(fields=["gift_code"]),
        ]

    def __str__(self):
        return f"Gift {self.gift_code or 'pending'} â†’ {self.recipient_email}"

class FoundingMember(models.Model):
    name=models.CharField(max_length=255)
    role=models.CharField(max_length=255)
    biography=models.TextField(blank=True)
    photo=models.ImageField(upload_to="founders/", blank=True, null=True)
    display_order=models.PositiveIntegerField(default=1)
    active=models.BooleanField(default=True)
    created_at=models.DateTimeField(auto_now_add=True)
    updated_at=models.DateTimeField(auto_now=True)

    class Meta:
        ordering=["display_order", "id"]

    def __str__(self):
        return self.name
