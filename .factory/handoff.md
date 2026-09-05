# Beat Postcard handoff

Date: 2026-09-05

Live URL: <https://beat-postcard.sociobot.in>

Implementation commit deployed: `36324c221bd3bd3e2a6d45f1d8ea61be8df61276`

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
The live JavaScript asset exactly matched the clean build of the reviewed
implementation candidate by SHA-256.

The product is not accepted yet. The verifier found two unresolved issues:

- Loss and 404 headings use forbidden metaphor copy instead of plain words.
- Five public claim groups are not in `.factory/claims.json` with observable
  declared tests: the exact sample tempo, link contents, microphone use,
  analytics/ads/tracking, and absence of uploads/rankings/profiles/biometric
  profiling.

See `.factory/verification-1.md` for evidence, commands, and the required
follow-up. Evidence is under `/work/.evidence/beat-postcard-verify-1/`.

## Repair 1 — accepted candidate

Date: 2026-09-05

Implementation commit deployed: `36324c221bd3bd3e2a6d45f1d8ea61be8df61276`

Documentation commit for this repair record:
`2ad4d7ccbf7fadc5be07587d900500be17d335f6`. Documentation-only commits do not
change the deployed product image.

### Findings resolved

| Earlier finding | Resolution | Regression evidence |
| --- | --- | --- |
| F-01: metaphor headings on loss and 404 pages | Replaced all reported loss, SPA 404, and static 404 headings with **Copy attempt did not pass** and **Page not found**. | The loss-path browser test and the static 404 accessibility test assert the displayed recovery headings. Fresh live loss and HTTP 404 runs passed. |
| F-02: five untested public promise groups | Added five declared, observable browser claims: `sample-call`, `share-link-contents`, `no-microphone`, `no-tracking`, and `product-boundaries`. | Each declaration maps to exactly one tagged outcome test; the claim-tag audit reports 21 of 21 declarations with one test each. |

The new tests inspect the populated sample board, the actual generated URL,
observed microphone API use, all network origins and frames during a complete
sample exchange, and the completed game's visible controls plus persisted demo
state. They do not merely search product source text.

### Verification

From a clean clone of implementation `36324c2`, `npm ci` completed with zero
reported vulnerabilities. Every command declared in `.factory/claims.json` was
then run separately: **21 of 21 passed**. The clean suite also passed:

- `npm run test:unit`: 4 of 4 tests passed.
- `npm test`: 22 of 22 browser tests passed, including accessibility, keyboard,
  reduced-motion, mobile layout, and all declared claims.
- `npm run build`: passed and produced `dist/`.
- `npm audit --audit-level=high`: zero vulnerabilities.
- Production assets: JavaScript 38.69 kB raw / 11.52 kB gzip; CSS 18.96 kB raw
  / 5.02 kB gzip.

Deployment used `/opt/fleet/lib/deploy-static.sh beat-postcard dist` with the
product's existing Static Web App configuration. Deployment ID
`0272b4cf-f025-4f24-a9b7-2d1ab614ef66` succeeded. The HTTPS product then passed
the factory URL check: HTTP 200, title, `lang`, one `h1`, `main`, labels, image
alt checks, and no console errors.

Fresh live browser checks passed on desktop and a 390 by 844, 2x touch phone:

- Before scrolling, both contexts showed the job, audience, **Try it with
  sample data**, and the playable percussion board. The phone had no horizontal
  overflow.
- The labelled 104 BPM Mira demo reset correctly and preserved pre-seeded real
  drafts and settings. Start for real restored the real draft.
- A deliberately wrong run reached the plain loss screen. The sample sequence
  reached the win screen; eight reply sounds produced a completed two-bar link;
  that link opened correctly in a fresh browser context.
- Live Playwright/axe scans of `/`, `/demo`, `/privacy`, `/terms`, a valid
  pattern, and `/definitely-missing` found zero serious or critical violations.
  The final path deliberately returned the designed page with HTTP 404.
