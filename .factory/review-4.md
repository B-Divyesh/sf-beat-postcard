# Review 4 — Make and share a rhythm challenge

**Verdict: PASS**

Date: 2026-09-06
Implementation candidate reviewed: `aa23aa145a8f50385b8698ea6e8f42910b3fba8e`
Documentation baseline reviewed: `37ea4b92ee75379cbf73e100ce82acbc2252a1bb` (reports and Graphify only; no product-code change)
Live URL: <https://beat-postcard.sociobot.in>

Finding count: **0**
Untested public claim count: **0**

## Job, audience, and first action

Beat Postcard lets two friends make an eight-beat percussion call, share its link, copy it, and add one reply bar. It is for friends who want a short browser music challenge without songs, installs, accounts, or rankings. The first action is **Try it with sample data**, which opens Mira's populated 104 BPM call.

Fresh live Chromium desktop (1440 by 1000) and phone (390 by 844, 2x, touch) views showed that action and the playable board before scrolling. Both views had no horizontal overflow. Evidence: `desktop-first.png` and `phone-first.png` in `/work/.evidence/beat-postcard-review-4/`.

## Clean candidate and public claims

A detached clean checkout at the implementation candidate completed `npm ci` with Node 22.23.2 and npm 10.9.8. Each command declared in `.factory/claims.json` ran separately and passed: **21 of 21**. The commands cover exchange completion and duration, win/loss and restart, demo isolation, sample data, keyboard/touch/audio, settings and draft recovery, privacy, link contents, product boundaries, free access, render rate, and invalid-link recovery.

- Claim-tag audit: 21 declarations, 21 unique matching `@claim:` tags, and no missing mapping.
- `npm run test:unit`: 4 of 4 passed.
- `npm test`: 23 of 23 passed in the clean checkout.
- `npm run build`: passed and produced `dist/`.
- `npm audit --audit-level=high`: zero vulnerabilities.
- Build output: JavaScript 38,689 bytes raw / 11,446 bytes gzip; CSS 19,051 bytes raw / 5,056 bytes gzip.

An initial full-suite run was mistakenly overlapped with a separate live browser review and one timing-sensitive sample-copy test failed under that reviewer-created contention. The same clean checkout was then run by itself and passed all 23 tests. The required separate claim commands had already passed before the overlapping run. This is not a product finding.

The landing page, game states, README, demo documentation, privacy page, and terms page were cross-checked against the claim declarations. No visitor-facing claim lacks an observable declared test. The product makes no offline or update promise.

The clean build matches live assets byte-for-byte:

| Asset | SHA-256 |
| --- | --- |
| `index-BRlWtHOJ.js` | `507b7eb4dfe5cc40fd25170ab509e773f712692ab6b2579630001a4c380923e9` |
| `index-BIFyx05B.css` | `f1f3660dcb2a0bd7fa269df14b740ba97da12b614c47417f68fe78bf2481c1c0` |

## Live game, demo, and recovery

The live demo showed the persistent **Demo — sample data, nothing is saved** label, 104 BPM, Mira source, and the eight expected sounds. Reset restored the sample. With a seeded real Bell draft and real settings, demo changes and reset left the real values unchanged. **Start for real** cleared all demo keys and restored the real Bell draft.

A fresh live desktop run reached each required state:

1. Eight deliberately wrong inputs opened **Copy attempt did not pass**.
2. The sample sequence entered with D/F/J/K opened **You copied the call**.
3. Eight reply sounds opened **The two-bar reply is complete**.
4. The completed URL opened in a separate fresh browser context with two rhythm bars.
5. **Play again** restored the original call in the ready state.

The recorded end screens are `loss-end.png` and `complete-end.png` in `/work/.evidence/beat-postcard-review-4/`; the structured run result is `live-run.json` in the same directory.

The live phone context had no horizontal overflow. A physical touch on Kick recorded the first beat. The clean suite covers keyboard focus, skip link, dialog focus return, timing-slider arrow operation, reduced-motion persistence, settings persistence, draft recovery, corrupt-storage recovery, and blocked-audio recovery.

Valid and invalid pattern routes, privacy, terms, robots, sitemap, and the designed HTTP 404 were checked. The deliberate unknown URL returned HTTP 404 with **Page not found** and a recovery link; its browser failed-resource entry is expected behavior, not a defect. Privacy and terms pages have route-specific titles and legal contact links.

## Accessibility, privacy, and delivery checks

Fresh live Playwright axe scans of home, demo, privacy, terms, invalid link, and static 404 found zero serious or critical violations. Each had `lang="en"`, a route-specific title, one `h1`, one `main`, and no unexpected console or page error. The factory URL verifier also passed title, language, landmark, image-alternative, button-label, and desktop/mobile console checks. Evidence is `live-axe.json` and `url-verify/verify.json` under `/work/.evidence/beat-postcard-review-4/`.

The declared privacy tests passed: the complete exchange is same-origin, requests no microphone, has no analytics/ads/tracking pixels, creates no identity record, and stores demo data separately. Live headers provide the matching same-origin CSP, no-referrer policy, MIME protection, microphone and payment restrictions, and frame restriction. There is no service worker, which matches the absence of an offline or update claim.

This is a static asynchronous link-sharing game. It has no account, backend, database, tenant, health endpoint, server restart state, realtime room, or rate-limited API. Backend isolation, restart, health, and 429/Retry-After checks therefore do not apply. The actual exchange was nevertheless completed with independent fresh browser clients.

## Earlier findings

- Verification 1 F-01 remains resolved: loss and 404 headings are plain **Copy attempt did not pass** and **Page not found**.
- Verification 1 F-02 remains resolved: sample details, link contents, microphone use, tracking, and product boundaries each have an observable declared claim test.
- Review 1 F-01 remains resolved: demo-banner controls have a contrasting dark 4 px focus ring.
- Review 1 F-02 remains resolved: both demo-banner controls and the timing control meet the 44 px phone touch target requirement.
- The absence of reply-rate telemetry, human calibration telemetry, offline support, and a realtime backend remains deliberate scope; no public copy promises these features.

## Acceptance result

**PASS.** This strict review has zero findings of every severity and zero untested public claims.
