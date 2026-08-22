from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Module, ModuleCertificate
from .completion_v45 import is_module_unlocked, finalize_module


class AcademyModuleFinalizeViewV45(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        module = get_object_or_404(Module, pk=pk, active=True)
        return Response(finalize_module(request.user, module))


class AcademyProgressionViewV45(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        rows = []
        modules = Module.objects.filter(active=True, required=True).select_related("level", "pathway").order_by("level__number", "order", "id")
        for module in modules:
            completed = ModuleCertificate.objects.filter(user=request.user, module=module, status="valid").exists()
            rows.append({
                "id": module.id,
                "level": module.level.number,
                "title": module.title,
                "order": module.order,
                "completed": completed,
                "unlocked": completed or is_module_unlocked(request.user, module),
                "url": f"/research-academy/module/{module.id}",
            })
        return Response({"modules": rows})
