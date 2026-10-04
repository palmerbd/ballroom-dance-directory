/**
 * Dance Booking Rank — city market reports built by Don's dance-market-report skill
 * (SiteTradeIn site audit + live ChatGPT / Perplexity / Google AI checks).
 *
 * Each published city is one generated file, content/dancebookingrank/<slug>.json,
 * rendered inside the normal site layout by
 *   app/dancebookingrank/[city]/page.tsx              -> /dancebookingrank/<slug>
 *   app/dancebookingrank/[city]/seo-details/page.tsx  -> /dancebookingrank/<slug>/seo-details
 * with the shared look in components/DanceBookingRank.tsx and
 * lib/dancebookingrank-styles.ts. The JSON files are regenerated from audit data —
 * don't hand-edit them. To add a city: add its JSON, import it below, add it to the list.
 */
import fortWorthTx from "@/content/dancebookingrank/fort-worth-tx.json";
import dallasTx from "@/content/dancebookingrank/dallas-tx.json";
import planoTx from "@/content/dancebookingrank/plano-tx.json";
import carrolltonTx from "@/content/dancebookingrank/carrollton-tx.json";
import houstonTx from "@/content/dancebookingrank/houston-tx.json";
import westHoustonTx from "@/content/dancebookingrank/west-houston-tx.json";
import theWoodlandsTx from "@/content/dancebookingrank/the-woodlands-tx.json";
import sugarLandTx from "@/content/dancebookingrank/sugar-land-tx.json";
import austinTx from "@/content/dancebookingrank/austin-tx.json";
import sanAntonioTx from "@/content/dancebookingrank/san-antonio-tx.json";
import columbusOh from "@/content/dancebookingrank/columbus-oh.json";
import cincinnatiOh from "@/content/dancebookingrank/cincinnati-oh.json";
import clevelandOh from "@/content/dancebookingrank/cleveland-oh.json";
import daytonOh from "@/content/dancebookingrank/dayton-oh.json";
import akronOh from "@/content/dancebookingrank/akron-oh.json";
import toledoOh from "@/content/dancebookingrank/toledo-oh.json";
import chicagoIl from "@/content/dancebookingrank/chicago-il.json";
import evanstonIl from "@/content/dancebookingrank/evanston-il.json";
import schaumburgIl from "@/content/dancebookingrank/schaumburg-il.json";
import auroraIl from "@/content/dancebookingrank/aurora-il.json";

export type DbrPage = {
  title: string;        // <title> without the site suffix (the layout template adds it)
  description: string;
  kicker: string;
  h1: string;
  intro: string;
  html: string;         // body fragment, styled by DBR_CSS under .dbr
  jsonLd?: Record<string, unknown>[];
};

export type DbrCity = {
  slug: string;         // e.g. "fort-worth-tx"
  city: string;
  state: string;
  stateAbbr: string;
  published: string;    // YYYY-MM-DD
  cityPage?: string;    // BDD city listing page, e.g. "/studios/city/fort-worth"
  ranking: DbrPage;
  details: DbrPage;
};

export const DANCE_BOOKING_RANK: DbrCity[] = [
  fortWorthTx,
  dallasTx,
  planoTx,
  carrolltonTx,
  houstonTx,
  westHoustonTx,
  theWoodlandsTx,
  sugarLandTx,
  austinTx,
  sanAntonioTx,
  columbusOh,
  cincinnatiOh,
  clevelandOh,
  daytonOh,
  akronOh,
  toledoOh,
  chicagoIl,
  evanstonIl,
  schaumburgIl,
  auroraIl,
];

export function getDbrCity(slug: string): DbrCity | undefined {
  return DANCE_BOOKING_RANK.find((c) => c.slug === slug);
}
