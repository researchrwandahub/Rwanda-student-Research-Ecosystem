# RSRE V44 Support Payments

Includes the V43 manual Mobile Money and Bank Transfer support system plus a working backend installer.

## Manual support now
- MTN MoMo display number
- Airtel Money display number
- Bank name/account/branch/SWIFT
- payer details, amount, method, reference and proof upload
- admin verification/rejection

## Automated MTN
The server-side endpoint remains gated until merchant/API credentials are configured. Do not put provider secrets in the frontend.

## Apply
Run from `RSRE\backend`:

`powershell.exe -ExecutionPolicy Bypass -File .\RSRE_V44_SUPPORT\apply_support_payments_v44.ps1`

Then:

`python manage.py makemigrations rsre_payments`

`python manage.py migrate`

`python manage.py check`
