from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from journal.models import ResearchPassport, User
from .models import CollaborationRequest, EthicsAssessment


@override_settings(SECURE_SSL_REDIRECT=False)
class CollaborationAndEthicsAuthorizationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.owner = User.objects.create_user(
            "owner", "owner@example.com", password="safe-password", full_name="Project Owner"
        )
        self.recipient = User.objects.create_user(
            "recipient", "recipient@example.com", password="safe-password", full_name="Research Partner"
        )
        self.other = User.objects.create_user(
            "other", "other@example.com", password="safe-password", full_name="Other Researcher"
        )
        ResearchPassport.objects.create(user=self.recipient, visibility="network")
        ResearchPassport.objects.create(user=self.other, visibility="private")

    def test_authenticated_user_can_send_and_recipient_can_accept(self):
        self.client.force_authenticate(self.owner)
        response = self.client.post(
            "/api/rsre/collaboration/",
            {"recipient": self.recipient.pk, "purpose": "mentorship"},
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        request = CollaborationRequest.objects.get()

        self.client.force_authenticate(self.recipient)
        response = self.client.post(
            f"/api/rsre/collaboration/requests/{request.pk}/",
            {"action": "accept"},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["status"], "accepted")

    def test_private_identity_is_not_returned_by_discovery(self):
        self.client.force_authenticate(self.owner)
        response = self.client.get("/api/rsre/collaboration/")
        self.assertEqual(response.status_code, 200)
        ids = {person["id"] for person in response.data["people"]}
        self.assertIn(self.recipient.pk, ids)
        self.assertNotIn(self.other.pk, ids)
        self.assertNotIn("email", response.data["people"][0])
        self.assertNotIn("whatsapp_number", response.data["people"][0])

    def test_non_participant_cannot_modify_collaboration_request(self):
        request = CollaborationRequest.objects.create(
            requester=self.owner, recipient=self.recipient, purpose="research_project"
        )
        self.client.force_authenticate(self.other)
        response = self.client.post(
            f"/api/rsre/collaboration/requests/{request.pk}/",
            {"action": "accept"},
            format="json",
        )
        self.assertEqual(response.status_code, 403)
        request.refresh_from_db()
        self.assertEqual(request.status, "pending")

    def test_ethics_assessment_is_owner_scoped_for_read_and_update(self):
        assessment = EthicsAssessment.objects.create(user=self.owner, title="Owner assessment")
        self.client.force_authenticate(self.other)
        self.assertEqual(
            self.client.get(f"/api/rsre/ethics/assessments/{assessment.pk}/").status_code,
            404,
        )
        response = self.client.put(
            f"/api/rsre/ethics/assessments/{assessment.pk}/",
            {"title": "Tampered assessment"},
            format="json",
        )
        self.assertEqual(response.status_code, 404)
        assessment.refresh_from_db()
        self.assertEqual(assessment.title, "Owner assessment")
