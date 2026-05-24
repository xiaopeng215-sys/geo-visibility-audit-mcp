import * as cheerio from 'cheerio';

const ENTITY_SCHEMA_TYPES = new Set(['Organization', 'SoftwareApplication', 'Product', 'LocalBusiness', 'Service', 'Brand']);
const ANSWER_SCHEMA_TYPES = new Set(['FAQPage', 'HowTo', 'Article', 'QAPage']);
const TRUST_DOMAINS = [
  'reddit.com',
  'g2.com',
  'capterra.com',
  'trustpilot.com',
  'youtube.com',
  'linkedin.com',
  'github.com',
  'producthunt.com',
  'quora.com',
];

export function normalizeUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return undefined;
  const trimmed = rawUrl.trim();
  if (!trimmed) return undefined;
  try {
    return new URL(trimmed.includes('://') ? trimmed : `https://${trimmed}`).toString();
  } catch {
    return undefined;
  }
}

export function auditGeoHtml(html, pageUrl, options = {}) {
  const $ = cheerio.load(html || '');
  const context = normalizeContext(options);
  const page = extractPageSignals($, pageUrl);
  const checks = buildGeoChecks(page, context);
  const score = scoreChecks(checks);
  const fixList = buildFixes(checks, page, context);
  const recommendedPrompts = buildRecommendedPrompts(context, page);

  return {
    url: pageUrl,
    brandName: context.brandName,
    category: context.category,
    title: page.title,
    metaDescription: page.metaDescription,
    h1s: page.h1s,
    h2s: page.h2s.slice(0, 12),
    wordCount: page.wordCount,
    jsonLdTypes: page.jsonLdTypes,
    score,
    grade: gradeFromScore(score),
    checks,
    entitySignals: entitySignals(page, context),
    answerReadiness: answerReadiness(page, context),
    schemaRecommendations: schemaRecommendations(page, context),
    thirdPartyTrustGaps: thirdPartyTrustGaps(page),
    competitorGaps: competitorGaps(page, context),
    recommendedPrompts,
    fixes: fixList,
    rewriteSuggestions: context.includeRewriteSuggestions ? rewriteSuggestions(page, context, recommendedPrompts) : undefined,
    accuracyNote: 'This is a deterministic AI-search readiness audit. It does not guarantee citations, rankings, traffic, or visibility in any specific AI answer system.',
  };
}

export function summarizeGeoAudits(audits, options = {}) {
  const total = audits.length;
  const averageScore = total
    ? Math.round(audits.reduce((sum, audit) => sum + audit.score, 0) / total)
    : 0;
  const topIssues = Object.entries(audits.flatMap((audit) => audit.checks.filter((check) => check.status !== 'pass').map((check) => check.id))
    .reduce((counts, id) => {
      counts[id] = (counts[id] || 0) + 1;
      return counts;
    }, {}))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([issue, count]) => ({ issue, count, recommendedFocus: focusFromIssue(issue) }));

  return {
    brandName: options.brandName || '',
    category: options.category || '',
    totalPages: total,
    averageScore,
    averageGrade: gradeFromScore(averageScore),
    weakPages: audits.filter((audit) => audit.score < 70).map((audit) => ({ url: audit.url, score: audit.score, grade: audit.grade })),
    strongestPages: audits.slice().sort((a, b) => b.score - a.score).slice(0, 3).map((audit) => ({ url: audit.url, score: audit.score, grade: audit.grade })),
    topIssues,
    recommendedPromptSet: dedupe(audits.flatMap((audit) => audit.recommendedPrompts)).slice(0, 20),
    recommendedFocus: topIssues.length ? topIssues[0].recommendedFocus : 'Maintain clear entity language, answer-ready sections, schema, and third-party proof.',
    accuracyNote: 'Use this summary as an audit and planning artifact. AI answer inclusion varies by prompt, model, time, location, and personalization.',
  };
}

function normalizeContext(options) {
  return {
    brandName: cleanText(options.brandName || ''),
    website: normalizeUrl(options.website || ''),
    category: cleanText(options.category || ''),
    competitors: Array.isArray(options.competitors) ? options.competitors.map(cleanText).filter(Boolean) : [],
    buyerPrompts: Array.isArray(options.buyerPrompts) ? options.buyerPrompts.map(cleanText).filter(Boolean) : [],
    targetAudience: cleanText(options.targetAudience || ''),
    includeRewriteSuggestions: options.includeRewriteSuggestions !== false,
  };
}

