# n8n Template Listing - Invoice Intake Review Queue

## Template Name

Invoice Intake Review Queue

## Short Description

Turn extracted invoice records into a finance review queue with missing-field checks, duplicate-risk flags, low-confidence OCR flags, and approval candidates.

## Long Description

This n8n workflow helps founders, bookkeepers, finance ops teams, and agencies review invoices before they enter accounting or payment workflows.

It is designed for the common messy step after invoices arrive by email, upload, OCR, or parser: someone still needs to check vendor names, invoice numbers, dates, totals, purchase orders, extraction confidence, and duplicate risk before approving or paying anything.

The workflow does not pay invoices, approve expenses, create accounting entries, or make tax decisions. It prepares a structured human review queue so a finance owner can verify the invoice evidence and decide what happens next.

## What It Does

1. Runs manually or on a weekly schedule.
2. Starts with sample invoice records from email, OCR, upload, form, or accounting exports.
3. Normalizes invoice fields.
4. Checks required fields such as vendor name, invoice number, invoice date, and total.
5. Flags duplicate-risk invoices using vendor, invoice number, total, and currency.
6. Flags low extraction confidence and missing PO/due-date warnings.
7. Builds a sorted finance review queue and final report object.
8. Leaves the output ready for Slack, email, Notion, Airtable, Google Sheets, ClickUp, QuickBooks, Xero, or a finance dashboard.

## Example Output

```json
{
  "reportTitle": "Invoice Intake Review Queue - 2 need fixes of 3 invoices",
  "reportSummary": "Reviewed 3 invoices. Needs fix: 2. Duplicate risk: 1. Low confidence: 1. Missing PO: 1.",
  "reviewQueue": [
    {
      "id": "INV-1003",
      "vendorName": "(missing vendor)",
      "invoiceNumber": "(missing invoice number)",
      "total": 99.9,
      "currency": "USD",
      "reviewStatus": "needs_fix",
      "riskScore": 80,
      "issues": [
        "Missing vendor name",
        "Missing invoice number",
        "Low extraction confidence"
      ],
      "warnings": [
        "Missing purchase order number",
        "Missing due date"
      ],
      "suggestedOwner": "Finance Ops"
    }
  ],
  "duplicateRisk": [
    {
      "id": "INV-1002",
      "duplicateOf": "INV-1001",
      "invoiceNumber": "NH-2026-0421",
      "total": 240,
      "currency": "USD"
    }
  ]
}
```

## Requirements

- n8n
- Invoice records from OCR, parser, email import, form submission, spreadsheet, or accounting export
- A human finance reviewer

## Setup

1. Import `invoice-intake-review-queue.n8n.json`.
2. Edit the "Invoice Intake Input" node:
   - `invoices`
   - `autoApproveBelow`
   - `defaultCurrency`
   - `reviewOwner`
   - `lowConfidenceThreshold`
   - `duplicateWindowDays`
3. Run manually once with sample invoices.
4. Replace sample input with your real upstream source.
5. Connect the final report node to Slack, email, Notion, Airtable, Google Sheets, ClickUp, QuickBooks, Xero, or your finance dashboard.
6. Keep invoice approval and payment human-reviewed.

## Safety Notes

- Do not auto-pay invoices from this workflow.
- Do not treat the output as tax, legal, or accounting advice.
- Verify vendors, bank details, PO numbers, amounts, and approvals before payment.
- Use dedupe checks as a review signal, not as a final accounting decision.

## Tags

n8n, invoice automation, accounts payable, bookkeeping, finance ops, AP review, duplicate detection, OCR review, human review, accounting workflow
