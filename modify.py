from pathlib import Path
root=Path('/mnt/data/rsjh_work/v25')

# models
p=root/'backend/journal/models.py'
s=p.read_text()
needle='class ResearchPassport(models.Model):\n    user=models.OneToOneField(User,related_name="research_passport",on_delete=models.CASCADE); skills=models.TextField(blank=True); methods=models.TextField(blank=True); interests=models.TextField(blank=True); collaborations=models.TextField(blank=True); updated_at=models.DateTimeField(auto_now=True)\n'
insert='''class ResearchPassport(models.Model):\n    user=models.OneToOneField(User,related_name="research_passport",on_delete=models.CASCADE); skills=models.TextField(blank=True); methods=models.TextField(blank=True); interests=models.TextField(blank=True); collaborations=models.TextField(blank=True); updated_at=models.DateTimeField(auto_now=True)\n\n\nclass FoundingMember(models.Model):\n    name=models.CharField(max_length=255)\n    role=models.CharField(max_length=255)\n    biography=models.TextField(blank=True)\n    photo=models.ImageField(upload_to="founders/", blank=True, null=True)\n    display_order=models.PositiveIntegerField(default=1)\n    active=models.BooleanField(default=True)\n    created_at=models.DateTimeField(auto_now_add=True)\n    updated_at=models.DateTimeField(auto_now=True)\n\n    class Meta:\n        ordering=["display_order", "id"]\n\n    def __str__(self):\n        return self.name\n'''
if needle not in s: raise SystemExit('models needle missing')
p.write_text(s.replace(needle,insert))

# serializers imports and partner + founding
p=root/'backend/journal/serializers.py'; s=p.read_text()
s=s.replace('    Partner,\n)', '    Partner, FoundingMember,\n)')
old='''class PartnerSerializer(serializers.ModelSerializer):\n    class Meta:\n        model = Partner\n        fields = "__all__"\n        read_only_fields = ["id", "created_at"]\n'''
new='''class PartnerSerializer(serializers.ModelSerializer):\n    class Meta:\n        model = Partner\n        fields = "__all__"\n        read_only_fields = ["id", "created_at"]\n\n    def validate_logo(self, value):\n        if value and value.size > 5 * 1024 * 1024:\n            raise serializers.ValidationError("Partner logo must be 5 MB or smaller.")\n        return value\n\n\nclass FoundingMemberSerializer(serializers.ModelSerializer):\n    class Meta:\n        model = FoundingMember\n        fields = "__all__"\n        read_only_fields = ["id", "created_at", "updated_at"]\n\n    def validate_photo(self, value):\n        if value and value.size > 5 * 1024 * 1024:\n            raise serializers.ValidationError("Founder photo must be 5 MB or smaller.")\n        return value\n'''
if old not in s: raise SystemExit('serializer needle missing')
p.write_text(s.replace(old,new))

