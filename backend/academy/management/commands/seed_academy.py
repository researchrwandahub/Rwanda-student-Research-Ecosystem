from django.core.management.base import BaseCommand
from django.utils import timezone
from django.utils.text import slugify
from academy.models import Level, SpecialistPathway, Module, Lesson, Quiz, Question, Choice, CertificateSettings, Badge, DiagnosticAssessment, PracticeLab, CaseStudy

REFS = {
    "NIH Clinical Research": "https://ocreco.od.nih.gov/clinical_research_training.html",
    "NIH Educational Resources": "https://www.nih.gov/health-information/nih-clinical-research-trials-you/educational-resources",
    "WHO Research Ethics": "https://www.who.int/southeastasia/our-work/research-and-innovation/research-capacity-building",
    "Rwanda Human Research Law": "https://rwandalii.org/akn/rw/act/law/2022/15/eng@2022-08-12",
    "NCST Research Permit": "https://www.ncst.gov.rw/detail/research-permit-application",
    "NCST Regulations": "https://www.ncst.gov.rw/news-detail/regulations-of-the-executive-secretary-no-001-ncst-2024-of-07-11-2024-governing-research",
    "University of Rwanda Ethics": "https://elearning2.ur.ac.rw/course/view.php?id=4246",
    "University of Rwanda Ethics Committees": "https://elearning2.ur.ac.rw/course/section.php?id=40189",
    "EQUATOR": "https://www.equator-network.org/reporting-guidelines/",
    "EQUATOR Manual": "https://www.equator-network.org/library/equator-network-reporting-guideline-manual/",
    "ICMJE": "https://www.icmje.org/recommendations/",
    "ICMJE AI": "https://www.icmje.org/recommendations/browse/artificial-intelligence/",
    "CRediT": "https://credit.niso.org/",
    "PRISMA": "https://www.prisma-statement.org/",
    "CONSORT": "https://www.consort-statement.org/",
    "STROBE": "https://www.strobe-statement.org/",
    "CARE": "https://www.care-statement.org/",
    "STARD": "https://www.equator-network.org/reporting-guidelines/stard/",
    "TRIPOD": "https://www.tripod-statement.org/",
    "SPIRIT": "https://www.spirit-statement.org/",
    "COREQ": "https://www.equator-network.org/reporting-guidelines/coreq/",
    "ARRIVE": "https://arriveguidelines.org/",
    "SQUIRE": "https://www.equator-network.org/reporting-guidelines/squire-2-0/",
}