- Live internal route checks returned 200 for `/`, `/demo`, `/privacy`,
  `/terms`, the valid pattern, `robots.txt`, and `sitemap.xml`; the deliberately
  missing path returned 404.
- The live test phone profile measured 60 fps at 390 by 844, 2x device scale,
  and four-times CPU throttling (claim threshold: 55 fps).

Evidence:

- `/work/.evidence/repair-1-clean-claims.log`
- `/work/.evidence/repair-1-clean-verify.log`
- `/work/.evidence/repair-1-claim-tag-audit.json`
- `/work/.evidence/repair-1-live/verify.json`
- `/work/.evidence/repair-1-live/live-browser-run.json`
- `/work/.evidence/repair-1-live/desktop-first.png`
- `/work/.evidence/repair-1-live/phone-first.png`
- `/work/.evidence/repair-1-live/loss-end.png`
- `/work/.evidence/repair-1-live/complete-end.png`
- `/work/.evidence/repair-1-live/404-live.png`

### Remaining scope notes

The previous scope decisions remain honest: there is no tracking-based measure
of the research reply-rate target, no human calibration-time telemetry, no
offline promise or service worker, and no realtime service because sharing is
asynchronous through a link. The free product has no paid offer to register.
No current product defect is known in the verified scope.

## Independent verification 2

Date: 2026-09-05
Verdict: **PASS**

Implementation reviewed: `36324c221bd3bd3e2a6d45f1d8ea61be8df61276`
Documentation pointer: `d637d8e6d3dc71f3abb2cfafe4b37eb4538b925b`

An independent fresh checkout ran all 21 declared claim commands separately,
4 unit tests, all 22 browser tests, the production build, and the high-severity
audit. Every command passed. The clean build's live JavaScript asset matched
the HTTPS asset by SHA-256. Fresh desktop and phone checks confirmed the first
screen, demo isolation and reset, loss, win, reply, return link, routes, legal
pages, designed HTTP 404, keyboard/touch/reduced-motion paths, live axe scans,
and a 60 FPS phone-profile measurement. The repaired plain loss/404 headings
and all five newly declared claim groups were verified. There are zero findings
and zero untested public claims.

Report: `.factory/verification-2.md`
Evidence: `/work/.evidence/beat-postcard-verify-2-claims.log`,
`/work/.evidence/beat-postcard-verify-2-clean-verify.log`, and
`/work/.evidence/beat-postcard-verify-2-live/`.

## Strict review 1

Date: 2026-09-05

Verdict: **FAIL**

Implementation reviewed: `36324c221bd3bd3e2a6d45f1d8ea61be8df61276`

Documentation reviewed: `3f0decb2cf9b6ccc256b8513e374be0030ee8f94`

A clean candidate checkout passed all 21 declared claim commands separately,
the 21-to-21 claim-tag audit, 4 unit tests, 22 browser tests, the production
build, and the high-severity audit. The live JavaScript still matches the clean
candidate byte-for-byte. Fresh live desktop and phone contexts completed demo
isolation and reset, loss, win, reply, fresh-client return, restart, invalid and
boundary links, privacy and legal routes, reduced motion, keyboard focus,
same-origin request inspection, and a 60 FPS phone-profile measurement.

Two accessibility findings remain:

- The demo banner's **Reset demo** and **Start for real** buttons show an amber
  focus outline against the same amber background, giving the visible focus
  indicator 1:1 contrast.
- Those two buttons are 38 CSS px high on the phone, and the Settings timing
  slider is 16 CSS px high. The required minimum is 44 × 44 CSS px.

No public claim is untested. Product code was not changed during this review.
The pre-existing `graphify-out/` working-tree changes were left untouched.

Report: `.factory/review-1.md`

Evidence: `/work/.evidence/beat-postcard-review-1-*`

## Repair 2 — accessibility findings resolved

Date: 2026-09-05

Implementation commit deployed:
`aa23aa145a8f50385b8698ea6e8f42910b3fba8e`

The documentation commit follows the implementation commit. Its exact SHA is
recorded in the final worker report; it does not change the deployed product
image.

### Changes

