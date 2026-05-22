#!/usr/bin/env tsx
/**
 * GSC Weekly Review Script
 * ========================
 * Pulls real Search Console data for https://www.ballroomdancedirectory.com/
 * and outputs a prioritized 3–5 item SEO action plan.
 *
 * Run manually:  npx tsx scripts/gsc-weekly-review.ts
 * Scheduled:     Every Monday 9:39 AM (via Cowork scheduled task)
 *
 * Required env: GSC_SERVICE_ACCOUNT_JSON (set in Vercel + local .env.local)
 */

import { getGscReport, type GscQueryData, type GscPageData } from '../lib/gsc';

interface ActionItem {
  priority: number;
  category: string;
  action: string;
  rationale: string;
  effort: 'Low' | 'Medium' | 'High';
  impact: 'Low' | 'Medium' | 'High';
}

function pct(n: number) {
  return `${(n * 100).toFixed(1)}%`;
}

function generateActionPlan(report: Awaited<ReturnType<typeof getGscReport>>): ActionItem[] {
  const actions: ActionItem[] = [];

  // ── 1. Low CTR opportunities (fix title/meta) ───────────────────────────
  if (report.lowCtrHighImpressions.length > 0) {
    const top = report.lowCtrHighImpressions.slice(0, 3);
    const examples = top.map((q) => `"${q.query}" (${q.impressions} impr, ${pct(q.ctr)} CTR)`).join('; ');
    actions.push({
      priority: 1,
      category: 'Title & Meta Optimization',
      action: `Rewrite page titles and meta descriptions for queries with high impressions but low CTR`,
      rationale: `Top opportunities: ${examples}. These pages are showing up but users aren't clicking — better titles/descriptions can lift CTR without any ranking change.`,
      effort: 'Low',
      impact: 'High',
    });
  }

  // ── 2. Position 4–15 push (internal linking / content depth) ───────────
  if (report.positionDrops.length > 0) {
    const top = report.positionDrops.slice(0, 3);
    const examples = top.map((q) => `"${q.query}" (pos ${q.position.toFixed(1)})`).join('; ');
    actions.push({
      priority: 2,
      category: 'Content & Internal Linking',
      action: `Add internal links and expand content for pages ranking positions 4–15`,
      rationale: `Queries ranking just off page 1: ${examples}. A content depth increase + 2–3 internal links from high-traffic pages can push these to page 1.`,
      effort: 'Medium',
      impact: 'High',
    });
  }

  // ── 3. Top page optimization ────────────────────────────────────────────
  const weakTopPage = report.topPages.find((p) => p.position > 5 && p.impressions > 100);
  if (weakTopPage) {
    actions.push({
      priority: 3,
      category: 'On-Page SEO',
      action: `Improve H1/H2 structure and add FAQ schema to: ${weakTopPage.page}`,
      rationale: `This page gets ${weakTopPage.impressions} impressions but sits at position ${weakTopPage.position.toFixed(1)} with only ${pct(weakTopPage.ctr)} CTR. Schema markup + heading restructure can boost both ranking and click-through.`,
      effort: 'Medium',
      impact: 'Medium',
    });
  }

  // ── 4. Overall CTR health ────────────────────────────────────────────────
  if (report.totals.avgCtr < 0.04) {
    actions.push({
      priority: 4,
      category: 'Structured Data',
      action: `Add breadcrumb + review schema to all studio listing pages`,
      rationale: `Site average CTR is ${pct(report.totals.avgCtr)}, below the 4% target. Rich results (breadcrumbs, review stars) make listings visually stand out and typically lift CTR by 20–30%.`,
      effort: 'Medium',
      impact: 'Medium',
    });
  }

  // ── 5. Position tracking ─────────────────────────────────────────────────
  const avgPos = report.totals.avgPosition;
  if (avgPos > 15) {
    actions.push({
      priority: 5,
      category: 'Link Building',
      action: `Build 3–5 backlinks from local dance blogs or event sites this week`,
      rationale: `Average position is ${avgPos.toFixed(1)} — site authority needs a boost. Target local dance studios, event calendars, and dance association directories for easy, relevant links.`,
      effort: 'High',
      impact: 'High',
    });
  }

  // ── Fallback if data is sparse ───────────────────────────────────────────
  if (actions.length === 0) {
    actions.push({
      priority: 1,
      category: 'Content',
      action: 'No significant opportunities detected — review manually in GSC',
      rationale: 'Insufficient data for automated recommendations. Check back after more traffic accumulates.',
      effort: 'Low',
      impact: 'Low',
    });
  }

  return actions.slice(0, 5);
}

