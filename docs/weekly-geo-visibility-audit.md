# n8n Template Listing - Weekly GEO Visibility Audit

## Template Name

Weekly GEO Visibility Audit Report with Apify

## Short Description

Run a weekly AI-search readiness audit for your brand pages using Apify, then prepare a practical fix report for your team.

## Long Description

This n8n workflow helps marketers, founders, and SEO teams monitor whether key brand pages are ready for AI search visibility, especially when classic SEO rankings still look healthy but clicks, mentions, and AI citations feel harder to explain.

The workflow sends your brand, category, competitors, buyer prompts, and page URLs to the hosted `GEO Visibility Audit Intelligence` Apify Actor. The Actor returns page-level GEO readiness scores, entity clarity findings, answer-readiness gaps, schema recommendations, third-party trust gaps, buyer prompt ideas, and prioritized fixes.

Use this as a lightweight first step before buying a full GEO dashboard or building custom AI visibility tracking. It is designed to produce "what should we fix this week?" output, not just another score.

## What It Does

1. Runs on a weekly schedule or manual trigger.
2. Builds the GEO audit input.
3. Calls the Apify Actor.
4. Converts the dataset result into a compact report object.
5. Leaves the report ready for Slack, email, Notion, Airtable, Google Sheets, or a client update.

## Example Output

```json
{
  "brandName": "Acme CRM",
  "website": "https://example.com",
  "auditedPages": 3,
  "averageScore": 72,
  "weakPages": [
    {
      "url": "https://example.com/pricing",
      "score": 61,
      "topIssue": "Pricing page lacks a direct answer for who should choose this product."
    }
  ],
  "topIssues": [
    "Category language changes across pages",
    "No FAQPage schema found",
    "Comparison and alternatives coverage is thin",
    "Third-party proof is not surfaced near buyer-intent pages"
  ],
  "recommendedNextFixes": [
    "Add a 40-60 word answer block near the top of the homepage",
    "Add FAQ sections to pricing and comparison pages",
    "Create or improve alternative/comparison content for buyer prompts",
    "Surface credible reviews, case studies, directory listings, or community proof"
  ],
  "buyerPrompts": [
    "best CRM for small marketing agencies",
    "Acme CRM vs HubSpot for agencies",
    "CRM with client reporting for agencies"
  ],
  "accuracyNote": "This is a readiness audit based on page signals, not a live AI ranking or citation guarantee."
}
```

## Requirements

- n8n
- Apify account
- Apify API token stored in an environment variable named `APIFY_TOKEN`
- Published Actor: `jumpy_invoice/geo-visibility-audit-intelligence`

## Setup

1. Import `weekly-geo-visibility-audit.n8n.json`.
2. Set `APIFY_TOKEN` in your n8n environment.
3. Edit the "Audit Input" node:
   - `brandName`
   - `website`
   - `category`
   - `competitors`
   - `buyerPrompts`
   - `pageUrls`
   - `targetAudience`
4. Run manually once.
5. Connect the final report node to Slack, email, Notion, Airtable, or Google Sheets if desired.

## Monetization Note

The Apify Actor uses pay-per-event pricing:

- Event: `geo-visibility-audit`
- Price: `$0.03` per audit
- Pricing effective time: `2026-06-07 22:22` Asia/Shanghai
- Public URL: https://apify.com/jumpy_invoice/geo-visibility-audit-intelligence

## Tags

n8n, Apify, GEO, AI search, SEO, marketing automation, weekly report, ChatGPT visibility, Google AI Overview