CORE = {
1: [
("What Is Health Research?", ["Define health research and distinguish it from routine practice.", "Explain how research can improve health and health systems."]),
("The Health Research Lifecycle", ["Describe the pathway from idea to dissemination.", "Recognise ethics, funding, analysis and communication as connected stages."]),
("Research Questions and Objectives", ["Turn a health problem into an answerable question.", "Write specific objectives and hypotheses."]),
("Evidence and the Research Landscape", ["Differentiate primary studies, reviews and guidelines.", "Use an evidence hierarchy cautiously rather than mechanically."]),
("Scientific Communication", ["Explain why research is communicated.", "Differentiate a manuscript, journal article, peer review and journal."]),
("Research Integrity Basics", ["Recognise plagiarism, fabrication, falsification and authorship problems.", "Understand why integrity begins before publication."]),
],
2: [
("Study Designs", ["Compare common observational and experimental designs.", "Match design to a health research question."]),
("Variables and Outcomes", ["Define exposures, outcomes, covariates and confounders.", "Choose measurable outcomes."]),
("Sampling and Sample Size", ["Understand sampling frames and common sources of bias.", "Explain the purpose of sample-size planning."]),
("Research Protocol Development", ["Draft the major sections of a protocol.", "Align methods, objectives and ethics."]),
("Scientific Writing and IMRAD", ["Build a coherent IMRAD manuscript.", "Write precisely without overstating findings."]),
("Referencing and CRediT", ["Use appropriate citations and references.", "Describe contributions using CRediT and responsible authorship principles."]),
("Research Data and Basic Statistics", ["Distinguish common variable types and descriptive measures.", "Interpret basic uncertainty and effect estimates."]),
],
3: [
("Systematic Reviews", ["Distinguish systematic from narrative reviews.", "Build a transparent review question and search plan."]),
("Scoping Reviews", ["Explain when a scoping review is useful.", "Develop a transparent charting and synthesis plan."]),
("Meta-analysis Fundamentals", ["Understand effect estimates, forest plots and heterogeneity.", "Interpret pooled results cautiously."]),
("Qualitative and Mixed Methods", ["Recognise common qualitative approaches.", "Explain when mixed methods can answer a health question better."]),
("Advanced Biostatistics Concepts", ["Understand regression, effect modification and confounding.", "Interpret estimates with confidence intervals."]),
("Reporting Guidelines", ["Match designs to CONSORT, STROBE, PRISMA, STARD, TRIPOD, CARE and other guidelines.", "Use reporting checklists before submission."]),
("Research Integrity and Responsible AI", ["Apply integrity, authorship, confidentiality and disclosure principles.", "Use AI without outsourcing scientific responsibility."]),
],
4: [
("Build a Researchable Protocol", ["Turn an idea into a structured protocol skeleton.", "Build a realistic ethics and analysis pathway."]),
("Conduct and Document the Study", ["Plan data quality, version control and deviations.", "Keep an auditable research record."]),
("From Results to Manuscript", ["Present results clearly and honestly.", "Write discussion, limitations and conclusions that match the evidence."]),
("Respond to Reviewers and Revise", ["Write point-by-point responses.", "Prepare a transparent revised submission."]),
],
5: [
("Grant Writing and Funding", ["Build a fundable concept note.", "Explain objectives, impact, feasibility and budget logic."]),
("Research Communication and Evidence Translation", ["Translate research for scientific and non-specialist audiences.", "Choose an appropriate communication product."]),
("Research Leadership and Mentorship", ["Set roles, authorship expectations and decision processes.", "Create a supportive and accountable research culture."]),
("Editorial and Research Governance", ["Understand editorial independence, conflicts and quality assurance.", "Recognise the boundaries between technology and scientific governance."]),
("Career and Research Portfolio", ["Build a research record across projects, publications, training and reviewing.", "Use evidence of skills responsibly in applications."]),
],
}

SPECIALIST = {
"Peer Review Academy": ("Train to critically and constructively assess health research manuscripts before applying to the reviewer pool.", [
("Peer Review Foundations", ["Explain the purpose and limits of peer review.", "Recognise reviewer responsibilities."]),
("Manuscript Critical Appraisal", ["Evaluate title, abstract, methods, results and discussion.", "Separate major scientific concerns from minor issues."]),
("Statistics, Bias and Evidence", ["Spot common bias and statistical interpretation problems.", "Assess whether claims are supported by the design."]),
("Reviewer Ethics and Confidentiality", ["Manage conflicts of interest and confidentiality.", "Use AI only where the journal permits and confidentiality can be protected."]),
("Reviewer Simulation", ["Produce a structured, evidence-based reviewer report.", "Demonstrate constructive and actionable feedback."]),
]),
"Grant Writing Academy": ("Build competitive health-research concepts and proposals without overstating impact.", [
("Fundable Problems and Concept Notes", ["Define the problem, gap, objective and value proposition.", "Make a coherent one-page concept note."]),
("Methods, Budget and Feasibility", ["Connect activities to resources and outcomes.", "Build a defensible budget narrative."]),
("Impact, Monitoring and Proposal Review", ["Define realistic outcomes and indicators.", "Critique a proposal from a funder perspective."]),
]),
"Health Communication Academy": ("Translate health evidence accurately for clinicians, students, policymakers and the public.", [
("Plain-Language Health Evidence", ["Summarise scientific findings without changing their meaning.", "Identify uncertainty and limitations."]),
("Health Journalism and Storytelling", ["Build evidence-linked stories, interviews and explainers.", "Avoid sensational or misleading health claims."]),
("Visuals, Policy Briefs and Public Communication", ["Choose formats suited to audiences.", "Communicate data responsibly in visual and written forms."]),
]),
"Responsible AI in Health Research": ("Use AI tools safely and transparently across the health-research lifecycle.", [
("AI for Research Planning", ["Use AI for brainstorming and workflow without inventing evidence.", "Verify claims against primary sources."]),
("AI, Authorship and Disclosure", ["Apply current ICMJE expectations.", "Document substantive AI use clearly."]),
("AI and Confidential Research", ["Protect unpublished and participant-sensitive material.", "Recognise where AI use in review or analysis may be inappropriate."]),
("AI Quality Control Simulation", ["Evaluate AI outputs for accuracy, bias, plagiarism and unsupported claims.", "Build a human verification checklist."]),
]),
}


