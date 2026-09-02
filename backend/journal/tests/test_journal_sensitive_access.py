from django.test import TestCase
from rest_framework.test import APIClient

from journal.models import Article, EditorialDecision, Review, ReviewAssignment, User


class JournalSensitiveAccessTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.author = User.objects.create_user(
            username="author", password="StrongPass9!", role="author",
            email="author@example.com", full_name="Lead Author",
        )
        self.other_author = User.objects.create_user(
            username="other", password="StrongPass9!", role="author",
        )
        self.reviewer = User.objects.create_user(
            username="reviewer", password="StrongPass9!", role="reviewer",
            email="reviewer@example.com", full_name="Secret Reviewer",
        )
        self.editor = User.objects.create_user(
            username="editor", password="StrongPass9!", role="editor",
        )
        self.article = Article.objects.create(
            title="Private manuscript", abstract="Abstract", full_text="Full manuscript",
            author=self.author, status="under_review", is_published=False,
            handling_editor=self.editor,
        )
        ReviewAssignment.objects.create(article=self.article, reviewer=self.reviewer)
        self.review = Review.objects.create(
            article=self.article, reviewer=self.reviewer,
            content="Reviewer report", comments_to_author="Author comments",
            confidential_comments="Confidential editor-only note",
            recommendation="minor_revision",
        )

    def test_author_sees_feedback_without_reviewer_identity_or_confidential_notes(self):
        self.client.force_authenticate(self.author)
        response = self.client.get(f"/api/articles/{self.article.pk}/", follow=True)
        self.assertEqual(response.status_code, 200)
        feedback = response.data["reviewer_feedback"][0]
        self.assertEqual(feedback["reviewer_name"], "Reviewer")
        self.assertNotIn("confidential_comments", feedback)
        self.assertNotIn("reviewer", feedback)

    def test_assigned_reviewer_sees_only_own_review_and_not_author_identity(self):
        self.client.force_authenticate(self.reviewer)
        article = self.client.get(f"/api/articles/{self.article.pk}/", follow=True)
        self.assertEqual(article.status_code, 200)
        self.assertNotIn("username", article.data["author"])
        self.assertEqual(len(article.data["reviewer_feedback"]), 1)
        self.assertEqual(article.data["reviewer_feedback"][0]["reviewer_name"], self.reviewer.full_name)
        assignment = self.client.get("/api/assignments/my/", follow=True)
        self.assertEqual(assignment.status_code, 200)
        self.assertNotIn("article_author", assignment.data[0])

    def test_other_author_cannot_read_unpublished_manuscript_or_decision(self):
        self.client.force_authenticate(self.other_author)
        self.assertEqual(self.client.get(f"/api/articles/{self.article.pk}/", follow=True).status_code, 404)
        decision = EditorialDecision.objects.create(
            article=self.article, editor=self.editor, decision="major_revision",
        )
        self.assertEqual(self.client.get(f"/api/editorial-decisions/{decision.pk}/", follow=True).status_code, 404)

    def test_editor_can_read_manuscript_and_review(self):
        self.client.force_authenticate(self.editor)
        self.assertEqual(self.client.get(f"/api/articles/{self.article.pk}/", follow=True).status_code, 200)
        self.assertEqual(self.client.get(f"/api/reviews/{self.review.pk}/", follow=True).status_code, 200)
