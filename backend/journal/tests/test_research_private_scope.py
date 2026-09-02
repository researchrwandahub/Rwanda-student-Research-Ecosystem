from unittest.mock import patch

from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from journal.models import (
    PassportEvidence,
    ResearchProject,
    ResearchProjectMember,
    ResearchSandboxWorkspace,
    User,
)


@override_settings(SECURE_SSL_REDIRECT=False)
class ResearchPrivateScopeTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.owner = User.objects.create_user("owner", password="Passw0rd!", role="author")
        self.member = User.objects.create_user("member", password="Passw0rd!", role="author")
        self.other = User.objects.create_user("other", password="Passw0rd!", role="author")
        self.project = ResearchProject.objects.create(owner=self.owner, title="Private study")
        ResearchProjectMember.objects.create(project=self.project, user=self.member)

    def test_project_owner_and_member_can_read_but_other_cannot(self):
        self.client.force_authenticate(self.owner)
        self.assertEqual(self.client.get(f"/api/research-projects/{self.project.pk}/", follow=True).status_code, 200)
        self.client.force_authenticate(self.member)
        self.assertEqual(self.client.get(f"/api/research-projects/{self.project.pk}/", follow=True).status_code, 200)
        self.client.force_authenticate(self.other)
        self.assertEqual(self.client.get(f"/api/research-projects/{self.project.pk}/", follow=True).status_code, 404)

    def test_private_sandbox_is_owner_only(self):
        workspace = ResearchSandboxWorkspace.objects.create(owner=self.owner, title="Private lab")
        self.client.force_authenticate(self.other)
        self.assertEqual(self.client.get(f"/api/research-sandbox/{workspace.pk}/", follow=True).status_code, 404)
        self.assertEqual(
            self.client.patch(
                f"/api/research-sandbox/{workspace.pk}/",
                {"title": "Stolen title"},
                format="json",
            ).status_code,
            404,
        )
        self.assertEqual(
            self.client.post(
                f"/api/research-sandbox/{workspace.pk}/add-note/",
                {"title": "Unauthorized", "body": "Must not persist."},
                format="json",
            ).status_code,
            404,
        )

    def test_owner_can_update_workspace_and_persist_note(self):
        self.client.force_authenticate(self.owner)
        created = self.client.post(
            "/api/research-sandbox/",
            {"title": "Methods lab", "research_topic": "Implementation", "description": "Test a method."},
            format="json",
        )
        self.assertEqual(created.status_code, 201)
        workspace_id = created.data["id"]

        updated = self.client.patch(
            f"/api/research-sandbox/{workspace_id}/",
            {"title": "Updated methods lab", "status": "archived"},
            format="json",
        )
        self.assertEqual(updated.status_code, 200)
        self.assertEqual(updated.data["title"], "Updated methods lab")
        self.assertEqual(updated.data["status"], "archived")

        note = self.client.post(
            f"/api/research-sandbox/{workspace_id}/add-note/",
            {"title": "First observation", "body": "The result is reproducible."},
            format="json",
        )
        self.assertEqual(note.status_code, 201)
        dataset = self.client.post(
            f"/api/research-sandbox/{workspace_id}/add-dataset/",
            {"name": "Synthetic cohort", "data_type": "synthetic"},
            format="json",
        )
        self.assertEqual(dataset.status_code, 201)
        reopened = self.client.get(f"/api/research-sandbox/{workspace_id}/")
        self.assertEqual(reopened.status_code, 200)
        self.assertEqual(reopened.data["notes"][0]["title"], "First observation")
        self.assertEqual(reopened.data["datasets"][0]["name"], "Synthetic cohort")

    def test_passport_evidence_is_owned_and_manual_evidence_can_be_edited(self):
        evidence = PassportEvidence.objects.create(
            user=self.owner, evidence_type="project", title="My evidence", source_type="manual"
        )
        self.client.force_authenticate(self.other)
        self.assertEqual(self.client.delete(f"/api/research-passport/evidence/{evidence.pk}/", follow=True).status_code, 404)
        self.client.force_authenticate(self.owner)
        response = self.client.patch(
            f"/api/research-passport/evidence/{evidence.pk}/", {"title": "Updated evidence"}, follow=True
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["title"], "Updated evidence")

    @patch("journal.views.urlopen", side_effect=OSError("provider down"))
    def test_external_discovery_failure_is_graceful(self, _urlopen):
        response = self.client.post("/api/opportunity-discovery/", {"keyword": "health"}, format="json", follow=True)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["results"], [])
        self.assertNotIn("provider down", response.data["detail"])
