# n8n Template Listing - Weekly Support Triage Review

## Template Name

Weekly Support Triage Review with Apify

## Short Description

Analyze support tickets with Apify, then prepare a human review queue with urgent escalations, reply drafts, and FAQ candidates.

## Long Description

This n8n workflow helps founders, small SaaS teams, ecommerce operators, and support agencies review messy support tickets before they reach a human queue.

The workflow sends ticket records to the hosted `Support Triage Intelligence` Apify Actor. The Actor returns priority, category, sentiment, escalation recommendations, next actions, reply drafts, and FAQ candidates. n8n then converts those results into a compact review report that can be sent to Slack, email, ClickUp, Notion, Airtable, Google Sheets, or a support lead.

This is designed for human-in-the-loop triage. It does not auto-send replies to customers. Use it when you want lower support triage cost without handing your customers to a fully autonomous bot.

The workflow includes sticky notes and node-level notes so new users can understand the setup, safety boundary, and output routing directly on the n8n canvas.

## What It Does

1. Runs on a weekly schedule or manual trigger.
2. Builds a batch of support ticket records.
3. Calls the Apify `Support Triage Intelligence` Actor.
4. Creates an escalation queue for urgent, angry, billing, access, legal, refund, or risk-heavy tickets.
5. Creates a reply review queue for human approval.
6. Extracts FAQ/knowledge-base candidates from repeated support questions.
7. Leaves the report ready for Slack, email, ClickUp, Notion, Airtable, or Google Sheets.

## Example Output

```json
{
  "reportTitle": "Weekly Support Triage Review - 1 urgent of 2 tickets",
  "reportSummary": "Analyzed 2 tickets. Urgent/escalation: 1. Negative sentiment: 1. Top category: billing",
  "escalationQueue": [
    {
      "id": "T-1001",
      "customerName": "Jordan Lee",
      "subject": "Charged twice and still cannot access my account",
      "priority": "urgent",
      "priorityScore": 100,
      "category": "billing",
      "reason": "High priority score from urgency, business impact, billing/access, or customer frustration."
    }
  ],
  "replyReviewQueue": [
    {
      "id": "T-1001",
      "subject": "Charged twice and still cannot access my account",
      "priority": "urgent",
      "category": "billing",
      "draftSubject": "Priority support update: Charged twice and still cannot access my account"
    }
  ],
  "faqCandidates": [
    {
      "id": "T-1002",
      "question": "How do I export invoices?",
      "reuseScore": "high"
    }
  ]
}
```

## Requirements

- n8n
- Apify account
- Apify API token stored in an environment variable named `APIFY_TOKEN`
- Published Actor: `jumpy_invoice/support-triage-intelligence`

## Setup

1. Import `support-triage-weekly-review.n8n.json`.
2. Set `APIFY_TOKEN` in your n8n environment.
3. Edit the "Support Tickets Input" node:
   - `tickets`
   - `defaultLanguage`
   - `brandVoice`
   - `businessContext`
   - `replySignature`
   - `includeReplyDraft`
   - `includeFaqCandidates`
4. Run manually once with sample tickets.
5. Connect the final report node to Slack, email, ClickUp, Notion, Airtable, or Google Sheets.
6. Keep customer replies human-reviewed. Do not connect this template directly to an auto-send email node unless you add your own approval gate.

## Monetization Note

The Apify Actor uses pay-per-event pricing:

- Event: `support-ticket-analysis`
- Price: `$0.02` per ticket analysis
- Pricing effective time: `2026-06-07 21:48` Asia/Shanghai
- Public URL: https://apify.com/jumpy_invoice/support-triage-intelligence

## Tags

n8n, Apify, support automation, ticket triage, customer support, Zendesk, Gmail, Help Scout, ecommerce support, human review
