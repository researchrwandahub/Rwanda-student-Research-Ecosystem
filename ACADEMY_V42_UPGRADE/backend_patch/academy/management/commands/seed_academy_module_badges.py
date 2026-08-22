from django.core.management.base import BaseCommand
from academy.models import Badge, Module

class Command(BaseCommand):
    help='Create or update one achievement badge for every active Academy module.'
    def handle(self,*args,**kwargs):
        created=updated=0
        for module in Module.objects.filter(active=True).order_by('level__number','pathway_id','order'):
            code=f'module-{module.slug}-complete'[:180]
            obj,is_new=Badge.objects.get_or_create(code=code, defaults={
                'name':f'{module.title} — Module Completed',
                'description':f'Awarded for completing the required learning and assessment for {module.title}.',
                'icon':'🏅','trigger_type':'module_completed','trigger_value':module.slug,'active':True,
            })
            if not is_new:
                changed=False
                for field,value in {'trigger_type':'module_completed','trigger_value':module.slug,'active':True}.items():
                    if getattr(obj,field)!=value: setattr(obj,field,value); changed=True
                if changed: obj.save(update_fields=['trigger_type','trigger_value','active']); updated+=1
            else: created+=1
        self.stdout.write(self.style.SUCCESS(f'Module badges ready. Created {created}, updated {updated}.'))