# views
p=root/'backend/journal/views.py'; s=p.read_text()
s=s.replace('AIUsageLog, EmailVerificationToken, ResearchIdea, ResearchOpportunity, EditorialBoardMember, ResearchPassport, CoAuthorContribution, Partner,', 'AIUsageLog, EmailVerificationToken, ResearchIdea, ResearchOpportunity, EditorialBoardMember, ResearchPassport, CoAuthorContribution, Partner, FoundingMember,')
s=s.replace('    PartnerSerializer,\n)', '    PartnerSerializer, FoundingMemberSerializer,\n)')
old='''class PartnerViewSet(viewsets.ModelViewSet):\n    queryset = Partner.objects.filter(status="active").order_by("name")\n    serializer_class = PartnerSerializer\n\n    def get_permissions(self):\n        if self.action in {"list", "retrieve"}:\n            return [AllowAny()]\n        return [permissions.IsAuthenticated()]\n\n    def _check_admin(self):\n        if not is_administrator(self.request.user):\n            raise PermissionDenied("Administrator access required.")\n\n    def perform_create(self, serializer):\n        self._check_admin()\n        serializer.save()\n\n    def perform_update(self, serializer):\n        self._check_admin()\n        serializer.save()\n\n    def perform_destroy(self, instance):\n        self._check_admin()\n        instance.delete()\n'''
new='''class PartnerViewSet(viewsets.ModelViewSet):\n    serializer_class = PartnerSerializer\n\n    def get_queryset(self):\n        if self.request.user.is_authenticated and is_administrator(self.request.user):\n            return Partner.objects.all().order_by("name")\n        return Partner.objects.filter(status="active").order_by("name")\n\n    def get_permissions(self):\n        if self.action in {"list", "retrieve"}:\n            return [AllowAny()]\n        return [permissions.IsAuthenticated()]\n\n    def _check_admin(self):\n        if not is_administrator(self.request.user):\n            raise PermissionDenied("Administrator access required.")\n\n    def perform_create(self, serializer):\n        self._check_admin()\n        serializer.save()\n\n    def perform_update(self, serializer):\n        self._check_admin()\n        serializer.save()\n\n    def perform_destroy(self, instance):\n        self._check_admin()\n        instance.delete()\n\n    @action(detail=True, methods=["post"], url_path="remove-logo")\n    def remove_logo(self, request, pk=None):\n        self._check_admin()\n        partner=self.get_object()\n        if partner.logo:\n            partner.logo.delete(save=False)\n        partner.logo=None\n        partner.save(update_fields=["logo"])\n        return Response(PartnerSerializer(partner, context={"request": request}).data)\n\n\nclass FoundingMemberViewSet(viewsets.ModelViewSet):\n    serializer_class = FoundingMemberSerializer\n\n    def get_queryset(self):\n        if self.request.user.is_authenticated and is_administrator(self.request.user):\n            return FoundingMember.objects.all().order_by("display_order", "id")\n        return FoundingMember.objects.filter(active=True).order_by("display_order", "id")\n\n    def get_permissions(self):\n        if self.action in {"list", "retrieve"}:\n            return [AllowAny()]\n        return [permissions.IsAuthenticated()]\n\n    def _check_admin(self):\n        if not is_administrator(self.request.user):\n            raise PermissionDenied("Administrator access required.")\n\n    def perform_create(self, serializer):\n        self._check_admin()\n        serializer.save()\n\n    def perform_update(self, serializer):\n        self._check_admin()\n        serializer.save()\n\n    def perform_destroy(self, instance):\n        self._check_admin()\n        instance.delete()\n'''
if old not in s: raise SystemExit('views partner block missing')
p.write_text(s.replace(old,new))

# urls
p=root/'backend/journal/urls.py'; s=p.read_text()
s=s.replace('ResearchPassportView, ResearchIdeaViewSet, ResearchOpportunityViewSet, EditorialBoardViewSet,', 'ResearchPassportView, ResearchIdeaViewSet, ResearchOpportunityViewSet, EditorialBoardViewSet, PartnerViewSet, FoundingMemberViewSet,') if 'PartnerViewSet' not in s.split('from .views import',1)[1].split(')',1)[0] else s
# Existing import list may already not include PartnerViewSet because it was previously registered but missing import - fix explicitly.
if '    PartnerViewSet,' not in s:
    marker='    RegisterView,\n'
    s=s.replace(marker, marker+'    PartnerViewSet,\n    FoundingMemberViewSet,\n')
# remove duplicate registration if any and append cleanly
s=s.replace('router.register("partners",PartnerViewSet,basename="partners")', 'router.register("partners",PartnerViewSet,basename="partners")\nrouter.register("founding-members",FoundingMemberViewSet,basename="founding-members")')
p.write_text(s)

# admin
p=root/'backend/journal/admin.py'; s=p.read_text()
s=s.replace('from .models import User, Article, Review, ReviewAssignment, ArticleRevision, EditorialDecision, AIUsageLog', 'from .models import User, Article, Review, ReviewAssignment, ArticleRevision, EditorialDecision, AIUsageLog, Partner, FoundingMember')
s += '\nadmin.site.register(Partner)\nadmin.site.register(FoundingMember)\n'
p.write_text(s)

# migration
mig=root/'backend/journal/migrations/0013_founding_member.py'
mig.write_text('''from django.db import migrations, models\n\n\nclass Migration(migrations.Migration):\n    dependencies = [("journal", "0012_v25_research_ecosystem")]\n\n    operations = [\n        migrations.CreateModel(\n            name="FoundingMember",\n            fields=[\n                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),\n                ("name", models.CharField(max_length=255)),\n                ("role", models.CharField(max_length=255)),\n                ("biography", models.TextField(blank=True)),\n                ("photo", models.ImageField(blank=True, null=True, upload_to="founders/")),\n                ("display_order", models.PositiveIntegerField(default=1)),\n                ("active", models.BooleanField(default=True)),\n                ("created_at", models.DateTimeField(auto_now_add=True)),\n                ("updated_at", models.DateTimeField(auto_now=True)),\n            ],\n            options={"ordering": ["display_order", "id"]},\n        ),\n    ]\n''')
