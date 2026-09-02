from django.core.exceptions import ValidationError
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIRequestFactory

from academy.models import AcademyCourse, Level, LevelCertificate, Lesson, Module
from academy.views import CertificateVerifyView


class AcademyCourseLifecycleTests(TestCase):
    def setUp(self):
        self.level = Level.objects.create(number=1, name="Foundations", code="foundations", description="Basics")
        self.course = AcademyCourse.objects.create(
            level=self.level, code="foundations-course", title="Foundations"
        )

    def test_valid_course_can_be_published(self):
        module = Module.objects.create(
            level=self.level, course=self.course, order=1, title="Intro",
            slug="intro", summary="Introduction"
        )
        Lesson.objects.create(module=module, order=1, title="Welcome")
        self.course.status = "draft"
        self.course.publish()
        self.course.refresh_from_db()
        self.assertEqual(self.course.status, "published")
        self.assertTrue(self.course.active)
        self.assertIsNotNone(self.course.published_at)

    def test_invalid_course_publish_is_rejected(self):
        self.course.status = "draft"
        with self.assertRaises(ValidationError):
            self.course.publish()
        self.course.refresh_from_db()
        self.assertEqual(self.course.status, "draft")

    def test_archive_removes_course_from_active_catalog(self):
        self.course.archive()
        self.course.refresh_from_db()
        self.assertEqual(self.course.status, "archived")
        self.assertFalse(self.course.active)
        self.assertIsNotNone(self.course.archived_at)

    def test_revoked_certificate_is_not_valid(self):
        user = get_user_model().objects.create_user(username="learner", password="password")
        cert = LevelCertificate.objects.create(
            user=user, level=self.level, certificate_id="RSRE-TEST-1"
        )
        cert.status = "revoked"
        cert.save(update_fields=["status"])
        request = APIRequestFactory().get("/certificates/verify/RSRE-TEST-1/")
        response = CertificateVerifyView.as_view()(request, certificate_id=cert.certificate_id)
        self.assertFalse(response.data["valid"])
        self.assertEqual(response.data["status"], "revoked")
