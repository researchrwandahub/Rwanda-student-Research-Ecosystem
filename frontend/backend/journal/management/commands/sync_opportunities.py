from datetime import datetime
from urllib.request import Request, urlopen
import json

from django.core.management.base import BaseCommand
from django.utils import timezone

from journal.models import ResearchOpportunity


GRANTS_SEARCH_URL = "https://api.grants.gov/v1/api/search2"
KEYWORDS = ["health", "medical", "public health", "research", "global health"]


def parse_date(value):
    if not value:
        return None
    for fmt in ("%m/%d/%Y", "%Y-%m-%d"):
        try:
            return datetime.strptime(value, fmt).date()
        except ValueError:
            pass
    return None


class Command(BaseCommand):
    help = "Synchronize automatically imported research opportunities from public opportunity APIs."

    def handle(self, *args, **options):
        total = 0
        seen = set()
        for keyword in KEYWORDS:
            payload = {
                "rows": 50,
                "keyword": keyword,
                "oppStatuses": "posted|forecasted",
            }
            request = Request(
                GRANTS_SEARCH_URL,
                data=json.dumps(payload).encode("utf-8"),
                headers={
                    "Content-Type": "application/json",
                    "User-Agent": "RSRE-Research-Opportunities/1.0",
                },
            )
            try:
                with urlopen(request, timeout=20) as response:
                    data = json.loads(response.read().decode("utf-8"))
            except Exception as exc:
                self.stderr.write(f"Grants.gov sync failed for '{keyword}': {exc}")
                continue

            for record in (data.get("data", {}).get("oppHits", []) or []):
                external_id = str(record.get("id") or record.get("number") or "").strip()
                if not external_id or external_id in seen:
                    continue
                seen.add(external_id)
                title = (record.get("title") or "Research opportunity").strip()
                agency = (record.get("agencyName") or "").strip()
                kind = "Grant / Funding" if record.get("docType") == "synopsis" else "Research Opportunity"
                description = "Automatically updated opportunity."
                if agency:
                    description += f" Provider: {agency}."
                close_date = parse_date(record.get("closeDate"))
                opportunity_id = record.get("id")
                detail_url = ""
                if opportunity_id:
                    detail_url = f"https://www.grants.gov/search-results-detail/{opportunity_id}"

                ResearchOpportunity.objects.update_or_create(
                    source_name="Grants.gov",
                    external_id=external_id,
                    defaults={
                        "title": title,
                        "kind": kind,
                        "description": description,
                        "url": detail_url,
                        "deadline": close_date,
                        "active": True,
                        "source_type": "automatic",
                        "last_synced_at": timezone.now(),
                    },
                )
                total += 1

        self.stdout.write(self.style.SUCCESS(f"Research opportunity sync complete: {total} records processed."))
