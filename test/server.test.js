import { test } from 'node:test';
import assert from 'node:assert/strict';
import { handleToolCall, tools } from '../src/server.js';

test('lists GEO audit tools', () => {
  assert.deepEqual(tools.map((tool) => tool.name), ['audit_geo_html', 'summarize_geo_audits']);
});

test('audits pasted HTML', async () => {
  const result = await handleToolCall('audit_geo_html', {
    brandName: 'Acme CRM',
    category: 'CRM for small agencies',
    competitors: ['HubSpot'],
    buyerPrompts: ['best CRM for small marketing agencies'],
    targetAudience: 'small marketing agencies',
    html: `
      <html>
        <head>
          <title>Acme CRM for Small Marketing Agencies</title>
          <script type="application/ld+json">{"@context":"https://schema.org","@type":"SoftwareApplication","name":"Acme CRM"}</script>
        </head>
        <body>
          <h1>Acme CRM for Small Marketing Agencies</h1>
          <p>Acme CRM is a CRM for small agencies that helps small marketing agencies manage follow-up, reporting, and client pipelines.</p>
          <h2>What is Acme CRM best for?</h2>
          <h2>How does Acme CRM compare with HubSpot?</h2>
          <h2>Frequently asked questions</h2>
          <p>Customer reviews and case studies show how agencies use Acme CRM.</p>
        </body>
      </html>
    `,
  });
  const audit = JSON.parse(result.content[0].text);

  assert.equal(audit.brandName, 'Acme CRM');
  assert.ok(audit.score > 50);
  assert.ok(audit.recommendedPrompts.some((prompt) => prompt.includes('acme crm vs hubspot')));
});

test('summarizes pasted audit results', async () => {
  const auditResult = await handleToolCall('audit_geo_html', {
    brandName: 'Acme CRM',
    html: '<html><body><h1>Home</h1></body></html>',
  });
  const audit = JSON.parse(auditResult.content[0].text);
  const summaryResult = await handleToolCall('summarize_geo_audits', {
    brandName: 'Acme CRM',
    audits: [audit],
  });
  const summary = JSON.parse(summaryResult.content[0].text);

  assert.equal(summary.totalPages, 1);
  assert.ok(summary.topIssues.length > 0);
});
