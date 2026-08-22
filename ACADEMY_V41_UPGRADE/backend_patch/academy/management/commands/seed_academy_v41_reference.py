from django.core.management.base import BaseCommand
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


DEEP_LESSONS = {
    "What Is Health Research?": [
        ("Start with the idea", "text", "Health research is a structured way of asking a question about health and collecting evidence that can help answer it. It is different from simply looking something up, following routine practice, or describing what happened once. Research begins with a clear problem and uses a planned method so another person can understand what was done and judge the evidence.\n\nIn health, research can describe a problem, identify risk factors, test an intervention, understand people's experiences, or improve how a health service works. A good research question is specific enough to answer with evidence. The question should guide the design, data collection, analysis and interpretation.\n\nExample: “How common is self-medication with antibiotics among medical students at a university?” is a researchable question. “Antibiotic use is bad” is a statement, not a research question.\n\nRemember: research does not begin with a result you want. It begins with a question you are willing to investigate honestly."),
        ("Research or routine practice?", "activity", "A clinic notices that many patients miss follow-up appointments. Staff begin calling patients one week before their next appointment as part of routine service improvement. If the team only implements and monitors the change for local improvement, that is primarily service practice. If the team develops a systematic study to answer a defined question, selects participants and variables in advance, analyzes the data, and intends to generate generalisable knowledge, it becomes research.\n\nAsk yourself:\n1. What question is being answered?\n2. Is there a planned method?\n3. What evidence will be collected?\n4. Who needs to review or authorize the activity?\n5. Is the goal local improvement, generalisable knowledge, or both?\n\nThere can be overlap between quality improvement and research, so researchers should follow the requirements of their institution and the responsible ethics or governance authority rather than deciding the classification informally."),
        ("Why research matters in Rwanda", "text", "Research helps health workers move from assumptions to evidence. In Rwanda, a research question may come from malaria control, maternal health, non-communicable diseases, antimicrobial resistance, digital health, laboratory practice, health financing or the experience of students and patients.\n\nA strong study can show the size of a problem, reveal who is affected, explain why a service is difficult to access, or test whether an intervention is useful. Research does not automatically change policy or practice; findings must also be interpreted, communicated and considered alongside feasibility, ethics and existing evidence.\n\nA practical research mindset is: define the problem, ask an answerable question, choose a suitable method, collect trustworthy evidence, analyze it carefully, acknowledge uncertainty and communicate what the evidence actually supports."),
        ("Worked example", "activity", "Scenario: A university health centre wants to know whether students who receive a short malaria-prevention education session improve their knowledge.\n\nStep 1 — Question: Does the education session improve malaria-prevention knowledge among students?\nStep 2 — Outcome: a defined knowledge score before and after the session.\nStep 3 — Method: choose a design that can compare knowledge over time or between groups.\nStep 4 — Evidence: use a clear questionnaire and document how it was administered.\nStep 5 — Interpretation: compare the observed change without claiming more than the design can support.\n\nNow create your own example from a health problem you have observed. Write the research question, the main outcome, who would provide the data, and what you would do next."),
        ("Check your understanding", "text", "Before moving on, you should be able to explain in your own words:\n\n• what health research is;\n• how research differs from routine practice or casual information gathering;\n• why a research question comes before choosing a method;\n• why evidence must be collected and documented systematically; and\n• why ethics and governance are part of responsible research.\n\nIf any of these points are unclear, review the lesson before taking the basic knowledge check. The assessment is designed to test understanding of the lesson, not advanced research expertise.")
    ],
    "The Health Research Lifecycle": [
        ("See the whole journey", "text", "The health-research lifecycle is a connected sequence rather than a single event. A typical journey is: identify a problem → review existing evidence → define the question → choose a design → plan ethics and governance → collect data → manage and analyze data → interpret findings → communicate or publish → preserve the record and learn from the work.\n\nThe stages influence one another. A poorly defined question creates problems for the design. A weak data plan creates problems for analysis. Poor reporting makes useful findings difficult to trust or reproduce."),
        ("From question to plan", "activity", "Take a simple question such as “What factors are associated with missed antenatal-care visits in a district?” Map the next five steps. Start with the evidence already available, then identify the study population, possible variables, ethical considerations and the kind of result you need. The goal is not to choose a perfect method yet; the goal is to see how each decision connects to the next."),
        ("Governance is part of the lifecycle", "text", "Research involving people, identifiable data, biological materials or interventions may require ethics review, institutional permission, regulatory authorization or other governance processes. These should be planned before activities that require approval begin.\n\nA responsible researcher also plans data security, authorship, documentation, conflicts of interest and dissemination early rather than at the end."),
        ("Worked example", "activity", "A student notices low vaccination knowledge among peers. First, check whether the question has already been answered. Next, define exactly what “knowledge” means. Then choose a suitable study design, think about recruitment and consent, plan the questionnaire, decide how data will be stored, and only then conduct the study. After analysis, communicate both strengths and limitations.\n\nWrite the lifecycle for your own example in ten short steps."),
        ("Ready for assessment", "text", "You should now recognize research as a process with linked decisions. You do not need to memorize one rigid sequence; different studies may revisit earlier stages. The important skill is understanding why each stage exists and how evidence, ethics, methods and communication connect.")
    ],
    "Research Questions and Objectives": [
        ("What makes a question researchable?", "text", "A research question identifies what you want to find out. A strong question is clear, focused, feasible and answerable with evidence. It identifies a population, issue, exposure, experience, intervention or outcome where appropriate.\n\nCompare: “Why is diabetes a problem?” is too broad. “What proportion of adult patients attending X clinic have controlled blood pressure?” is more specific. The best wording depends on the design and purpose of the study."),
        ("Questions, objectives and hypotheses", "text", "The question states what you want to know. The objective states what the study will do. A hypothesis is a testable expectation used when appropriate. For example: Question — “Is sleep duration associated with academic performance among medical students?” Objective — “To assess the association between sleep duration and academic performance among medical students at X university.”\n\nObjectives should be specific enough to guide the methods and analysis."),
        ("Build one step at a time", "activity", "Start with a health problem. Write one sentence describing the problem, one research question, one primary objective and two secondary objectives. Remove words that do not help define what will actually be measured or explored. Then ask: Could another researcher tell what evidence I need from this wording?"),
        ("Worked example", "activity", "Problem: students often report difficulty accessing research articles. Question: “What barriers do health-science students report when accessing scholarly articles?” Objective: “To describe perceived barriers to accessing scholarly articles among health-science students at X institution.” Secondary objectives could explore differences by year of study or access to institutional subscriptions.\n\nNotice that the wording points directly toward data collection."),
        ("Check your understanding", "text", "Before the quiz, remember the sequence: problem → question → objective → method. Do not choose a statistical test or questionnaire first. Start by deciding exactly what you need to learn.")
    ],
    "Evidence and the Research Landscape": [
        ("What counts as evidence?", "text", "Health evidence comes from different sources, including primary research studies, systematic reviews, clinical guidelines, surveillance reports and policy documents. Each source answers different questions and has different strengths and limitations.\n\nA research article may provide original data. A systematic review summarizes multiple studies using an explicit method. A guideline translates evidence into recommendations, often using additional judgments about values, resources and feasibility."),
        ("Search before you repeat", "activity", "Before starting a new study, ask what is already known. Search using the main concepts of your question. Record the databases or sources searched, key terms and important findings. The purpose is not to prove your idea; it is to understand the existing landscape and identify what remains uncertain."),
        ("Evidence is not a popularity contest", "text", "Do not judge a source only by how impressive its journal or website looks. Ask: Was the study appropriate for the question? Was the method clear? Could bias have affected the result? Are the participants relevant? Are the conclusions supported by the data? A heavily cited study can still have limitations."),
        ("Worked example", "activity", "Suppose you find a news article, a cross-sectional study and a systematic review about malaria prevention. For a scientific background, the primary study may provide useful local data, while the systematic review may help summarize the wider evidence. The news article can help you understand public communication but should not automatically be treated as your strongest scientific source."),
        ("Check your understanding", "text", "Your goal is not to memorize a rigid evidence hierarchy. Your goal is to match the source to the question and judge its quality, relevance, limitations and currency.")
    ],
    "Scientific Communication": [
        ("Why research must be communicated", "text", "Research only becomes useful when other people can understand and evaluate it. Scientific communication includes protocols, posters, oral presentations, reports, manuscripts, journal articles, policy briefs and public explanations. Each format has a different audience and purpose.\n\nA manuscript is a structured scientific report. A journal is the publication venue. Peer review is a quality-assessment process; it does not guarantee that every finding is correct."),
        ("Match message to audience", "activity", "Take one finding and explain it three ways: in one sentence to another medical student, in a short paragraph to a hospital manager, and in plain language to a member of the public. Keep the meaning and uncertainty consistent. This is a core research skill, not just a writing exercise."),
        ("The basic scientific story", "text", "Many health research reports use a logical flow: why the problem matters, what was asked, how it was studied, what was found, what the findings mean, and what remains uncertain. A good paper does not hide limitations or inflate significance. Clear communication follows the evidence rather than trying to make the study sound more impressive."),
        ("Worked example", "activity", "Finding: “In this sample, 52% of students reported consistent insecticide-treated-net use.” A scientific statement can describe the proportion and population. It should not automatically say the intervention caused the behavior unless the design supports that conclusion. Practice rewriting one result without adding a causal claim."),
        ("Check your understanding", "text", "Before assessment, make sure you can distinguish a research report, journal, reviewer, author and reader, and explain why communicating limitations is part of scientific quality.")
    ],
    "Research Integrity Basics": [
        ("What research integrity means", "text", "Research integrity means doing research honestly, transparently and responsibly. It includes accurate recording, appropriate authorship, respect for participants, careful data handling, honest reporting and disclosure of important conflicts.\n\nFabrication means making up data. Falsification means manipulating research materials or results dishonestly. Plagiarism means presenting another person's work or ideas without appropriate attribution. These are serious because they damage the research record and can harm people."),
        ("Integrity starts before publication", "text", "Good integrity begins when the question is planned. Keep decisions documented. Do not remove inconvenient observations simply because they do not support a preferred story. Do not change the primary outcome after seeing results without transparently explaining the change. Protect participant confidentiality and follow approved procedures."),
        ("Worked scenario", "activity", "A student notices that several questionnaire responses are incomplete. The supervisor suggests deleting all incomplete responses without recording how many were removed. What should the student do? The correct approach is to document the issue, follow the analysis plan where possible, discuss appropriate handling with the research team, and report important exclusions transparently."),
        ("Authorship and contribution", "text", "Authorship should reflect meaningful scholarly contribution according to the relevant journal or institutional standards. People who helped with administration or general supervision may deserve acknowledgment rather than automatic authorship. Teams should discuss roles early and document contributions."),
        ("Check your understanding", "text", "Integrity is not simply “do not cheat.” It is a system of honest decisions that allows others to trust the research record.")
    ],
}


