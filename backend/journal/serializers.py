from django.db import models
from rest_framework import serializers

from .models import (
    ReviewerInvitation,
    User,
    Article,
    Review,
    ReviewAssignment,
    CoAuthorContribution,
    Bookmark,
    Notification,
    ArticleRevision,
    EditorialDecision,
    AIUsageLog,
    ResearchIdea,
    ResearchProject, ResearchProjectMember, ResearchProjectMilestone,
    ResearchOpportunity,
    EditorialBoardMember,
    ResearchPassport, PassportEvidence, StudentGift,
    Partner, FoundingMember, ResearchSandboxWorkspace, ResearchSandboxNote, ResearchSandboxDataset,
)


# =========================
# USER SERIALIZER
# =========================

class UserSerializer(serializers.ModelSerializer):

    profile_picture = serializers.ImageField(
        required=False,
        allow_null=True
    )


    class Meta:

        model = User

        fields = [

            "id",

            "username",

            "email",

            "full_name",

            "role",

            "account_status",

            "institution",

            "university",

            "department",

            "orcid",

            "biography",

            "research_interests",

            "country",

            "discipline",

            "academic_stage",

            "whatsapp_number",

            "profile_picture",

            "academic_position",

            "research_field",

            "research_experience",

            "publications_count",

            "is_verified_researcher",

        ]


        read_only_fields = [

            "role",

            "publications_count",

            "is_verified_researcher",

        ]
# =========================
# REGISTRATION
# =========================

class UserRegistrationSerializer(serializers.ModelSerializer):

    password = serializers.CharField(write_only=True)

    invitation_code = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True
    )

    class Meta:

        model = User

        fields = [
            "username",
            "email",
            "password",
            "full_name",
            "role",
            "university",
            "department",
            "discipline",
            "academic_stage",
            "orcid",
            "biography",
            "invitation_code",
        ]

    def validate(self, attrs):

        role = attrs.get("role")
        allowed = {"author", "reviewer", "editor", "editor_in_chief"}

        if role not in allowed:
            raise serializers.ValidationError({"role": "Invalid registration role."})

        if role in {"reviewer", "editor", "editor_in_chief"}:
            code = attrs.get("invitation_code")
            invitation_qs = ReviewerInvitation.objects.filter(
                code=code,
                used=False,
                role=role,
            )
            email = (attrs.get("email") or "").strip().lower()
            invitation = invitation_qs.filter(
                models.Q(email__isnull=True)
                | models.Q(email="")
                | models.Q(email__iexact=email)
            ).first()

            if invitation is None:
                raise serializers.ValidationError({
                    "invitation_code":
                    "Invalid or mismatched editorial invitation code."
                })

        return attrs

    def create(self, validated_data):

        code = validated_data.pop(
            "invitation_code",
            None
        )

        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email", ""),
            password=validated_data["password"],
            full_name=validated_data.get("full_name", ""),
            role=validated_data.get("role", "reader"),
            university=validated_data.get("university", ""),
            department=validated_data.get("department", ""),
            discipline=validated_data.get("discipline", ""),
            academic_stage=validated_data.get("academic_stage", ""),
            orcid=validated_data.get("orcid", ""),
            biography=validated_data.get("biography", ""),
        )

        if user.role in {"editor", "editor_in_chief"}:
            EditorialBoardMember.objects.get_or_create(
                user=user,
                defaults={
                    "board_role": "Editor-in-Chief" if user.role == "editor_in_chief" else "Editor",
                },
            )

        if user.role in {"reviewer", "editor", "editor_in_chief"}:

            invitation = ReviewerInvitation.objects.get(
                code=code,
                role=user.role,
                used=False,
            )

            invitation.used = True
            invitation.used_by = user
            invitation.save(update_fields=["used", "used_by"])

        return user
    # =========================
# REVIEWER REGISTRATION
# =========================

