/**
 * Google Search Console API client
 * Uses a service account (bdd-gsc-reader) with Full permissions on
 * https://www.ballroomdancedirectory.com/
 *
 * Required env var: GSC_SERVICE_ACCOUNT_JSON
 *   Value: the full JSON content of the service account key file
 *   (ballroom-dance-directory-60efe350f5b7.json), stored as a string.
 *
 * To add to Vercel: Settings → Environment Variables → add GSC_SERVICE_ACCOUNT_JSON
 */

const GSC_PROPERTY = 'https://www.ballroomdancedirectory.com/';
const GSC_API_BASE = 'https://searchconsole.googleapis.com/webmasters/v3';

interface ServiceAccountKey {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  token_uri: string;
}

interface GscQueryRow {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

interface GscQueryResponse {
  rows?: GscQueryRow[];
  responseAggregationType?: string;
}

export interface GscPageData {
  page: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface GscQueryData {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface GscReport {
  generatedAt: string;
  dateRange: { startDate: string; endDate: string };
  totals: { clicks: number; impressions: number; avgCtr: number; avgPosition: number };
  topPages: GscPageData[];
  topQueries: GscQueryData[];
  lowCtrHighImpressions: GscQueryData[];
  positionDrops: GscQueryData[];
}

/** Create a signed JWT and exchange it for an access token */
async function getAccessToken(): Promise<string> {
  const raw = process.env.GSC_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error('GSC_SERVICE_ACCOUNT_JSON env var is not set');

  const key: ServiceAccountKey = JSON.parse(raw);

  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: key.client_email,
    scope: 'https://www.googleapis.com/auth/webmasters.readonly',
    aud: key.token_uri,
    exp: now + 3600,
    iat: now,
  };

  const encode = (obj: object) =>
    Buffer.from(JSON.stringify(obj)).toString('base64url');

  const signingInput = `${encode(header)}.${encode(payload)}`;

  // Import the PEM private key using the Web Crypto API (available in Node 18+)
  const pemBody = key.private_key
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s/g, '');
  const derBuffer = Buffer.from(pemBody, 'base64');

  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    derBuffer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    Buffer.from(signingInput)
  );

  const jwt = `${signingInput}.${Buffer.from(signature).toString('base64url')}`;

  // Exchange JWT for access token
  const tokenRes = await fetch(key.token_uri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  if (!tokenRes.ok) {
    const err = await tokenRes.text();
    throw new Error(`Failed to get GSC access token: ${err}`);
  }

  const tokenData = await tokenRes.json();
  return tokenData.access_token as string;
}

/** Run a Search Analytics query */
async function querySearchAnalytics(
  token: string,
  body: object
): Promise<GscQueryResponse> {
  const url = `${GSC_API_BASE}/sites/${encodeURIComponent(GSC_PROPERTY)}/searchAnalytics/query`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GSC API error: ${err}`);
  }

  return res.json();
}

/** Get date strings for the last N days */
function getDateRange(daysBack: number): { startDate: string; endDate: string } {
  const end = new Date();
  end.setDate(end.getDate() - 3); // GSC has ~3 day lag
  const start = new Date(end);
  start.setDate(start.getDate() - daysBack);

  const fmt = (d: Date) => d.toISOString().split('T')[0];
  return { startDate: fmt(start), endDate: fmt(end) };
}

/** Pull a full GSC report: top pages, top queries, opportunities */
export async function getGscReport(): Promise<GscReport> {
  const token = await getAccessToken();
  const dateRange = getDateRange(28); // last 28 days

  // Fetch top pages by clicks
  const pagesRes = await querySearchAnalytics(token, {
    ...dateRange,
    dimensions: ['page'],
    rowLimit: 25,
    orderBy: [{ fieldName: 'clicks', sortOrder: 'DESCENDING' }],
  });

  // Fetch top queries by clicks
  const queriesRes = await querySearchAnalytics(token, {
    ...dateRange,
    dimensions: ['query'],
    rowLimit: 50,
    orderBy: [{ fieldName: 'clicks', sortOrder: 'DESCENDING' }],
  });

  const topPages: GscPageData[] = (pagesRes.rows ?? []).map((r) => ({
    page: r.keys[0],
    clicks: r.clicks,
    impressions: r.impressions,
    ctr: r.ctr,
    position: r.position,
  }));

  const topQueries: GscQueryData[] = (queriesRes.rows ?? []).map((r) => ({
    query: r.keys[0],
    clicks: r.clicks,
    impressions: r.impressions,
    ctr: r.ctr,
    position: r.position,
  }));

  // Low CTR but high impressions = opportunity to improve titles/meta
  const lowCtrHighImpressions = topQueries
    .filter((q) => q.impressions >= 50 && q.ctr < 0.03)
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 10);

  // Queries ranking 4–15 = close to page 1, push them up
  const positionDrops = topQueries
    .filter((q) => q.position >= 4 && q.position <= 15 && q.impressions >= 20)
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 10);

  // Calculate totals
  const totals = topPages.reduce(
    (acc, p) => ({
      clicks: acc.clicks + p.clicks,
      impressions: acc.impressions + p.impressions,
      avgCtr: 0,
      avgPosition: 0,
    }),
    { clicks: 0, impressions: 0, avgCtr: 0, avgPosition: 0 }
  );
  totals.avgCtr = totals.impressions > 0 ? totals.clicks / totals.impressions : 0;
  totals.avgPosition =
    topPages.length > 0
      ? topPages.reduce((s, p) => s + p.position, 0) / topPages.length
      : 0;

  return {
    generatedAt: new Date().toISOString(),
    dateRange,
    totals,
    topPages: topPages.slice(0, 10),
    topQueries: topQueries.slice(0, 20),
    lowCtrHighImpressions,
    positionDrops,
  };
}