def lesson_content(title):
    if title in DEEP_LESSONS:
        base = DEEP_LESSONS[title][0][2]
        resources = [REFS["NIH Clinical Research"], REFS["NIH Educational Resources"]]
        if "Integrity" in title or "Ethic" in title:
            resources = [REFS["Rwanda Human Research Law"], REFS["NCST Regulations"], REFS["University of Rwanda Ethics"]]
        elif "Communication" in title or "Writing" in title or "Review" in title:
            resources = [REFS["EQUATOR"], REFS["EQUATOR Manual"], REFS["ICMJE"]]
        return base, resources
    if "Ethic" in title or "Protocol" in title or "Confidential" in title:
        return (f"{title} is best learned by connecting the concept to a real health-research decision. Start by defining the terms in simple language, then identify what information a researcher would need, what could go wrong, and what governance or ethical requirements apply.\n\nA practical test is to ask: What would I do before collecting data? What would I document? Who should review the decision? How would I protect participants, data and scientific integrity?\n\nUse the module objectives as your checklist and work through the Rwanda/Africa example before attempting the assessment.", [REFS["Rwanda Human Research Law"], REFS["NCST Regulations"], REFS["University of Rwanda Ethics"]])
    if "Reporting" in title or "Manuscript" in title or "Writing" in title or "Review" in title:
        return (f"This module teaches {title.lower()} from first principles. First understand the purpose of the process, then learn the main steps, then apply them to a realistic health-research example. A reporting guideline or publishing standard is a support tool; it does not replace scientific judgment.\n\nAs you study, keep asking: What is the research question? What evidence do I have? What can I reasonably claim? What information must another researcher see to understand what I did?\n\nFinish the worked example and the short practice task before taking the basic knowledge check.", [REFS["EQUATOR"], REFS["EQUATOR Manual"], REFS["ICMJE"]])
    if "AI" in title:
        return (f"{title} should be approached as a human-led research skill. AI may help with brainstorming, organization or language, but the researcher remains responsible for accuracy, confidentiality, attribution and scientific decisions.\n\nLearn the concept first, then test it on a safe example. For every AI-assisted output ask: Is it accurate? Can I verify it? Does it reveal confidential information? Who is responsible for the final claim?\n\nThe lesson is designed so you can understand the core principles without needing an external course.", [REFS["ICMJE AI"], REFS["CRediT"]])
    if "Systematic" in title or "Meta-analysis" in title or "Scoping" in title:
        return (f"{title} requires a transparent and reproducible process. Start with a clearly framed question, define eligibility criteria, search systematically, document screening, and interpret the findings in context. A pooled estimate is not automatically causal, important or applicable to every population.\n\nWork through a simple example before attempting the assessment. Focus first on understanding what each step is for and what a reader would need to see to trust the process.", [REFS["PRISMA"], REFS["EQUATOR"], REFS["NIH Clinical Research"]])
    return (f"{title} is a practical research skill. Begin with a plain-language definition, then connect it to a health-research question. Identify the key terms, explain why the skill matters, walk through a simple example, and finish by stating what you would do next in a real student research project.\n\nDo not start by memorizing advanced terminology. The Academy expects you to understand the concept, recognize a good example, avoid common mistakes and apply the idea to a realistic Rwanda/Africa context.\n\nUse the objectives as a checklist, complete the activity, and take the basic knowledge check only after you can explain the concept without notes.", [REFS["NIH Clinical Research"], REFS["NIH Educational Resources"]])


