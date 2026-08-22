from django.db import models
from django.db.models import Q
from django.utils import timezone

from rest_framework import (
    generics,
    permissions,
    viewsets,
    filters,
    status,
)

from rest_framework.views import APIView
from rest_framework.response import Response

from rest_framework.decorators import (
    api_view,
    permission_classes,
    action,
)

from rest_framework.permissions import (
    AllowAny,
    IsAuthenticated,
)

from rest_framework.exceptions import PermissionDenied

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
)

from rest_framework_simplejwt.serializers import (
    TokenObtainPairSerializer,
)

from django_filters.rest_framework import DjangoFilterBackend

from .permissions import IsAdministratorForDelete

from .models import (
    User,
    Article,
    Review,
    ReviewAssignment,
    Bookmark,
    Notification,
    ReviewerInvitation,
    ArticleRevision,
    EditorialDecision,
    AIUsageLog, EmailVerificationToken, ResearchIdea, ResearchProject, ResearchProjectMember, ResearchProjectMilestone, ResearchOpportunity, EditorialBoardMember, ResearchPassport, PassportEvidence, CoAuthorContribution, Partner, FoundingMember, PublicationSettings, StudentGift, ResearchSandboxWorkspace, ResearchSandboxNote, ResearchSandboxDataset,
)

from .serializers import (
    UserSerializer,
    UserRegistrationSerializer,
    ReviewerRegistrationSerializer,
    ArticleSerializer,
    ReviewSerializer,
    ReviewAssignmentSerializer,
    BookmarkSerializer,
    NotificationSerializer,
    ArticleRevisionSerializer,
    EditorialDecisionSerializer,
    AIUsageLogSerializer,
    PartnerSerializer, FoundingMemberSerializer,
)
from .serializers import ResearchIdeaSerializer, ResearchProjectSerializer, ResearchProjectMemberSerializer, ResearchProjectMilestoneSerializer, ResearchOpportunitySerializer, EditorialBoardMemberSerializer, ResearchPassportSerializer, PassportEvidenceSerializer, ResearchSandboxWorkspaceSerializer, ResearchSandboxNoteSerializer, ResearchSandboxDatasetSerializer
from .notifications import notify, verification, welcome, send_invitation_email, send_student_gift_email
from .integrations.passport import record_manuscript_submission, record_peer_review, record_publication
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.contrib.auth.password_validation import validate_password
from django.conf import settings
from django.http import HttpResponseRedirect
import secrets
import json
import hashlib
import re
from urllib.parse import urlencode
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError
# =========================
# REVIEWER REGISTER
# =========================

class ReviewerRegisterView(
    generics.CreateAPIView
):

    queryset = User.objects.all()

    permission_classes = [
        permissions.AllowAny
    ]

    serializer_class = ReviewerRegistrationSerializer

    def perform_create(self, serializer):
        user = serializer.save()
        welcome(user)
# =========================
# RESEARCH ANALYTICS
# =========================

from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response



# =========================
# BASIC RESEARCH ANALYTICS
# =========================

class ResearchAnalyticsView(APIView):

    permission_classes = [
        AllowAny
    ]


    def get(self, request):

        published_articles = Article.objects.filter(
            status="published"
        )


        return Response({

            "published_articles":
                published_articles.count(),


            "total_researchers":
                User.objects.filter(
                    role="author"
                ).count(),


            "universities":
                published_articles.values(
                    "author__university"
                )
                .distinct()
                .count(),


            "research_areas":
                published_articles.values(
                    "specialty"
                )
                .distinct()
                .count(),

        })



# =========================
# TOP DISEASE ANALYTICS
# =========================

class TopDiseasesAnalyticsView(APIView):

    permission_classes = [
        AllowAny
    ]


    def get(self, request):

        articles = Article.objects.filter(
            status="published"
        )


        disease_counter = {}


        diseases_list = [

            "malaria",

            "hiv",

            "tuberculosis",

            "diabetes",

            "hypertension",

            "cancer",

            "covid",

            "pneumonia",

            "anemia",

            "hepatitis"

        ]


        for article in articles:


            text = (

                (article.title or "")
                + " "
                +
                (article.abstract or "")
                + " "
                +
                (article.keywords or "")

            ).lower()



            for disease in diseases_list:


                if disease in text:


                    if disease in disease_counter:

                        disease_counter[disease] += 1


                    else:

                        disease_counter[disease] = 1



        data = []


        for disease, count in disease_counter.items():


            data.append({

                "name":
                    disease.title(),

                "count":
                    count

            })



        data = sorted(

            data,

            key=lambda x: x["count"],

            reverse=True

        )



        return Response({

            "diseases":
                data

        })





# =========================
# RESEARCH GEOGRAPHY ANALYTICS
# =========================

class GeographyAnalyticsView(APIView):

    permission_classes = [
        AllowAny
    ]


    def get(self, request):


        universities = (

            Article.objects

            .filter(
                status="published"
            )

            .values(
                "author__university"
            )

            .annotate(
                count=models.Count("id")
            )

            .exclude(
                author__university=""
            )

            .order_by(
                "-count"
            )

        )



        data = []



        for item in universities:


            data.append({

                "name":
                    item["author__university"],


                "count":
                    item["count"]

            })



        return Response({

            "universities":
                data

        })
    # =========================
# SPECIALTY ANALYTICS
# =========================

class SpecialtyAnalyticsView(APIView):

    permission_classes = [
        AllowAny
    ]


    def get(self, request):

        specialties = (

            Article.objects

            .filter(
                status="published"
            )

            .values(
                "specialty"
            )

            .annotate(
                count=models.Count("id")
            )

            .exclude(
                specialty=""
            )

            .order_by(
                "-count"
            )

        )


        data = []


        for item in specialties:

            data.append({

                "name":
                    item["specialty"],

                "count":
                    item["count"]

            })


        return Response({

            "specialties":
                data

        })





# =========================
# PUBLICATION TREND ANALYTICS
# =========================

class PublicationTrendAnalyticsView(APIView):

    permission_classes = [
        AllowAny
    ]


    def get(self, request):

        years = (

            Article.objects

            .filter(
                status="published"
            )

            .values(
                "year"
            )

            .annotate(
                count=models.Count("id")
            )

            .exclude(
                year=None
            )

            .order_by(
                "year"
            )

        )


        data = []


        for item in years:

            data.append({

                "year":
                    item["year"],

                "count":
                    item["count"]

            })


        return Response({

            "publications":
                data

        })
# =========================
# ROLE HELPERS
def is_administrator(user): return user.is_authenticated and (user.is_superuser or user.role=="administrator")
def is_editorial_staff(user): return user.is_authenticated and (user.role in {"editor","editor_in_chief"} or is_administrator(user))
def is_reviewer(user): return user.is_authenticated and user.role=="reviewer"


# =========================
# REGISTER
# =========================

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = UserRegistrationSerializer

    def perform_create(self, serializer):
        user = serializer.save()

        # In-app welcome notification + welcome email.
        welcome(user)

        # Separate verification email keeps account verification explicit.
        if user.email:
            token = secrets.token_urlsafe(48)
            EmailVerificationToken.objects.create(
                user=user,
                token=token,
                expires_at=timezone.now() + timezone.timedelta(hours=24),
            )
            verification(user, token)



# =========================
# JWT LOGIN
# =========================

class CustomTokenObtainPairSerializer(
    TokenObtainPairSerializer
):


    @classmethod
    def get_token(cls, user):

        token = super().get_token(user)

        token["role"] = user.role

        token["username"] = user.username

        token["full_name"] = user.full_name

        return token



class CustomTokenObtainPairView(
    TokenObtainPairView
):

    serializer_class = (
        CustomTokenObtainPairSerializer
    )



# =========================
# USERS
# =========================

# =========================================================
# USERS MANAGEMENT
# =========================================================

