# GEO Visibility Audit MCP Launch Guide

## Server Name

GEO Visibility Audit MCP

## Repository

https://github.com/xiaopeng215-sys/geo-visibility-audit-mcp

## Category

Marketing

## Pricing

Free local MCP server.

Hosted batch audits are available through the paid Apify Actor:

https://apify.com/jumpy_invoice/geo-visibility-audit-intelligence

## Short Description

Audit pasted HTML for AI-search readiness, entity clarity, answer readiness, schema gaps, buyer prompts, and third-party trust signals.

## Long Description

GEO Visibility Audit MCP helps marketers, SEO freelancers, founders, and content teams understand whether their pages are ready to be cited, summarized, and recommended by AI search systems such as ChatGPT, Perplexity, Gemini, Claude, and Google AI Overviews.

It is built for teams seeing the new SEO pattern: rankings may still look healthy, but AI Overviews, answer engines, and zero-click search make visibility harder to explain. Instead of giving another abstract visibility dashboard, it turns pasted page HTML into specific fixes: clearer entity language, better answer blocks, missing schema, stronger comparison coverage, and third-party trust signals.

This is a deterministic readiness audit, not a live AI ranking tracker. It does not guarantee rankings, citations, traffic, or revenue.

## Tools

- `audit_geo_html`: audits one pasted HTML page for GEO and AI-search readiness.
- `summarize_geo_audits`: summarizes multiple GEO audit outputs into average score, weak pages, top issues, recommended prompts, and next focus.

## Install Command

```bash
npx -y github:xiaopeng215-sys/geo-visibility-audit-mcp
```

## Local Development

```bash
git clone https://github.com/xiaopeng215-sys/geo-visibility-audit-mcp.git
cd geo-visibility-audit-mcp
npm install
npm test
npm start
```

## Example Prompt

```text
Audit this landing page for AI-search visibility. Return entity clarity, answer readiness, schema gaps, buyer prompts, third-party trust gaps, and prioritized fixes.
```

## Tags

GEO, AI search, SEO, ChatGPT visibility, Perplexity visibility, Google AI Overview, content audit, schema, marketing, prompt research

## Safety Notes

- Do not claim guaranteed AI answer placement.
- Do not automate spam posting to Reddit or review platforms.
- Treat third-party trust surfaces as legitimate proof-building opportunities.
- Explain that AI answer inclusion varies by prompt, model, time, location, and personalization.