def add_lessons(module):
    resources = lesson_content(module.title)[1]
    specs = DEEP_LESSONS.get(module.title)
    if specs:
        lesson_specs = [(t, k, b) for t, k, b in specs]
        if len(lesson_specs) < 5:
            lesson_specs.append(("Further learning", "video", "Use the linked external learning resource for deeper study. External resources are optional; the Academy lesson remains the core learning material."))
    else:
        base_text, resources = lesson_content(module.title)
        lesson_specs = [
            ("Core concept", "text", base_text),
            ("Key ideas", "text", f"Break {module.title.lower()} into its essential parts. Define the important terms, explain why each part matters, and note one common mistake a beginner should avoid. Then connect the parts back to the research question.\n\nUse this lesson as a reference you can revisit while working on the example."),
            ("Worked example", "activity", f"Apply {module.title.lower()} to a realistic Rwanda/Africa health-research scenario. State the question or problem, explain the decision you would make, identify the evidence you would consult, and describe what you would do next."),
            ("Practice task", "activity", f"Write a short response showing how you would use {module.title.lower()} in a student research project. Keep the answer practical: what is the problem, what would you do, why, and what would you document?"),
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
                "estimated_minutes": 30 if kind in ("text", "video") else 40,
                "required": True,
                "active": True,
            },
        )