function extractPageSignals($, pageUrl) {
  const title = cleanText($('title').first().text());
  const metaDescription = cleanText($('meta[name="description"]').attr('content') || '');
  const h1s = $('h1').map((_, element) => cleanText($(element).text())).get().filter(Boolean);
  const h2s = $('h2').map((_, element) => cleanText($(element).text())).get().filter(Boolean);
  const h3s = $('h3').map((_, element) => cleanText($(element).text())).get().filter(Boolean);
  const bodyText = cleanText($('body').text());
  const lowerBody = bodyText.toLowerCase();
  const wordCount = bodyText ? bodyText.split(/\s+/).filter(Boolean).length : 0;
  const jsonLdTypes = extractJsonLdTypes($);
  const links = extractLinks($, pageUrl);
  const headings = [...h1s, ...h2s, ...h3s];

  return {
    title,
    metaDescription,
    h1s,
    h2s,
    h3s,
    bodyText,
    lowerBody,
    wordCount,
    jsonLdTypes,
    links,
    headings,
    hasFaqSection: /(^|\b)(faq|frequently asked questions|questions and answers|common questions)(\b|$)/i.test(bodyText),
    hasComparisonLanguage: /\b(vs\.?|versus|alternative|alternatives|compare|comparison|competitor|competitors)\b/i.test(bodyText),
    hasProofLanguage: /\b(customer|customers|case study|case studies|review|reviews|testimonial|testimonials|rating|rated|trusted by|used by)\b/i.test(bodyText),
    hasDirectAnswer: detectDirectAnswer($, bodyText),
    questionHeadings: headings.filter((heading) => /\?$|^(what|why|how|when|where|who|which|can|does|is|are)\b/i.test(heading)),
  };
}

function buildGeoChecks(page, context) {
  const checks = [];
  const add = (id, status, message, weight) => checks.push({ id, status, message, weight });
  const allText = `${page.title} ${page.metaDescription} ${page.bodyText}`.toLowerCase();
  const brandLower = context.brandName.toLowerCase();
  const categoryLower = context.category.toLowerCase();
  const audienceLower = context.targetAudience.toLowerCase();
  const brandMentions = countOccurrences(allText, brandLower);
  const competitorMentions = context.competitors.filter((name) => allText.includes(name.toLowerCase()));

  add('brand_entity_clarity', brandMentions >= 3 ? 'pass' : brandMentions >= 1 ? 'warn' : 'fail', `Found ${brandMentions} brand mentions across visible page signals.`, 15);
  add('category_clarity', categoryLower && allText.includes(categoryLower) ? 'pass' : categoryTermOverlap(allText, categoryLower) >= 2 ? 'warn' : 'fail', context.category ? `Category target: ${context.category}.` : 'No category was provided.', 12);
  add('audience_clarity', !audienceLower || allText.includes(audienceLower) ? 'pass' : audienceTermOverlap(allText, audienceLower) >= 2 ? 'warn' : 'fail', context.targetAudience ? `Audience target: ${context.targetAudience}.` : 'No audience was provided.', 10);
  add('direct_answer_block', page.hasDirectAnswer ? 'pass' : 'warn', page.hasDirectAnswer ? 'Page includes a concise answer-style paragraph.' : 'No concise answer-style paragraph found near the page body.', 12);
  add('question_headings', page.questionHeadings.length >= 2 ? 'pass' : page.questionHeadings.length === 1 ? 'warn' : 'fail', `Found ${page.questionHeadings.length} question-style headings.`, 9);
  add('faq_coverage', page.hasFaqSection ? 'pass' : 'warn', page.hasFaqSection ? 'FAQ or common-questions section is present.' : 'FAQ or common-questions section is missing.', 10);
  add('schema_for_ai', hasAnyType(page.jsonLdTypes, [...ENTITY_SCHEMA_TYPES, ...ANSWER_SCHEMA_TYPES]) ? 'pass' : 'warn', page.jsonLdTypes.length ? `JSON-LD types: ${page.jsonLdTypes.join(', ')}.` : 'No JSON-LD schema types found.', 12);
  add('comparison_context', context.competitors.length === 0 || page.hasComparisonLanguage || competitorMentions.length ? 'pass' : 'warn', context.competitors.length ? `Mentioned competitors: ${competitorMentions.join(', ') || 'none'}.` : 'No competitors supplied.', 8);
  add('third_party_trust_surface', page.hasProofLanguage || thirdPartyLinks(page.links.external).length ? 'pass' : 'warn', `Found ${thirdPartyLinks(page.links.external).length} links to known third-party trust surfaces.`, 7);
  add('content_depth', page.wordCount >= 500 ? 'pass' : page.wordCount >= 250 ? 'warn' : 'fail', `Visible body has about ${page.wordCount} words.`, 8);

  return checks;
}

