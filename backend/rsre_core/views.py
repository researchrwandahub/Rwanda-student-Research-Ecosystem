from django.db.models import Count, Q
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import EthicsAssessment, EthicsResource, Application, PlatformSetting, ContentItem, FeatureComponent, SupportTicket, SupportMessage, NotificationPreference, NotificationOutbox, AdminAuditEvent, WhatsAppCommunity, WhatsAppCommunityMember, CollaborationRequest
from .serializers import ApplicationSerializer, PlatformSettingSerializer, ContentItemSerializer, FeatureComponentSerializer, SupportTicketSerializer, NotificationPreferenceSerializer, WhatsAppCommunitySerializer, WhatsAppCommunityMemberSerializer, EthicsAssessmentSerializer, EthicsResourceSerializer, CollaborationRequestSerializer
from .permissions import IsRSREAdmin
from .services import send_email_notification, send_whatsapp_notification, dispatch_notification, create_whatsapp_group, record_passport_evidence

DEFAULT_APPLICATIONS = [
    ("academy", "Research Academy", "Learn and demonstrate health-research competencies.", "/research-academy", "🧠", 10),
    ("discovery", "Research Discovery", "Find health research, authors, institutions and topics.", "/research-discovery", "🔎", 20),
    ("opportunities", "Research Opportunities", "Find grants, scholarships, fellowships, internships and calls.", "/research-opportunities", "🎯", 30),
    ("incubator", "Research Incubator", "Turn a research idea into a structured project and team.", "/research-incubator", "💡", 40),
    ("passport", "Research Passport", "Maintain a verified record of research learning and achievements.", "/research-passport", "🪪", 50),
    ("analytics", "Research Analytics", "Explore the Rwanda health-research landscape and platform activity.", "/research-analytics", "📊", 60),
    ("journal", "RSJH Journal", "Student-centered health-sciences publication and peer review.", "/articles", "📖", 70),
    ("sandbox", "Research Sandbox", "Practice with public, synthetic and governed research data.", "/research-sandbox", "🧪", 80),
    ("ai", "MedTech AI", "Responsible AI assistance for research work under human oversight.", "/medtech-ai", "🤖", 90),
    ("ethics", "Ethics & Compliance", "Research integrity, ethics, privacy and governance guidance.", "/ethics-compliance", "🛡️", 100),
    ("collaboration", "Collaboration Network", "Find people, teams, mentors and research collaborators.", "/collaboration", "🤝", 110),
]

def ensure_application_registry():
    for key, name, description, route, icon, order in DEFAULT_APPLICATIONS:
        Application.objects.update_or_create(
            key=key,
            defaults={
                "name": name,
                "description": description,
                "route": route,
                "icon": icon,
                "nav_label": name,
                "order": order,
                "active": True,
                "public": True,
            },
        )



class RSREConfigView(APIView):
    permission_classes=[AllowAny]
    def get(self, request):
        ensure_application_registry()
        setting=PlatformSetting.objects.get_or_create(singleton_key=1)[0]
        apps=ApplicationSerializer(Application.objects.filter(active=True), many=True).data
        return Response({'platform': PlatformSettingSerializer(setting).data, 'applications': apps})