async function main() {
  console.log('\n══════════════════════════════════════════════');
  console.log('  BDD GSC Weekly SEO Review');
  console.log(`  ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`);
  console.log('══════════════════════════════════════════════\n');

  let report;
  try {
    console.log('⏳ Fetching Search Console data...\n');
    report = await getGscReport();
  } catch (err) {
    console.error('❌ Failed to fetch GSC data:', err);
    process.exit(1);
  }

  // ── Summary Stats ──────────────────────────────────────────────────────
  console.log(`📅 Date range: ${report.dateRange.startDate} → ${report.dateRange.endDate} (28 days)\n`);
  console.log('📊 SITE OVERVIEW');
  console.log(`   Total Clicks:      ${report.totals.clicks.toLocaleString()}`);
  console.log(`   Total Impressions: ${report.totals.impressions.toLocaleString()}`);
  console.log(`   Avg CTR:           ${pct(report.totals.avgCtr)}`);
  console.log(`   Avg Position:      ${report.totals.avgPosition.toFixed(1)}`);

  // ── Top Pages ────────────────────────────────────────────────────────────
  console.log('\n🏆 TOP 5 PAGES BY CLICKS');
  report.topPages.slice(0, 5).forEach((p, i) => {
    const shortPage = p.page.replace('https://www.ballroomdancedirectory.com', '') || '/';
    console.log(`   ${i + 1}. ${shortPage}`);
    console.log(`      ${p.clicks} clicks · ${p.impressions} impr · ${pct(p.ctr)} CTR · pos ${p.position.toFixed(1)}`);
  });

  // ── Top Queries ───────────────────────────────────────────────────────────
  console.log('\n🔍 TOP 10 QUERIES BY CLICKS');
  report.topQueries.slice(0, 10).forEach((q, i) => {
    console.log(`   ${i + 1}. "${q.query}"`);
    console.log(`      ${q.clicks} clicks · ${q.impressions} impr · ${pct(q.ctr)} CTR · pos ${q.position.toFixed(1)}`);
  });

  // ── CTR Opportunities ──────────────────────────────────────────────────
  if (report.lowCtrHighImpressions.length > 0) {
    console.log('\n⚡ LOW CTR OPPORTUNITIES (high impressions, CTR < 3%)');
    report.lowCtrHighImpressions.slice(0, 5).forEach((q, i) => {
      console.log(`   ${i + 1}. "${q.query}" — ${q.impressions} impr, ${pct(q.ctr)} CTR`);
    });
  }

  // ── Page 2 Queries ─────────────────────────────────────────────────────
  if (report.positionDrops.length > 0) {
    console.log('\n📈 CLOSE TO PAGE 1 (positions 4–15)');
    report.positionDrops.slice(0, 5).forEach((q, i) => {
      console.log(`   ${i + 1}. "${q.query}" — pos ${q.position.toFixed(1)}, ${q.impressions} impr`);
    });
  }

  // ── Action Plan ───────────────────────────────────────────────────────────
  const plan = generateActionPlan(report);

  console.log('\n\n🎯 THIS WEEK\'S SEO ACTION PLAN');
  console.log('════════════════════════════════════════════\n');

  plan.forEach((item) => {
    console.log(`${item.priority}. [${item.category}] — Effort: ${item.effort} | Impact: ${item.impact}`);
    console.log(`   ✅ ${item.action}`);
    console.log(`   📝 ${item.rationale}`);
    console.log('');
  });

  console.log('══════════════════════════════════════════════');
  console.log('  Review complete. Take action on items above.');
  console.log('══════════════════════════════════════════════\n');
}

main();
