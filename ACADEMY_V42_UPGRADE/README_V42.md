# RSRE Research Academy V42 — Module completion, certificates and badges

## Student experience
- At the end of an unlocked module, the learner can download a PDF containing the module teaching content and assessment questions.
- Passing the module assessment continues to use the existing Academy credential service. Module certificates are issued when the module is actually completed.
- Eligible module badges are awarded by the existing Badge/UserBadge rule engine.
- Learners can download a certificate PDF and a shareable SVG badge from the module page and Certificates page.

## Admin experience
- Existing module/lesson editor remains the source of truth for learning content.
- Academy Admin now includes badge management: name, icon, description, trigger type/value and active state.
- Existing CertificateSettings controls certificate branding/signatory/template.

## Apply backend patch
1. Copy/extract `ACADEMY_V42_UPGRADE` into the RSRE root.
2. From `RSRE\backend`, run the included `apply_academy_v42_patch.ps1`.
3. Install ReportLab in the same Python environment if needed: `python -m pip install reportlab`.
4. Run `python manage.py check`.
5. Run `python manage.py seed_academy_module_badges`.
6. Restart Django.

No database migration is required for V42 because Badge, UserBadge and ModuleCertificate already exist in the Academy model.
