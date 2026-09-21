# RSRE Google Discoverability Audit — 2026-09-21

## Current findings

- Active frontend architecture is the root `pages/` + `components/` tree with Django in `backend/`.
- Current source had no dedicated `robots.txt` or `sitemap.xml` implementation.
- Current `_app.tsx` had no global search metadata layer.
- `pages/articles/[id].tsx` currently fetches article data in the browser; public articles are therefore not yet ideal for search indexing because their main content is not server-rendered.
- Public Passport pages already use `getServerSideProps` and page-specific `<Head>` metadata; the SEO layer intentionally leaves those pages alone.
- The backend/article permission design allows unauthenticated reads only for published articles, so the sitemap must only enumerate published article IDs.
- Private workspaces must not be advertised in the sitemap.

## Changes in this patch

1. Adds a Pages Router `robots.txt` route.
2. Adds a Pages Router `sitemap.xml` route.
3. Adds route-aware global metadata and robots directives.
4. Adds homepage Organization JSON-LD.
5. Adds canonical URLs and Open Graph metadata for public pages.
6. Adds a dynamic sitemap section for published articles when `NEXT_PUBLIC_API_URL` is configured.
7. Deliberately does not rewrite the article page automatically because its current implementation is more sensitive and should be upgraded without replacing other recent changes.
8. Leaves public Passport metadata implementation intact.

## Production requirement

This patch cannot make Google index the site while the production server itself is unavailable. As of the audit check on 2026-09-21, the external checker received HTTP 503 from `https://rsre-frontend.onrender.com/`.

After deployment, verify:

- https://rsre-frontend.onrender.com/
- https://rsre-frontend.onrender.com/robots.txt
- https://rsre-frontend.onrender.com/sitemap.xml

Then use the already-verified Google Search Console property to submit `sitemap.xml` and inspect/request indexing for the homepage and important public article URLs.

Google recommends using URL Inspection to test how Google sees a page and submitting a sitemap to help keep Google informed of URLs; crawling/re-indexing can take time and is not guaranteed. See Google Search Central documentation.