class RSREDashboardView(APIView):
    permission_classes=[IsAuthenticated]

    def get(self, request):
        from django.apps import apps
        journal_notifications = []
        unread = 0
        try:
            Notification = apps.get_model('journal', 'Notification')
            rows = Notification.objects.filter(user=request.user).order_by('-created_at')[:8]
            journal_notifications = [
                {'id': n.id, 'title': n.title, 'message': n.message, 'is_read': n.is_read, 'created_at': n.created_at}
                for n in rows
            ]
            unread = Notification.objects.filter(user=request.user, is_read=False).count()
        except Exception:
            pass

        def count_owned(model_name, relation=None):
            try:
                model = apps.get_model('journal', model_name)
                qs = model.objects.all()
                if relation and any(f.name == relation for f in model._meta.fields):
                    qs = qs.filter(**{relation: request.user})
                return qs.count()
            except Exception:
                return 0

        data={
            'user': {'id': request.user.id, 'name': request.user.get_full_name() or request.user.username, 'email': request.user.email, 'role': getattr(request.user,'role','reader')},
            'applications': ApplicationSerializer(Application.objects.filter(active=True), many=True).data,
            'notifications_unread': unread,
            'notifications': journal_notifications,
            'support_open': SupportTicket.objects.filter(user=request.user, status__in=['new','in_progress','waiting']).count(),
            'activity': {
                'research_projects': count_owned('ResearchProject', 'owner'),
                'opportunities_active': _count_model_filtered('journal', 'ResearchOpportunity', active=True),
                'passport_evidence': count_owned('PassportEvidence', 'user'),
                'articles': count_owned('Article', 'author'),
            },
            'next_actions': [],
        }
        # Cross-pillar momentum: show a small number of useful next actions without duplicating pillar UIs.
        try:
            from journal.models import ResearchProject, Article, ResearchProjectMilestone
            projects = ResearchProject.objects.filter(Q(owner=request.user) | Q(members__user=request.user, members__status='active')).distinct()
            blocked = projects.filter(status='paused').count()
            if projects.filter(status__in=['analysis','manuscript','publication']).exists():
                data['next_actions'].append({'key':'project-next-step','label':'Continue an active research project','href':'/incubator'})
            elif projects.filter(status='idea').exists():
                data['next_actions'].append({'key':'project-build','label':'Develop your research idea','href':'/incubator'})
            if not blocked and not projects.exists():
                data['next_actions'].append({'key':'start-research','label':'Start a research project','href':'/incubator'})
            elif blocked:
                data['next_actions'].append({'key':'unblock-project','label':'Review a paused research project','href':'/incubator'})
            if Article.objects.filter(author=request.user, status='revision').exists():
                data['next_actions'].append({'key':'journal-revision','label':'Review your RSJH revision','href':'/submit'})
            if not data['next_actions'] and data['activity']['opportunities_active']:
                data['next_actions'].append({'key':'opportunity','label':'Explore research opportunities','href':'/opportunities'})
        except Exception:
            pass

        return Response(data)


def _count_model_filtered(app_label, model_name, **filters):
    try:
        from django.apps import apps
        return apps.get_model(app_label, model_name).objects.filter(**filters).count()
    except Exception:
        return 0


class SupportTicketListCreateView(APIView):
    permission_classes=[IsAuthenticated]
    def get(self, request):
        return Response(SupportTicketSerializer(SupportTicket.objects.filter(user=request.user), many=True).data)
    def post(self, request):
        s=SupportTicketSerializer(data=request.data); s.is_valid(raise_exception=True); ticket=s.save(user=request.user)
        return Response(SupportTicketSerializer(ticket).data, status=status.HTTP_201_CREATED)


class SupportTicketDetailView(APIView):
    permission_classes=[IsAuthenticated]
    def post(self, request, pk):
        try: ticket=SupportTicket.objects.get(pk=pk)
        except SupportTicket.DoesNotExist: return Response({'detail':'Not found'}, status=404)
        if ticket.user_id != request.user.id and not IsRSREAdmin().has_permission(request,self): return Response({'detail':'Forbidden'}, status=403)
        msg=request.data.get('message','').strip()
        if not msg: return Response({'detail':'Message is required'}, status=400)
        SupportMessage.objects.create(ticket=ticket, author=request.user, message=msg)
        if ticket.user_id == request.user.id and ticket.status == 'resolved': ticket.status='in_progress'; ticket.save(update_fields=['status','updated_at'])
        return Response(SupportTicketSerializer(ticket).data)


class NotificationPreferenceView(APIView):
    permission_classes=[IsAuthenticated]
    def get(self, request):
        obj=NotificationPreference.objects.get_or_create(user=request.user)[0]
        return Response(NotificationPreferenceSerializer(obj).data)
    def put(self, request):
        obj=NotificationPreference.objects.get_or_create(user=request.user)[0]
        s=NotificationPreferenceSerializer(obj, data=request.data, partial=True); s.is_valid(raise_exception=True); s.save(); return Response(s.data)


