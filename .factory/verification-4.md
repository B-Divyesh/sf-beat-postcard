# Verification 4 — Make and share a rhythm challenge

**Verdict: PASS**

Date: 2026-09-06  
Implementation candidate reviewed: `aa23aa145a8f50385b8698ea6e8f42910b3fba8e`  
Documentation baseline reviewed: `2c8264bf549da509455ba2402a71f4f567467be9` (report-only; it does not change the product image)  
Live URL: <https://beat-postcard.sociobot.in>

Finding count: **0**  
Untested public claim count: **0**

## Job, audience, and first action

Beat Postcard lets two friends make an eight-beat percussion call, share its
link, copy it, and add a reply bar. It is for friends who want a short music
challenge without songs, installs, accounts, or rankings. The first action is
**Try it with sample data**, which opens Mira's populated 104 BPM call.

Fresh live Chromium desktop (1440 by 1000) and phone (390 by 844, 2x, touch)
views showed this job, audience, first action, and the playable board before
scrolling. There was no horizontal overflow. Screenshots are
`/work/.evidence/beat-postcard-verify-4/chromium-desktop-first.png` and
`/work/.evidence/beat-postcard-verify-4/chromium-phone-first.png`.

## Clean candidate and declared claims

A detached clean worktree at the implementation candidate completed `npm ci`
with Node 22.23.2 and npm 10.9.8. Every command declared in
`.factory/claims.json` ran separately and passed: **21 of 21**. The evidence
log is `/tmp/beat-postcard-verify-4/claims.log`.

- The claim-tag audit found 21 declarations, 21 unique tags, exactly one
  `@claim:<id>` test per declaration, and no missing mapping.
- `npm run test:unit` passed: 4 of 4 tests.
- `npm test` passed: 23 of 23 Chromium browser tests.
- `npm run build` passed and produced `dist/`.
- `npm audit --audit-level=high` reported zero vulnerabilities.
- The build is 38,689 bytes JavaScript (11.52 kB gzip) and 19,051 bytes CSS
  (5.03 kB gzip).

The 21 passing claim commands cover the complete exchange and round duration,
win/loss endings, restart, labelled and isolated demo/reset, sample details,
keyboard and phone touch input, audio gesture and synthesized sounds, timing
check, saved settings and draft recovery, local privacy and link contents, no
microphone/tracking/product-boundary controls, free/no-account access, phone
render rate, and invalid-link recovery. The site makes no offline or update
claim, so there is no untested offline or service-worker claim.

## Live game run

On the live candidate, a fresh Chromium 145.0.7632.6 creator made an
eight-note call. A separate fresh receiver opened that URL, heard it, used
D/F/J/K to copy it, reached the win state, added eight reply notes, and reached
the completed two-bar screen. A third fresh client opened the completed URL.
The same live Chromium run deliberately copied all eight demo notes wrongly
and reached **Copy attempt did not pass** with 0/8 matches. The actual end
screen is recorded in
`/work/.evidence/beat-postcard-verify-4/chromium-loss-end.png`.

The live demo kept the persistent **Demo — sample data, nothing is saved**
label, Mira source, 104 BPM, and all eight sample notes. Reset restored the
sample. The Chromium live run also confirmed that sound waits before the user
press, becomes ready after **Enable sound**, unfinished drafts return after
reload, and Wide timing plus Reduce motion persist after reload.

The valid 96 and 116 BPM routes opened playable calls. Invalid low/high tempo,
version, and short-pattern routes opened **Open a complete rhythm link**.
`/definitely-missing` returned the designed **Page not found** response with
HTTP 404, which is expected behavior rather than a defect.

## Firefox and WebKit coverage

The product documents Playwright Chromium as its browser prerequisite; it does
not publicly name Firefox or WebKit support. For this added compatibility
coverage, Playwright 1.58.2 Firefox 146.0.1 and WebKit 26.0 were installed,
including the documented host dependencies.

