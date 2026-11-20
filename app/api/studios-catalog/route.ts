import { getAllStudiosFromWP } from "@/lib/wordpress";

// ─── /api/studios-catalog ─────────────────────────────────────────────────────
// One cached copy of the full studio list (lightweight cards) for every page that
// needs the whole catalog. Vercel serves it from cache and refreshes it at most
// once a day; if WordPress fails during a refresh, the error is thrown so the last
// good copy keeps being served instead of an empty or broken list.
export const revalidate = 86400;

export async function GET() {
  const studios = await getAllStudiosFromWP(100);
  if (studios.length < 1000) throw new Error(`catalog too small (${studios.length})`);
  return Response.json(
    { generatedAt: new Date().toISOString(), count: studios.length, studios },
    { headers: { "X-Robots-Tag": "noindex" } },
  );
}