class AdminDashboardView(APIView):
    permission_classes=[IsRSREAdmin]
    def get(self, request):
        ensure_application_registry()
        return Response({
            'users': request.user.__class__.objects.count(),
            'applications': Application.objects.count(),
            'active_applications': Application.objects.filter(active=True).count(),
            'support_new': SupportTicket.objects.filter(status='new').count(),
            'support_open': SupportTicket.objects.filter(status__in=['new','in_progress','waiting']).count(),
            'notifications_queued': NotificationOutbox.objects.filter(status='queued').count(),
            'notifications_failed': NotificationOutbox.objects.filter(status='failed').count(),
            'notifications_sent_today': NotificationOutbox.objects.filter(status='sent', sent_at__date=__import__('django').utils.timezone.localdate()).count(),
            'content_items': ContentItem.objects.count(),
            'academy_modules': _count_model('academy','Module'),
            'journal_articles': _count_model('journal','Article'),
            'feature_components': FeatureComponent.objects.filter(enabled=True).count(),
            'feature_components_total': FeatureComponent.objects.count(),
            'whatsapp_communities': WhatsAppCommunity.objects.filter(active=True).count(),
            'whatsapp_members': WhatsAppCommunityMember.objects.filter(status='joined').count(),
            'audit_events': AdminAuditEvent.objects.count(),
        })


class AdminAuditView(APIView):
    permission_classes=[IsRSREAdmin]
    def get(self, request):
        rows=AdminAuditEvent.objects.select_related('actor').all()[:100]
        return Response([
            {'id': r.id, 'actor': r.actor.get_full_name() if r.actor else 'System', 'action': r.action, 'target_type': r.target_type, 'target_id': r.target_id, 'metadata': r.metadata, 'created_at': r.created_at}
            for r in rows
        ])


class AdminNotificationsView(APIView):
    permission_classes=[IsRSREAdmin]
    def get(self, request):
        rows=NotificationOutbox.objects.select_related('user').all()[:100]
        return Response([
            {'id': r.id, 'user': (r.user.get_full_name() or r.user.username) if r.user else 'System', 'channel': r.channel, 'subject': r.subject, 'status': r.status, 'event_key': r.event_key, 'created_at': r.created_at, 'error_message': r.error_message}
            for r in rows
        ])


def _count_model(app_label, model_name):
    try:
        from django.apps import apps
        return apps.get_model(app_label, model_name).objects.count()
    except Exception:
        return 0


class AdminApplicationsView(APIView):
    permission_classes=[IsRSREAdmin]
    def get(self, request):
        ensure_application_registry()
        return Response(ApplicationSerializer(Application.objects.all(), many=True).data)
    def post(self, request):
        s=ApplicationSerializer(data=request.data); s.is_valid(raise_exception=True); obj=s.save(); return Response(s.data, status=201)


class AdminApplicationDetailView(APIView):
    permission_classes=[IsRSREAdmin]
    def put(self, request, pk):
        obj=Application.objects.get(pk=pk); s=ApplicationSerializer(obj,data=request.data,partial=True); s.is_valid(raise_exception=True); s.save(); return Response(s.data)
    def delete(self, request, pk):
        obj=Application.objects.get(pk=pk); obj.delete(); return Response(status=204)


class AdminSettingsView(APIView):
    permission_classes=[IsRSREAdmin]
    def get(self, request): return Response(PlatformSettingSerializer(PlatformSetting.objects.get_or_create(singleton_key=1)[0]).data)
    def put(self, request):
        obj=PlatformSetting.objects.get_or_create(singleton_key=1)[0]; s=PlatformSettingSerializer(obj,data=request.data,partial=True); s.is_valid(raise_exception=True); s.save(); AdminAuditEvent.objects.create(actor=request.user,action='update_platform_settings'); return Response(s.data)


class AdminContentView(APIView):
    permission_classes=[IsRSREAdmin]
    def get(self, request): return Response(ContentItemSerializer(ContentItem.objects.select_related('application').all(), many=True).data)
    def post(self, request):
        s=ContentItemSerializer(data=request.data); s.is_valid(raise_exception=True); obj=s.save(); AdminAuditEvent.objects.create(actor=request.user,action='create_content',target_type='ContentItem',target_id=str(obj.id)); return Response(s.data,status=201)


class AdminContentDetailView(APIView):
    permission_classes=[IsRSREAdmin]
    def put(self, request, pk): obj=ContentItem.objects.get(pk=pk); s=ContentItemSerializer(obj,data=request.data,partial=True); s.is_valid(raise_exception=True); s.save(); AdminAuditEvent.objects.create(actor=request.user,action='update_content',target_type='ContentItem',target_id=str(pk)); return Response(s.data)
    def delete(self, request, pk): ContentItem.objects.get(pk=pk).delete(); AdminAuditEvent.objects.create(actor=request.user,action='delete_content',target_type='ContentItem',target_id=str(pk)); return Response(status=204)


