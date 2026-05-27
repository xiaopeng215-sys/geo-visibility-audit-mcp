# GEO Visibility Audit MCP

Find the page fixes that make a brand easier to understand, quote, and compare in AI search results.

This MCP server turns pasted page HTML into a practical review for marketers, SEO freelancers, SaaS founders, and content teams. It is built for the moment when a page looks fine in classic SEO tools, but still feels hard for answer engines to summarize, compare, or recommend.

Use it before a content refresh, client audit, product page rewrite, or GEO sales call. The output is meant to become a fix list, not another dashboard nobody opens.

## Tools

- `audit_geo_html`: audit one pasted HTML page.
- `summarize_geo_audits`: summarize multiple GEO audit results.

## Run With npx

```bash
npx -y geo-visibility-audit-mcp
```

## Run From GitHub

```bash
npx -y github:xiaopeng215-sys/geo-visibility-audit-mcp
```

## Local Install

```bash
git clone https://github.com/xiaopeng215-sys/geo-visibility-audit-mcp.git
cd geo-visibility-audit-mcp
npm install
```

## Run

```bash
npm start
```

## Example Tool Input

```json
{
  "html": "<html><head><title>Acme CRM for Agencies</title></head><body><h1>Acme CRM</h1><p>Acme CRM is a CRM for small agencies...</p></body></html>",
  "url": "https://example.com/",
  "brandName": "Acme CRM",
  "category": "CRM for small agencies",
  "competitors": ["HubSpot", "Pipedrive"],
  "buyerPrompts": ["best CRM for small marketing agencies"],
  "targetAudience": "small marketing agencies"
}
```

## Output

The audit returns:

- page readiness score
- entity and positioning gaps
- answer-block opportunities
- schema recommendations
- FAQ and comparison coverage gaps
- off-page trust surfaces to strengthen
- buyer prompt angles worth testing
- prioritized rewrite and technical fixes
- caveats for human review

## Hosted Batch Version

For URL fetching, batch audits, and marketplace billing, use the hosted Apify Actor:

https://apify.com/jumpy_invoice/geo-visibility-audit-intelligence

## n8n Workflows

This repo also includes ready-to-import n8n workflows:

- `workflows/weekly-geo-visibility-audit.n8n.json`
- `workflows/support-triage-weekly-review.n8n.json`
- `workflows/invoice-intake-review-queue.n8n.json`

Use the GEO workflow to run weekly GEO readiness audits through the hosted Apify Actor and prepare a compact fix report for Slack, email, Notion, Airtable, Google Sheets, or a client update.

Use the support triage workflow to analyze support tickets through the hosted Support Triage Intelligence Actor and prepare a human review queue with urgent escalations, reply drafts, FAQ candidates, and next actions.

Use the invoice intake workflow to turn extracted invoice records into a finance review queue with missing-field checks, duplicate-risk flags, low-confidence OCR flags, and approval candidates.

## Accuracy Notes

- This is a deterministic readiness audit, not a live AI ranking tracker.
- It does not guarantee rankings, citations, traffic, or revenue.
- AI answer inclusion changes by prompt, model, time, location, and personalization.
- Treat Reddit, G2, YouTube, directories, reviews, and community mentions as trust surfaces, not spam targets.

## License

MIT
