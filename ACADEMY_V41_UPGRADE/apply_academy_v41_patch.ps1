$ErrorActionPreference = 'Stop'
$backend = Split-Path -Parent $PSScriptRoot
$views = Join-Path $backend 'academy\views.py'
$commands = Join-Path $backend 'academy\management\commands'
$source = Join-Path $PSScriptRoot 'backend_patch\academy\management\commands\upgrade_academy_v41.py'

if (-not (Test-Path $views)) { throw "Could not find academy/views.py. Run this script from the backend folder or set the path correctly." }

# Backup current view file before patching.
Copy-Item $views "$views.v40-backup" -Force

$text = Get-Content -LiteralPath $views -Raw
$pattern = '(?s)class SubmitQuizView\(APIView\):.*?(?=\n\nclass CohortListView\(APIView\):)'
$replacement = @'
class SubmitQuizView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, pk):
        quiz = get_object_or_404(
            Quiz.objects.select_related("module", "module__level", "module__pathway").prefetch_related("questions__choices"),
            pk=pk,
        )
        if not module_unlocked(request.user, quiz.module):
            return Response({"detail": "This module is locked."}, status=403)

        answers = request.data.get("answers") or {}
        questions = list(quiz.questions.all())
        selected_ids = {str(k) for k in answers.keys()}
        selected = [q for q in questions if str(q.id) in selected_ids]

        if not selected:
            return Response({"detail": "Please answer at least one question."}, status=400)

        correct = 0
        per_question = []
        for q in selected:
            expected = {str(c.id) for c in q.choices.filter(is_correct=True)}
            supplied = answers.get(str(q.id), answers.get(q.id, []))
            if not isinstance(supplied, list):
                supplied = [supplied]
            supplied = {str(v) for v in supplied}
            is_correct = supplied == expected
            correct += int(is_correct)
            per_question.append({"question": q.id, "correct": is_correct, "explanation": q.explanation})

        score = round(100 * correct / len(selected), 2)
        passed = score >= quiz.pass_mark
        QuizAttempt.objects.create(user=request.user, quiz=quiz, score=score, passed=passed, answers=answers)
        if passed:
            issue_completed_credentials(request.user)
            notify_academy(request.user, "Research Academy - quiz passed", f"You passed {quiz.title} with {score:.0f}%. Your next required learning is now available.", "/research-academy", "Continue learning")
        else:
            notify_academy(request.user, "Research Academy - quiz attempt", f"You scored {score:.0f}% on {quiz.title}. The required pass mark is {quiz.pass_mark}%. Review the lesson material and try again.", f"/research-academy/module/{quiz.module.id}", "Review module")
        return Response({"score": float(score), "passed": passed, "pass_mark": quiz.pass_mark, "results": per_question, "questions_answered": len(selected)})
'@

if ($text -notmatch $pattern) { throw 'Could not locate the existing SubmitQuizView block. No view changes were written.' }
$text = [regex]::Replace($text, $pattern, $replacement, 1)
Set-Content -LiteralPath $views -Value $text -Encoding utf8

New-Item -ItemType Directory -Force $commands | Out-Null
Copy-Item $source (Join-Path $commands 'upgrade_academy_v41.py') -Force

Write-Host 'Academy V41 backend patch applied.' -ForegroundColor Green
Write-Host 'Backup:' $views'.v40-backup'
Write-Host 'Next: python manage.py check, then python manage.py upgrade_academy_v41' -ForegroundColor Cyan
