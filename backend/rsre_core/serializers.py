from rest_framework import serializers

from .models import (
    Application,
    PlatformSetting,
    ContentItem,
    FeatureComponent,
    SupportTicket,
    SupportMessage,
    NotificationPreference,
    WhatsAppCommunity,
    WhatsAppCommunityMember,
    EthicsAssessment,
    EthicsResource,
    CollaborationRequest,
)


class ApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = "__all__"


class PlatformSettingSerializer(serializers.ModelSerializer):
    whatsapp_token = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True,
    )

    class Meta:
        model = PlatformSetting
        fields = "__all__"


class ContentItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContentItem
        fields = "__all__"


class SupportMessageSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()

    def get_author_name(self, obj):
        if obj.author:
            return obj.author.get_full_name() or obj.author.username
        return "System"

    class Meta:
        model = SupportMessage
        fields = [
            "id",
            "author",
            "author_name",
            "message",
            "created_at",
        ]


class SupportTicketSerializer(serializers.ModelSerializer):
    messages = SupportMessageSerializer(many=True, read_only=True)
    application_name = serializers.CharField(
        source="application.name",
        read_only=True,
    )

    class Meta:
        model = SupportTicket
        fields = "__all__"
        read_only_fields = [
            "user",
            "created_at",
            "updated_at",
        ]


class NotificationPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationPreference
        exclude = ["user"]


class FeatureComponentSerializer(serializers.ModelSerializer):
    application_name = serializers.CharField(
        source="application.name",
        read_only=True,
    )

    class Meta:
        model = FeatureComponent
        fields = "__all__"


class WhatsAppCommunitySerializer(serializers.ModelSerializer):
    member_count = serializers.IntegerField(
        source="members.count",
        read_only=True,
    )

    class Meta:
        model = WhatsAppCommunity
        fields = "__all__"
        read_only_fields = [
            "owner",
            "created_at",
            "updated_at",
        ]


class WhatsAppCommunityMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = WhatsAppCommunityMember
        fields = "__all__"
        read_only_fields = [
            "user",
            "joined_at",
            "created_at",
        ]


class EthicsAssessmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = EthicsAssessment
        fields = "__all__"
        read_only_fields = [
            "user",
            "reviewed_by_id",
            "reviewed_at",
            "created_at",
            "updated_at",
        ]


class EthicsResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = EthicsResource
        fields = "__all__"


class CollaborationRequestSerializer(serializers.ModelSerializer):
    requester_name = serializers.SerializerMethodField()
    recipient_name = serializers.SerializerMethodField()
    project_title = serializers.CharField(
        source="project.title",
        read_only=True,
    )

    def get_requester_name(self, obj):
        return obj.requester.get_full_name() or obj.requester.username

    def get_recipient_name(self, obj):
        return obj.recipient.get_full_name() or obj.recipient.username

    class Meta:
        model = CollaborationRequest
        fields = "__all__"
        read_only_fields = [
            "requester",
            "status",
            "created_at",
            "responded_at",
        ]