- The demo banner's **Reset demo** and **Start for real** controls now use a
  dark focus outline against the amber banner. The live rendered contrast is
  9.41:1, above the required 3:1.
- Both demo actions are now 44 CSS px high on the tested phone.
- The Settings **Timing offset** slider now has a 44 CSS px hit area.
- The product design record now states the 44 CSS px minimum and retains 48 px
  primary game controls.
- Browser regressions tab to each banner action and calculate contrast from
  rendered colors. The mobile regression measures actual hit areas on the
  home page, demo page, and open Settings dialog. These are rendered outcomes,
  not source-string checks.

### Clean verification

A fresh clone of the pushed implementation commit completed `npm ci` with zero
reported vulnerabilities. All checks ran from that clone:

- Every command in `.factory/claims.json`: 21 of 21 passed individually.
- Claim-tag audit: 21 unique declarations, exactly one matching tag per claim,
  no undeclared tags, and all commands matched their IDs.
- `npm run test:unit`: 4 of 4 passed.
- `npm test`: 23 of 23 browser tests passed.
- `npm run build`: passed and produced `dist/`.
- `npm audit --audit-level=high`: zero vulnerabilities.
- Main JavaScript: 38,689 bytes raw / 11,446 bytes gzip.
- Main CSS: 19,051 bytes raw / 5,056 bytes gzip.

### Deployment and live verification

The clean build was deployed with
`/opt/fleet/lib/deploy-static.sh beat-postcard dist`. Deployment ID
`42a6c12f-1d06-4d4b-aaa2-20f1bfcd4436` succeeded. The custom HTTPS domain
returned 200. The live JavaScript and CSS SHA-256 values matched the clean
build exactly.

Fresh 1440 by 1000 desktop and 390 by 844, 2x touch-phone contexts confirmed:

- Before scrolling, both showed the job, audience, **Try it with sample
  data**, and the game board. Neither had horizontal overflow.
- `/demo` showed the persistent sample label, Mira, 104 BPM, and all eight
  populated beats.
- Reset restored the sample, Start for real restored a pre-seeded real Bell
  draft, and demo actions left real draft and settings values unchanged.
- Keyboard focus reached both banner actions. Each showed a 4 px dark outline
  with 9.41:1 contrast against the banner.
- Both banner actions and the timing slider measured 44 CSS px high.
- A deliberately wrong copy reached **Copy attempt did not pass**. Retry then
  reached **You copied the call** with the sample sequence. Eight reply sounds
  reached **The two-bar reply is complete**; a fresh third context opened the
  completed two-bar link. Play again restored the original ready state.
- The full exchange used only the product origin, opened one top-level frame,
  requested no microphone, and produced no page or console errors.
- Home, demo, privacy, terms, valid 96 and 116 BPM links, and invalid links
  returned the expected pages. Invalid versions, low/high tempos, note values,
  and lengths all showed the recovery action. The designed unknown route
  deliberately returned HTTP 404.
- Live axe scans reported zero serious or critical violations across home,
  demo, privacy, terms, valid-pattern, invalid-pattern, and 404 states.
- The factory URL verifier passed title, language, one `h1`, `main`, image
  alternatives, labelled buttons, and console checks.
- The 390 by 844, 2x touch profile under 4x CPU throttling recorded five 60
  FPS samples; the declared threshold is 55 FPS.
- Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100,
  SEO 100; LCP 1.0 s, total blocking time 20 ms, CLS 0.
- All discovered product links returned 200. Reduced-motion CSS remained
  effective. No service worker is installed, matching the absence of an
  offline or update promise.

Evidence:

- `/work/.evidence/beat-postcard-repair-2-clean-claims.log`
- `/work/.evidence/beat-postcard-repair-2-claim-tag-audit.json`
- `/work/.evidence/beat-postcard-repair-2-clean-verify.log`
- `/work/.evidence/beat-postcard-repair-2-clean-audit-assets.log`
- `/work/.evidence/beat-postcard-repair-2-deployment-match.log`
- `/work/.evidence/beat-postcard-repair-2-url/verify.json`
- `/work/.evidence/beat-postcard-repair-2-live/live-browser-run.json`
- `/work/.evidence/beat-postcard-repair-2-live/desktop-first.png`
- `/work/.evidence/beat-postcard-repair-2-live/phone-first.png`
- `/work/.evidence/beat-postcard-repair-2-live/reset-focus.png`
- `/work/.evidence/beat-postcard-repair-2-live/start-real-focus.png`
- `/work/.evidence/beat-postcard-repair-2-live/loss-end.png`
- `/work/.evidence/beat-postcard-repair-2-live/win-end.png`
- `/work/.evidence/beat-postcard-repair-2-live/complete-end.png`
- `/work/.evidence/beat-postcard-repair-2-live-links-console.json`
- `/work/.evidence/beat-postcard-repair-2-live-invalid-boundaries.json`
- `/work/.evidence/beat-postcard-repair-2-lighthouse.json`
- `/work/.evidence/beat-postcard-repair-2-lighthouse-summary.json`
- `/work/.evidence/catalog-description.txt`

### Earlier findings and remaining scope

Verification 1's plain-copy and missing-claim findings remain resolved. Strict
review 1's two accessibility findings are resolved by this implementation and
its rendered regressions. No public claim is untested.

The documented scope limits remain unchanged: there is no silent telemetry for
the 25% reply research target, no human calibration-time tracking, no offline
promise, and no realtime backend because exchanges are asynchronous links. The
current product is free and advertises no paid offer, so no billing metadata is
required. No known product defect remains in the verified scope.

## Independent verification 3

Date: 2026-09-05

Verdict: **PASS**

Implementation reviewed: `aa23aa145a8f50385b8698ea6e8f42910b3fba8e`
Repair documentation reviewed: `089ff4df07ff0486cc8c9828d023c470e6b96fa6`

An independent fresh worktree ran `npm ci`, `npm audit --audit-level=high`, all 21 declared claim commands individually, 4 unit tests, all 23 browser tests, and the production build. All checks passed. The deployed JavaScript and CSS matched the clean build by SHA-256.

Fresh live desktop and phone contexts showed the job, audience, sample action, and game board before scrolling. The live demo was populated and persistently labelled; Reset restored it; Start for real left pre-seeded real data unchanged. The deterministic run reached loss, win, completed reply, and a fresh-client return link. Live checks also passed routes and recovery, legal pages, designed HTTP 404, same-origin privacy requests, keyboard focus, reduced motion, axe, 44 px phone targets, 9.41:1 demo focus contrast, and 60 FPS under the declared phone profile.

All Verification 1 and Strict review 1 findings remain resolved. There are zero findings and zero untested public claims. Full report: `.factory/verification-3.md`. Evidence: `/work/.evidence/beat-postcard-verify-3/`.

## Strict review 2

Date: 2026-09-05

Verdict: **PASS**

Implementation reviewed: `aa23aa145a8f50385b8698ea6e8f42910b3fba8e`

Repair documentation reviewed: `089ff4df07ff0486cc8c9828d023c470e6b96fa6`

This review made no product-code change. A clean detached worktree ran all 21 declared claim commands separately, 4 unit tests, 23 browser tests, the production build, and the high-severity audit. All passed. The production JavaScript and CSS matched the live HTTPS assets by SHA-256.

Fresh desktop and phone contexts showed the job, audience, sample action, and playable board before scrolling. The live demo remained labelled and populated, reset correctly, and preserved pre-seeded real data. A deterministic live run reached loss, win, completed reply, and an independent return link. Live checks also covered normal, invalid, and boundary pattern links; privacy and terms; designed HTTP 404; same-origin request behavior; no microphone request; keyboard and dialog focus; reduced motion; phone targets; focus contrast; axe; and the 60 FPS phone profile.

Verification 1 F-01/F-02 and Review 1 F-01/F-02 remain resolved. There are zero findings and zero untested public claims.

Report: `.factory/review-2.md`

Evidence: `/work/.evidence/beat-postcard-review-2/`
