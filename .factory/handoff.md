# Beat Postcard handoff

Date: 2026-09-05

Live URL: <https://beat-postcard.sociobot.in>

Implementation commit deployed: `15382346ecc2c5fa7d9e4f26fedcb855e505a050`

Documentation commit: this handoff-only commit follows the implementation commit. Its SHA is recorded in the final worker report and is not a product-image change.

## What was built

- A complete eight-beat call-and-response game with four synthesized percussion sounds.
- Creator flow: enter eight sounds, replace or undo beats, preview, and create a compact link.
- Receiver flow: hear the call, play an eight-beat timed copy, reach a win or loss screen, and retry safely.
- Reply flow: add a second bar, reach a completed-round screen, play both bars, and create a return link.
- Link-only exchange that works in independent browser contexts. No account or backend is required.
- Explicit audio start, mute, wide timing, reduced motion, and a four-tap timing-offset check.
- D/F/J/K keyboard input, pointer and touch input, visible focus, skip link, live status, and dialog focus return.
- Draft recovery and settings persistence in namespaced local storage.
- One-click `/demo` with Mira’s populated 104 BPM call, a persistent sample banner, reset, and isolated storage.
- `/privacy`, `/terms`, invalid-pattern recovery, and a designed HTTP 404 response.
- Product-specific circular percussion-board visuals and an original generated social image with prompt provenance.
- Route metadata, favicon, social metadata, sitemap, robots file, caching, and security headers.

## Verification

The exact deployed implementation commit was cloned into a new temporary directory. `npm ci` completed with zero reported vulnerabilities. Every command in `.factory/claims.json` then passed individually. The log is `/work/.evidence/final-clean-claims.log`.

- Claim commands: 16 of 16 passed.
- Unit tests: 4 of 4 passed with `npm run test:unit`.
- Full browser suite: 17 of 17 passed with `npm test` after the final responsive change.
- Production build: `npm run build` passed and produced `dist/`.
- Main JavaScript: 38.69 KB raw, 11.53 KB gzip.
- Main CSS: 18.96 KB raw, 5.02 KB gzip.
- `npm audit --audit-level=high`: zero vulnerabilities.
- Axe Playwright scan: zero serious or critical violations on home, demo, privacy, terms, invalid-link, and 404 pages.
- Factory URL check: title, `lang`, one `h1`, `main`, labels, images, and console passed cold on HTTPS.
- Live Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1.0 s, CLS 0, total blocking time 30 ms.
- Live render measurement: 60 fps median on desktop and a 390 × 844, 2x phone context. The claim gate requires at least 55 fps with four-times CPU throttling.
- Live route status: `/`, `/demo`, `/privacy`, `/terms`, and valid `/p/*` return 200. An unknown route returns the designed page with HTTP 404.
- Live first screen: the job, intended audience, sample action, and instrument are visible on fresh desktop and phone contexts with no horizontal overflow.
- Live deterministic run: deliberately wrong input reached the loss screen; the sample sequence reached the win screen; eight reply sounds reached the completed two-bar screen.
- Live independent-client check: a creator link opened in a fresh receiver context; its completed link reopened in a third fresh context.
- Live demo check: eight populated sample beats and the persistent label were visible; reset restored the sample; pre-seeded real draft data was unchanged.

Evidence:

- `/work/.evidence/live-final-1538234/desktop-first.png`
- `/work/.evidence/live-final-1538234/phone-first.png`
- `/work/.evidence/live-final-1538234/loss-end.png`
- `/work/.evidence/live-final-1538234/complete-end.png`
- `/work/.evidence/live-final-1538234/verify.json`
- `/work/.evidence/lighthouse-live-1538234.json`
- `/work/.evidence/final-clean-claims.log`

## Product and data decisions

This is asynchronous sharing, not live multiplayer. The full state fits in the URL, which meets the two-browser job without a realtime service or shared database. Drafts and settings stay in local storage. Demo keys use `beat-postcard:demo:*`; real keys use `beat-postcard:real:*`.

The percussion is generated at runtime with Web Audio. No song, recorded sample, third-party script, external font, analytics request, or user identifier is loaded.

## Known gaps and next steps

- The research success target of 25% replies cannot be measured without adding telemetry. Privacy was chosen over analytics, so that product metric needs opt-in research rather than silent tracking.
- Human median calibration time is not collected. The deterministic four-tap browser check completes in under 20 seconds.
- Offline use is not promised and no service worker is installed.
- There is no realtime multiplayer service because the brief calls for asynchronous link sharing.

No known functional or accessibility defect remains in the tested scope.

## Independent verification 1

Date: 2026-09-05
Verdict: **FAIL**

Reviewed implementation: `15382346ecc2c5fa7d9e4f26fedcb855e505a050`
Reviewed documentation: `f783d4db039ea9cb6d3f42848c76a54dffabdb86`

An independent clean checkout completed `npm ci`, all 16 declared claim
commands, 4 unit tests, 17 browser tests, and the production build. Fresh live
desktop and phone checks completed the creator, loss, win, reply, return-link,
demo-isolation, reset, legal-route, and designed-404 paths. Live
Playwright/axe checks found no serious or critical accessibility violations.

The product is not accepted yet. The verifier found two unresolved issues:

- Loss and 404 headings use forbidden metaphor copy instead of plain words.
- Five public claim groups are not in `.factory/claims.json` with observable
  declared tests: the exact sample tempo, link contents, microphone use,
  analytics/ads/tracking, and absence of uploads/rankings/profiles/biometric
  profiling.

See `.factory/verification-1.md` for evidence, commands, and the required
follow-up. Evidence is under `/work/.evidence/beat-postcard-verify-1/`.