def lesson_content(title):
    if "Ethic" in title or "Protocol" in title or "Confidential" in title:
        return (
            "Understand the principle, apply it to a health-research scenario, then document the decision. In Rwanda, human-participant research is governed by national law and applicable research-ethics and authorization processes; students should work under appropriate institutional supervision.",
            [REFS["Rwanda Human Research Law"], REFS["NCST Regulations"], REFS["University of Rwanda Ethics"]],
        )
    if "Reporting" in title or "Manuscript" in title or "Writing" in title or "Review" in title:
        return (
            "Use the relevant reporting or publishing guidance as a checklist, not as a substitute for scientific judgement. Build the manuscript around the research question and design, and make the claims match the evidence.",
            [REFS["EQUATOR"], REFS["EQUATOR Manual"], REFS["ICMJE"]],
        )
    if "AI" in title:
        return (
            "AI can assist with planning, language and workflow, but the researcher remains responsible for accuracy, integrity, originality, attribution and confidentiality. Use AI transparently and verify important outputs against authoritative sources.",
            [REFS["ICMJE AI"], REFS["CRediT"]],
        )
    if "Systematic" in title or "Meta-analysis" in title or "Scoping" in title:
        return (
            "Evidence synthesis requires a prespecified question, transparent searching, explicit eligibility criteria, reproducible screening and careful interpretation. Do not treat a pooled estimate as automatically causal or clinically important.",
            [REFS["PRISMA"], REFS["EQUATOR"], REFS["NIH Clinical Research"]],
        )
    return (
        "Learn the concept, test it on a health-research example, and connect it to the next stage of the research lifecycle. Use the external references as authoritative further reading rather than copying them into your work.",
        [REFS["NIH Clinical Research"], REFS["NIH Educational Resources"]],
    )


def add_lessons(module):
    base_text, resources = lesson_content(module.title)
    lesson_specs = [
        ("Core concept", "text", base_text),
        ("Worked example", "activity", f"Apply {module.title.lower()} to a realistic Rwanda/Africa health-research scenario. Write down the decision you would make, what evidence you would consult, and what you would do next."),
        ("Further learning", "video", "Use the linked external learning resource for deeper study. External courses are optional; RSRE assessment is based on the Academy material and your application of it."),
    ]
    for order, (title, kind, body) in enumerate(lesson_specs, 1):
        video = resources[0] if kind == "video" else ""
        Lesson.objects.update_or_create(
            module=module,
            order=order,
            defaults={
                "title": title,
                "lesson_type": kind,
                "body": body,
                "video_url": video,
                "resource_urls": resources,
                "estimated_minutes": 25 if kind != "activity" else 35,
                "required": True,
                "active": True,
            },
        )


def add_quiz(module):
    quiz, _ = Quiz.objects.update_or_create(
        module=module,
        defaults={"title": f"{module.title} — Knowledge Check", "pass_mark": 80, "attempts_allowed": 0},
    )
    # Five original questions; the first two are bespoke to the module, the remaining are transfer questions.
    prompts = [
        (f"What is the strongest first step when working on {module.title.lower()}?", ["Align the task with the research question and evidence", "Choose results before methods", "Avoid documenting decisions", "Skip relevant guidance"], 0, "Good research keeps the question, methods, evidence and reporting aligned."),
        (f"Which approach best supports quality in {module.title.lower()}?", ["Transparent decisions and appropriate documentation", "Changing methods to fit the desired result", "Ignoring limitations", "Using only one source regardless of quality"], 0, "Transparency and documentation support reproducibility and trust."),
        ("Which statement best reflects responsible health research?", ["Methods should follow the question and ethics requirements", "Ethics can be considered after recruitment", "A significant p-value proves causation", "AI output does not need verification"], 0, "Responsible research aligns design, ethics, analysis and interpretation."),
        ("When a reporting guideline applies, it should be used to:", ["Support complete and transparent reporting", "Replace the need for scientific judgement", "Guarantee publication", "Choose the desired result"], 0, "Reporting guidelines help authors report key information clearly."),
        ("What should a researcher do when an AI-generated statement is uncertain?", ["Verify it against authoritative evidence", "Publish it without checking", "Remove all citations", "Treat the AI as an author"], 0, "Humans remain responsible for accuracy, attribution and integrity."),
    ]
    quiz.questions.all().delete()
    for i, (prompt, choices, correct, explanation) in enumerate(prompts, 1):
        q = Question.objects.create(quiz=quiz, order=i, prompt=prompt, question_type="single", explanation=explanation)
        for j, text in enumerate(choices, 1):
            Choice.objects.create(question=q, order=j, text=text, is_correct=(j - 1 == correct))


