# RSRE Learning Engine V2

This layer deepens the existing Research Academy without replacing the current curriculum.

## Added capabilities

- Course containers tied to levels or specialist pathways.
- Explicit module prerequisite records.
- Graded practical assignments with multiple attempts and pass marks.
- Rubric criteria and per-criterion grading/feedback.
- Practical research labs with optional required status, attempts and grading.
- Automatic module completion now considers required lessons, quizzes, assignments and required labs.
- Automatic credential evaluation remains connected to level/pathway completion.
- Rule-driven Academy badges (`manual`, `module_completed`, `level_completed`, `course_completed`).
- Learner assignment submission history.
- Admin endpoints for creating assignments, defining prerequisites and grading submissions.
- Cohort, resource and WhatsApp support from the preceding RSRE enhancement layer remains intact.

## API additions

`GET /api/academy/courses/`

`GET /api/academy/courses/<id>/`

`POST /api/academy/assignments/<id>/submit/`

`GET /api/academy/assignments/my/`

`POST /api/academy/labs/<id>/submit/`

Admin:

`POST /api/academy/admin/assignments/`

`PATCH /api/academy/admin/assignments/submissions/<id>/grade/`

`POST /api/academy/admin/prerequisites/`

`DELETE /api/academy/admin/prerequisites/<id>/`

`PATCH /api/academy/admin/labs/submissions/<id>/grade/`

## Seed behavior

`python manage.py seed_academy` now also ensures:

- one Academy Course for each core level and specialist pathway;
- explicit sequential prerequisites;
- one applied research assignment per active module when none exists;
- a four-criterion rubric for generated assignments;
- one optional practical lab per active module when none exists;
- starter badge rules tied to key modules/levels.

`python manage.py sync_academy_resources` remains available for converting existing `resource_urls` into structured resources.

## Migration

New Academy migrations:

- `0007_learning_engine`
- `0008_practical_lab_assessment`

Apply them only after the existing RSRE/Academy migrations are in place.
