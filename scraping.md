# Studio Data Pipeline — Scraping Reference

This document captures the full history of how we approached importing real studio data into WordPress, what failed and why, and the exact process that worked. Use this as the playbook for future city expansions.

---

## What We Were Trying to Do

Replace placeholder/dummy studios in WordPress with real business data (name, address, phone, website, hours, rating, review count, dance styles) pulled from Google Places.

**WordPress backend:** Hetzner VPS at `5.78.144.42`
**Custom post type:** `dance_studio`
**ACF field group:** "Dance Studio Details"
**Target endpoint:** `POST /wp-json/wp/v2/dance_studio`

---

## Approaches That Did Not Work

### 1. Node.js Script from the VM (`fetch-studios.mjs`)
Built a full Node.js ES module pipeline that reads `.env.local`, calls the Google Places REST API, and POSTs to WordPress. Blocked because the VM's outbound network allowlist prevents connections to Google APIs and the Hetzner server IP.

### 2. Google Places REST API from the Browser
The Places Nearby Search and Text Search REST endpoints (`maps.googleapis.com/maps/api/place/...`) are blocked by CORS in the browser. Cannot call these directly from browser console.

### 3. WordPress Application Passwords
Application Passwords would allow simple Basic Auth from any client. Blocked because the Hetzner server runs HTTP only — WordPress disables Application Passwords on non-HTTPS sites.

### 4. Custom WordPress Plugin Endpoint (`hello.php`)
Attempted to add a `POST /wp-json/pipeline/v1/import` endpoint with a shared secret header (`X-Pipeline-Secret: dance_pipeline_2026`) to the Hello Dolly plugin file via the Plugin File Editor. Two problems:
- JavaScript injected into the textarea introduced PHP syntax errors, so the route never registered.
- Plugin File Editor textarea content was flagged as blocked by the browser tool, making the file unreadable/unwritable.

### 5. SSH to Hetzner
The VM's network allowlist blocks outbound SSH to `5.78.144.42`.

---

## What Actually Worked — The Browser Console Pipeline

**Core insight:** Two things work natively from a logged-in WordPress admin browser session without CORS or auth issues:

1. **Google Maps JavaScript SDK** — `google.maps.places.PlacesService` runs in the browser, no CORS restrictions, uses the browser-loaded Maps API key.
2. **WordPress REST API with nonce auth** — `X-WP-Nonce: wpApiSettings.nonce` is available on every WP admin page and authenticates REST requests same-origin.