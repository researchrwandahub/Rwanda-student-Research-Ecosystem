from django.core.management.base import BaseCommand
from academy.models import Lesson, LessonResource

class Command(BaseCommand):
    help='Create structured LessonResource rows from existing lesson resource_urls.'
    def handle(self,*args,**kwargs):
        created=0
        for lesson in Lesson.objects.all():
            for idx,item in enumerate(lesson.resource_urls or [],1):
                if isinstance(item, str):
                    title=item.rsplit('/',1)[-1] or f'Resource {idx}'
                    rtype='reading'
                    url=item
                elif isinstance(item, dict):
                    title=item.get('title') or item.get('name') or f'Resource {idx}'
                    rtype=item.get('resource_type') or item.get('type') or 'reading'
                    url=item.get('url') or ''
                else:
                    continue
                obj,was=LessonResource.objects.get_or_create(lesson=lesson,url=url,title=title,defaults={'resource_type':rtype,'order':idx,'active':True})
                created += int(was)
        self.stdout.write(self.style.SUCCESS(f'Academy resources synchronized: {created} new resource records.'))
