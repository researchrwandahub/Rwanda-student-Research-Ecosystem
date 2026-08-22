"""Regression tests documenting the protected RSJH workflow contract.

These tests are intentionally additive. They verify that the established article
states and core workflow models still exist while Passport integration remains a
separate evidence layer.
"""
from django.test import SimpleTestCase

from journal.models import ARTICLE_STATUS, Article, Review, ReviewAssignment, EditorialDecision


class RSJHProtectedWorkflowContractTests(SimpleTestCase):
    def test_article_states_remain_intact(self):
        keys = {key for key, _label in ARTICLE_STATUS}
        self.assertTrue({"draft", "submitted", "under_review", "revision", "editor_decision", "accepted", "rejected", "published"}.issubset(keys))

    def test_core_journal_models_remain_present(self):
        self.assertTrue(Article)
        self.assertTrue(Review)
        self.assertTrue(ReviewAssignment)
        self.assertTrue(EditorialDecision)
