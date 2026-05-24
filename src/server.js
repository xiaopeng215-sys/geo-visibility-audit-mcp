#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import {
  auditGeoHtml,
  summarizeGeoAudits,
} from './geo-audit.js';

export const tools = [
  {
    name: 'audit_geo_html',
    description: 'Audit pasted HTML for GEO and AI-search visibility readiness.',
    inputSchema: {
      type: 'object',
      properties: {
        html: { type: 'string' },
        url: { type: 'string', default: 'https://example.com/' },
        brandName: { type: 'string' },
        website: { type: 'string', default: '' },
        category: { type: 'string', default: '' },
        competitors: { type: 'array', items: { type: 'string' }, default: [] },
        buyerPrompts: { type: 'array', items: { type: 'string' }, default: [] },
        targetAudience: { type: 'string', default: '' },
        includeRewriteSuggestions: { type: 'boolean', default: true },
      },
      required: ['html', 'brandName'],
    },
  },
  {
    name: 'summarize_geo_audits',
    description: 'Summarize an array of GEO visibility audit results.',
    inputSchema: {
      type: 'object',
      properties: {
        audits: { type: 'array', items: { type: 'object' } },
        brandName: { type: 'string', default: '' },
        category: { type: 'string', default: '' },
      },
      required: ['audits'],
    },
  },
];

export async function handleToolCall(name, args = {}) {
  if (name === 'audit_geo_html') {
    return textResult(auditGeoHtml(args.html || '', args.url || 'https://example.com/', {
      brandName: args.brandName || '',
      website: args.website || '',
      category: args.category || '',
      competitors: Array.isArray(args.competitors) ? args.competitors : [],
      buyerPrompts: Array.isArray(args.buyerPrompts) ? args.buyerPrompts : [],
      targetAudience: args.targetAudience || '',
      includeRewriteSuggestions: args.includeRewriteSuggestions !== false,
    }));
  }

  if (name === 'summarize_geo_audits') {
    return textResult(summarizeGeoAudits(Array.isArray(args.audits) ? args.audits : [], {
      brandName: args.brandName || '',
      category: args.category || '',
    }));
  }

  throw new Error(`Unknown tool: ${name}`);
}

export async function createServer() {
  const server = new Server(
    { name: 'geo-visibility-audit-mcp', version: '0.1.0' },
    { capabilities: { tools: {} } },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));
  server.setRequestHandler(CallToolRequestSchema, async (request) => handleToolCall(request.params.name, request.params.arguments));

  return server;
}

function textResult(value) {
  return {
    content: [{ type: 'text', text: JSON.stringify(value, null, 2) }],
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const server = await createServer();
  await server.connect(new StdioServerTransport());
}
