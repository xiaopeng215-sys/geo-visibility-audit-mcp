# GEO Visibility Audit MCP

Audit pasted HTML for GEO, AI-search visibility, entity clarity, answer readiness, schema gaps, prompt coverage, and third-party trust signals.

This server is useful for marketers, SEO freelancers, SaaS founders, and content teams preparing pages for ChatGPT, Perplexity, Gemini, Claude, Google AI Overviews, and other AI-assisted discovery flows.

It is built for teams seeing the new SEO pattern: rankings may still look healthy, but AI Overviews, answer engines, and zero-click search make visibility harder to explain. The server returns practical page-level fixes instead of a black-box score.

## Tools

- `audit_geo_html`: audit one pasted HTML page.
- `summarize_geo_audits`: summarize multiple GEO audit results.

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

- AI citation readiness score
- entity clarity findings
- answer-readiness gaps
- schema recommendations
- FAQ and comparison coverage gaps
- third-party trust surface gaps
- buyer prompt ideas
- prioritized fix list
- accuracy caveats

## Hosted Batch Version

For URL fetching, batch audits, and marketplace billing, use the hosted Apify Actor:

https://apify.com/jumpy_invoice/geo-visibility-audit-intelligence

## n8n Workflow

This repo also includes a ready-to-import n8n workflow:

`workflows/weekly-geo-visibility-audit.n8n.json`

Use it to run weekly GEO readiness audits through the hosted Apify Actor and prepare a compact fix report for Slack, email, Notion, Airtable, Google Sheets, or a client update.

## Accuracy Notes

- This is a deterministic readiness audit, not a live AI ranking tracker.
- Do not claim guaranteed rankings, citations, traffic, or revenue.
- AI answer inclusion varies by prompt, model, time, location, and personalization.
- Treat Reddit, G2, YouTube, directories, reviews, and community mentions as trust surfaces, not spam targets.

## License

MIT
