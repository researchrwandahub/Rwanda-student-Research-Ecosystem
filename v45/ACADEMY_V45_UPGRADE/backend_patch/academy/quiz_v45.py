from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Quiz, QuizAttempt
from .completion_v45 import is_module_unlocked, finalize_module
from .services import notify_academy


class SubmitQuizViewV45(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, pk):
        quiz = get_object_or_404(
            Quiz.objects.select_related("module", "module__level", "module__pathway").prefetch_related("questions__choices"),
            pk=pk,
        )
        if not is_module_unlocked(request.user, quiz.module):
            return Response({"detail": "This module is locked."}, status=403)

        answers = request.data.get("answers") or {}
        if not isinstance(answers, dict) or not answers:
            return Response({"detail": "Answer at least one question."}, status=400)

        all_questions = {str(q.id): q for q in quiz.questions.all()}
        selected_ids = [str(qid) for qid in answers.keys() if str(qid) in all_questions]
        if not selected_ids:
            return Response({"detail": "No valid questions were submitted."}, status=400)

        correct = 0
        results = []
        for qid in selected_ids:
            q = all_questions[qid]
            expected = {str(c.id) for c in q.choices.all() if c.is_correct}
            supplied = answers.get(qid, answers.get(str(qid), []))
            if not isinstance(supplied, list):
                supplied = [supplied]
            supplied = {str(v) for v in supplied}
            ok = supplied == expected
            correct += int(ok)
            results.append({"question": q.id, "correct": ok, "explanation": q.explanation})

        score = round(100 * correct / len(selected_ids), 2)
        passed = score >= quiz.pass_mark
        attempt = QuizAttempt.objects.create(user=request.user, quiz=quiz, score=score, passed=passed, answers=answers)

        completion = None
        if passed:
            completion = finalize_module(request.user, quiz.module)
            notify_academy(
                request.user,
                "Research Academy — assessment passed",
                f"You scored {score:.0f}% on {quiz.title}.",
                f"/research-academy/module/{quiz.module.id}",
                "View result",
            )
        else:
            notify_academy(
                request.user,
                "Research Academy — assessment result",
                f"You scored {score:.0f}% on {quiz.title}. Review the lessons and try another question set.",
                f"/research-academy/module/{quiz.module.id}",
                "Try again",
            )

        return Response({
            "attempt_id": attempt.id,
            "score": float(score),
            "passed": passed,
            "pass_mark": quiz.pass_mark,
            "question_count": len(selected_ids),
            "results": results,
            "completion": completion,
        })