class ReviewerRegistrationSerializer(serializers.ModelSerializer):

    password = serializers.CharField(
        write_only=True
    )


    invitation_code = serializers.CharField(
        write_only=True
    )


    class Meta:

        model = User

        fields = [
            "username",
            "email",
            "password",
            "full_name",
            "university",
            "department",
            "discipline",
            "academic_stage",
            "invitation_code",
        ]



    def validate_invitation_code(self, value):

        invitation = ReviewerInvitation.objects.filter(
            code=value,
            used=False
        ).first()


        if invitation is None:

            raise serializers.ValidationError(
                "Invalid reviewer invitation code."
            )


        return value



    def create(self, validated_data):

        code = validated_data.pop(
            "invitation_code"
        )


        user = User.objects.create_user(

            username=validated_data["username"],

            email=validated_data.get(
                "email",
                ""
            ),

            password=validated_data["password"],

            full_name=validated_data.get(
                "full_name",
                ""
            ),

            university=validated_data.get(
                "university",
                ""
            ),

            department=validated_data.get(
                "department",
                ""
            ),
            discipline=validated_data.get("discipline", ""),
            academic_stage=validated_data.get("academic_stage", ""),

            role="reviewer"

        )


        invitation = ReviewerInvitation.objects.get(
            code=code
        )


        invitation.used = True

        invitation.used_by = user

        invitation.save()



        return user
# =========================
# ARTICLE
# =========================

class ArticleSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    handling_editor = UserSerializer(read_only=True)
    journey = serializers.SerializerMethodField()
    reviewer_feedback = serializers.SerializerMethodField()
    editorial_history = serializers.SerializerMethodField()
    revisions = serializers.SerializerMethodField()
    co_author_contributions = serializers.SerializerMethodField()

    class Meta:
        model = Article
        fields = "__all__"
        read_only_fields = [
            "author", "status", "is_published", "published_date",
            "published_by", "created_at", "updated_at", "submitted_at",
            "last_reviewed_at", "revision_round", "editorial_notes",
        ]

    def get_journey(self, obj):
        stages = [
            ("draft", "Research draft"),
            ("submitted", "Editor screening"),
            ("under_review", "Peer review"),
            ("revision", "Author revision"),
            ("accepted", "Accepted"),
            ("published", "Published"),
        ]
        current = obj.status
        index = next((i for i, (key, _) in enumerate(stages) if key == current), 0)
        return {
            "current": current,
            "label": dict(stages).get(current, current.title()),
            "stages": [{"key": k, "label": label, "complete": i < index or (i == index and current == "published"), "current": i == index} for i, (k, label) in enumerate(stages)],
        }

    def get_reviewer_feedback(self, obj):
        request = self.context.get("request")
        if request is None or not getattr(request, "user", None) or not request.user.is_authenticated:
            return []
        reviews = obj.reviews.select_related("reviewer").all().order_by("created_at")
        if request.user == obj.author:
            # Authors see reviewer-facing comments and recommendations, but never confidential reviewer notes.
            return [{
                "id": r.id,
                "reviewer_name": "Reviewer",
                "recommendation": r.recommendation,
                "comments_to_author": r.comments_to_author,
                "content": r.content,
                "created_at": r.created_at,
            } for r in reviews]
        if request.user.role not in {"administrator", "editor", "editor_in_chief", "reviewer"}:
            return []
        return ReviewSerializer(reviews, many=True, context=self.context).data

    def get_co_author_contributions(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return []
        allowed = request.user == obj.author or request.user.role in {"administrator", "editor", "editor_in_chief"}
        if not allowed:
            return []
        return CoAuthorContributionSerializer(
            obj.coauthor_contributions.select_related("user").all(), many=True, context=self.context
        ).data

    def get_revisions(self, obj):
        request = self.context.get("request")
        user = getattr(request, "user", None)
        if not user or not user.is_authenticated or (user != obj.author and user.role not in {"administrator", "editor", "editor_in_chief", "reviewer"}):
            return []
        return ArticleRevisionSerializer(obj.revisions.select_related("submitted_by").all(), many=True, context=self.context).data

    def get_editorial_history(self, obj):
        request = self.context.get("request")
        user = getattr(request, "user", None)
        if not user or not user.is_authenticated or (user != obj.author and user.role not in {"administrator", "editor", "editor_in_chief", "reviewer"}):
            return []
        return EditorialDecisionSerializer(obj.editorial_decisions.select_related("editor").all(), many=True, context=self.context).data

# =========================
# REVIEW
# =========================

class ReviewSerializer(serializers.ModelSerializer):
    reviewer = UserSerializer(read_only=True)
    reviewer_name = serializers.SerializerMethodField()
    confidential_comments = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = "__all__"
        read_only_fields = ["reviewer", "created_at", "updated_at"]

    def get_reviewer_name(self, obj):
        return obj.reviewer.full_name or obj.reviewer.username

    def get_confidential_comments(self, obj):
        request = self.context.get("request")
        user = getattr(request, "user", None)
        if user and user.is_authenticated and (user == obj.reviewer or user.role in {"administrator", "reviewer"}):
            return obj.confidential_comments
        return ""

# =========================
# REVIEW ASSIGNMENT
# =========================

class ReviewAssignmentSerializer(serializers.ModelSerializer):

    reviewer_name = serializers.CharField(
        source="reviewer.username",
        read_only=True
    )

    article_title = serializers.CharField(source="article.title", read_only=True)
    article_status = serializers.CharField(source="article.status", read_only=True)

    article_author = serializers.CharField(
        source="article.author.username",
        read_only=True
    )

    pdf = serializers.FileField(
        source="article.pdf",
        read_only=True
    )


    class Meta:
        model = ReviewAssignment
        fields = [
            "id", "article", "reviewer", "reviewer_name", "article_title", "article_status",
            "article_author", "pdf", "assigned_at", "deadline", "accepted_at",
            "completed_at", "accepted", "completed",
        ]
        read_only_fields = ["assigned_at", "accepted_at", "completed_at"]


class CoAuthorContributionSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = CoAuthorContribution
        fields = ["id", "article", "user", "contribution_roles", "author_order"]
        read_only_fields = ["id", "article", "user"]


class ArticleRevisionSerializer(serializers.ModelSerializer):
    submitted_by = UserSerializer(read_only=True)

    class Meta:
        model = ArticleRevision
        fields = "__all__"
        read_only_fields = ["submitted_by", "created_at", "round"]


class EditorialDecisionSerializer(serializers.ModelSerializer):
    editor = UserSerializer(read_only=True)

    class Meta:
        model = EditorialDecision
        fields = "__all__"
        read_only_fields = ["editor", "created_at"]


class AIUsageLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIUsageLog
        fields = "__all__"
        read_only_fields = ["user", "provider", "model", "input_characters", "output_characters", "success", "created_at"]


# =========================
# BOOKMARK
# =========================

class BookmarkSerializer(serializers.ModelSerializer):

    article = ArticleSerializer(
        read_only=True
    )


    class Meta:

        model = Bookmark

        fields = "__all__"



# =========================
# NOTIFICATION
# =========================

class NotificationSerializer(serializers.ModelSerializer):


    class Meta:

        model = Notification

        fields = "__all__"

class ResearchIdeaSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResearchIdea
        fields = "__all__"
        read_only_fields = ["owner", "created_at", "updated_at"]


class ResearchProjectMemberSerializer(serializers.ModelSerializer):
    user_profile = UserSerializer(source="user", read_only=True)
    class Meta:
        model = ResearchProjectMember
        fields = ["id", "project", "user", "user_profile", "role", "status", "joined_at"]
        read_only_fields = ["project", "joined_at"]


class ResearchProjectMilestoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResearchProjectMilestone
        fields = "__all__"
        read_only_fields = ["project", "created_at", "updated_at"]


class ResearchProjectSerializer(serializers.ModelSerializer):
    members = ResearchProjectMemberSerializer(many=True, read_only=True)
    milestones = ResearchProjectMilestoneSerializer(many=True, read_only=True)
    owner_profile = UserSerializer(source="owner", read_only=True)
    mentor_profile = UserSerializer(source="mentor", read_only=True)

    class Meta:
        model = ResearchProject
        fields = [
            "id", "title", "owner", "owner_profile", "source_idea", "research_question",
            "objectives", "background", "methodology", "discipline", "study_type", "status",
            "ethics_status", "data_governance_status", "mentor", "mentor_profile", "visibility",
            "readiness_score", "target_completion_date", "members", "milestones", "created_at", "updated_at",
        ]
        read_only_fields = ["owner", "readiness_score", "created_at", "updated_at"]

    def create(self, validated_data):
        obj = ResearchProject(owner=self.context["request"].user, **validated_data)
        obj.recalculate_readiness()
        obj.save()
        return obj

    def update(self, instance, validated_data):
        for key, value in validated_data.items():
            setattr(instance, key, value)
        instance.recalculate_readiness()
        instance.save()
        return instance


class ResearchOpportunitySerializer(serializers.ModelSerializer):
    source_type = serializers.CharField(read_only=True)
    source_name = serializers.CharField(read_only=True)
    external_id = serializers.CharField(read_only=True)
    last_synced_at = serializers.DateTimeField(read_only=True)

    class Meta:
        model = ResearchOpportunity
        fields = [
            "id", "title", "kind", "description", "deadline", "active",
            "source_type", "last_synced_at",
        ]
class EditorialBoardMemberSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), write_only=True)
    user_profile = UserSerializer(source="user", read_only=True)

    class Meta:
        model = EditorialBoardMember
        fields = [
            "id", "user", "user_profile", "board_role", "specialty", "bio", "active"
        ]
        read_only_fields = ["id"]
class PassportEvidenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = PassportEvidence
        fields = "__all__"
        read_only_fields = ["user", "verified_at", "verification_code"]


class ResearchPassportSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    class Meta:
        model = ResearchPassport
        fields = "__all__"
        read_only_fields = ["user", "verification_version"]


# =========================
# PARTNERS
# =========================

class PartnerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Partner
        fields = "__all__"
        read_only_fields = ["id", "created_at"]

    def validate_logo(self, value):
        if value and value.size > 5 * 1024 * 1024:
            raise serializers.ValidationError("Partner logo must be 5 MB or smaller.")
        return value


class FoundingMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = FoundingMember
        fields = "__all__"
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_photo(self, value):
        if value and value.size > 5 * 1024 * 1024:
            raise serializers.ValidationError("Founder photo must be 5 MB or smaller.")
        return value


class StudentGiftSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentGift
        fields = "__all__"
        read_only_fields = ["gift_code", "status", "sent_at", "redeemed_at", "redeemed_by", "created_at", "updated_at"]



class ResearchSandboxNoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResearchSandboxNote
        fields = "__all__"
        read_only_fields = ["author", "workspace", "created_at", "updated_at"]


class ResearchSandboxDatasetSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResearchSandboxDataset
        fields = "__all__"
        read_only_fields = ["workspace", "created_at", "updated_at"]


class ResearchSandboxWorkspaceSerializer(serializers.ModelSerializer):
    notes = ResearchSandboxNoteSerializer(many=True, read_only=True)
    datasets = ResearchSandboxDatasetSerializer(many=True, read_only=True)
    owner_profile = UserSerializer(source="owner", read_only=True)

    class Meta:
        model = ResearchSandboxWorkspace
        fields = ["id", "owner", "owner_profile", "title", "description", "research_topic", "visibility", "status", "notes", "datasets", "created_at", "updated_at"]
        read_only_fields = ["owner", "created_at", "updated_at"]
