from django.core.management.base import BaseCommand
from academy.models import Lesson
from academy.content_quality import lesson_content_quality

class Command(BaseCommand):
    help = "Audit RSRE Academy lesson depth without modifying learning data."

    def handle(self, *args, **options):
        lessons = Lesson.objects.filter(active=True).select_related("module", "module__level").order_by("module__level__number", "module__order", "order")
        counts = {"strong": 0, "acceptable": 0, "needs-development": 0}
        flagged = []
        for lesson in lessons:
            quality = lesson_content_quality(lesson)
            counts[quality["level"]] += 1
            if quality["level"] == "needs-development":
                flagged.append((lesson.module.level.number, lesson.module.title, lesson.order, lesson.title, quality["characters"], quality["words"]))
        self.stdout.write(f"Active lessons: {sum(counts.values())}")
        self.stdout.write(f"Strong: {counts['strong']} | Acceptable: {counts['acceptable']} | Needs development: {counts['needs-development']}")
        if flagged:
            self.stdout.write("\nLessons needing development:")
            for level, module, order, title, chars, words in flagged:
                self.stdout.write(f"L{level} | {module} | {order}. {title} | {chars} chars / {words} words")