class UserViewSet(viewsets.ModelViewSet):

    queryset = User.objects.all().order_by("-id")

    serializer_class = UserSerializer

    permission_classes = [
        permissions.IsAuthenticated
    ]

    filter_backends = [
        filters.SearchFilter,
        DjangoFilterBackend,
    ]

    filterset_fields = [
        "role",
        "account_status",
        "is_active",
    ]

    search_fields = [
        "username",
        "email",
        "university",
        "department",
        "role",
    ]

    # =====================================================
    # GET USERS
    # =====================================================

    def get_queryset(self):

        user = self.request.user

        # Administrator can see all users.
        if is_administrator(user):
            return User.objects.all().order_by("-id")

        # Editorial staff get narrowly scoped directories: reviewers for reviewer assignment,
        # and editors for EIC/editorial governance assignment.
        requested_role = self.request.query_params.get("role")
        if user.role == "editor":
            if requested_role == "reviewer":
                return User.objects.filter(role="reviewer", account_status="active").order_by("full_name", "username")
            return User.objects.filter(id=user.id)
        if user.role == "editor_in_chief":
            if requested_role in {"reviewer", "editor"}:
                return User.objects.filter(role=requested_role, account_status="active").order_by("full_name", "username")
            return User.objects.filter(id=user.id)

        # Normal users can only see themselves via the main endpoint.
        return User.objects.filter(id=user.id)

    # =====================================================
    # UPDATE USER
    # =====================================================

    def perform_update(self, serializer):

        current_user = self.request.user

        # Administrator can update users
        if is_administrator(current_user):

            serializer.save()

            return

        # Normal users cannot change their role
        serializer.save(
            role=current_user.role
        )

    @action(detail=False, methods=["get"], url_path="directory")
    def directory(self, request):
        if not request.user.is_authenticated:
            raise PermissionDenied("Authentication required.")
        query = (request.query_params.get("q") or "").strip()
        qs = User.objects.filter(role__in=["author", "editor", "editor_in_chief"], account_status="active").exclude(pk=request.user.pk)
        if query:
            qs = qs.filter(models.Q(username__icontains=query) | models.Q(full_name__icontains=query) | models.Q(university__icontains=query) | models.Q(institution__icontains=query) | models.Q(discipline__icontains=query) | models.Q(research_field__icontains=query))
        return Response(UserSerializer(qs.order_by("full_name", "username")[:25], many=True).data)

    @action(detail=True, methods=["post"], url_path="set-role")
    def set_role(self, request, pk=None):
        if not is_administrator(request.user): raise PermissionDenied("Administrator access required.")
        role=request.data.get("role")
        if role not in {"reader","author","reviewer","editor","editor_in_chief","administrator"}: return Response({"detail":"Invalid role."},status=400)
        target=self.get_object(); target.role=role; target.save(update_fields=["role"]); return Response(UserSerializer(target).data)

    # =====================================================
    # SUSPEND USER
    # =====================================================

    @action(
        detail=True,
        methods=["post"],
        url_path="suspend"
    )
    def suspend(self, request, pk=None):

        # Only administrator can suspend
        if not is_administrator(request.user):

            raise PermissionDenied(
                "Only administrators can suspend users."
            )

        user = self.get_object()

        # Prevent administrator from suspending themselves
        if user.id == request.user.id:

            return Response(
                {
                    "detail":
                    "You cannot suspend your own administrator account."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Actually disable Django account
        user.is_active = False

        user.save(
            update_fields=["is_active"]
        )

        return Response(
            {
                "message":
                f"{user.username} has been suspended.",

                "username":
                user.username,

                "is_active":
                user.is_active,

                "status":
                "suspended"
            },
            status=status.HTTP_200_OK
        )

    # =====================================================
    # ACTIVATE USER
    # =====================================================

    @action(
        detail=True,
        methods=["post"],
        url_path="activate"
    )
    def activate(self, request, pk=None):

        # Only administrator can activate
        if not is_administrator(request.user):

            raise PermissionDenied(
                "Only administrators can activate users."
            )

        user = self.get_object()

        # Activate Django account
        user.is_active = True

        user.save(
            update_fields=["is_active"]
        )

        return Response(
            {
                "message":
                f"{user.username} has been activated.",

                "username":
                user.username,

                "is_active":
                user.is_active,

                "status":
                "active"
            },
            status=status.HTTP_200_OK
        )

    # =====================================================
    # DELETE USER
    # =====================================================

    def destroy(self, request, *args, **kwargs):

        if not is_administrator(request.user):

            raise PermissionDenied(
                "Only administrators can delete users."
            )

        user = self.get_object()

        # Prevent deleting yourself
        if user.id == request.user.id:

            return Response(
                {
                    "detail":
                    "You cannot delete your own administrator account."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        user.delete()

        return Response(
            {
                "message":
                "User deleted successfully."
            },
            status=status.HTTP_204_NO_CONTENT
        )
# =========================
# GENERATE REVIEWER INVITATION
# =========================

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def _publication_settings():
    obj = PublicationSettings.objects.order_by("id").first()
    if not obj:
        obj = PublicationSettings.objects.create()
    return obj


@api_view(["GET", "PATCH"])
@permission_classes([permissions.IsAuthenticated])
def publication_settings_view(request):
    if not is_administrator(request.user):
        return Response({"detail": "Administrator access required."}, status=403)
    obj = _publication_settings()
    if request.method == "PATCH":
        allowed = {
            "journal_name", "current_volume", "current_issue", "publication_year",
            "next_article_number", "journal_code", "doi_prefix", "automatic_numbering",
            "automatic_volume_issue", "automatic_citation", "automatic_doi"
        }
        for key, value in request.data.items():
            if key in allowed:
                setattr(obj, key, value)
        obj.save()
    return Response({
        "journal_name": obj.journal_name, "current_volume": obj.current_volume,
        "current_issue": obj.current_issue, "publication_year": obj.publication_year,
        "next_article_number": obj.next_article_number, "journal_code": obj.journal_code,
        "doi_prefix": obj.doi_prefix, "automatic_numbering": obj.automatic_numbering,
        "automatic_volume_issue": obj.automatic_volume_issue,
        "automatic_citation": obj.automatic_citation, "automatic_doi": obj.automatic_doi,
    })


def _assign_publication_metadata(article):
    settings_obj = _publication_settings()
    if settings_obj.automatic_volume_issue:
        article.volume = settings_obj.current_volume
        article.issue = settings_obj.current_issue
    number = article.publication_number
    if settings_obj.automatic_numbering and number is None:
        number = settings_obj.next_article_number
        article.publication_number = number
        settings_obj.next_article_number += 1
        settings_obj.save(update_fields=["next_article_number", "updated_at"])
    if settings_obj.automatic_doi and settings_obj.doi_prefix and number is not None:
        article.doi = f"{settings_obj.doi_prefix.rstrip('/')}/{settings_obj.journal_code}.{settings_obj.publication_year}.{number:04d}"
    article.year = settings_obj.publication_year
    if settings_obj.automatic_citation:
        doi_part = f" DOI: {article.doi}." if article.doi else ""
        article.citation_text = f"{article.title}. Rwanda Student Journal for Health. {settings_obj.publication_year};{article.volume or ''}({article.issue or ''}).{doi_part}".strip()
    article.save(update_fields=["volume", "issue", "publication_number", "doi", "year", "citation_text", "updated_at"])


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def send_invitation(request):
    user = request.user
    if not is_administrator(user):
        return Response({"detail": "Only administrators can send invitations."}, status=403)

    role = request.data.get("role", "reviewer")
    allowed = {"reviewer", "editor", "editor_in_chief", "partner"}
    if role not in allowed:
        return Response({"detail": "Invalid invitation role."}, status=400)

    email = (request.data.get("email") or "").strip()
    contact_name = (request.data.get("contact_name") or "").strip()
    organization = (request.data.get("organization") or "").strip()

    if not email:
        return Response({"detail": "Contact email is required."}, status=400)
    if role == "partner" and not organization:
        return Response({"detail": "Organisation is required for partner invitations."}, status=400)

    token = secrets.token_urlsafe(32)
    number = ReviewerInvitation.objects.count() + 1
    prefix = {
        "reviewer": "RSJH-REV",
        "editor": "RSJH-EDT",
        "editor_in_chief": "RSJH-EIC",
        "partner": "RSJH-PAR",
    }[role]

    invitation = ReviewerInvitation.objects.create(
        code=f"{prefix}-{number:04d}",
        role=role,
        email=email,
        contact_name=contact_name,
        organization=organization,
        token=token,
        expires_at=timezone.now() + timezone.timedelta(days=14),
        status="pending",
    )

    frontend = getattr(settings, "FRONTEND_URL", "http://localhost:3000").rstrip("/")
    link = f"{frontend}/auth/register?invitation={token}&role={role}"

    try:
        sent = send_invitation_email(
            email=email,
            contact_name=contact_name,
            role=role,
            organization=organization,
            invitation_code=invitation.code,
            invitation_url=link,
            expires_at=invitation.expires_at,
            invited_by=user,
        )
        if not sent:
            raise RuntimeError("The email could not be delivered by the configured mail server.")
    except Exception as exc:
        invitation.delete()
        return Response({"detail": f"Invitation could not be emailed: {exc}"}, status=502)

    return Response({
        "message": "Invitation email sent successfully.",
        "id": invitation.id,
        "code": invitation.code,
        "status": invitation.status,
        "role": role,
    }, status=201)


# =========================
# PROFILE
# =========================

class ProfileView(APIView):

    permission_classes = [
        permissions.IsAuthenticated
    ]


    def get(self, request):

        serializer = UserSerializer(
            request.user
        )


        return Response(
            serializer.data
        )



    def patch(self, request):

        serializer = UserSerializer(
            request.user,
            data=request.data,
            partial=True
        )


        serializer.is_valid(
            raise_exception=True
        )


        serializer.save()


        return Response(
            serializer.data
        )
  
# =========================
# REVIEWS
# =========================

# =========================
# ARTICLES
# =========================

class ArticleViewSet(viewsets.ModelViewSet):

    queryset = Article.objects.all().order_by(
        "-created_at"
    )

    serializer_class = ArticleSerializer

    permission_classes = [
        permissions.IsAuthenticatedOrReadOnly
    ]


    filter_backends = [
        filters.SearchFilter,
        DjangoFilterBackend
    ]


    search_fields = [
        "title",
        "abstract",
        "keywords",
        "specialty",
        "author__username",
        "author__university"
    ]


    filterset_fields = [
        "year",
        "specialty",
        "status",
        "is_published"
    ]



    # =========================
    # CREATE MANUSCRIPT
    # =========================

    def perform_create(self, serializer):

        user = self.request.user


        print("========== ARTICLE CREATE ==========")
        print("USER:", user)
        print("AUTHENTICATED:", user.is_authenticated)
        print("ROLE:", getattr(user, "role", None))


        if not user.is_authenticated:

            raise PermissionDenied(
                "You must login first."
            )


        if (
            user.role not in [
                "author",
                "administrator"
            ]
            and not user.is_superuser
        ):

            raise PermissionDenied(
                "Only authors can submit manuscripts."
            )


        article = serializer.save(
            author=user,
            status="draft",
            is_published=False
        )

        notify(
            user,
            "Draft created successfully",
            f'Your manuscript draft "{article.title}" has been created successfully. You can continue developing it from your author dashboard.',
            "RSJH — Draft created successfully",
        )



    # =========================
    # GET ARTICLES
    # =========================

    def get_queryset(self):

        user = self.request.user


        queryset = Article.objects.all().order_by(
            "-created_at"
        )


        if not user.is_authenticated:

            return queryset.filter(
                is_published=True
            )


        if is_administrator(user):

            return queryset


        # Editorial staff must be able to see the full editorial queue.
        if user.role in {"editor", "editor_in_chief"}:

            return queryset



        if is_reviewer(user):

            return queryset.filter(
                models.Q(is_published=True)
                |
                models.Q(
                    assignments__reviewer=user
                )
            ).distinct()



        return queryset.filter(
            models.Q(is_published=True)
            |
            models.Q(author=user)
        ).distinct()



    # =========================
    # MY ARTICLES
    # =========================

    @action(detail=True, methods=["post"], url_path="co-authors")
    def co_authors_action(self, request, pk=None):
        article = self.get_object()
        if not (is_administrator(request.user) or article.author == request.user):
            raise PermissionDenied("Only the lead author or an administrator can manage co-authors.")
        usernames = request.data.get("usernames", [])
        contributions = request.data.get("contributions", {}) or {}
        if not isinstance(usernames, list):
            return Response({"detail": "usernames must be a list."}, status=400)
        found = list(User.objects.filter(username__in=usernames, role__in=["author", "editor", "editor_in_chief"]).exclude(pk=article.author_id))
        found_by_username = {u.username: u for u in found}
        missing = [u for u in usernames if u not in found_by_username]
        article.co_authors.set(found)
        CoAuthorContribution.objects.filter(article=article).delete()
        for order, username in enumerate(usernames, start=1):
            user = found_by_username.get(username)
            if not user:
                continue
            roles = contributions.get(username, []) if isinstance(contributions, dict) else []
            if not isinstance(roles, list):
                roles = [str(roles)]
            CoAuthorContribution.objects.create(article=article, user=user, contribution_roles=roles, author_order=order)
        return Response({
            "article": article.id,
            "co_authors": UserSerializer(found, many=True).data,
            "contributions": [
                {"username": c.user.username, "roles": c.contribution_roles, "author_order": c.author_order}
                for c in article.coauthor_contributions.select_related("user").all()
            ],
            "missing_usernames": missing,
        })

    @action(detail=True, methods=["post"], url_path="handling-editor")
    def handling_editor_action(self, request, pk=None):
        article = self.get_object()
        user = request.user
        if user.role not in {"administrator", "editor", "editor_in_chief"}:
            raise PermissionDenied("Editorial access required.")
        editor_id = request.data.get("editor")
        if editor_id in (None, "", "null"):
            if user.role in {"editor", "editor_in_chief"}:
                editor = user
            else:
                article.handling_editor = None
                article.save(update_fields=["handling_editor", "updated_at"])
                return Response({"detail": "Handling editor cleared."})
        else:
            try:
                editor = User.objects.get(pk=editor_id, role__in=["editor", "editor_in_chief"])
            except User.DoesNotExist:
                return Response({"detail": "Selected handling editor is invalid."}, status=400)
            if user.role == "editor" and editor.id != user.id:
                raise PermissionDenied("Editors can only claim manuscripts for themselves. The EIC or administrator assigns other editors.")
        article.handling_editor = editor
        article.save(update_fields=["handling_editor", "updated_at"])
        return Response(ArticleSerializer(article, context={"request": request}).data)

    @action(
        detail=False,
        methods=["get"]
    )
    def my(self, request):

        articles = Article.objects.filter(
            author=request.user
        ).order_by(
            "-created_at"
        )


        serializer = ArticleSerializer(
            articles,
            many=True,
            context={"request": request},
        )


        return Response(
            serializer.data
        )



    # =========================
    # SUBMIT ARTICLE
    # =========================

    @action(
        detail=True,
        methods=["post"]
    )
    def submit(self, request, pk=None):

        article = self.get_object()


        if article.author != request.user:

            raise PermissionDenied(
                "You cannot submit this manuscript."
            )


        if article.status != "draft":

            return Response(
                {
                    "detail":
                    "Only draft manuscripts can be submitted."
                },
                status=400
            )


        article.status = "submitted"
        article.is_published = False
        article.submitted_at = timezone.now()
        article.save(update_fields=["status","is_published","submitted_at","updated_at"])
        # ADDITIVE RSRE integration: record evidence only after the existing submission succeeds.
        record_manuscript_submission(article)

        notify(
            article.author,
            "Manuscript submitted",
            f"Dear Author,\n\nYour manuscript \"{article.title}\" has been successfully submitted to the Rwanda Student Journal for Health.\n\nThe next stage is editorial screening. The editorial team will assess scope, completeness and readiness for peer review.\n\nYou can track the manuscript status from your author dashboard.",
            "RSJH — Manuscript Submitted",
            f"{getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')}/dashboard",
            "Track Manuscript",
        )
        for editor in User.objects.filter(role__in=["editor","editor_in_chief","administrator"]):
            notify(
                editor,
                "New manuscript submitted",
                f"Dear Editor,\n\nA new manuscript has been submitted to RSJH and is awaiting editorial screening.\n\nManuscript: {article.title}\n\nPlease review the submission for scope, completeness, ethics and readiness for peer review.",
                "RSJH — New Manuscript Submitted",
                f"{getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')}/dashboard",
                "Open Editorial Dashboard",
            )



        return Response(
            {
                "message":
                "Manuscript submitted successfully."
            }
        )



    @action(detail=True, methods=["post"], url_path="submit-revision")
    def submit_revision(self, request, pk=None):
        article = self.get_object()
        if article.author != request.user:
            raise PermissionDenied("Only the manuscript author can submit a revision.")
        if article.status != "revision":
            return Response({"detail": "This manuscript is not awaiting revision."}, status=400)

        response_to_reviewers = request.data.get("response_to_reviewers", "")
        author_notes = request.data.get("author_notes", "")
        revision_file = request.FILES.get("manuscript_file")
        revision = ArticleRevision.objects.create(
            article=article,
            round=article.revision_round + 1,
            manuscript_file=revision_file,
            response_to_reviewers=response_to_reviewers,
            author_notes=author_notes,
            submitted_by=request.user,
        )
        article.revision_round = revision.round
        article.status = "under_review"
        article.is_published = False
        article.submitted_at = timezone.now()
        article.save(update_fields=["revision_round", "status", "is_published", "submitted_at", "updated_at"])

        for reviewer in User.objects.filter(assignments__article=article).distinct():
            notify(reviewer,"Author revision received",f'A revision has been submitted for "{article.title}".')

        return Response(ArticleRevisionSerializer(revision, context={"request": request}).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["get"], url_path="journey")
    def journey(self, request, pk=None):
        article = self.get_object()
        return Response(ArticleSerializer(article, context={"request": request}).data)

    # =========================
    # UPDATE
    # =========================

    def perform_update(self, serializer):

        article = serializer.instance

        user = self.request.user


        if is_administrator(user):

            serializer.save()

            return



        if article.author != user:

            raise PermissionDenied(
                "You can edit only your own manuscript."
            )



        if article.status not in [
            "draft",
            "revision"
        ]:

            raise PermissionDenied(
                "This manuscript cannot be edited."
            )


        serializer.save()



    # =========================
    # DELETE
    # =========================

    def perform_destroy(self, instance):

        user = self.request.user


        if is_administrator(user):

            instance.delete()

            return



        if (
            instance.author != user
            or instance.status != "draft"
        ):

            raise PermissionDenied(
                "Only draft manuscripts can be deleted."
            )


        instance.delete()
 # =========================
# REVIEWS
# =========================

class ReviewViewSet(viewsets.ModelViewSet):

    queryset = Review.objects.all().order_by(
        "-created_at"
    )

    serializer_class = ReviewSerializer

    permission_classes = [
        permissions.IsAuthenticated
    ]


    def get_queryset(self):

        user = self.request.user


        if is_administrator(user):

            return Review.objects.all()


        return Review.objects.filter(
            reviewer=user
        )



    def perform_create(self, serializer):
        user = self.request.user
        if not is_reviewer(user):
            raise PermissionDenied("Reviewer access required.")

        article = serializer.validated_data.get("article")
        assignment = ReviewAssignment.objects.filter(article=article, reviewer=user).first()
        if assignment is None:
            raise PermissionDenied("You can review only manuscripts assigned to you.")

        review = serializer.save(reviewer=user)
        assignment.completed = True
        assignment.completed_at = timezone.now()
        assignment.save(update_fields=["completed", "completed_at"])

        article.last_reviewed_at = timezone.now()
        article.is_published = False
        if review.recommendation in ["minor_revision", "major_revision"]:
            article.status = "revision"
        else:
            article.status = "editor_decision"
        article.save(update_fields=["last_reviewed_at", "is_published", "status", "updated_at"])
        # ADDITIVE RSRE integration: peer-review evidence; no editorial state is changed here.
        record_peer_review(review)


        message = (
            f'Reviewer feedback is now available for "{article.title}". '
            + (
                "Please review the requested changes and submit a revision."
                if article.status == "revision"
                else "The manuscript has moved to editorial decision."
            )
        )
        notify(
            article.author,
            "Reviewer feedback available",
            f"Dear Author,\n\nReviewer feedback is now available for \"{article.title}\".\n\n{message}\n\nPlease review the comments carefully and follow the next action shown in your RSJH dashboard.",
            "RSJH — Reviewer Feedback Available",
            f"{getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')}/dashboard",
            "View Reviewer Feedback",
        )

        # Notify the editorial team as soon as peer review is completed.
        for editor in User.objects.filter(
            role__in=["editor", "editor_in_chief", "administrator"]
        ).exclude(pk=request.user.pk):
            notify(
                editor,
                "Reviewer feedback submitted",
                f"Dear Editor,\n\nA reviewer has completed feedback for \"{article.title}\".\n\n{message}\n\nPlease open the editorial dashboard to review the report and determine the next editorial action.",
                "RSJH — Reviewer Feedback Submitted",
                f"{getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')}/dashboard",
                "Open Editorial Dashboard",
            )



# =========================================================
# REVIEW ASSIGNMENTS
# =========================================================

class ReviewAssignmentViewSet(
    viewsets.ModelViewSet
):

    queryset = ReviewAssignment.objects.all().order_by(
        "-assigned_at"
    )

    serializer_class = ReviewAssignmentSerializer

    permission_classes = [
        permissions.IsAuthenticated
    ]

    def get_queryset(self):
        user = self.request.user
        if is_administrator(user) or user.role in {"editor", "editor_in_chief"}:
            if user.role == "editor":
                return ReviewAssignment.objects.filter(article__handling_editor=user)
            return ReviewAssignment.objects.all()
        if user.role == "reviewer":
            return ReviewAssignment.objects.filter(reviewer=user)
        return ReviewAssignment.objects.none()

    @action(detail=False, methods=["get"], url_path="suggested-reviewers")
    def suggested_reviewers(self, request):
        if not is_editorial_staff(request.user):
            raise PermissionDenied("Editorial access required.")
        article_id = request.query_params.get("article")
        if not article_id:
            return Response({"detail": "article query parameter is required."}, status=400)
        try:
            article = Article.objects.select_related("author", "handling_editor").get(pk=article_id)
        except Article.DoesNotExist:
            return Response({"detail": "Manuscript not found."}, status=404)
        reviewers = User.objects.filter(role="reviewer", account_status="active").order_by("full_name", "username")
        assigned_ids = set(ReviewAssignment.objects.filter(article=article).values_list("reviewer_id", flat=True))
        rows = []
        for reviewer in reviewers:
            conflicts = []
            if reviewer.id == article.author_id:
                conflicts.append("reviewer_is_author")
            if reviewer.id in set(article.co_authors.values_list("id", flat=True)):
                conflicts.append("reviewer_is_coauthor")
            if reviewer.id in assigned_ids:
                conflicts.append("already_assigned")
            if reviewer.institution and article.author.institution and reviewer.institution.strip().lower() == article.author.institution.strip().lower():
                conflicts.append("same_institution")
            active_workload = ReviewAssignment.objects.filter(reviewer=reviewer, completed=False).count()
            topic = (article.specialty or article.discipline or "").lower()
            interests = (reviewer.research_interests or reviewer.research_field or reviewer.discipline or "").lower()
            topic_match = bool(topic and any(part.strip() and part.strip() in interests for part in topic.replace(",", " ").split()))
            rows.append({"id": reviewer.id, "username": reviewer.username, "full_name": reviewer.full_name or reviewer.username, "email": reviewer.email, "workload": active_workload, "topic_match": topic_match, "conflicts": conflicts, "eligible": not conflicts})
        rows.sort(key=lambda r: (not r["eligible"], not r["topic_match"], r["workload"], r["full_name"].lower()))
        return Response(rows)

    @action(detail=False, methods=["get"], url_path="my")
    def my(self, request):
        if request.user.role != "reviewer":
            raise PermissionDenied("Reviewer access required.")
        assignments = self.get_queryset().select_related("article", "article__author")
        return Response(ReviewAssignmentSerializer(assignments, many=True, context={"request": request}).data)

    def perform_create(self, serializer):

        user = self.request.user

        if not is_editorial_staff(user):
            raise PermissionDenied("Only Editors, Editors-in-Chief, or Administrators can assign reviewers.")

        reviewer = serializer.validated_data.get(
            "reviewer"
        )

        article = serializer.validated_data.get(
            "article"
        )

        if reviewer is None:

            raise PermissionDenied(
                "Reviewer must be selected."
            )

        if reviewer.role != "reviewer":
            raise PermissionDenied("Selected user is not a reviewer.")

        if user.role == "editor" and article.handling_editor_id not in {None, user.id}:
            raise PermissionDenied("This manuscript is handled by another editor. Only the assigned handling editor, EIC, or administrator can assign reviewers.")

        conflict_reasons = []
        if reviewer.id == article.author_id:
            conflict_reasons.append("the reviewer is the lead author")
        if article.co_authors.filter(pk=reviewer.id).exists():
            conflict_reasons.append("the reviewer is a co-author")
        if reviewer.institution and article.author.institution and reviewer.institution.strip().lower() == article.author.institution.strip().lower():
            conflict_reasons.append("the reviewer shares the author's institution")
        if conflict_reasons:
            raise PermissionDenied("Conflict of interest detected: " + "; ".join(conflict_reasons) + ".")

        existing = ReviewAssignment.objects.filter(article=article, reviewer=reviewer).exists()

        if existing:

            raise PermissionDenied(
                "This reviewer is already assigned to this manuscript."
            )

        assignment = serializer.save()

        if article.status in {"submitted", "editor_decision"}:
            article.status = "under_review"
            article.is_published = False
            article.save(update_fields=["status", "is_published", "updated_at"])

        notify(reviewer,"New Review Assignment",f"You have been assigned to review {assignment.article.title}")

        notify(article.author,"Peer review started",f"A reviewer has been assigned to your RSJH manuscript: {article.title}.")


# =========================================================
# REVIEWER DASHBOARD
# =========================================================

class ReviewerDashboardView(APIView):

    permission_classes = [
        permissions.IsAuthenticated
    ]

    def get(self, request):

        user = request.user

        if user.role != "reviewer":

            return Response(
                {
                    "detail":
                    "Reviewer access required."
                },
                status=403
            )

        assignments = (
            ReviewAssignment.objects
            .filter(reviewer=user)
            .select_related(
                "article",
                "article__author"
            )
        )

        return Response({

            "reviewer":
            user.full_name or user.username,

            "total_assignments":
            assignments.count(),

            "assignments":
            ReviewAssignmentSerializer(
                assignments,
                many=True
            ).data,
        })


# =========================================================
# EDITORIAL DECISIONS
# =========================================================

class EditorialDecisionViewSet(viewsets.ModelViewSet):
    queryset = EditorialDecision.objects.all().order_by("-created_at")
    serializer_class = EditorialDecisionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if is_administrator(user) or is_editorial_staff(user):
            return EditorialDecision.objects.all()
        return EditorialDecision.objects.filter(article__author=user)

    def perform_create(self, serializer):
        user = self.request.user
        if not is_editorial_staff(user):
            raise PermissionDenied(
                "Only Editors, Editors-in-Chief, or Administrators can make editorial decisions."
            )
        article = serializer.validated_data["article"]
        decision = serializer.validated_data["decision"]
        record = serializer.save(editor=user)
        article.editorial_notes = record.rationale
        article.accepted_date = timezone.now().date() if decision == "accept" else None
        article.published_by = user if decision == "accept" else None
        article.status = "published" if decision == "accept" else ("revision" if decision in {"minor_revision", "major_revision"} else "rejected")
        article.is_published = decision == "accept"
        if decision == "accept":
            article.published_date = timezone.now().date()
            article.save(update_fields=["editorial_notes", "accepted_date", "published_by", "status", "is_published", "published_date", "updated_at"])
            _assign_publication_metadata(article)
            # ADDITIVE RSRE integration: record publication evidence after publication metadata is assigned.
            record_publication(article)
        else:
            article.published_date = None
            article.save(update_fields=["editorial_notes", "accepted_date", "published_by", "status", "is_published", "published_date", "updated_at"])
        dashboard_url = f"{getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')}/dashboard"
        metadata_lines = [
            f"Manuscript: {article.title}",
            f"Decision: {decision.replace('_', ' ').title()}",
        ]
        if decision == "accept":
            if article.volume is not None:
                metadata_lines.append(f"Volume: {article.volume}")
            if article.issue is not None:
                metadata_lines.append(f"Issue: {article.issue}")
            if article.publication_number is not None:
                metadata_lines.append(f"Article number: {article.publication_number:04d}")
            if article.doi:
                metadata_lines.append(f"DOI: {article.doi}")

            notify(
                article.author,
                "Manuscript accepted",
                "\n".join(metadata_lines) + "\n\nYour manuscript has been accepted for publication.",
                "RSJH — Manuscript Accepted",
                dashboard_url,
                "View Publication Details",
            )

            notify(
                article.author,
                "Article published",
                "\n".join(metadata_lines) + "\n\nYour article is now published in the RSJH archive.",
                "RSJH — Your Article Has Been Published",
                dashboard_url,
                "View Published Article",
            )
        elif decision in {"minor_revision", "major_revision"}:
            notify(
                article.author,
                "Revision required",
                "\n".join(metadata_lines) + "\n\nPlease review the editorial rationale and submit your revision through the RSJH dashboard.",
                "RSJH — Revision Required",
                dashboard_url,
                "Submit Revision",
            )
        else:
            notify(
                article.author,
                "Manuscript rejected",
                "\n".join(metadata_lines) + "\n\nPlease review the editorial rationale provided in your RSJH dashboard.",
                "RSJH — Editorial Decision",
                dashboard_url,
                "View Editorial Decision",
            )


# =========================================================
# RESPONSIBLE AI ASSISTANCE
# =========================================================

from .ai_service import AIService

class RSJHAIAssistView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        task = (request.data.get("task") or "research").strip().lower()
        text = request.data.get("text") or ""
        article_id = request.data.get("article")
        disclosed = bool(request.data.get("disclosed", False))
        if not text.strip():
            return Response({"detail": "Text is required."}, status=400)
        article = None
        if article_id:
            article = Article.objects.filter(id=article_id).first()
            if article and article.author != request.user and not is_reviewer(request.user):
                raise PermissionDenied("You cannot use AI assistance on this manuscript.")
        try:
            result = AIService().generate(task, text, {"language": request.data.get("language", "en")})
            AIUsageLog.objects.create(
                user=request.user, article=article, task=task,
                provider=result.get("provider", "unknown"),
                model=result.get("metadata", {}).get("model", ""),
                input_characters=len(text), output_characters=len(result.get("content", "")),
                disclosed=disclosed, success=True,
            )
            return Response({
                "task": task,
                "content": result.get("content", ""),
                "provider": result.get("provider"),
                "model": result.get("metadata", {}).get("model", ""),
                "accountability": "AI is assisting; the student/reviewer remains responsible for the final work. Verify facts, citations and originality before use."
            })
        except Exception as exc:
            AIUsageLog.objects.create(user=request.user, article=article, task=task, success=False, disclosed=disclosed, input_characters=len(text))
            return Response({"detail": str(exc)}, status=503)


class MedTechAIChatView(APIView):
    """Cross-pillar RSRE assistant. Keeps RSJH as a protected source of truth."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        message = (request.data.get("message") or "").strip()
        if not message:
            return Response({"detail": "Message is required."}, status=400)

        language = (request.data.get("language") or "en").strip()
        pillar = (request.data.get("pillar") or "general").strip()
        extra_context = request.data.get("context") or {}
        if not isinstance(extra_context, dict):
            extra_context = {}

        # Only expose published RSJH evidence to the model context.
        query = request.data.get("research_query") or message
        qs = Article.objects.filter(status="published", is_published=True).filter(
            models.Q(title__icontains=query)
            | models.Q(abstract__icontains=query)
            | models.Q(keywords__icontains=query)
            | models.Q(specialty__icontains=query)
            | models.Q(author__username__icontains=query)
            | models.Q(author__full_name__icontains=query)
        ).select_related("author").order_by("-published_date", "-created_at")

        evidence = []
        for article in qs[:6]:
            evidence.append({
                "id": article.id,
                "title": article.title,
                "author": getattr(article.author, "full_name", "") or getattr(article.author, "username", ""),
                "year": article.year,
                "specialty": article.specialty,
                "abstract": (article.abstract or "")[:700],
            })

        prompt_payload = {
            "user_message": message,
            "current_pillar": pillar,
            "context": extra_context,
            "published_rsjh_evidence": evidence,
        }
        import json as _json
        text = _json.dumps(prompt_payload, ensure_ascii=False)

        try:
            result = AIService().generate("chat", text, {"language": language, "pillar": pillar})
            content = result.get("content", "")
            AIUsageLog.objects.create(
                user=request.user, task="chat", provider=result.get("provider", "unknown"),
                model=result.get("metadata", {}).get("model", ""),
                input_characters=len(message), output_characters=len(content), success=True, disclosed=True,
            )
            return Response({
                "message": content,
                "pillar": pillar,
                "research_evidence": evidence,
                "accountability": "MedTech AI assists; the researcher remains responsible for final decisions, facts, citations, ethics, and originality.",
            })
        except Exception as exc:
            AIUsageLog.objects.create(
                user=request.user, task="chat", success=False, disclosed=True, input_characters=len(message)
            )
            return Response({"detail": str(exc)}, status=503)


class AIUsageViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = AIUsageLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if is_administrator(self.request.user):
            return AIUsageLog.objects.all()
        return AIUsageLog.objects.filter(user=self.request.user)


# =========================================================
# BOOKMARKS
# =========================================================

class BookmarkViewSet(
    viewsets.ModelViewSet
):

    serializer_class = BookmarkSerializer

    permission_classes = [
        permissions.IsAuthenticated
    ]

    def get_queryset(self):

        return Bookmark.objects.filter(
            user=self.request.user
        )

    def perform_create(self, serializer):

        serializer.save(
            user=self.request.user
        )


# =========================================================
# NOTIFICATIONS
# =========================================================

class NotificationViewSet(
    viewsets.ModelViewSet
):

    serializer_class = NotificationSerializer

    permission_classes = [
        permissions.IsAuthenticated
    ]

    http_method_names = [
        "get",
        "patch",
        "head",
        "options",
    ]

    def get_queryset(self):
        return Notification.objects.filter(
            user=self.request.user
        ).order_by("-created_at")

    @action(detail=True, methods=["post"], url_path="mark-read")
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save(update_fields=["is_read"])
        return Response(NotificationSerializer(notification).data)

    @action(detail=False, methods=["post"], url_path="mark-all-read")
    def mark_all_read(self, request):
        updated = self.get_queryset().filter(is_read=False).update(is_read=True)
        return Response({"marked_read": updated})


# =========================================================
# BASIC RESEARCH ANALYTICS
# =========================================================

class ResearchAnalyticsView(APIView):

    permission_classes = [
        permissions.AllowAny
    ]

    def get(self, request):

        published_articles = Article.objects.filter(
            status="published",
            is_published=True,
            author__account_status="active",
        )

        return Response({

            "published_articles":
            published_articles.count(),

            "total_researchers":
            User.objects.filter(
                role="author"
            ).count(),

            "universities":
            published_articles.values(
                "author__university"
            ).distinct().count(),

            "research_areas":
            published_articles.values(
                "specialty"
            ).distinct().count(),
        })


# =========================================================
# TOP DISEASE ANALYTICS
# =========================================================

class TopDiseasesAnalyticsView(APIView):

    permission_classes = [
        permissions.AllowAny
    ]

    def get(self, request):

        articles = Article.objects.filter(
            status="published",
            is_published=True,
            author__account_status="active",
        )

        disease_counter = {}

        diseases_list = [

            "malaria",
            "hiv",
            "tuberculosis",
            "diabetes",
            "hypertension",
            "cancer",
            "covid",
            "pneumonia",
            "anemia",
            "hepatitis",
        ]

        for article in articles:

            text = (
                (article.title or "")
                + " "
                + (article.abstract or "")
                + " "
                + (article.keywords or "")
            ).lower()

            for disease in diseases_list:

                if disease in text:

                    disease_counter[disease] = (
                        disease_counter.get(
                            disease,
                            0
                        ) + 1
                    )

        data = []

        for disease, count in disease_counter.items():

            data.append({
                "name": disease.title(),
                "count": count,
            })

        data = sorted(
            data,
            key=lambda x: x["count"],
            reverse=True
        )

        return Response({
            "diseases": data
        })


# =========================================================
# RESEARCH GEOGRAPHY ANALYTICS
# =========================================================

class GeographyAnalyticsView(APIView):

    permission_classes = [
        permissions.AllowAny
    ]

    def get(self, request):

        universities = (
            Article.objects
            .filter(
                status="published",
                is_published=True,
                author__account_status="active",
            )
            .values(
                "author__university"
            )
            .annotate(
                count=models.Count("id")
            )
            .exclude(
                author__university=""
            )
            .order_by(
                "-count"
            )
        )

        data = []

        for item in universities:

            data.append({

                "name":
                item["author__university"],

                "count":
                item["count"],
            })

        return Response({
            "universities": data
        })


# =========================================================
# SPECIALTY ANALYTICS
# =========================================================

class SpecialtyAnalyticsView(APIView):

    permission_classes = [
        permissions.AllowAny
    ]

    def get(self, request):

        specialties = (
            Article.objects
            .filter(
                status="published",
                is_published=True,
                author__account_status="active",
            )
            .values(
                "specialty"
            )
            .annotate(
                count=models.Count("id")
            )
            .exclude(
                specialty=""
            )
            .order_by(
                "-count"
            )
        )

        data = []

        for item in specialties:

            data.append({

                "name":
                item["specialty"],

                "count":
                item["count"],
            })

        return Response({
            "specialties": data
        })


# =========================================================
# PUBLICATION TREND ANALYTICS
# =========================================================

class PublicationTrendAnalyticsView(APIView):

    permission_classes = [
        permissions.AllowAny
    ]

    def get(self, request):

        years = (
            Article.objects
            .filter(
                status="published",
                is_published=True,
                author__account_status="active",
            )
            .values(
                "year"
            )
            .annotate(
                count=models.Count("id")
            )
            .exclude(
                year=None
            )
            .order_by(
                "year"
            )
        )

        data = []

        for item in years:

            data.append({

                "year":
                item["year"],

                "count":
                item["count"],
            })

        return Response({
            "publications": data
        })


# =========================================================
# AUTHOR DASHBOARD
# =========================================================

class AuthorDashboardView(APIView):

    permission_classes = [
        permissions.IsAuthenticated
    ]

    def get(self, request):

        user = request.user

        articles = Article.objects.filter(
            author=user
        ).order_by(
            "-created_at"
        )

        return Response({
            "name": user.full_name or user.username,
            "discipline": user.get_discipline_display() if user.discipline else "",
            "total_manuscripts": articles.count(),
            "drafts": articles.filter(status="draft").count(),
            "submitted": articles.filter(status__in=["submitted", "under_review"]).count(),
            "revision_required": articles.filter(status="revision").count(),
            "editorial_decision": articles.filter(status="editor_decision").count(),
            "published": articles.filter(is_published=True).count(),
            "articles": ArticleSerializer(articles, many=True, context={"request": request}).data,
        })


# =========================================================
# MEDTECH AI RESEARCH SEARCH
# =========================================================

# =========================
# MEDTECH AI RESEARCH SEARCH
# =========================

class MedTechAIResearchSearchView(APIView):

    permission_classes = [
        permissions.AllowAny
    ]

    def get(self, request):

        query = request.GET.get("q", "").strip()

        print("====================================")
        print("MEDTECH AI RESEARCH SEARCH")
        print("QUERY:", query)
        print("====================================")

        if not query:

            return Response({
                "query": "",
                "count": 0,
                "articles": []
            })

        articles = Article.objects.filter(
            status="published",
            is_published=True
        ).filter(

            models.Q(
                title__icontains=query
            )

            |

            models.Q(
                abstract__icontains=query
            )

            |

            models.Q(
                keywords__icontains=query
            )

            |

            models.Q(
                specialty__icontains=query
            )

            |

            models.Q(
                author__username__icontains=query
            )

            |

            models.Q(
                author__full_name__icontains=query
            )

        ).select_related(
            "author",
            "published_by"
        ).order_by(
            "-published_date",
            "-created_at"
        )

        print("FOUND ARTICLES:", articles.count())

        results = []

        for article in articles[:20]:

            results.append({

                "id": article.id,

                "title": article.title,

                "abstract": article.abstract,

                "keywords": article.keywords,

                "specialty": article.specialty,

                "year": article.year,

                "published_date": article.published_date,

                "doi": article.doi,

                "author": (
                    article.author.full_name
                    or article.author.username
                    if article.author
                    else None
                ),

                "author_username": (
                    article.author.username
                    if article.author
                    else None
                ),

                "author_university": (
                    article.author.university
                    if article.author
                    else None
                ),

                "published_by": (
                    article.published_by.full_name
                    or article.published_by.username
                    if article.published_by
                    else None
                ),

            })

        return Response({

            "query": query,

            "count": len(results),

            "articles": results

        })
    

class VerifyEmailView(APIView):
    permission_classes=[AllowAny]
    def post(self,request):
        x=EmailVerificationToken.objects.select_related("user").filter(token=request.data.get("token","")).first()
        if not x or x.expires_at<timezone.now(): return Response({"detail":"Invalid or expired verification token."},status=400)
        x.user.email_verified=True; x.user.save(update_fields=["email_verified"]); x.delete(); return Response({"message":"Email verified successfully."})
class RequestPasswordResetView(APIView):
    permission_classes=[AllowAny]
    def post(self,request):
        email=(request.data.get("email") or "").strip(); user=User.objects.filter(email__iexact=email).first()
        if user and user.email:
            uid=urlsafe_base64_encode(force_bytes(user.pk)); token=default_token_generator.make_token(user); url=f"{settings.FRONTEND_URL}/auth/reset-password?uid={uid}&token={token}"
            from django.core.mail import send_mail; send_mail("RSJH password reset",f"Reset your password: {url}",settings.DEFAULT_FROM_EMAIL,[user.email],fail_silently=True)
        return Response({"message":"If an account exists for that email, a reset link has been sent."})
class ConfirmPasswordResetView(APIView):
    permission_classes=[AllowAny]
    def post(self,request):
        try: user=User.objects.get(pk=force_str(urlsafe_base64_decode(request.data.get("uid",""))))
        except Exception: return Response({"detail":"Invalid reset link."},status=400)
        if not default_token_generator.check_token(user,request.data.get("token","")): return Response({"detail":"Invalid or expired reset link."},status=400)
        try: validate_password(request.data.get("password",""),user)
        except Exception as e: return Response({"detail":getattr(e,"messages",[str(e)])},status=400)
        user.set_password(request.data["password"]); user.save(update_fields=["password"]); return Response({"message":"Password reset successfully."})
class ResearchIdeaViewSet(viewsets.ModelViewSet):
    serializer_class = ResearchIdeaSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ResearchIdea.objects.filter(owner=self.request.user).prefetch_related("projects")

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=True, methods=["post"], url_path="convert-to-project")
    def convert_to_project(self, request, pk=None):
        idea = self.get_object()
        if ResearchProject.objects.filter(source_idea=idea).exists():
            return Response({"detail": "This idea has already been converted into a project."}, status=status.HTTP_400_BAD_REQUEST)
        project = ResearchProject.objects.create(
            owner=request.user, source_idea=idea, title=idea.title,
            research_question=idea.research_question, objectives=idea.objectives,
            background=idea.problem, methodology=idea.methodology, discipline=idea.discipline,
        )
        project.recalculate_readiness(); project.save(update_fields=["readiness_score", "updated_at"])
        idea.status = "converted"; idea.save(update_fields=["status", "updated_at"])
        return Response(ResearchProjectSerializer(project, context={"request": request}).data, status=status.HTTP_201_CREATED)


class ResearchProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ResearchProjectSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if getattr(user, "role", "") == "administrator":
            return ResearchProject.objects.all().select_related("owner", "mentor", "source_idea").prefetch_related("members__user", "milestones")
        return ResearchProject.objects.filter(models.Q(owner=user) | models.Q(members__user=user, members__status="active")).distinct().select_related("owner", "mentor", "source_idea").prefetch_related("members__user", "milestones")

    def _can_manage(self, project):
        user = self.request.user
        return user.role == "administrator" or project.owner_id == user.id

    def perform_create(self, serializer):
        serializer.save()

    def perform_update(self, serializer):
        project = self.get_object()
        if not self._can_manage(project):
            raise PermissionDenied("Only the project owner or an administrator can update this project.")
        serializer.save()

    def perform_destroy(self, instance):
        if not self._can_manage(instance):
            raise PermissionDenied("Only the project owner or an administrator can delete this project.")
        instance.delete()

    @action(detail=True, methods=["post"], url_path="add-member")
    def add_member(self, request, pk=None):
        project = self.get_object()
        if not self._can_manage(project): raise PermissionDenied("Only the project owner or an administrator can manage the team.")
        try:
            user = User.objects.get(pk=request.data.get("user_id"))
        except (User.DoesNotExist, TypeError, ValueError):
            return Response({"detail": "Valid user_id is required."}, status=400)
        member, _ = ResearchProjectMember.objects.update_or_create(project=project, user=user, defaults={"role": request.data.get("role", "co_investigator"), "status": "active"})
        return Response(ResearchProjectMemberSerializer(member, context={"request": request}).data, status=201)

    @action(detail=True, methods=["post"], url_path="add-milestone")
    def add_milestone(self, request, pk=None):
        project = self.get_object()
        if not self._can_manage(project): raise PermissionDenied("Only the project owner or an administrator can manage milestones.")
        serializer = ResearchProjectMilestoneSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        milestone = ResearchProjectMilestone.objects.create(project=project, **serializer.validated_data)
        return Response(ResearchProjectMilestoneSerializer(milestone).data, status=201)

    @action(detail=True, methods=["post"], url_path="update-milestone")
    def update_milestone(self, request, pk=None):
        project = self.get_object()
        if not self._can_manage(project):
            raise PermissionDenied("Only the project owner or an administrator can update milestones.")
        try:
            milestone = project.milestones.get(pk=request.data.get("milestone_id"))
        except ResearchProjectMilestone.DoesNotExist:
            return Response({"detail":"Milestone not found."}, status=404)
        allowed = {"title", "description", "due_date", "status", "order"}
        changes = {k:v for k,v in request.data.items() if k in allowed}
        if "status" in changes and changes["status"] not in {c[0] for c in ResearchProjectMilestone.STATUS_CHOICES}:
            return Response({"detail":"Invalid milestone status."}, status=400)
        was_done = milestone.status == "done"
        for key, value in changes.items():
            setattr(milestone, key, value)
        milestone.save()
        if milestone.status == "done" and not was_done:
            from rsre_core.services import emit_research_event
            emit_research_event(
                project.owner, subject="RSRE — research milestone completed",
                message=f"Milestone completed: {milestone.title} in {project.title}. Your next project action is now ready.",
                event_key="incubator_milestone_completed", application_key="incubator",
                action_url=f"/incubator/{project.id}",
                evidence={"evidence_type":"milestone","title":f"Research milestone: {milestone.title}","description":f"Completed milestone in research project: {project.title}.","source_model":"journal.research_project_milestone","source_object_id":milestone.pk},
            )
            for member in project.members.filter(status="active").select_related("user"):
                if member.user_id != project.owner_id:
                    emit_research_event(member.user, subject="RSRE — project milestone completed", message=f"{milestone.title} was completed in {project.title}.", event_key="incubator_milestone_team_update", application_key="incubator", action_url=f"/incubator/{project.id}")
        return Response(ResearchProjectMilestoneSerializer(milestone).data)

    @action(detail=True, methods=["post"], url_path="advance")
    def advance(self, request, pk=None):
        project = self.get_object()
        if not self._can_manage(project): raise PermissionDenied("Only the project owner or an administrator can advance this project.")
        next_status = request.data.get("status")
        valid = {choice[0] for choice in ResearchProject.STATUS_CHOICES}
        if next_status not in valid:
            return Response({"detail": "Invalid project status."}, status=400)
        project.status = next_status; project.save(update_fields=["status", "updated_at"])
        from rsre_core.services import emit_research_event
        emit_research_event(
            project.owner, subject="RSRE — research project stage updated",
            message=f"{project.title} moved to {project.get_status_display()}. Review the next recommended action in your project cockpit.",
            event_key="incubator_stage_updated", application_key="incubator", action_url=f"/incubator/{project.id}",
        )
        return Response(ResearchProjectSerializer(project, context={"request": request}).data)



class ResearchSandboxWorkspaceViewSet(viewsets.ModelViewSet):
    serializer_class = ResearchSandboxWorkspaceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return ResearchSandboxWorkspace.objects.filter(owner=user).prefetch_related("notes", "datasets")

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    def perform_update(self, serializer):
        workspace = self.get_object()
        serializer.save()

    @action(detail=True, methods=["post"], url_path="add-note")
    def add_note(self, request, pk=None):
        workspace = self.get_object()
        payload = request.data.copy()
        payload.pop("author", None)
        serializer = ResearchSandboxNoteSerializer(data=payload)
        serializer.is_valid(raise_exception=True)
        note = ResearchSandboxNote.objects.create(workspace=workspace, author=request.user, **serializer.validated_data)
        return Response(ResearchSandboxNoteSerializer(note).data, status=201)

    @action(detail=True, methods=["post"], url_path="add-dataset")
    def add_dataset(self, request, pk=None):
        workspace = self.get_object()
        serializer = ResearchSandboxDatasetSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        dataset = ResearchSandboxDataset.objects.create(workspace=workspace, **serializer.validated_data)
        return Response(ResearchSandboxDatasetSerializer(dataset).data, status=201)

class ResearchDiscoveryView(APIView):
    """
    Unified scholarly discovery endpoint.

    Sources:
    - OpenAlex: broad scholarly metadata, OA and citation signals.
    - Crossref: DOI and publisher metadata.
    - RSJH: locally published student research.

    Query parameters:
      q       search phrase (required, >= 2 chars)
      rows    max external records per source (1-20)
      source  all|openalex|crossref|rsjh
      year    exact publication year
      oa      true|false (external OA flag)
    """
    permission_classes = [AllowAny]

    def get(self, request):
        query = (request.query_params.get("q") or "").strip()
        if len(query) < 2:
            return Response({
                "results": [],
                "local_results": [],
                "message": "Enter at least two characters to search scholarly literature."
            })

        try:
            rows = max(1, min(int(request.query_params.get("rows", "10") or 10), 20))
        except (TypeError, ValueError):
            rows = 10

        source_filter = (request.query_params.get("source") or "all").lower()
        if source_filter not in {"all", "openalex", "crossref", "rsjh"}:
            source_filter = "all"

        try:
            year_filter = int(request.query_params["year"]) if request.query_params.get("year") else None
        except (TypeError, ValueError):
            year_filter = None

        oa_param = (request.query_params.get("oa") or "").lower()
        oa_filter = True if oa_param == "true" else False if oa_param == "false" else None

        results = []
        source_status = {"OpenAlex": "not_requested", "Crossref": "not_requested", "RSJH": "not_requested"}

        def include_external(item):
            if year_filter and item.get("year") != year_filter:
                return False
            if oa_filter is not None and bool(item.get("open_access")) != oa_filter:
                return False
            return True

        # OpenAlex
        if source_filter in {"all", "openalex"}:
            source_status["OpenAlex"] = "ok"
            try:
                params = urlencode({
                    "search": query,
                    "per-page": rows,
                    "mailto": getattr(settings, "EMAIL_HOST_USER", "researchrwandahub@gmail.com")
                })
                req = Request(
                    "https://api.openalex.org/works?" + params,
                    headers={"User-Agent": "RSRE/1.1 research discovery"}
                )
                with urlopen(req, timeout=8) as response:
                    data = json.loads(response.read().decode("utf-8"))
                for item in data.get("results", []):
                    primary = item.get("primary_location") or {}
                    source = primary.get("source") or {}
                    record = {
                        "source": "OpenAlex",
                        "id": item.get("id"),
                        "title": item.get("title") or "Untitled work",
                        "authors": [
                            a.get("author", {}).get("display_name")
                            for a in item.get("authorships", [])
                            if a.get("author", {}).get("display_name")
                        ][:6],
                        "year": item.get("publication_year"),
                        "journal": source.get("display_name") if source else None,
                        "doi": item.get("doi"),
                        "url": item.get("doi") or item.get("id"),
                        "open_access": bool((item.get("open_access") or {}).get("is_oa")),
                        "citations": item.get("cited_by_count", 0),
                    }
                    if include_external(record):
                        results.append(record)
            except Exception:
                source_status["OpenAlex"] = "unavailable"

        # Crossref
        if source_filter in {"all", "crossref"}:
            source_status["Crossref"] = "ok"
            try:
                params = urlencode({
                    "query.bibliographic": query,
                    "rows": rows,
                    "mailto": getattr(settings, "EMAIL_HOST_USER", "researchrwandahub@gmail.com")
                })
                req = Request(
                    "https://api.crossref.org/works?" + params,
                    headers={"User-Agent": "RSRE/1.1 research discovery"}
                )
                with urlopen(req, timeout=8) as response:
                    data = json.loads(response.read().decode("utf-8"))
                seen_dois = {r.get("doi", "").lower() for r in results if r.get("doi")}
                for item in data.get("message", {}).get("items", []):
                    doi = item.get("DOI")
                    if doi and doi.lower() in seen_dois:
                        continue
                    titles = item.get("title") or []
                    dates = item.get("published-print") or item.get("published-online") or {}
                    parts = dates.get("date-parts", [[None]])
                    record = {
                        "source": "Crossref",
                        "id": doi or item.get("URL"),
                        "title": titles[0] if titles else "Untitled work",
                        "authors": [
                            f"{a.get('given', '')} {a.get('family', '')}".strip()
                            for a in item.get("author", [])
                        ][:6],
                        "year": parts[0][0] if parts and parts[0] else None,
                        "journal": (item.get("container-title") or [None])[0],
                        "doi": doi,
                        "url": item.get("URL") or (f"https://doi.org/{doi}" if doi else None),
                        "open_access": False,
                        "citations": item.get("is-referenced-by-count", 0),
                    }
                    if include_external(record):
                        results.append(record)
            except Exception:
                source_status["Crossref"] = "unavailable"

        # RSJH local research is always useful to Rwandan researchers and does
        # not depend on external services.
        local_results = []
        if source_filter in {"all", "rsjh"}:
            source_status["RSJH"] = "ok"
            try:
                local_qs = Article.objects.filter(
                    is_published=True
                ).filter(
                    Q(title__icontains=query) |
                    Q(abstract__icontains=query) |
                    Q(keywords__icontains=query) |
                    Q(specialty__icontains=query)
                ).select_related("author").order_by("-published_date")[:20]
                for article in local_qs:
                    local_results.append({
                        "source": "RSJH",
                        "id": article.id,
                        "title": article.title,
                        "authors": [
                            (
                                article.author.full_name or article.author.username
                                if article.author else "RSJH Author"
                            )
                        ],
                        "year": article.year,
                        "journal": "Rwanda Student Journal for Health",
                        "doi": article.doi,
                        "url": f"/articles/{article.id}",
                        "open_access": True,
                        "citations": 0,
                        "specialty": article.specialty,
                    })
            except Exception:
                source_status["RSJH"] = "unavailable"

        # Deduplicate external records by DOI, then title.
        unique = []
        seen = set()
        for record in results:
            key = ("doi", record["doi"].lower()) if record.get("doi") else (
                "title", re.sub(r"\W+", " ", (record.get("title") or "").lower()).strip()
            )
            if key in seen:
                continue
            seen.add(key)
            unique.append(record)

        return Response({
            "query": query,
            "count": len(unique),
            "results": unique[:30],
            "local_results": local_results,
            "sources": ["OpenAlex", "Crossref", "RSJH"],
            "source_status": source_status,
            "filters": {"source": source_filter, "year": year_filter, "oa": oa_filter},
        })


class ExternalOpportunityDiscoveryView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        keyword = (request.data.get("keyword") or "health").strip()
        try:
            req = Request("https://api.grants.gov/v1/api/search2", data=json.dumps({"keyword": keyword}).encode("utf-8"), headers={"Content-Type": "application/json", "User-Agent": "RSJH/1.0 opportunities"})
            with urlopen(req, timeout=10) as response:
                data = json.loads(response.read().decode("utf-8"))
            return Response({"source": "Grants.gov", "keyword": keyword, "results": data})
        except Exception as exc:
            return Response({"source": "Grants.gov", "keyword": keyword, "results": [], "detail": f"External opportunity source unavailable right now: {exc}"}, status=200)


class ResearchOpportunityViewSet(viewsets.ModelViewSet):
    serializer_class = ResearchOpportunitySerializer

    def get_permissions(self):
        if self.action in {"list", "retrieve"}:
            return [AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        # Expired opportunities disappear from the public feed without requiring manual cleanup.
        today = timezone.localdate()
        return ResearchOpportunity.objects.filter(active=True).filter(
            Q(deadline__isnull=True) | Q(deadline__gte=today)
        ).order_by("deadline", "-created_at")

    def _check_admin(self):
        if not is_administrator(self.request.user):
            raise PermissionDenied("Administrator access required.")

    def perform_create(self, serializer):
        self._check_admin()
        serializer.save(source_type="manual", source_name="RSRE Admin")

    def perform_update(self, serializer):
        self._check_admin()
        serializer.save()

    def perform_destroy(self, instance):
        self._check_admin()
        instance.delete()

    @action(detail=True, methods=["get"], permission_classes=[AllowAny], url_path="open")
    def open_opportunity(self, request, pk=None):
        opportunity = self.get_object()
        if not opportunity.url:
            return Response({"detail": "This opportunity does not have an external application page."}, status=status.HTTP_404_NOT_FOUND)
        return HttpResponseRedirect(opportunity.url)


class EditorialBoardViewSet(viewsets.ModelViewSet):
    serializer_class = EditorialBoardMemberSerializer

    def get_permissions(self):
        if self.action in {"list", "retrieve"}:
            return [AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        return EditorialBoardMember.objects.filter(active=True).select_related("user")

    def _check_admin(self):
        if not is_administrator(self.request.user):
            raise PermissionDenied("Administrator access required.")

    def perform_create(self, serializer):
        self._check_admin()
        serializer.save()

    def perform_update(self, serializer):
        self._check_admin()
        serializer.save()

    def perform_destroy(self, instance):
        self._check_admin()
        instance.delete()


class PartnerViewSet(viewsets.ModelViewSet):
    serializer_class = PartnerSerializer

    def get_queryset(self):
        if self.request.user.is_authenticated and is_administrator(self.request.user):
            return Partner.objects.all().order_by("name")
        return Partner.objects.filter(status="active").order_by("name")

    def get_permissions(self):
        if self.action in {"list", "retrieve"}:
            return [AllowAny()]
        return [permissions.IsAuthenticated()]

    def _check_admin(self):
        if not is_administrator(self.request.user):
            raise PermissionDenied("Administrator access required.")

    def perform_create(self, serializer):
        self._check_admin()
        serializer.save()

    def perform_update(self, serializer):
        self._check_admin()
        serializer.save()

    def perform_destroy(self, instance):
        self._check_admin()
        instance.delete()

    @action(detail=True, methods=["post"], url_path="remove-logo")
    def remove_logo(self, request, pk=None):
        self._check_admin()
        partner=self.get_object()
        if partner.logo:
            partner.logo.delete(save=False)
        partner.logo=None
        partner.save(update_fields=["logo"])
        return Response(PartnerSerializer(partner, context={"request": request}).data)


class FoundingMemberViewSet(viewsets.ModelViewSet):
    serializer_class = FoundingMemberSerializer

    def get_queryset(self):
        if self.request.user.is_authenticated and is_administrator(self.request.user):
            return FoundingMember.objects.all().order_by("display_order", "id")
        return FoundingMember.objects.filter(active=True).order_by("display_order", "id")

    def get_permissions(self):
        if self.action in {"list", "retrieve"}:
            return [AllowAny()]
        return [permissions.IsAuthenticated()]

    def _check_admin(self):
        if not is_administrator(self.request.user):
            raise PermissionDenied("Administrator access required.")

    def perform_create(self, serializer):
        self._check_admin()
        serializer.save()

    def perform_update(self, serializer):
        self._check_admin()
        serializer.save()

    def perform_destroy(self, instance):
        self._check_admin()
        instance.delete()


class ResearchPassportView(APIView):
    permission_classes = [IsAuthenticated]

    def _snapshot(self, user, passport):
        from academy.models import LearningRecord, LevelCertificate, ModuleCertificate, PathwayCertificate

        projects = ResearchProject.objects.filter(models.Q(owner=user) | models.Q(members__user=user)).distinct()
        published = Article.objects.filter(author=user, is_published=True)
        reviews = Review.objects.filter(reviewer=user)
        academy_records = LearningRecord.objects.filter(user=user, verified=True)
        certificates = list(ModuleCertificate.objects.filter(user=user, status="valid").select_related("module")) + list(LevelCertificate.objects.filter(user=user, status="valid").select_related("level")) + list(PathwayCertificate.objects.filter(user=user, status="valid").select_related("pathway"))
        milestones = ResearchProjectMilestone.objects.filter(project__in=projects, status="done").count()
        evidence = PassportEvidence.objects.filter(user=user, active=True).order_by("-evidence_date", "-created_at")[:50]

        completed_learning = academy_records.filter(event_type__in=["quiz_passed", "assignment_passed", "lab_passed", "course_completed", "certificate_issued"]).count()
        completed_courses = user.academy_course_enrollments.filter(status="completed").count()
        competency_count = len(passport.competencies or [])
        verified_count = evidence.filter(source_type__in=["automatic", "verified"]).count()
        score = min(100, (completed_learning * 3) + (completed_courses * 8) + (projects.filter(status__in=["analysis", "manuscript", "publication", "completed"]).count() * 10) + (published.count() * 15) + (reviews.count() * 5) + (milestones * 2) + (certificates.__len__() * 5) + (competency_count * 2))
        status = "emerging" if score < 35 else "developing" if score < 65 else "research-active" if score < 85 else "research-ready"
        verification_material = f"{user.pk}:{passport.verification_version}:{verified_count}:{published.count()}:{projects.count()}"
        verification_hash = hashlib.sha256(verification_material.encode()).hexdigest()[:16].upper()

        return {
            "profile": ResearchPassportSerializer(passport).data,
            "verification": {"status": status, "score": score, "code": f"RSRE-{user.pk}-{verification_hash}", "as_of": timezone.now()},
            "metrics": {
                "learning_records": academy_records.count(), "completed_learning": completed_learning, "completed_courses": completed_courses,
                "valid_certificates": len(certificates), "projects": projects.count(), "active_projects": projects.exclude(status__in=["completed", "paused"]).count(),
                "completed_milestones": milestones, "publications": published.count(), "peer_reviews": reviews.count(), "verified_evidence": verified_count,
            },
            "research_profile": {
                "discipline": getattr(user, "discipline", ""), "institution": getattr(user, "institution", ""),
                "university": getattr(user, "university", ""), "orcid": getattr(user, "orcid", ""),
                "academic_stage": getattr(user, "academic_stage", ""), "interests": passport.interests,
            },
            "recent_evidence": PassportEvidenceSerializer(evidence, many=True).data,
            "certificates": [
                {"certificate_id": c.certificate_id, "type": "module", "title": c.module.title, "issued_at": c.issued_at, "status": c.status}
                for c in certificates if isinstance(c, ModuleCertificate)
            ] + [
                {"certificate_id": c.certificate_id, "type": "level", "title": c.level.name, "issued_at": c.issued_at, "status": c.status}
                for c in certificates if isinstance(c, LevelCertificate)
            ] + [
                {"certificate_id": c.certificate_id, "type": "pathway", "title": c.pathway.name, "issued_at": c.issued_at, "status": c.status}
                for c in certificates if isinstance(c, PathwayCertificate)
            ],
            "pathway": [
                {"stage": "Learn", "done": completed_learning > 0, "detail": f"{completed_learning} verified learning records"},
                {"stage": "Build", "done": projects.exists(), "detail": f"{projects.count()} research projects"},
                {"stage": "Contribute", "done": reviews.exists() or milestones > 0, "detail": f"{reviews.count()} peer reviews · {milestones} completed milestones"},
                {"stage": "Publish", "done": published.exists(), "detail": f"{published.count()} published articles"},
                {"stage": "Impact", "done": published.exists() and (projects.filter(status="completed").exists() or reviews.exists()), "detail": "Evidence of sustained research contribution"},
            ],
        }

    def get(self, request):
        p, _ = ResearchPassport.objects.get_or_create(user=request.user)
        return Response(self._snapshot(request.user, p))

    def put(self, request):
        p, _ = ResearchPassport.objects.get_or_create(user=request.user)
        ser = ResearchPassportSerializer(p, data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        ser.save(verification_version=p.verification_version + 1)
        return Response(self._snapshot(request.user, p))

class PublicResearchPassportView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, username):
        from academy.models import LevelCertificate, ModuleCertificate, PathwayCertificate

        user = User.objects.filter(
            username=username,
            is_active=True,
        ).first()

        if not user:
            return Response(
                {"detail": "Researcher not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        passport = ResearchPassport.objects.filter(
            user=user,
            visibility="public",
        ).first()

        if not passport:
            return Response(
                {"detail": "This research passport is not publicly available."},
                status=status.HTTP_404_NOT_FOUND,
            )

        projects = ResearchProject.objects.filter(
            models.Q(owner=user)
            | models.Q(members__user=user)
        ).distinct()

        published = Article.objects.filter(
            author=user,
            is_published=True,
            status="published",
        )

        reviews = Review.objects.filter(reviewer=user)

        certificates = list(
            ModuleCertificate.objects.filter(
                user=user,
                status="valid",
            ).select_related("module")
        ) + list(
            LevelCertificate.objects.filter(
                user=user,
                status="valid",
            ).select_related("level")
        ) + list(
            PathwayCertificate.objects.filter(
                user=user,
                status="valid",
            ).select_related("pathway")
        )

        return Response(
            {
                "researcher": {
                    "id": user.id,
                    "username": user.username,
                    "full_name": user.get_full_name() or user.username,
                    "email": "",
                    "institution": getattr(user, "institution", ""),
                    "university": getattr(user, "university", ""),
                    "department": getattr(user, "department", ""),
                    "discipline": getattr(user, "discipline", ""),
                    "academic_stage": getattr(user, "academic_stage", ""),
                    "research_field": getattr(user, "research_field", ""),
                    "orcid": getattr(user, "orcid", ""),
                    "biography": getattr(user, "biography", ""),
                    "research_interests": getattr(
                        user,
                        "research_interests",
                        "",
                    ),
                    "profile_picture": (
                        user.profile_picture.url
                        if getattr(user, "profile_picture", None)
                        else None
                    ),
                },
                "passport": {
                    "headline": passport.headline,
                    "career_goal": passport.career_goal,
                    "skills": passport.skills,
                    "methods": passport.methods,
                    "interests": passport.interests,
                    "collaborations": passport.collaborations,
                    "competencies": passport.competencies or [],
                    "visibility": passport.visibility,
                    "updated_at": passport.updated_at,
                },
                "metrics": {
                    "projects": projects.count(),
                    "publications": published.count(),
                    "peer_reviews": reviews.count(),
                    "valid_certificates": len(certificates),
                },
                "publications": [
                    {
                        "id": article.id,
                        "title": article.title,
                        "abstract": article.abstract,
                        "discipline": article.discipline,
                        "specialty": article.specialty,
                        "published_date": article.published_date,
                        "year": article.year,
                        "volume": article.volume,
                        "issue": article.issue,
                        "publication_number": article.publication_number,
                        "doi": article.doi,
                        "citation_text": article.citation_text,
                    }
                    for article in published.order_by(
                        "-published_date",
                        "-id",
                    )[:10]
                ],
                "projects": [
                    {
                        "id": project.id,
                        "title": project.title,
                        "status": project.status,
                        "discipline": project.discipline,
                        "study_type": project.study_type,
                    }
                    for project in projects.order_by(
                        "-updated_at",
                    )[:10]
                ],
                "credentials": [
                    {
                        "certificate_id": certificate.certificate_id,
                        "type": "module",
                        "title": certificate.module.title,
                        "issued_at": certificate.issued_at,
                    }
                    for certificate in certificates
                    if isinstance(certificate, ModuleCertificate)
                ]
                + [
                    {
                        "certificate_id": certificate.certificate_id,
                        "type": "level",
                        "title": certificate.level.name,
                        "issued_at": certificate.issued_at,
                    }
                    for certificate in certificates
                    if isinstance(certificate, LevelCertificate)
                ]
                + [
                    {
                        "certificate_id": certificate.certificate_id,
                        "type": "pathway",
                        "title": certificate.pathway.name,
                        "issued_at": certificate.issued_at,
                    }
                    for certificate in certificates
                    if isinstance(certificate, PathwayCertificate)
                ],
            }
        )
class PublicResearchPassportView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, username):
        from academy.models import (
            ModuleCertificate,
            LevelCertificate,
            PathwayCertificate,
        )

        user = User.objects.filter(
            username=username,
            is_active=True,
        ).first()

        if not user:
            return Response(
                {"detail": "Researcher not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        passport = ResearchPassport.objects.filter(
            user=user,
            visibility="public",
        ).first()

        if not passport:
            return Response(
                {
                    "detail": (
                        "This research passport is not publicly available."
                    )
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        projects = ResearchProject.objects.filter(
            models.Q(owner=user)
            | models.Q(members__user=user)
        ).distinct()

        publications = Article.objects.filter(
            author=user,
            status="published",
            is_published=True,
        ).order_by("-published_date", "-id")

        reviews = Review.objects.filter(
            reviewer=user
        )

        module_certificates = list(
            ModuleCertificate.objects.filter(
                user=user,
                status="valid",
            ).select_related("module")
        )

        level_certificates = list(
            LevelCertificate.objects.filter(
                user=user,
                status="valid",
            ).select_related("level")
        )

        pathway_certificates = list(
            PathwayCertificate.objects.filter(
                user=user,
                status="valid",
            ).select_related("pathway")
        )

        certificates = (
            [
                {
                    "certificate_id": certificate.certificate_id,
                    "type": "module",
                    "title": certificate.module.title,
                    "issued_at": certificate.issued_at,
                }
                for certificate in module_certificates
            ]
            + [
                {
                    "certificate_id": certificate.certificate_id,
                    "type": "level",
                    "title": certificate.level.name,
                    "issued_at": certificate.issued_at,
                }
                for certificate in level_certificates
            ]
            + [
                {
                    "certificate_id": certificate.certificate_id,
                    "type": "pathway",
                    "title": certificate.pathway.name,
                    "issued_at": certificate.issued_at,
                }
                for certificate in pathway_certificates
            ]
        )

        profile_picture = None

        try:
            if getattr(user, "profile_picture", None):
                profile_picture = request.build_absolute_uri(
                    user.profile_picture.url
                )
        except Exception:
            profile_picture = None

        return Response(
            {
                "researcher": {
                    "id": user.id,
                    "username": user.username,
                    "full_name": (
                        user.get_full_name()
                        or user.username
                    ),
                    "institution": getattr(
                        user, "institution", ""
                    ),
                    "university": getattr(
                        user, "university", ""
                    ),
                    "department": getattr(
                        user, "department", ""
                    ),
                    "discipline": getattr(
                        user, "discipline", ""
                    ),
                    "academic_stage": getattr(
                        user, "academic_stage", ""
                    ),
                    "research_field": getattr(
                        user, "research_field", ""
                    ),
                    "orcid": getattr(
                        user, "orcid", ""
                    ),
                    "biography": getattr(
                        user, "biography", ""
                    ),
                    "research_interests": getattr(
                        user,
                        "research_interests",
                        "",
                    ),
                    "profile_picture": profile_picture,
                },
                "passport": {
                    "headline": passport.headline,
                    "career_goal": passport.career_goal,
                    "skills": passport.skills,
                    "methods": passport.methods,
                    "interests": passport.interests,
                    "collaborations": passport.collaborations,
                    "competencies": (
                        passport.competencies or []
                    ),
                    "visibility": passport.visibility,
                    "updated_at": passport.updated_at,
                },
                "metrics": {
                    "projects": projects.count(),
                    "publications": publications.count(),
                    "peer_reviews": reviews.count(),
                    "valid_certificates": len(
                        certificates
                    ),
                },
                "publications": [
                    {
                        "id": article.id,
                        "title": article.title,
                        "abstract": article.abstract,
                        "discipline": article.discipline,
                        "specialty": article.specialty,
                        "published_date": article.published_date,
                        "year": article.year,
                        "volume": article.volume,
                        "issue": article.issue,
                        "publication_number": (
                            article.publication_number
                        ),
                        "doi": article.doi,
                        "citation_text": (
                            article.citation_text
                        ),
                    }
                    for article in publications[:10]
                ],
                "projects": [
                    {
                        "id": project.id,
                        "title": project.title,
                        "status": project.status,
                        "discipline": project.discipline,
                        "study_type": project.study_type,
                    }
                    for project in projects.order_by(
                        "-updated_at"
                    )[:10]
                ],
                "credentials": certificates,
            }
        )
class PassportEvidenceView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(PassportEvidenceSerializer(PassportEvidence.objects.filter(user=request.user, active=True), many=True).data)

    def post(self, request):
        data = request.data.copy(); data.pop("source_type", None); data.pop("verification_note", None)
        serializer = PassportEvidenceSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        obj = serializer.save(user=request.user, source_type="manual")
        return Response(PassportEvidenceSerializer(obj).data, status=status.HTTP_201_CREATED)


class PassportEvidenceDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        obj = PassportEvidence.objects.filter(pk=pk, user=request.user).first()
        if not obj:
            return Response({"detail": "Evidence not found."}, status=status.HTTP_404_NOT_FOUND)
        obj.active = False; obj.save(update_fields=["active", "updated_at"])
        return Response(status=status.HTTP_204_NO_CONTENT)



class StudentGiftView(APIView):
    """Sponsor-side gift request + student-side redemption. Students never pay through this flow."""
    permission_classes = [AllowAny]

    def post(self, request):
        action = (request.data.get("action") or "request").strip().lower()
        if action == "request":
            recipient_email = (request.data.get("recipient_email") or "").strip().lower()
            if not recipient_email:
                return Response({"detail": "Recipient email is required."}, status=400)
            amount = request.data.get("amount") or 0
            try:
                amount = float(amount)
            except (TypeError, ValueError):
                return Response({"detail": "Amount must be numeric."}, status=400)
            if amount < 0:
                return Response({"detail": "Amount cannot be negative."}, status=400)
            purpose = (request.data.get("purpose") or "general").strip().lower()
            if purpose == "journal_support":
                return Response({"detail": "RSJH is free. Sponsorship cannot be used to buy publication or editorial outcomes."}, status=400)
            gift = StudentGift.objects.create(
                sponsor_name=(request.data.get("sponsor_name") or "").strip(),
                sponsor_email=(request.data.get("sponsor_email") or "").strip().lower(),
                recipient_email=recipient_email,
                recipient_name=(request.data.get("recipient_name") or "").strip(),
                purpose=purpose,
                amount=amount,
                currency=request.data.get("currency") or "RWF",
                payment_method=request.data.get("payment_method") or "other",
                message=(request.data.get("message") or "").strip(),
            )
            return Response({
                "id": gift.id,
                "status": gift.status,
                "message": "Gift request recorded. The recipient is not asked to pay. A gift code is sent only after the sponsor payment is confirmed."
            }, status=201)

        if action == "redeem":
            if not request.user.is_authenticated:
                return Response({"detail": "Sign in to redeem a gift code."}, status=401)
            code = (request.data.get("gift_code") or "").strip().upper()
            gift = StudentGift.objects.filter(gift_code=code).first()
            if not gift:
                return Response({"detail": "Gift code not found."}, status=404)
            if gift.status not in {"sent", "paid"}:
                return Response({"detail": "This gift is not available for redemption."}, status=400)
            if gift.expires_at and gift.expires_at <= timezone.now():
                gift.status = "expired"; gift.save(update_fields=["status", "updated_at"])
                return Response({"detail": "This gift code has expired."}, status=400)
            if gift.redeemed_by_id and gift.redeemed_by_id != request.user.id:
                return Response({"detail": "This gift has already been redeemed."}, status=400)
            gift.redeemed_by = request.user
            gift.redeemed_at = timezone.now()
            gift.status = "redeemed"
            gift.save(update_fields=["redeemed_by", "redeemed_at", "status", "updated_at"])
            return Response({"message": "Gift redeemed successfully.", "purpose": gift.get_purpose_display(), "amount": str(gift.amount), "currency": gift.currency})

        return Response({"detail": "Unsupported gift action."}, status=400)


class AdminGiftPaymentConfirmView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        if getattr(request.user, "role", None) != "administrator" and not request.user.is_staff:
            raise PermissionDenied("Administrator access required.")
        gift = StudentGift.objects.get(pk=pk)
        if gift.status in {"redeemed", "cancelled", "expired"}:
            return Response({"detail": "Gift cannot be confirmed in its current state."}, status=400)
        gift.status = "paid"
        gift.payment_reference = (request.data.get("payment_reference") or gift.payment_reference).strip()
        gift.gift_code = gift.gift_code or f"RSG-{secrets.token_hex(5).upper()}"
        gift.save(update_fields=["status", "payment_reference", "gift_code", "updated_at"])
        sent = send_student_gift_email(gift)
        if sent:
            gift.status = "sent"
            gift.sent_at = timezone.now()
            gift.save(update_fields=["status", "sent_at", "updated_at"])
        return Response({"status": gift.status, "gift_code": gift.gift_code, "email_sent": sent})
