# Run this script from the RSRE project root on a scheduler such as Windows Task Scheduler.
Set-Location "$PSScriptRoot\..\backend"
python manage.py sync_opportunities