function scoreChecks(checks) {
  const max = checks.reduce((sum, check) => sum + check.weight, 0);
  const earned = checks.reduce((sum, check) => {
    if (check.status === 'pass') return sum + check.weight;
    if (check.status === 'warn') return sum + check.weight * 0.5;
    return sum;
  }, 0);
  return Math.round((earned / max) * 100);
}

function entitySignals(page, context) {
  const allText = `${page.title} ${page.metaDescription} ${page.bodyText}`.toLowerCase();
  const brandMentions = countOccurrences(allText, context.brandName.toLowerCase());
  const schemaTypes = page.jsonLdTypes.filter((type) => ENTITY_SCHEMA_TYPES.has(type));
  const findings = [];
  const gaps = [];

  if (brandMentions >= 3) findings.push('Brand is repeated enough for basic entity clarity.');
  else gaps.push('Mention the brand in the title, H1, intro, and schema name fields.');
  if (schemaTypes.length) findings.push(`Entity schema found: ${schemaTypes.join(', ')}.`);
  else gaps.push('Add Organization, SoftwareApplication, Product, LocalBusiness, Service, or Brand schema where relevant.');
  if (context.category && categoryTermOverlap(allText, context.category.toLowerCase()) >= 2) findings.push('Category terms appear in page copy.');
  else if (context.category) gaps.push(`Use category language consistently: ${context.category}.`);

  return {
    status: gaps.length === 0 ? 'strong' : gaps.length <= 2 ? 'medium' : 'weak',
    brandMentions,
    schemaTypes,
    findings,
    gaps,
  };
}

function answerReadiness(page, context) {
  const strengths = [];
  const missing = [];

  if (page.hasDirectAnswer) strengths.push('Includes a concise answer-style paragraph.');
  else missing.push('Add a 40-60 word direct answer near the top of the page.');
  if (page.questionHeadings.length >= 2) strengths.push('Uses question-style headings that map to buyer prompts.');
  else missing.push('Add question-style H2s that match buyer prompts.');
  if (page.hasFaqSection) strengths.push('Includes FAQ or common-question coverage.');
  else missing.push('Add a short FAQ section with direct answers.');
  if (context.buyerPrompts.some((prompt) => page.lowerBody.includes(prompt.toLowerCase().split(/\s+/).slice(0, 3).join(' ')))) {
    strengths.push('Some buyer prompt language appears in the page copy.');
  } else if (context.buyerPrompts.length) {
    missing.push('Mirror important buyer prompt language in headings and answer paragraphs.');
  }

  return {
    status: missing.length <= 1 ? 'strong' : missing.length <= 3 ? 'needs_work' : 'weak',
    strengths,
    missing,
  };
}

function schemaRecommendations(page, context) {
  const recommendations = [];
  const types = new Set(page.jsonLdTypes);
  const category = context.category.toLowerCase();

  if (!hasAnyType(page.jsonLdTypes, ['Organization', 'Brand'])) recommendations.push('Organization');
  if (!hasAnyType(page.jsonLdTypes, ['FAQPage']) && (page.hasFaqSection || context.buyerPrompts.length)) recommendations.push('FAQPage');
  if (!hasAnyType(page.jsonLdTypes, ['SoftwareApplication']) && /\b(software|saas|app|platform|tool|crm)\b/.test(category)) recommendations.push('SoftwareApplication');
  if (!hasAnyType(page.jsonLdTypes, ['Product']) && /\b(product|ecommerce|shop|store)\b/.test(category)) recommendations.push('Product');
  if (!hasAnyType(page.jsonLdTypes, ['LocalBusiness']) && /\b(local|contractor|clinic|restaurant|service area)\b/.test(category)) recommendations.push('LocalBusiness');
  if (!types.size) recommendations.push('Article or WebPage');

  return dedupe(recommendations).slice(0, 6);
}

