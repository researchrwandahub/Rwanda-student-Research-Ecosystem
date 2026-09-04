from urllib.error import URLError
from unittest.mock import patch

from django.test import TestCase
from rest_framework.test import APIRequestFactory

from journal.views import ResearchDiscoveryView


class ResearchDiscoveryTests(TestCase):
    def setUp(self):
        self.factory = APIRequestFactory()

    def test_short_query_returns_helpful_empty_response(self):
        response = ResearchDiscoveryView.as_view()(self.factory.get("/api/research-discovery/?q=x"))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["results"], [])
        self.assertIn("at least two", response.data["message"])

    @patch("journal.views.urlopen", side_effect=URLError("offline"))
    def test_provider_failures_are_isolated(self, _urlopen):
        response = ResearchDiscoveryView.as_view()(self.factory.get("/api/research-discovery/?q=malaria"))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["source_status"]["PubMed"], "unavailable")
        self.assertEqual(response.data["source_status"]["OpenAlex"], "unavailable")
        self.assertEqual(response.data["source_status"]["Europe PMC"], "unavailable")
        self.assertEqual(response.data["source_status"]["Crossref"], "unavailable")
        self.assertIn("Local RSRE", response.data["source_status"])