class AdminSupportView(APIView):
    permission_classes=[IsRSREAdmin]
    def get(self, request): return Response(SupportTicketSerializer(SupportTicket.objects.all(), many=True).data)
    def put(self, request, pk):
        obj=SupportTicket.objects.get(pk=pk); allowed={'status','priority','assigned_to','category'}; data={k:v for k,v in request.data.items() if k in allowed};
        s=SupportTicketSerializer(obj,data=data,partial=True); s.is_valid(raise_exception=True); s.save(); AdminAuditEvent.objects.create(actor=request.user,action='update_support_ticket',target_type='SupportTicket',target_id=str(pk)); return Response(s.data)


class AdminReplySupportView(APIView):
    permission_classes=[IsRSREAdmin]
    def post(self, request, pk):
        obj=SupportTicket.objects.get(pk=pk); msg=request.data.get('message','').strip();
        if not msg: return Response({'detail':'Message is required'},status=400)
        SupportMessage.objects.create(ticket=obj,author=request.user,message=msg)
        if obj.user_id:
            dispatch_notification(obj.user, f'RSRE Support — {obj.subject}', msg, event_key='support_reply', application_key=obj.application.key if obj.application else 'support', action_url=f'/support/{obj.id}')
        obj.status='waiting'; obj.save(update_fields=['status','updated_at']); return Response(SupportTicketSerializer(obj).data)


class AdminFeatureComponentView(APIView):
    permission_classes=[IsRSREAdmin]
    def get(self, request):
        return Response(FeatureComponentSerializer(FeatureComponent.objects.select_related("application").all(), many=True).data)
    def post(self, request):
        s=FeatureComponentSerializer(data=request.data); s.is_valid(raise_exception=True); obj=s.save(); AdminAuditEvent.objects.create(actor=request.user,action='create_feature_component',target_type='FeatureComponent',target_id=str(obj.id)); return Response(FeatureComponentSerializer(obj).data,status=201)

class AdminFeatureComponentDetailView(APIView):
    permission_classes=[IsRSREAdmin]
    def put(self, request, pk):
        obj=FeatureComponent.objects.get(pk=pk); s=FeatureComponentSerializer(obj,data=request.data,partial=True); s.is_valid(raise_exception=True); s.save(); AdminAuditEvent.objects.create(actor=request.user,action='update_feature_component',target_type='FeatureComponent',target_id=str(pk)); return Response(s.data)
    def delete(self, request, pk):
        FeatureComponent.objects.get(pk=pk).delete(); AdminAuditEvent.objects.create(actor=request.user,action='delete_feature_component',target_type='FeatureComponent',target_id=str(pk)); return Response(status=204)

class WhatsAppCommunityView(APIView):
    permission_classes=[IsAuthenticated]
    def get(self, request):
        qs=WhatsAppCommunity.objects.filter(active=True)
        return Response(WhatsAppCommunitySerializer(qs,many=True).data)
    def post(self, request):
        obj=WhatsAppCommunity.objects.create(owner=request.user, application_id=request.data.get('application'), name=request.data.get('name','RSRE Research Group'), description=request.data.get('description',''), purpose=request.data.get('purpose','learning'), invite_url=request.data.get('invite_url',''))
        WhatsAppCommunityMember.objects.get_or_create(community=obj,user=request.user,defaults={'status':'joined'})
        return Response(WhatsAppCommunitySerializer(obj).data,status=201)

