# n8n Template Listing - Weekly GEO Visibility Audit

## Template Name

Weekly AI Search Fix Report with Apify

## Short Description

Send your team a weekly report showing which brand pages need clearer answers, schema, comparisons, and proof.

## Long Description

Search reports often tell you what happened last month. This workflow is built for the practical question that comes next: what should the team fix this week so important pages are easier to understand, quote, and compare in AI-assisted search?

The workflow sends your brand, category, competitors, buyer prompts, and page URLs to the hosted `GEO Visibility Audit Intelligence` Apify Actor. It returns a compact report with weak pages, repeated content gaps, missing schema, thin comparison coverage, missing buyer questions, and proof gaps.

Use it as a lightweight weekly check before paying for a full GEO dashboard or building custom monitoring. It is best for teams that need an action list, not another passive score.

## What It Does

1. Runs on a weekly schedule or manual trigger.
2. Builds the audit input for your brand, competitors, prompts, and pages.
3. Validates the setup before calling Apify, so missing URLs or tokens fail early.
4. Calls the Apify Actor.
5. Converts the dataset result into a ranked Markdown fix report.
6. Splits healthy audits from pages that need review.
7. Optionally sends the full report to Slack when a webhook URL is configured.
8. Leaves a manual delivery output for email, Notion, Airtable, Google Sheets, or a client update.

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
5. Optional: add a Slack incoming webhook URL in the "Audit Input" node.
6. Run manually once, then enable the weekly schedule.
7. Use the final Markdown output in email, Notion, Airtable, Google Sheets, or a client update.

## Hosted Actor

This workflow uses the published Apify Actor:

https://apify.com/jumpy_invoice/geo-visibility-audit-intelligence

## Tags

n8n, Apify, AI search, SEO, marketing automation, weekly report, GEO, content audit, Google AI Overview