WebKit 26.0 completed the same fresh live phone touch check and full,
independent creator/receiver/return-client run: wrong sample inputs reached
the loss end state, keyboard copy reached the win, the reply reached completion,
and a third context opened the return link. It also passed audio start, draft
reload, saved settings, sample/reset, no-overflow, and no-console-error checks.
Evidence is `cross-engine-followup.json` and the WebKit end screenshots in
`/work/.evidence/beat-postcard-verify-4/`.

Firefox 146.0.1 launched and rendered the fresh live desktop game and demo
correctly: title, plain first-screen content, board, 104 BPM sample, and reset
all worked with no page or console error. The Firefox Playwright worker does
not support its `isMobile` emulation flag; the supported 390 by 844 touch
fallback rendered without overflow, but did not deliver the synthetic touch.
More importantly, after a real Playwright click, the live audio gate remained
at **Sound waits for your first press**. A direct `AudioContext.resume()` in
that headless Firefox worker also never resolved. Thus the copy phase could not
start in this worker. This is unavailable headless audio/input infrastructure,
not a product defect or an untested public Firefox promise: Chromium is the
only documented browser prerequisite, and WebKit completed the equivalent
cross-engine flow. Reproduce with the pinned Firefox browser in this worker:
open `/`, click **Enable sound**, then observe the unchanged gate; a direct
`new AudioContext().resume()` hangs.

An initial WebKit pass logged one stylesheet-CSP message while its moving pad
click was retried. A clean follow-up loaded the live CSS sheet, rendered the
expected board color, completed the game, and had no console errors. The live
header permits `style-src 'self'`; the message was not reproducible and is not
a finding.

## Accessibility, privacy, routes, and deployment match

Fresh live Chromium axe scans of `/`, `/demo`, `/privacy`, `/terms`, an invalid
pattern, and `/404.html` found zero serious or critical violations. Each route
had its route-specific title, exactly one `h1`, exactly one `main`, and no
console errors. The evidence is
`/work/.evidence/beat-postcard-verify-4/live-axe.json`.

The declared privacy claim suite passed from the clean candidate, including
same-origin request checks through a complete exchange, no microphone request,
no tracking/ads/pixels, and no identity record. The static product has no
backend, database, account, realtime room, tenant, health, restart, or
rate-limit endpoint. Exchange state is deliberately encoded in the shared URL;
therefore backend tenant/429 checks do not apply.

Live `/`, `/demo`, `/privacy`, `/terms`, valid and invalid pattern routes,
`robots.txt`, and `sitemap.xml` returned 200. The deliberate missing route
returned 404 with its designed recovery page. The privacy and terms pages are
present and passed the live accessibility scan.

The clean built JavaScript and CSS SHA-256 values match the live assets exactly:

| Asset | SHA-256 |
| --- | --- |
| `index-BRlWtHOJ.js` | `507b7eb4dfe5cc40fd25170ab509e773f712692ab6b2579630001a4c380923e9` |
| `index-BIFyx05B.css` | `f1f3660dcb2a0bd7fa269df14b740ba97da12b614c47417f68fe78bf2481c1c0` |

## Earlier findings and result

All earlier findings remain resolved on the current live candidate:

- Verification 1 F-01: loss and 404 headings are the plain **Copy attempt did
  not pass** and **Page not found**.
- Verification 1 F-02: the five formerly undeclared promise groups have their
  own observable claims; the 21-to-21 audit and every command passed again.
- Review 1 F-01: demo-banner keyboard focus remains visible and contrasting.
- Review 1 F-02: demo actions and the timing control retain their 44 px mobile
  targets through the full browser suite.

No reply-rate telemetry, human calibration telemetry, offline feature, service
worker, or realtime service is promised. Those deliberate scope limits are not
defects.

**PASS.** This independent verification has zero findings of every severity
and zero untested public claims.