def add_quiz(module):
    quiz, _ = Quiz.objects.update_or_create(
        module=module,
        defaults={"title": f"{module.title} — Basic Knowledge Check", "pass_mark": 80, "attempts_allowed": 0},
    )
    # Keep a real question bank. The frontend randomly selects a different subset for each attempt.
    questions = [
        (f"What is the main purpose of learning {module.title.lower()}?", [f"To understand and apply the core idea in health research", "To memorize advanced statistical formulas immediately", "To choose results before collecting data", "To avoid documenting decisions"], 0, "The Academy first checks whether the learner understands the core concept and can apply it responsibly."),
        (f"What should a beginner do first when using {module.title.lower()}?", ["Define the problem or question clearly", "Choose a desired conclusion", "Skip the evidence review", "Copy another study without checking fit"], 0, "A clear problem or question gives the rest of the research process direction."),
        (f"Which action shows good practice in {module.title.lower()}?", ["Make decisions transparent and document important steps", "Change the method whenever results look inconvenient", "Ignore limitations", "Hide uncertainty"], 0, "Transparency and documentation make research easier to understand and evaluate."),
        (f"Which statement about {module.title.lower()} is safest for a beginner?", ["The method should match the research question and context", "One method is always correct", "A complicated method is always better", "Results should be selected before analysis"], 0, "Methods are chosen to fit the question, context, evidence and constraints."),
        ("What should you do when you are unsure about an important research statement?", ["Check an authoritative source or primary evidence", "Publish it without checking", "Remove the uncertainty from the report", "Ask an AI tool and accept its answer"], 0, "Verification is part of responsible research."),
        ("Why are limitations included in research reports?", ["To help readers judge how far the findings can be trusted", "To make the study look weak", "Because every paper must have negative results", "To replace the results section"], 0, "Limitations explain important uncertainty and boundaries around the findings."),
        ("Which is a better student research habit?", ["Keep a record of important decisions and changes", "Change plans secretly", "Delete inconvenient observations", "Avoid keeping notes"], 0, "A traceable record supports transparency and reproducibility."),
        ("Which statement best describes evidence?", ["Evidence should be judged for quality, relevance and limitations", "The most popular source is automatically best", "One source is enough for every question", "A citation automatically makes a claim true"], 0, "Evidence must be evaluated, not merely collected."),
        ("When should ethics and governance be considered?", ["During planning, before activities that require approval begin", "Only after publication", "Only if the results are interesting", "After participants are recruited"], 0, "Ethics and governance are planning issues, not end-stage paperwork."),
        ("What is the best way to use an external course in the Academy?", ["Use it for deeper learning while using the RSRE lesson as the core material", "Depend on it instead of reading the RSRE lesson", "Skip the RSRE assessment", "Copy its answers into the assessment"], 0, "External resources are supplementary; RSRE tests understanding and application."),
        (f"Which example shows application of {module.title.lower()}?", [f"Using the concept to make a defensible decision in a real health-research scenario", "Repeating the definition without understanding it", "Choosing a result because it looks impressive", "Avoiding a practical example"], 0, "Application means using the idea to make or explain a research decision."),
        ("What is the role of a knowledge check at this stage?", ["To confirm basic understanding before progressing", "To test whether the student already has a PhD", "To guarantee publication", "To replace practical work"], 0, "Early Academy assessments should confirm foundations, not require professional-level expertise."),
    ]
    quiz.questions.all().delete()
    for i, (prompt, choices, correct, explanation) in enumerate(questions, 1):
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
                    "pass_mark": level.required_pass_mark, "active": True, "order": level.number,
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
                    "pass_mark": pathway.required_pass_mark, "active": True, "order": 100 + pathway.id,
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