class WhatsAppCommunityDetailView(APIView):
    permission_classes=[IsAuthenticated]
    def post(self, request, pk):
        community=WhatsAppCommunity.objects.get(pk=pk)
        if request.data.get('action') == 'join':
            membership,_=WhatsAppCommunityMember.objects.update_or_create(community=community,user=request.user,defaults={'status':'joined'})
            return Response({'community': WhatsAppCommunitySerializer(community).data,'invite_url':community.invite_url,'membership':WhatsAppCommunityMemberSerializer(membership).data})
        if request.data.get('action') == 'broadcast':
            msg=request.data.get('message','').strip()
            if not msg: return Response({'detail':'Message is required'},status=400)
            if community.owner_id != request.user.id and not IsRSREAdmin().has_permission(request,self): return Response({'detail':'Forbidden'},status=403)
            from .services import dispatch_notification
            targets=community.members.filter(status='joined').select_related('user')
            count=0
            for member in targets:
                dispatch_notification(member.user, f'{community.name}', msg, event_key='whatsapp_community_broadcast', application_key='community', action_url=community.invite_url or '/research-opportunities')
                count += 1
            return Response({'sent_to':count,'community_id':community.id})
        return Response({'detail':'Unsupported action'},status=400)

class AdminWhatsAppCommunityView(APIView):
    permission_classes=[IsRSREAdmin]
    def get(self, request): return Response(WhatsAppCommunitySerializer(WhatsAppCommunity.objects.all(),many=True).data)
    def post(self, request):
        data=request.data.copy(); data['owner']=request.user.id; s=WhatsAppCommunitySerializer(data=data); s.is_valid(raise_exception=True); obj=s.save(owner=request.user)
        if request.data.get('create_provider_group'):
            result=create_whatsapp_group(obj.name,obj.description,request.data.get('member_phone_numbers') or [])
            if result.get('created'):
                obj.provider_group_id=result.get('provider_group_id',''); obj.invite_url=result.get('invite_url','') or obj.invite_url; obj.save(update_fields=['provider_group_id','invite_url','updated_at'])
            return Response({'community':WhatsAppCommunitySerializer(obj).data,'provider_result':{k:v for k,v in result.items() if k != 'raw'}},status=201)
        return Response(WhatsAppCommunitySerializer(obj).data,status=201)

class AdminWhatsAppCommunityDetailView(APIView):
    permission_classes=[IsRSREAdmin]
    def put(self, request, pk):
        obj=WhatsAppCommunity.objects.get(pk=pk); s=WhatsAppCommunitySerializer(obj,data=request.data,partial=True); s.is_valid(raise_exception=True); s.save(); return Response(s.data)
    def delete(self, request, pk): WhatsAppCommunity.objects.get(pk=pk).delete(); return Response(status=204)

class EthicsAssessmentListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(EthicsAssessmentSerializer(EthicsAssessment.objects.filter(user=request.user), many=True).data)

    def post(self, request):
        serializer = EthicsAssessmentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        obj = serializer.save(user=request.user)
        obj.guidance = self._guidance(obj)
        obj.risk_level = self._risk(obj)
        obj.status = 'guidance'
        obj.save(update_fields=['guidance','risk_level','status','updated_at'])
        dispatch_notification(request.user, 'RSRE Ethics & Compliance guidance ready', f'Your ethics self-assessment for “{obj.title}” is ready to review.', event_key='ethics_assessment_ready', application_key='ethics', action_url=f'/ethics-compliance?assessment={obj.id}')
        return Response(EthicsAssessmentSerializer(obj).data, status=201)

    @staticmethod
    def _risk(obj):
        score = sum([
            2 if obj.involves_human_participants else 0,
            2 if obj.involves_vulnerable_groups else 0,
            2 if obj.uses_identifiable_or_sensitive_data else 0,
            1 if obj.biological_samples_or_interventions else 0,
            1 if obj.ai_or_automated_decision_support else 0,
        ])
        return 'high' if score >= 5 else 'moderate' if score >= 2 else 'low'

    @staticmethod
    def _guidance(obj):
        notes = []
        if obj.involves_human_participants:
            notes.append('Human participant research should be reviewed against the requirements of the responsible institutional ethics committee or other competent authority before data collection begins.')
        if obj.uses_identifiable_or_sensitive_data:
            notes.append('Minimize identifiers, restrict access, document the lawful/approved basis for processing, and use secure storage and sharing practices.')
        if obj.involves_vulnerable_groups:
            notes.append('Plan additional safeguards, appropriate consent/assent procedures, and protections against undue influence or coercion.')
        if obj.biological_samples_or_interventions:
            notes.append('Check the applicable institutional, clinical, laboratory, biosafety and regulatory requirements before proceeding.')
        if obj.ai_or_automated_decision_support:
            notes.append('Document the AI role, validate outputs, maintain human oversight, and do not use AI output as a substitute for required professional or institutional decisions.')
        if not notes:
            notes.append('This appears to be a lower-risk activity based on the information provided. Continue to follow your institution’s research integrity, privacy and governance requirements.')
        notes.append('RSRE provides guidance and readiness support; it does not grant statutory ethics approval or regulatory authorization.')
        return '\n\n'.join(notes)

class EthicsAssessmentDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, request, pk):
        return get_object_or_404(EthicsAssessment, pk=pk, user=request.user)

    def get(self, request, pk):
        return Response(EthicsAssessmentSerializer(self.get_object(request, pk)).data)

    def put(self, request, pk):
        obj = self.get_object(request, pk)
        serializer = EthicsAssessmentSerializer(obj, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        obj = serializer.save()
        obj.risk_level = EthicsAssessmentListCreateView._risk(obj)
        obj.guidance = EthicsAssessmentListCreateView._guidance(obj)
        obj.status = 'guidance'
        obj.save(update_fields=['risk_level','guidance','status','updated_at'])
        return Response(EthicsAssessmentSerializer(obj).data)

class EthicsResourceListView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        return Response(EthicsResourceSerializer(EthicsResource.objects.filter(active=True), many=True).data)

class AdminEthicsResourceView(APIView):
    permission_classes = [IsRSREAdmin]
    def get(self, request):
        return Response(EthicsResourceSerializer(EthicsResource.objects.all(), many=True).data)
    def post(self, request):
        serializer = EthicsResourceSerializer(data=request.data); serializer.is_valid(raise_exception=True); obj=serializer.save()
        AdminAuditEvent.objects.create(actor=request.user, action='create_ethics_resource', target_type='EthicsResource', target_id=str(obj.id))
        return Response(EthicsResourceSerializer(obj).data, status=201)

class AdminEthicsResourceDetailView(APIView):
    permission_classes = [IsRSREAdmin]
    def put(self, request, pk):
        obj=EthicsResource.objects.get(pk=pk); serializer=EthicsResourceSerializer(obj,data=request.data,partial=True); serializer.is_valid(raise_exception=True); serializer.save(); return Response(EthicsResourceSerializer(obj).data)
    def delete(self, request, pk):
        EthicsResource.objects.get(pk=pk).delete(); return Response(status=204)


class CollaborationNetworkView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from django.contrib.auth import get_user_model
        User = get_user_model()
        q = (request.query_params.get('q') or '').strip()
        discipline = (request.query_params.get('discipline') or '').strip()
        stage = (request.query_params.get('academic_stage') or '').strip()
        # Collaboration discovery is an opt-in surface.  A passport is the
        # existing source of truth for whether a user's identity is visible
        # to the RSRE network; private passports must never be indexed here.
        qs = User.objects.filter(
            is_active=True,
            research_passport__visibility__in=['network', 'public'],
        ).exclude(id=request.user.id)
        if q:
            qs = qs.filter(
                Q(full_name__icontains=q) | Q(username__icontains=q) |
                Q(institution__icontains=q) | Q(university__icontains=q) |
                Q(research_interests__icontains=q) | Q(research_field__icontains=q) |
                Q(biography__icontains=q)
            )
        if discipline:
            qs = qs.filter(discipline__iexact=discipline)
        if stage:
            qs = qs.filter(academic_stage__iexact=stage)
        qs = qs.order_by('-is_verified_researcher','full_name','username')[:40]
        sent = set(CollaborationRequest.objects.filter(requester=request.user, status='pending').values_list('recipient_id', flat=True))
        accepted = set(CollaborationRequest.objects.filter(Q(requester=request.user)|Q(recipient=request.user), status='accepted').values_list('requester_id','recipient_id'))
        connected_ids = {a if b == request.user.id else b for a,b in accepted}
        people=[]
        for u in qs:
            name=u.get_full_name() or u.username
            interests=[x.strip() for x in (u.research_interests or '').replace(';',',').split(',') if x.strip()][:8]
            people.append({'id':u.id,'name':name,'institution':u.institution or u.university,'discipline':u.discipline,'academic_stage':u.academic_stage,'research_field':u.research_field,'research_interests':interests,'verified':u.is_verified_researcher,'biography':u.biography[:240] if u.biography else '', 'request_pending':u.id in sent, 'connected':u.id in connected_ids})
        incoming=CollaborationRequest.objects.filter(recipient=request.user,status='pending').select_related('requester','project')[:30]
        outgoing=CollaborationRequest.objects.filter(requester=request.user,status='pending').select_related('recipient','project')[:30]
        return Response({'people':people,'incoming':CollaborationRequestSerializer(incoming,many=True).data,'outgoing':CollaborationRequestSerializer(outgoing,many=True).data})

    def post(self, request):
        recipient_id = request.data.get('recipient')
        try:
            recipient_id = int(recipient_id)
        except (TypeError, ValueError):
            recipient_id = None
        if not recipient_id or recipient_id == request.user.id:
            return Response({'detail':'Choose another researcher.'}, status=400)
        from django.contrib.auth import get_user_model
        User = get_user_model()
        try:
            recipient=User.objects.get(id=recipient_id,is_active=True)
        except User.DoesNotExist:
            return Response({'detail':'Researcher not found.'}, status=404)
        project=None
        project_id=request.data.get('project')
        if project_id:
            from journal.models import ResearchProject
            project=ResearchProject.objects.filter(id=project_id, owner=request.user).first()
            if not project:
                return Response({'detail':'You can only connect a collaborator to your own project.'}, status=403)
        serializer=CollaborationRequestSerializer(data={
            'recipient':recipient.id,'purpose':request.data.get('purpose','research_project'),
            'desired_role':request.data.get('desired_role',''),'message':request.data.get('message','').strip(),'project':project.id if project else None
        })
        serializer.is_valid(raise_exception=True)
        if CollaborationRequest.objects.filter(requester=request.user,recipient=recipient,status='pending',purpose=request.data.get('purpose','research_project'),project=project).exists():
            return Response({'detail':'A similar request is already pending.'},status=409)
        obj=serializer.save(requester=request.user)
        dispatch_notification(recipient,'New RSRE collaboration request',f'{request.user.get_full_name() or request.user.username} would like to connect for {obj.get_purpose_display()}.',event_key='collaboration_request',application_key='collaboration',action_url='/collaboration')
        return Response(CollaborationRequestSerializer(obj).data,status=201)

class CollaborationRequestActionView(APIView):
    permission_classes=[IsAuthenticated]
    def post(self, request, pk):
        try: obj=CollaborationRequest.objects.select_related('requester','recipient').get(pk=pk)
        except CollaborationRequest.DoesNotExist: return Response({'detail':'Not found'},status=404)
        action=request.data.get('action')
        if action not in {'accept','decline','cancel'}: return Response({'detail':'Unsupported action.'},status=400)
        if obj.status != 'pending':
            return Response({'detail':'Only pending requests can be changed.'}, status=409)
        if action == 'cancel':
            if obj.requester_id != request.user.id: return Response({'detail':'Forbidden'},status=403)
            obj.status='cancelled'
        else:
            if obj.recipient_id != request.user.id: return Response({'detail':'Forbidden'},status=403)
            obj.status='accepted' if action=='accept' else 'declined'
        from django.utils import timezone
        obj.responded_at=timezone.now(); obj.save(update_fields=['status','responded_at'])
        other=obj.requester if request.user.id==obj.recipient_id else obj.recipient
        if obj.status=='accepted':
            record_passport_evidence(request.user, 'collaboration', f'RSRE collaboration: {other.get_full_name() or other.username}', 'A collaboration request was accepted through the RSRE network.', 'rsre.collaboration_request', obj.pk)
            record_passport_evidence(other, 'collaboration', f'RSRE collaboration: {request.user.get_full_name() or request.user.username}', 'A collaboration request was accepted through the RSRE network.', 'rsre.collaboration_request', obj.pk)
            dispatch_notification(other,'RSRE collaboration accepted',f'{request.user.get_full_name() or request.user.username} accepted your collaboration request.',event_key='collaboration_accepted',application_key='collaboration',action_url='/collaboration')
        elif obj.status=='declined':
            dispatch_notification(other,'RSRE collaboration request update',f'{request.user.get_full_name() or request.user.username} declined your collaboration request.',event_key='collaboration_declined',application_key='collaboration',action_url='/collaboration')
        return Response(CollaborationRequestSerializer(obj).data)
