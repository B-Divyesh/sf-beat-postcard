# Verification 2 — Copy and extend a rhythm

**Verdict: PASS**

Date: 2026-09-05  
Implementation reviewed: 36324c221bd3bd3e2a6d45f1d8ea61be8df61276  
Documentation pointer reviewed: d637d8e6d3dc71f3abb2cfafe4b37eb4538b925b  
Live URL: https://beat-postcard.sociobot.in

Finding count: **0**  
Untested public claim count: **0**

## Job, audience, and first action

The job is to make an eight-beat percussion call, send its link, and have a friend copy it and add one reply bar. It is for two friends who want a short browser music challenge without songs, installs, accounts, or rankings. The first action is **Try it with sample data**; it opens Mira's populated sample.

Fresh 1440 × 1000 desktop and 390 × 844, 2x touch-phone contexts both showed that job, audience, first action, and the game board before scrolling. The phone had no horizontal overflow. The captured first views are /work/.evidence/beat-postcard-verify-2-live/desktop-first.png and /work/.evidence/beat-postcard-verify-2-live/phone-first.png.

## Clean checkout verification

A new checkout of the implementation candidate completed npm ci with Node 22.23.2 and npm 10.9.8. It reported zero audit vulnerabilities. All commands ran from that checkout, not from the working tree.

- All 21 declared claim commands passed individually. Full output: /work/.evidence/beat-postcard-verify-2-claims.log.
- A tag audit found 21 unique declared IDs and exactly one matching @claim:<id> test for each ID.
- npm run test:unit: 4 of 4 passed.
- npm test: 22 of 22 passed, including keyboard, touch, reduced-motion, route, accessibility, and mobile checks.
- npm run build: passed and produced dist/.
- npm audit --audit-level=high: zero vulnerabilities.
- Build evidence: /work/.evidence/beat-postcard-verify-2-clean-verify.log.

The generated main JavaScript was 38,689 bytes (11.52 kB gzip) and CSS was 18,962 bytes (5.02 kB gzip), within the static-product JavaScript budget.

| Claim IDs | Result |
| --- | --- |
| complete-exchange, round-duration, win-loss-endings, restart-reset, demo-sandbox | Pass |
| sample-call, keyboard-controls, touch-controls, audio-gesture, synthesized-sounds | Pass |
| timing-check, settings-persist, draft-recovery, local-privacy, share-link-contents | Pass |
| no-microphone, no-tracking, product-boundaries, free-no-account, render-rate, invalid-recovery | Pass |

Each listed claim command was run separately; its command, one tagged observable test, and passing output are recorded in the claims evidence log. The landing page, game copy, privacy page, README, and demo documentation were cross-checked against .factory/claims.json. All testable visitor promises map to a declared observable claim. The product makes no offline or update promise.

## Live browser verification

Fresh live contexts completed this deterministic game run:

1. Loaded /demo; the persistent **Demo — sample data, nothing is saved** banner, Mira source, 104 BPM tempo, and all eight sample sounds appeared.
2. Changed demo-only reduced motion, reset the demo, and verified that seeded real draft and settings values were byte-for-byte unchanged.
3. Played eight deliberately wrong inputs and reached **Copy attempt did not pass**. Evidence: loss-end.png.
4. Retried with the sample sequence by keyboard and reached **You copied the call** with 8/8 matches. Evidence: win-end.png and win-run.json.
5. Added eight reply beats, reached **The two-bar reply is complete**, and opened the returned completed link in a fresh browser context. Evidence: complete-end.png and summary.json.

The live request log during the complete demo flow contained only https://beat-postcard.sociobot.in and one top-level frame. It made no console or page errors on normal routes. The 390 × 844, 2x touch context with 4x CPU throttling measured 60 FPS, above the advertised 55 FPS threshold.

Routes /, /demo, /privacy, /terms, a valid pattern, robots.txt, and sitemap.xml returned 200. A malformed pattern displayed its recovery page. /definitely-missing deliberately returned the designed **Page not found** page with HTTP 404; this is expected behavior, not a defect. Route titles, one-h1/one-main structure, and internal product links passed.

Playwright axe scans of home, demo, privacy, terms, invalid-pattern, and static 404 pages found zero serious or critical violations. The clean browser suite also verified the skip link, keyboard-only controls, focus movement after navigation, visible focus styling, touch targets, and reduced motion. No backend exists: exchange state is encoded in the link, so tenant isolation, restart persistence, health, and rate-limit checks do not apply.

Full live evidence is in /work/.evidence/beat-postcard-verify-2-live/.

## Candidate and deployment match

The clean build emitted /assets/index-x43LR2-L.js. The deployed page uses the same asset. Both SHA-256 values are baa8c86df10f3fe9749574937e120dc870ca36d357fde2cf758a819693b0a5ad.

## Earlier findings and scope notes

Verification 1's two findings are resolved:

- F-01, forbidden loss and 404 metaphor headings: live loss and 404 pages now use **Copy attempt did not pass** and **Page not found**.
- F-02, five undeclared public claim groups: sample details, link contents, microphone use, tracking, and product boundaries now have their own declared observable claim tests. The 21-to-21 tag audit passed.

The previous handoff's non-defects remain accurate: there is no tracking-based measurement of the research reply-rate target, no human calibration telemetry, no offline promise or service worker, and no realtime backend because this is an asynchronous link-sharing game. These are stated product-scope decisions, not findings.

## Acceptance result

**PASS.** The implementation candidate has zero findings at every severity and zero untested public claims.