function thirdPartyTrustGaps(page) {
  const links = thirdPartyLinks(page.links.external);
  const gaps = [];
  if (!links.some((url) => url.includes('reddit.com'))) gaps.push('No visible Reddit or community proof link.');
  if (!links.some((url) => url.includes('g2.com') || url.includes('capterra.com') || url.includes('trustpilot.com'))) gaps.push('No visible review or directory proof link.');
  if (!page.hasProofLanguage) gaps.push('Add customer proof, case studies, testimonials, ratings, or usage evidence.');

  return gaps;
}

function competitorGaps(page, context) {
  if (!context.competitors.length) {
    return ['Add known competitors to generate comparison prompts and positioning gaps.'];
  }
  const allText = page.bodyText.toLowerCase();
  const mentioned = context.competitors.filter((name) => allText.includes(name.toLowerCase()));
  const missing = context.competitors.filter((name) => !mentioned.includes(name));
  const gaps = [];
  if (!page.hasComparisonLanguage) gaps.push('Add comparison or alternatives content for high-intent buyer prompts.');
  if (missing.length) gaps.push(`Consider coverage for competitor prompts involving: ${missing.slice(0, 5).join(', ')}.`);
  return gaps;
}

function buildRecommendedPrompts(context, page) {
  const prompts = [...context.buyerPrompts];
  const brand = context.brandName || 'this brand';
  const category = context.category || page.h1s[0] || 'this category';
  const audience = context.targetAudience || 'buyers';

  prompts.push(`best ${category} for ${audience}`);
  prompts.push(`${brand} reviews`);
  prompts.push(`${brand} alternatives`);
  prompts.push(`is ${brand} good for ${audience}`);
  for (const competitor of context.competitors.slice(0, 5)) {
    prompts.push(`${brand} vs ${competitor}`);
    prompts.push(`${competitor} alternatives for ${audience}`);
  }

  return dedupe(prompts.map((prompt) => prompt.toLowerCase())).slice(0, 20);
}

function buildFixes(checks, page, context) {
  return checks
    .filter((check) => check.status !== 'pass')
    .map((check) => fixForIssue(check.id, page, context))
    .filter(Boolean)
    .slice(0, 12);
}

function rewriteSuggestions(page, context, prompts) {
  const audience = context.targetAudience || 'target buyers';
  const category = context.category || page.h1s[0] || 'the category';
  const brand = context.brandName || 'the brand';
  return {
    directAnswerBlock: `${brand} is a ${category} option for ${audience}. It is best evaluated against your use case, budget, integrations, and proof needs before choosing a solution.`,
    faqQuestions: prompts.slice(0, 6).map((prompt) => titleCase(prompt.replace(context.brandName.toLowerCase(), context.brandName))),
    comparisonHeading: context.competitors.length ? `${brand} vs ${context.competitors[0]}: which option fits ${audience}?` : `${brand} alternatives and comparison points`,
  };
}

function fixForIssue(id, page, context) {
  const map = {
    brand_entity_clarity: { priority: 'high', type: 'entity', action: `Mention ${context.brandName || 'the brand'} clearly in the title, H1, intro paragraph, and schema name fields.` },
    category_clarity: { priority: 'high', type: 'entity', action: `Use category language consistently near the top of the page: ${context.category || 'the target category'}.` },
    audience_clarity: { priority: 'medium', type: 'positioning', action: `State who this is for using the target audience phrase: ${context.targetAudience || 'the target buyer'}.` },
    direct_answer_block: { priority: 'high', type: 'answer-readiness', action: 'Add a 40-60 word direct answer near the top that explains what the product/service is, who it is for, and when to choose it.' },
    question_headings: { priority: 'medium', type: 'content', action: 'Add question-style H2s that mirror buyer prompts and answer them directly below each heading.' },
    faq_coverage: { priority: 'medium', type: 'content', action: 'Add a compact FAQ section with direct answers and mark it up with FAQPage schema when appropriate.' },
    schema_for_ai: { priority: 'high', type: 'schema', action: `Add JSON-LD schema such as ${schemaRecommendations(page, context).join(', ')}.` },
    comparison_context: { priority: 'medium', type: 'comparison', action: 'Add alternatives, comparison, or competitor context so AI answers can understand when this brand is the right fit.' },
    third_party_trust_surface: { priority: 'medium', type: 'trust', action: 'Add genuine third-party proof: reviews, directories, case studies, community mentions, or customer examples.' },
    content_depth: { priority: 'medium', type: 'content', action: 'Expand the page with examples, use cases, comparisons, FAQs, and proof instead of thin generic copy.' },
  };
  return map[id];
}

