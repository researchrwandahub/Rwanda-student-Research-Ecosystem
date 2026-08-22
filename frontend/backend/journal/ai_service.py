import json
import os
import urllib.request
from typing import Any, Dict, Optional


class BaseAIProvider:
    def generate(self, task: str, prompt: str, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        raise NotImplementedError


class MockAIProvider(BaseAIProvider):
    def generate(self, task: str, prompt: str, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        content = self._mock_content(task, prompt, context or {})
        return {
            "task": task,
            "provider": "mock",
            "content": content,
            "metadata": {"provider": "mock", "model": "mock"},
        }

    def _mock_content(self, task: str, prompt: str, context: Dict[str, Any]) -> str:
        language = context.get("language", "en").upper()
        if task == "summarize":
            return f"Summary ({language}): {prompt[:220]}"
        if task == "grammar":
            return f"Grammar improvement ({language}): {prompt[:220]}"
        if task == "keywords":
            return "Suggested keywords: Rwanda, maternal health, public health, digital health, medical education"
        if task == "research":
            return "Research assistance: focus on study design, ethics approval, measurable outcomes, and reproducible methods."
        if task == "chat":
            return "MedTech AI can help with research learning, discovery, study design, data-analysis concepts, writing, and next-step planning. Human judgement remains required for clinical, ethical, editorial, and publication decisions."
        if task == "reviewer":
            return "Reviewer assistance: assess originality, clinical relevance, methods, ethics, and significance."
        if task == "explain":
            return "Educational explanation: break the topic into problem, mechanism, evidence, and takeaway."
        if task == "flashcards":
            return "Flashcards: 1) Define the key concept. 2) Explain the clinical implication."
        if task == "mcq":
            return "MCQ generation: 1) Which statement best describes the finding? 2) What is the most appropriate next step?"
        if task == "writing":
            return "Scientific writing assistance: tighten the abstract, clarify the methods, and strengthen the conclusion."
        return f"{task.title()} output ready for RMSJ."


class OpenAICompatibleProvider(BaseAIProvider):
    def __init__(self) -> None:
        self.api_key = os.environ.get("AI_API_KEY", "").strip()
        self.base_url = os.environ.get("AI_BASE_URL", "https://api.openai.com/v1/chat/completions").strip()
        self.model = os.environ.get("AI_MODEL", "gpt-4o-mini").strip()
        self.timeout = int(os.environ.get("AI_TIMEOUT_SECONDS", "20"))

    def generate(self, task: str, prompt: str, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        if not self.api_key:
            raise RuntimeError("AI_API_KEY is not configured")
        payload = {"model": self.model, "messages": [{"role": "system", "content": "You are a helpful medical research assistant for RMSJ."}, {"role": "user", "content": prompt}], "temperature": 0.2, "max_tokens": 500}
        headers = {"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"}
        request = urllib.request.Request(self.base_url, data=json.dumps(payload).encode('utf-8'), headers=headers, method='POST')
        with urllib.request.urlopen(request, timeout=self.timeout) as response:
            result = json.loads(response.read().decode('utf-8'))
            text = result.get('choices', [{}])[0].get('message', {}).get('content', '')
            return {"task": task, "provider": "openai-compatible", "content": text, "metadata": {"model": self.model}}


class AIService:
    def __init__(self, provider_name: Optional[str] = None) -> None:
        provider_name = (provider_name or os.environ.get("AI_PROVIDER", "mock")).strip().lower()
        self.provider_name = provider_name
        self.provider = self._build_provider(provider_name)

    def _build_provider(self, provider_name: str) -> BaseAIProvider:
        if provider_name in {"openai", "openai-compatible", "azure-openai"}:
            return OpenAICompatibleProvider()
        return MockAIProvider()

    def build_prompt(self, task: str, text: str, context: Optional[Dict[str, Any]] = None) -> str:
        task = (task or "summarize").strip().lower()
        context = context or {}
        language = context.get("language", "en")
        text = text or ""
        if task == "summarize":
            return f"Summarize the following medical research text in clear {language}:\n\n{text}"
        if task == "writing":
            return f"Improve the scientific writing clarity and structure of the following text in {language}:\n\n{text}"
        if task == "grammar":
            return f"Correct grammar and improve readability of the following text in {language}:\n\n{text}"
        if task == "keywords":
            return f"Generate useful keywords for the following text in {language}:\n\n{text}"
        if task == "research":
            return f"Provide practical research assistance for the following medical research text in {language}. Highlight assumptions, distinguish evidence from suggestions, and never invent citations:\n\n{text}"
        if task == "chat":
            return (
                f"You are MedTech AI inside the Rwanda Student Research & Education (RSRE) ecosystem. "
                f"Respond in {language}. Help the user with research learning, discovery, study design, analysis concepts, "
                f"scientific writing, opportunities, Academy practice, Sandbox experimentation, and Incubator planning. "
                f"Never make an editorial acceptance decision, ethics approval decision, diagnosis, treatment decision, or claim that a paper is publishable. "
                f"Do not invent references or pretend to have searched sources you were not given. "
                f"Use the supplied RSJH evidence when present. Clearly label uncertainty and recommend human verification where needed.\n\n{text}"
            )
        if task in {"reviewer", "reviewer_support"}:
            return f"Support a human reviewer by identifying constructive points to consider in this manuscript or reviewer comment. Do not make the editorial decision. Respond in {language}:\n\n{text}"
        if task == "plain_language":
            return f"Create a plain-language summary for a general health audience. Preserve factual accuracy and do not invent findings. Use {language}:\n\n{text}"
        if task == "integrity_check":
            return f"Check this research text for missing clarity, ethics, reporting or citation-related information. Do not fabricate references. Respond in {language}:\n\n{text}"
        if task == "explain":
            return f"Explain the following medical topic in simple educational terms in {language}:\n\n{text}"
        if task == "flashcards":
            return f"Create useful flashcards from the following text in {language}:\n\n{text}"
        if task == "mcq":
            return f"Generate concise multiple-choice questions from the following text in {language}:\n\n{text}"
        return f"Provide helpful assistance for the following RMSJ content in {language}:\n\n{text}"

    def generate(self, task: str, text: str, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        prompt = self.build_prompt(task, text, context)
        try:
            return self.provider.generate(task, prompt, context)
        except Exception:
            return MockAIProvider().generate(task, prompt, context)
