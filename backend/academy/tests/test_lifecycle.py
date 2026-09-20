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

class AcademyLearningQualityTests(TestCase):
    def setUp(self):
        from academy.models import Quiz, Question, Choice
        self.user = get_user_model().objects.create_user(username="learner-quality", password="password")
        self.level = Level.objects.create(number=1, name="Foundations", code="foundations-q", description="Basics")
        self.module = Module.objects.create(
            level=self.level, order=1, title="Research Foundations", slug="research-foundations-q", summary="Foundations"
        )
        self.lesson = Lesson.objects.create(
            module=self.module, order=1, title="Core lesson", body=("Research evidence and research questions. " * 120), estimated_minutes=40
        )
        self.quiz = Quiz.objects.create(module=self.module, title="Knowledge check", pass_mark=80)
        question = Question.objects.create(quiz=self.quiz, order=1, prompt="Which comes first?")
        self.correct = Choice.objects.create(question=question, order=1, text="A clear research question", is_correct=True)
        Choice.objects.create(question=question, order=2, text="A preferred result", is_correct=False)

    def test_assessment_requires_required_lessons(self):
        from academy.views import SubmitQuizView
        factory = APIRequestFactory()
        request = factory.post("/academy/quizzes/1/submit/", {"answers": {str(self.quiz.questions.first().id): [str(self.correct.id)]}}, format="json")
        request.user = self.user
        response = SubmitQuizView.as_view()(request, pk=self.quiz.id)
        self.assertEqual(response.status_code, 400)
        self.assertIn("incomplete_lessons", response.data)

    def test_full_assessment_can_be_scored_after_lesson_completion(self):
        from academy.views import SubmitQuizView
        from academy.models import LessonProgress
        LessonProgress.objects.create(user=self.user, lesson=self.lesson)
        question = self.quiz.questions.first()
        request = APIRequestFactory().post(
            "/academy/quizzes/1/submit/", {"answers": {str(question.id): [str(self.correct.id)]}}, format="json"
        )
        request.user = self.user
        response = SubmitQuizView.as_view()(request, pk=self.quiz.id)
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["passed"])
        self.assertEqual(response.data["questions_answered"], 1)