function focusFromIssue(issue) {
  const focus = {
    brand_entity_clarity: 'Clarify brand/entity signals before optimizing smaller page details.',
    category_clarity: 'Make category language explicit and consistent across title, H1, intro, and schema.',
    audience_clarity: 'State the ideal buyer directly so AI answers can match the page to prompts.',
    direct_answer_block: 'Add concise answer-ready copy near the top of important pages.',
    question_headings: 'Add buyer-question headings that map to AI prompts.',
    faq_coverage: 'Add FAQ coverage for high-intent prompts and mark it up when appropriate.',
    schema_for_ai: 'Add structured data that identifies the brand, product, page, and answers.',
    comparison_context: 'Create comparison and alternatives coverage for high-intent discovery prompts.',
    third_party_trust_surface: 'Strengthen real third-party proof and review surfaces.',
    content_depth: 'Replace thin pages with useful examples, proof, FAQs, and comparisons.',
  };
  return focus[issue] || 'Fix repeated warnings before optimizing lower-impact details.';
}

function detectDirectAnswer($, bodyText) {
  const paragraphs = $('p').map((_, element) => cleanText($(element).text())).get().filter(Boolean);
  return paragraphs.slice(0, 5).some((paragraph) => {
    const words = paragraph.split(/\s+/).filter(Boolean).length;
    return words >= 35 && words <= 90 && /\b(is|are|helps|for|designed for|used by|best for)\b/i.test(paragraph);
  }) || bodyText.split(/\s+/).length >= 80 && /\b(is|are) (a|an|the)\b/i.test(bodyText.slice(0, 700));
}

function extractLinks($, pageUrl) {
  const origin = safeOrigin(pageUrl);
  const internal = [];
  const external = [];
  $('a[href]').each((_, element) => {
    const href = $(element).attr('href');
    const url = safeResolveUrl(href, pageUrl);
    if (!url || !/^https?:\/\//.test(url)) return;
    if (origin && safeOrigin(url) === origin) internal.push(url);
    else external.push(url);
  });
  return {
    internal: dedupe(internal),
    external: dedupe(external),
  };
}

function thirdPartyLinks(urls) {
  return urls.filter((url) => TRUST_DOMAINS.some((domain) => safeHostname(url).endsWith(domain)));
}

function extractJsonLdTypes($) {
  const types = new Set();
  $('script[type="application/ld+json"]').each((_, element) => {
    try {
      const parsed = JSON.parse($(element).text());
      for (const item of flattenJsonLd(parsed)) {
        const type = item?.['@type'];
        if (Array.isArray(type)) type.forEach((value) => types.add(value));
        else if (type) types.add(type);
      }
    } catch {
      // Ignore invalid JSON-LD snippets.
    }
  });
  return [...types];
}

function flattenJsonLd(value) {
  if (Array.isArray(value)) return value.flatMap(flattenJsonLd);
  if (value?.['@graph']) return [value, ...flattenJsonLd(value['@graph'])];
  return [value];
}

function categoryTermOverlap(text, category) {
  return termOverlap(text, category);
}

function audienceTermOverlap(text, audience) {
  return termOverlap(text, audience);
}

function termOverlap(text, phrase) {
  if (!phrase) return 0;
  return phrase.toLowerCase().split(/\s+/).filter((term) => term.length > 2 && text.includes(term)).length;
}

function countOccurrences(text, needle) {
  if (!needle) return 0;
  return (text.match(new RegExp(escapeRegExp(needle), 'g')) || []).length;
}

function hasAnyType(types, targets) {
  return types.some((type) => targets.includes(type));
}

function cleanText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function gradeFromScore(score) {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

function safeOrigin(url) {
  try {
    return new URL(url).origin;
  } catch {
    return '';
  }
}

function safeHostname(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

function safeResolveUrl(href, baseUrl) {
  if (!href || href.startsWith('mailto:') || href.startsWith('tel:')) return undefined;
  try {
    return new URL(href, baseUrl).toString();
  } catch {
    return undefined;
  }
}

function dedupe(values) {
  return [...new Set(values.filter(Boolean))];
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function titleCase(value) {
  return String(value || '').replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1));
}
