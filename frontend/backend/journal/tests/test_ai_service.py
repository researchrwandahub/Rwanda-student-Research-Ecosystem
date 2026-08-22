from django.test import SimpleTestCase

from journal.ai_service import AIService


class AIServiceTests(SimpleTestCase):
    def test_mock_provider_returns_structured_response(self):
        service = AIService(provider_name='mock')
        result = service.generate(
            task='summarize',
            text='Rwanda has improved maternal health through community outreach and digital records.',
            context={'language': 'en'}
        )

        self.assertEqual(result['task'], 'summarize')
        self.assertIn('summary', result['content'].lower())
        self.assertIn('rwanda', result['content'].lower())