class Command(BaseCommand):
    help = "Seed and refresh the standalone RSRE Research Academy V2 curriculum"

    def handle(self, *args, **kwargs):
        for number, name, description, modules in [
            (1, "Beginner", "Foundations for health research and scientific communication.", CORE[1]),
            (2, "Intermediate", "Design, protocol development, data and scientific writing.", CORE[2]),
            (3, "Advanced", "Evidence synthesis, rigorous reporting and research integrity.", CORE[3]),
            (4, "Research Practitioner", "Apply the research lifecycle to a practical project.", CORE[4]),
            (5, "Research Leader", "Lead, fund, communicate and govern health research responsibly.", CORE[5]),
        ]:
            level, _ = Level.objects.update_or_create(
                number=number,
                defaults={"name": name, "code": slugify(name), "description": description, "required_pass_mark": 80, "active": True},
            )
            for order, (title, objectives) in enumerate(modules, 1):
                module, _ = Module.objects.update_or_create(
                    level=level,
                    pathway=None,
                    order=order,
                    defaults={
                        "title": title,
                        "slug": slugify(title),
                        "summary": objectives[0],
                        "objectives": objectives,
                        "estimated_minutes": 90,
                        "required": True,
                        "active": True,
                    },
                )
                add_lessons(module)
                add_quiz(module)

        pathway_order_base = 100
        for path_index, (name, (description, modules)) in enumerate(SPECIALIST.items()):
            pathway, _ = SpecialistPathway.objects.update_or_create(
                code=slugify(name),
                defaults={"name": name, "description": description, "prerequisite_level": 3, "required_pass_mark": 80, "active": True},
            )
            level5 = Level.objects.get(number=5)
            for idx, (title, objectives) in enumerate(modules, 1):
                order = pathway_order_base + path_index * 10 + idx
                module, _ = Module.objects.update_or_create(
                    level=level5,
                    pathway=pathway,
                    order=order,
                    defaults={
                        "title": title,
                        "slug": slugify(f"{name}-{title}"),
                        "summary": objectives[0],
                        "objectives": objectives,
                        "estimated_minutes": 120,
                        "required": True,
                        "active": True,
                    },
                )
                add_lessons(module)
                add_quiz(module)

        # V1 learning-engine enrichment: courses, prerequisites, assignments and rubrics
        from academy.models import AcademyCourse, ModulePrerequisite, Assignment, RubricCriterion
        for level in Level.objects.filter(active=True).order_by("number"):
            course, _ = AcademyCourse.objects.update_or_create(
                code=f"level-{level.number}",
                defaults={
                    "level": level, "pathway": None, "title": level.name,
                    "description": level.description, "learning_outcomes": [level.description],
                    "estimated_hours": round(sum((m.estimated_minutes for m in level.modules.filter(active=True)), 0) / 60, 2),
                    "pass_mark": level.required_pass_mark, "active": True, "status": "published",
                    "published_at": timezone.now(), "archived_at": None, "order": level.number,
                },
            )
            for module in level.modules.filter(active=True, pathway__isnull=True).order_by("order"):
                if module.course_id != course.id:
                    module.course = course
                    module.save(update_fields=["course"])
        for pathway in SpecialistPathway.objects.filter(active=True):
            course, _ = AcademyCourse.objects.update_or_create(
                code=f"pathway-{pathway.code}",
                defaults={
                    "level": None, "pathway": pathway, "title": pathway.name, "description": pathway.description,
                    "learning_outcomes": [pathway.description],
                    "estimated_hours": round(sum((m.estimated_minutes for m in pathway.modules.filter(active=True)), 0) / 60, 2),
                    "pass_mark": pathway.required_pass_mark, "active": True, "status": "published",
                    "published_at": timezone.now(), "archived_at": None, "order": 100 + pathway.id,
                },
            )
            for module in pathway.modules.filter(active=True).order_by("order"):
                if module.course_id != course.id:
                    module.course = course
                    module.save(update_fields=["course"])
        core_modules=list(Module.objects.filter(active=True, pathway__isnull=True).order_by("level__number", "order"))
        for previous, current in zip(core_modules, core_modules[1:]):
            ModulePrerequisite.objects.get_or_create(module=current, prerequisite=previous, defaults={"minimum_quiz_score": current.level.required_pass_mark})
        for module in Module.objects.filter(active=True, pathway__isnull=False).order_by("pathway_id","order"):
            prev=module.pathway.modules.filter(active=True, required=True, order__lt=module.order).order_by("-order").first()
            if prev:
                ModulePrerequisite.objects.get_or_create(module=module, prerequisite=prev, defaults={"minimum_quiz_score": module.pathway.required_pass_mark})
        for module in Module.objects.filter(active=True).order_by("level__number","pathway_id","order"):
            if not Assignment.objects.filter(module=module, active=True).exists():
                assignment=Assignment.objects.create(
                    module=module, title=f"Applied Research Task — {module.title}",
                    instructions=(f"Apply the concepts from {module.title} to a realistic health-research scenario. "
                                  "State your assumptions, identify the evidence needed, and produce a concise, practical response suitable for a student research team."),
                    submission_type="text", max_score=100, pass_mark=80, due_after_days=7, attempts_allowed=2, required=True, active=True,
                )
                criteria=[
                    ("Research reasoning","Uses sound research reasoning and connects the response to the module concepts.",30),
                    ("Health-research application","Applies the concept accurately to a realistic health context.",30),
                    ("Evidence and integrity","Uses appropriate evidence logic and avoids unsupported claims.",20),
                    ("Clarity and communication","Communicates the work clearly and professionally.",20),
                ]
                for order,(title,description,max_points) in enumerate(criteria,1):
                    RubricCriterion.objects.create(assignment=assignment,title=title,description=description,max_points=max_points,order=order)

        from academy.models import PracticeLab
        for module in Module.objects.filter(active=True).order_by("level__number","pathway_id","order"):
            if not module.practice_labs.filter(active=True).exists():
                PracticeLab.objects.create(
                    module=module,
                    title=f"Applied Research Lab — {module.title}",
                    description=f"Apply {module.title} to a realistic health-research problem.",
                    instructions=("Define the problem, state the research reasoning you would use, and submit a concise practical response. "
                                  "Use evidence appropriately and identify any ethical, data or methodological constraints."),
                    rubric=[
                        {"criterion":"Reasoning","max_points":30},
                        {"criterion":"Health application","max_points":30},
                        {"criterion":"Evidence and integrity","max_points":20},
                        {"criterion":"Clarity","max_points":20},
                    ],
                    pass_mark=80, required=False, attempts_allowed=2, active=True,
                )

        badge_rules = [
            ("Research Foundations", "research-foundations", "🏅", "level_completed", "foundation"),
            ("Health Research Lifecycle", "health-research-lifecycle", "🔬", "module_completed", "the-health-research-lifecycle"),
            ("Scientific Communication", "scientific-communication", "✍️", "module_completed", "scientific-communication"),
            ("Research Integrity", "research-integrity", "🛡️", "module_completed", "research-integrity-basics"),
        ]
        from academy.models import Badge
        for name, code, icon, trigger_type, trigger_value in badge_rules:
            Badge.objects.update_or_create(code=code, defaults={"name":name,"icon":icon,"trigger_type":trigger_type,"trigger_value":trigger_value,"active":True})

        CertificateSettings.objects.get_or_create(
            singleton_key=1,
            defaults={
                "organization_name": "Rwanda Student Research Ecosystem",
                "academy_name": "Research Academy",
                "signature_name": "Prof. Dr. [NAME]",
                "signature_credentials": "PhD, [FIELD]",
                "signature_title": "Academic Director / Academic Advisor",
                "certificate_footer": "Certificate of completion of an RSRE Research Academy learning pathway.",
            },
        )

        # Enhancement library: entry assessment, competency badges, practice labs and Rwanda/Africa case studies.
        assessment_questions = [
            {"prompt":"Which design is commonly used to estimate prevalence at one point in time?","answer":"B","options":["A. Cohort","B. Cross-sectional","C. Case-control","D. RCT"]},
            {"prompt":"What should come before selecting a statistical test?","answer":"C","options":["A. Writing the discussion","B. Choosing the desired result","C. Defining the question, variables and design","D. Ignoring assumptions"]},
            {"prompt":"Which principle is essential when research involves human participants?","answer":"A","options":["A. Appropriate ethics review and informed consent where applicable","B. Publish first and ask later","C. Skip confidentiality","D. Let AI decide"]},
            {"prompt":"Which guideline is associated with systematic reviews?","answer":"D","options":["A. CARE","B. STARD","C. CONSORT","D. PRISMA"]},
            {"prompt":"Who remains responsible for checking AI-assisted research output?","answer":"B","options":["A. The AI tool","B. The human researcher/author","C. The search engine","D. Nobody"]},
        ]
        da, _ = DiagnosticAssessment.objects.update_or_create(id=1, defaults={"title":"Research Academy Entry Assessment","description":"A short diagnostic to help learners identify a sensible starting point. It does not replace required learning or assessment.","pass_mark":70,"active":True,"questions":assessment_questions})
        for name, code, icon, desc in [
            ("Research Ethics Ready","research-ethics-ready","⚖️","Demonstrated understanding of foundational research ethics."),
            ("Evidence Searcher","evidence-searcher","🔎","Demonstrated ability to search and evaluate health evidence."),
            ("Scientific Writer","scientific-writer","✍️","Demonstrated achievement in scientific writing foundations."),
            ("Critical Appraiser","critical-appraiser","🧠","Demonstrated critical appraisal and evidence reasoning."),
            ("Peer Review Ready","peer-review-ready","👁️","Completed the Peer Review Academy pathway assessment."),
        ]:
            Badge.objects.update_or_create(code=code, defaults={"name":name,"icon":icon,"description":desc,"active":True})

        case_specs=[
            ("Malaria Surveillance in a District","Rwanda","Epidemiology","A district wants to estimate the current prevalence of malaria among children attending selected health facilities. Define the research question, study design, sampling approach and key ethics considerations."),
            ("Antimicrobial Use among Medical Students","Rwanda","Antimicrobial stewardship","A medical school wants to understand antibiotic self-medication among students. Identify the exposure, outcome, possible confounders, and a defensible study design."),
            ("Maternal Health Service Access","East Africa","Maternal health","A team wants to understand barriers to antenatal care in rural communities. Compare a quantitative and qualitative approach and explain what each would contribute."),
        ]
        for title,country,topic,scenario in case_specs:
            CaseStudy.objects.update_or_create(title=title,defaults={"country":country,"topic":topic,"scenario":scenario,"questions":["What is the primary research question?","Which study design fits and why?","What ethical issues must be addressed?"],"active":True})

        # Create one practice lab for each first core module if none exists.
        for module in Module.objects.filter(level__number__lte=2,pathway__isnull=True,active=True).order_by("level__number","order")[:6]:
            PracticeLab.objects.get_or_create(module=module,title=f"{module.title} — Practice Lab",defaults={"description":"Apply this module to a realistic health-research scenario.","instructions":"Write a short, structured response. State your reasoning, evidence you would consult and what you would do next.","rubric":["Conceptual accuracy","Research alignment","Ethics awareness","Clarity"]})

        self.stdout.write(self.style.SUCCESS("Research Academy V4 curriculum seeded: core levels + specialist pathways + diagnostics + badges + labs + Rwanda/Africa cases + quizzes + certificate settings."))
