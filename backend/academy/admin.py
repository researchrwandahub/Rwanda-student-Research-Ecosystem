from django.contrib import admin
from .models import (
    Level, SpecialistPathway, Module, Lesson, Quiz, Question, Choice,
    Enrollment, LessonProgress, QuizAttempt, ModuleCertificate, LevelCertificate,
    PathwayCertificate, CertificateSettings, CourseEnrollment, LearningRecord, CourseAnnouncement,
)

admin.site.register([
    Level, SpecialistPathway, Module, Lesson, Quiz, Question, Choice,
    Enrollment, LessonProgress, QuizAttempt, LevelCertificate,
    PathwayCertificate, ModuleCertificate,
])

@admin.register(CertificateSettings)
class CertificateSettingsAdmin(admin.ModelAdmin):
    list_display = ("organization_name", "academy_name", "signature_name", "signature_title", "updated_at")

from .models import LessonResource, CourseCohort, CourseCohortMember

@admin.register(LessonResource)
class LessonResourceAdmin(admin.ModelAdmin):
    list_display=('title','lesson','resource_type','required','active','order')
    list_filter=('resource_type','required','active')
    search_fields=('title','description','source')

@admin.register(CourseCohort)
class CourseCohortAdmin(admin.ModelAdmin):
    list_display=('name','code','level','pathway','capacity','active','starts_at','ends_at')
    list_filter=('active','level','pathway')
    search_fields=('name','code','description')

admin.site.register(CourseCohortMember)

from .models import AcademyCourse, ModulePrerequisite, Assignment, RubricCriterion, AssignmentSubmission, RubricScore
for _model in [AcademyCourse, ModulePrerequisite, Assignment, RubricCriterion, AssignmentSubmission, RubricScore]:
    try:
        admin.site.register(_model)
    except admin.sites.AlreadyRegistered:
        pass
