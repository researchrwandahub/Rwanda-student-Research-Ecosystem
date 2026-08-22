from rest_framework import serializers
from .models import (
    Level, Module, Lesson, Quiz, Question, Choice,
    LevelCertificate, ModuleCertificate, PathwayCertificate, SpecialistPathway, CertificateSettings, AcademyCourse, Assignment, RubricCriterion, AssignmentSubmission, RubricScore,
)


class ChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Choice
        fields = ["id", "order", "text"]


class QuestionSerializer(serializers.ModelSerializer):
    choices = ChoiceSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = ["id", "order", "prompt", "question_type", "choices"]


class QuizSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Quiz
        fields = ["id", "title", "pass_mark", "questions"]


class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = ["id", "order", "title", "lesson_type", "body", "video_url", "resource_urls", "estimated_minutes", "required"]


class ModuleSerializer(serializers.ModelSerializer):
    lessons = LessonSerializer(many=True, read_only=True)
    quiz = QuizSerializer(read_only=True)
    pathway_name = serializers.CharField(source="pathway.name", read_only=True)

    class Meta:
        model = Module
        fields = ["id", "level", "pathway", "pathway_name", "course", "order", "title", "slug", "summary", "objectives", "estimated_minutes", "lessons", "quiz"]


class LevelSerializer(serializers.ModelSerializer):
    modules = serializers.SerializerMethodField()

    class Meta:
        model = Level
        fields = ["id", "number", "name", "code", "description", "required_pass_mark", "modules"]

    def get_modules(self, obj):
        qs = obj.modules.filter(active=True, pathway__isnull=True).order_by("order")
        return ModuleSerializer(qs, many=True).data


class PathwaySerializer(serializers.ModelSerializer):
    modules = serializers.SerializerMethodField()

    class Meta:
        model = SpecialistPathway
        fields = ["id", "name", "code", "description", "prerequisite_level", "required_pass_mark", "modules"]

    def get_modules(self, obj):
        return ModuleSerializer(obj.modules.filter(active=True).order_by("order"), many=True).data


class CertificateSerializer(serializers.ModelSerializer):
    level_name = serializers.CharField(source="level.name", read_only=True)
    verification_url = serializers.SerializerMethodField()

    class Meta:
        model = LevelCertificate
        fields = ["certificate_id", "level", "level_name", "issued_at", "status", "verification_url"]

    def get_verification_url(self, obj):
        settings_obj = CertificateSettings.objects.order_by("id").first()
        base = (settings_obj.verification_base_url if settings_obj else "").rstrip("/")
        return f"{base}/certificates/verify/{obj.certificate_id}/" if base else f"/research-academy/certificate/{obj.certificate_id}/"


class ModuleCertificateSerializer(serializers.ModelSerializer):
    module_name = serializers.CharField(source="module.title", read_only=True)
    verification_url = serializers.SerializerMethodField()

    class Meta:
        model = ModuleCertificate
        fields = ["certificate_id", "module", "module_name", "issued_at", "status", "verification_url"]

    def get_verification_url(self, obj):
        settings_obj = CertificateSettings.objects.order_by("id").first()
        base = (settings_obj.verification_base_url if settings_obj else "").rstrip("/")
        return f"{base}/certificates/verify/{obj.certificate_id}/" if base else f"/research-academy/certificate/{obj.certificate_id}/"


class PathwayCertificateSerializer(serializers.ModelSerializer):
    pathway_name = serializers.CharField(source="pathway.name", read_only=True)
    verification_url = serializers.SerializerMethodField()

    class Meta:
        model = PathwayCertificate
        fields = ["certificate_id", "pathway", "pathway_name", "issued_at", "status", "verification_url"]

    def get_verification_url(self, obj):
        settings_obj = CertificateSettings.objects.order_by("id").first()
        base = (settings_obj.verification_base_url if settings_obj else "").rstrip("/")
        return f"{base}/certificates/verify/{obj.certificate_id}/" if base else f"/research-academy/certificate/{obj.certificate_id}/"


class AcademyCourseSerializer(serializers.ModelSerializer):
    level_name = serializers.CharField(source="level.name", read_only=True)
    pathway_name = serializers.CharField(source="pathway.name", read_only=True)
    module_count = serializers.IntegerField(source="modules.count", read_only=True)
    class Meta:
        model = AcademyCourse
        fields = "__all__"

class RubricCriterionSerializer(serializers.ModelSerializer):
    class Meta:
        model = RubricCriterion
        fields = "__all__"

class AssignmentSerializer(serializers.ModelSerializer):
    rubric_criteria = RubricCriterionSerializer(many=True, read_only=True)
    module_title = serializers.CharField(source="module.title", read_only=True)
    class Meta:
        model = Assignment
        fields = "__all__"

class RubricScoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = RubricScore
        fields = "__all__"

class AssignmentSubmissionSerializer(serializers.ModelSerializer):
    rubric_scores = RubricScoreSerializer(many=True, read_only=True)
    assignment_title = serializers.CharField(source="assignment.title", read_only=True)
    class Meta:
        model = AssignmentSubmission
        fields = "__all__"
        read_only_fields = ["user", "attempt_number", "status", "score", "feedback", "graded_at", "graded_by", "submitted_at"]


class CourseEnrollmentSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source="course.title", read_only=True)
    class Meta:
        model = __import__("academy.models", fromlist=["CourseEnrollment"]).CourseEnrollment
        fields = ["id","course","course_title","status","enrolled_at","completed_at","last_activity_at","progress_percent"]
        read_only_fields=["id","status","enrolled_at","completed_at","last_activity_at","progress_percent"]

class LearningRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = __import__("academy.models", fromlist=["LearningRecord"]).LearningRecord
        fields = "__all__"

class CourseAnnouncementSerializer(serializers.ModelSerializer):
    class Meta:
        model = __import__("academy.models", fromlist=["CourseAnnouncement"]).CourseAnnouncement
        fields = "__all__"
