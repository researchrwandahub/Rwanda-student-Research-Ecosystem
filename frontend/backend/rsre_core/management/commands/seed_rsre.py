from django.core.management.base import BaseCommand
from rsre_core.models import Application, PlatformSetting, FeatureComponent, EthicsResource

APPS = [
    ("academy", "Research Academy", "Learn and demonstrate health-research competencies.", "/research-academy", "🧠", 10),
    ("discovery", "Research Discovery", "Find health research, authors, institutions and topics.", "/research-discovery", "🔎", 20),
    ("opportunities", "Research Opportunities", "Find grants, scholarships, fellowships, internships and calls.", "/research-opportunities", "🎯", 30),
    ("incubator", "Research Incubator", "Turn a research idea into a structured project and team.", "/research-incubator", "💡", 40),
    ("passport", "Research Passport", "Maintain a verified record of research learning and achievements.", "/research-passport", "🪪", 50),
    ("analytics", "Research Analytics", "Explore the Rwanda health-research landscape and platform activity.", "/research-analytics", "📊", 60),
    ("journal", "RSJH Journal", "Student-centered health-sciences publication and peer review.", "/articles", "📖", 70),
    ("sandbox", "Research Sandbox", "Practice with public, synthetic and governed research data.", "/research-sandbox", "🧪", 80),
    ("ai", "MedTech AI", "Responsible AI assistance for research work under human oversight.", "/medtech-ai", "🤖", 90),
    ("ethics", "Ethics & Compliance", "Research integrity, ethics, privacy and governance guidance.", "/ethics-compliance", "🛡️", 100),
    ("collaboration", "Collaboration Network", "Find people, teams, mentors and research collaborators.", "/collaboration", "🤝", 110),
]

class Command(BaseCommand):
    help = "Seed the RSRE ecosystem application registry and default platform settings."
    def handle(self, *args, **kwargs):
        for key, name, desc, route, icon, order in APPS:
            Application.objects.update_or_create(key=key, defaults={
                'name': name, 'description': desc, 'route': route, 'icon': icon,
                'nav_label': name, 'order': order, 'active': True, 'public': True,
            })
        PlatformSetting.objects.get_or_create(singleton_key=1)
        components = {
            "academy": [("learning_path", "Learning Pathways", "Core levels and specialist pathways.", "section", 10), ("my_learning", "My Learning", "Progress, required modules and next actions.", "card", 20), ("assessments", "Assessments", "Quizzes, diagnostics and readiness checks.", "tool", 30), ("credentials", "Credentials", "Badges and verifiable certificates.", "card", 40)],
            "discovery": [("search", "Research Search", "Search authors, topics, institutions and research outputs.", "tool", 10), ("saved", "Saved Research", "Saved items and follow lists.", "card", 20)],
            "analytics": [("landscape", "Research Landscape", "Trends, institutions, topics and collaboration signals.", "section", 10), ("personal", "My Research Analytics", "Personal activity and evidence metrics.", "card", 20)],
            "incubator": [("ideas", "Idea Capture", "Turn a problem into a researchable question.", "tool", 10), ("projects", "Project Workspace", "Protocol, team, mentor and task workflow.", "section", 20)],
            "opportunities": [("discover", "Opportunity Discovery", "Verified grants, fellowships, internships and calls.", "section", 10), ("saved", "Saved Opportunities", "Track opportunities and deadlines.", "card", 20)],
            "passport": [("record", "Research Record", "Learning, projects, reviews and verified achievements.", "section", 10), ("verification", "Verification", "Evidence and verification tiers.", "tool", 20)],
            "journal": [("manuscripts", "Manuscript Workspace", "Submission, review, revision and publication.", "section", 10), ("editorial", "Editorial Operations", "Journal editorial workflow and quality controls.", "tool", 20)],
            "sandbox": [("datasets", "Safe Datasets", "Synthetic, public and governed datasets.", "section", 10), ("lab", "Analysis Lab", "Practice statistics, coding and reproducible workflows.", "tool", 20)],
            "ai": [("coach", "Research Coach", "Explain, brainstorm, code and structure research work.", "tool", 10), ("disclosure", "AI Disclosure", "Record and explain responsible AI use.", "card", 20)],
            "ethics": [("guidance", "Ethics Guidance", "Research integrity, privacy and governance guidance.", "section", 10)],
            "collaboration": [("people", "People & Skills", "Discover mentors, researchers and collaborators.", "section", 10), ("teams", "Research Teams", "Create and manage multidisciplinary teams.", "tool", 20)],
        }
        for app_key, rows in components.items():
            app = Application.objects.filter(key=app_key).first()
            if not app:
                continue
            for key,title,description,ctype,order in rows:
                FeatureComponent.objects.update_or_create(application=app,key=key,defaults={
                    "title":title,"description":description,"component_type":ctype,"order":order,"enabled":True
                })
        default_ethics_resources = [
            ("Research integrity essentials", "guide", "Practical guidance on honesty, authorship, conflicts of interest, plagiarism, fabrication and falsification."),
            ("Human participant readiness checklist", "checklist", "Questions to consider before recruiting participants or collecting identifiable information."),
            ("Responsible AI in research", "policy", "Human oversight, validation, disclosure and responsible use of AI in research workflows."),
            ("Data protection planning", "checklist", "A practical checklist for minimizing identifiers, access control, secure storage and responsible sharing."),
        ]
        for title, resource_type, summary in default_ethics_resources:
            EthicsResource.objects.update_or_create(title=title, defaults={"resource_type":resource_type,"summary":summary,"active":True})
        self.stdout.write(self.style.SUCCESS(f"RSRE ecosystem seeded: {len(APPS)} applications."))
