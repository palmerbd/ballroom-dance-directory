/**
 * Styles for the Dance Booking Rank body fragments (content/dancebookingrank/*.json),
 * scoped under .dbr so they can't leak into the rest of the site. Colors and fonts
 * follow the site theme: navy #0c1428 / #1a2d5a, gold #b8922a / #e8c560 / #c9a227,
 * Playfair Display for headings, Inter for text (from the root layout).
 */
export const DBR_CSS = `
.dbr{--navy:#0c1428;--navy2:#1a2d5a;--gold:#b8922a;--gold-lt:#e8c560;--champ:#fdf8f0;--ink:#111827;--text:#374151;--muted:#6b7280;--line:#e5e7eb;--row:#f9fafb;color:var(--text);font-size:1rem;line-height:1.65;}
.dbr h2{font-family:'Playfair Display',Georgia,serif;font-size:1.55rem;font-weight:700;color:var(--ink);margin:2.5rem 0 .75rem;line-height:1.3;}
.dbr h3{font-size:1.1rem;font-weight:700;color:var(--ink);margin:1.5rem 0 .4rem;}
.dbr p{margin:0 0 1rem;}
.dbr a{color:#b45309;text-decoration:none;}
.dbr a:hover{text-decoration:underline;}
.dbr b,.dbr strong{color:var(--ink);font-weight:600;}
.dbr td b,.dbr td strong{color:inherit;}
.dbr ul.findings{list-style:disc;padding-left:1.5rem;margin:0 0 1.25rem;}
.dbr ul.findings li{margin-bottom:.6rem;}
.dbr .meta{color:var(--muted);font-size:.85rem;margin:.75rem 0 1.25rem;}
.dbr hr.rule{border:0;border-top:2px solid var(--gold);margin:1.25rem 0 1.5rem;}
.dbr .tablewrap{overflow-x:auto;-webkit-overflow-scrolling:touch;margin:.75rem 0 .5rem;}
.dbr table{width:100%;border-collapse:collapse;font-size:.88rem;}
.dbr thead th{background:var(--navy);color:#fff;text-align:left;padding:.6rem;font-size:.8rem;font-weight:600;}
.dbr tbody td{padding:.55rem .6rem;border:1px solid var(--line);vertical-align:top;}
.dbr tbody tr:nth-child(even){background:var(--row);}
.dbr .center{text-align:center;}
.dbr .nowrap{white-space:nowrap;}
.dbr .grade-A{color:#15803d;font-weight:700;}
.dbr .grade-B{color:#4d7c0f;font-weight:700;}
.dbr .grade-C{color:#b45309;font-weight:700;}
.dbr .grade-D{color:#c2410c;font-weight:700;}
.dbr .grade-F{color:#b91c1c;font-weight:700;}
.dbr .rank1{color:#15803d;font-weight:700;}
.dbr .top10{font-weight:700;}
.dbr .dim{color:#9ca3af;}
.dbr .bars .fill{color:var(--gold);}
.dbr .bars .empty{color:#d1d5db;}
.dbr .plan-table thead th{background:var(--gold);}
.dbr a.studio{color:inherit;border-bottom:1px dotted #9ca3af;}
.dbr a.studio:hover{text-decoration:none;border-bottom-style:solid;}
.dbr .badge{display:flex;gap:1.25rem;align-items:stretch;background:var(--champ);border:1px solid #f0d080;border-radius:12px;overflow:hidden;margin:0 0 .75rem;}
.dbr .badge .num{background:var(--navy);color:#fff;padding:1.75rem 1.4rem;text-align:center;min-width:170px;font-weight:700;display:flex;flex-direction:column;justify-content:center;}
.dbr .badge .num .big{font-family:'Playfair Display',Georgia,serif;font-size:2.1rem;line-height:1;color:var(--gold-lt);display:block;}
.dbr .badge .num .lbl{font-size:.72rem;letter-spacing:.03em;margin-top:.45rem;display:block;}
.dbr .badge .txt{padding:1rem 1.25rem 1rem 0;}
.dbr .badge .txt h3{margin:0 0 .5rem;font-size:1.08rem;}
.dbr .badge .txt p{margin:0;font-size:.92rem;}
.dbr .methodology{margin-top:2rem;border-top:1px solid var(--line);padding-top:1rem;}
.dbr .methodology p{font-size:.85rem;color:var(--muted);}
.dbr .studio-card{display:flex;align-items:center;gap:1rem;border:1px solid var(--line);border-radius:12px;padding:.9rem 1rem;margin-bottom:.65rem;background:#fff;}
.dbr .studio-card.top{border-color:var(--gold);background:var(--champ);}
.dbr .rank{min-width:52px;text-align:center;}
.dbr .rank .tie{display:block;font-size:.7rem;color:var(--muted);}
.dbr .medal{display:inline-block;font-family:'Playfair Display',Georgia,serif;font-weight:800;font-size:1.1rem;color:#4b5563;}
.dbr .medal.gold{color:#8a6d1f;font-size:1.3rem;}
.dbr .medal.silver{color:#6b7280;font-size:1.12rem;}
.dbr .medal.bronze{color:#9a5b2e;font-size:1.05rem;}
.dbr .info{flex:1;min-width:0;}
.dbr .info h3{margin:0 0 .1rem;font-size:1.05rem;}
.dbr .info h3 a{color:var(--ink);}
.dbr .info .url{margin:0;color:var(--muted);font-size:.82rem;overflow-wrap:anywhere;}
.dbr .info .ai-note{margin:.25rem 0 0;font-size:.85rem;color:#4b5563;}
.dbr .score{text-align:right;min-width:70px;}
.dbr .score-num{font-family:'Playfair Display',Georgia,serif;font-size:1.6rem;font-weight:800;color:var(--navy);}
.dbr .score-lbl{font-size:.78rem;color:var(--muted);}
.dbr .medal,.dbr .score-num,.dbr .badge .num .big{font-variant-numeric:lining-nums;}
.dbr .details-link{text-align:center;margin:1.25rem 0 .5rem;}
.dbr .details-link a{display:inline-block;border:1px solid var(--gold);color:var(--ink);font-weight:700;padding:.65rem 1.25rem;border-radius:999px;}
.dbr .details-link a:hover{background:var(--champ);text-decoration:none;}
.dbr .callout{background:var(--champ);border-left:4px solid var(--gold);border-radius:8px;padding:.9rem 1.1rem;margin:1.25rem 0;font-size:.95rem;}
.dbr .cta{margin-top:2.25rem;text-align:center;background:linear-gradient(135deg,#0c1428 0%,#1a2d5a 100%);border-radius:16px;padding:1.75rem 1.5rem;color:#fff;}
.dbr .cta h2{color:#fff;margin-top:0;}
.dbr .cta p{color:rgba(255,255,255,.72)!important;}
.dbr .cta a{display:inline-block;margin-top:.5rem;background:#c9a227;color:#fff;font-weight:700;padding:.7rem 1.6rem;border-radius:999px;}
.dbr .cta a:hover{text-decoration:none;filter:brightness(1.05);}
@media (max-width:640px){
  .dbr .badge{flex-direction:column;gap:0;}
  .dbr .badge .num{min-width:0;}
  .dbr .badge .txt{padding:1rem;}
  .dbr .studio-card{gap:.6rem;padding:.75rem;}
  .dbr .rank{min-width:40px;}
  .dbr .score{min-width:52px;}
  .dbr .score-num{font-size:1.3rem;}
  .dbr table{font-size:.8rem;}
}
`;
