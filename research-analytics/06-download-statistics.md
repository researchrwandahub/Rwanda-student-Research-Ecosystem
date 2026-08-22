# Download Statistics

Purpose

Track how often PDFs or article pages are downloaded to understand readership.

Metrics

- Downloads per article (total and by period)
- Downloads by country or region (if geolocation data is available)
- Top downloaded articles

Implementation notes

- For static site: track clicks on download links and save counts in localStorage (temporary) or via analytics events.
- For backend: store download counts in the article model and expose via API.

Visuals

- Top-10 downloads chart
- Heatmap of downloads by country (when data available)