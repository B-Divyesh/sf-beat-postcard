# Review 2 — Make and share a rhythm challenge

**Verdict: PASS**

Date: 2026-09-05

Implementation reviewed: `aa23aa145a8f50385b8698ea6e8f42910b3fba8e`

Repair documentation reviewed: `089ff4df07ff0486cc8c9828d023c470e6b96fa6`

Previous verification report reviewed: `5ef8dfbab6f87cd3858a4a74a6a628382902de26`

Live URL: <https://beat-postcard.sociobot.in>

Finding count: **0**

Untested public claim count: **0**

## Job, audience, and first action

The job is to make an eight-beat percussion call, share its link, and let a friend copy it and add one reply bar. It is for two friends who want a short browser music challenge without songs, installs, accounts, or rankings. The first action is **Try it with sample data**; it opens Mira's populated 104 BPM call.

Fresh 1440 × 1000 desktop and 390 × 844, 2x touch-phone contexts showed that job, audience, action, and game board before scrolling. The board began at 358 px on desktop and 686 px on phone. Neither viewport had horizontal overflow. Evidence: `desktop-first.png`, `phone-first.png`, and `live-check.json` in `/work/.evidence/beat-postcard-review-2/`.

## Clean candidate verification

A detached clean worktree at the implementation commit completed `npm ci` with Node 22.23.2 and npm 10.9.8. `npm audit --audit-level=high` reported zero vulnerabilities.

- Every one of the 21 commands declared in `.factory/claims.json` was run separately and passed. The log contains 21 commands and 21 passing outcomes.
- `npm run test:unit` passed: 4 of 4 tests.
- `npm test` passed: 23 of 23 browser tests.
- `npm run build` passed and produced `dist/`.
- The claim-tag audit found 21 declarations, 21 unique tags, exactly one matching tag per declaration, and no undeclared tags.
- The built JavaScript is 38,689 bytes raw and 11,446 bytes gzip. The CSS is 19,051 bytes raw and 5,056 bytes gzip.

The live JavaScript and CSS have the same SHA-256 values as the clean build:

- JavaScript: `507b7eb4dfe5cc40fd25170ab509e773f712692ab6b2579630001a4c380923e9`
- CSS: `f1f3660dcb2a0bd7fa269df14b740ba97da12b614c47417f68fe78bf2481c1c0`

Evidence: `claims.log`, `unit.log`, `full-browser.log`, `build.log`, and `audit.log` in `/work/.evidence/beat-postcard-review-2/`.

## Live game and demo verification

Fresh live sample mode showed the persistent **Demo — sample data, nothing is saved** label, Mira as the source, 104 BPM, and all eight expected sounds. Reset restored all eight sample beats. With a pre-seeded real Bell draft and settings value, demo settings and reset left the real values byte-for-byte unchanged. **Start for real** discarded every `beat-postcard:demo:*` key and restored the real Bell draft.

One deterministic live run reached all required endings:

1. Eight deliberately wrong sounds reached **Copy attempt did not pass**.
2. Mira's sequence reached **You copied the call**.
3. Eight reply sounds reached **The two-bar reply is complete**.
4. The completed link opened in an independent fresh browser context with both rhythm bars.

The completed sample flow used only `https://beat-postcard.sociobot.in`, had one top-level frame, made zero microphone requests, and stored only `beat-postcard:demo:session` in the demo namespace. Evidence: `loss-end.png`, `win-end.png`, `complete-end.png`, `live-check.json`, and `live-privacy.json`.

## Routes, accessibility, privacy, and recovery

- `/`, `/demo`, `/privacy`, `/terms`, valid 96 and 116 BPM links, invalid low/high tempo links, and an invalid-length link loaded their expected states with route-specific titles, one `h1`, and one `main`.
- `/definitely-missing` returned the designed **Page not found** page with HTTP 404. The browser's failed-resource console line for this deliberate 404 is expected behavior, not a defect.
- Playwright axe scans of home, demo, privacy, terms, invalid link, and static 404 found zero serious or critical violations.
- Keyboard D/F/J/K input created a shareable call. The Settings dialog opened, closed with Escape, and returned focus to its trigger.
- The live phone check found no visible target under 44 × 44 CSS px. The repaired demo focus indicator is 4 px, dark `rgb(8, 23, 35)` on the amber `rgb(245, 173, 40)` banner, with 9.41:1 contrast; the Reset control is 44 px high.
- Reduced motion applies the `reduce-motion` class and reduces transitions to 0.000001 seconds. The phone profile at 390 × 844, 2x scale, touch enabled, and 4x CPU throttling measured 60 FPS, above the 55 FPS claim.
- The live entry request loaded only document, script, and stylesheet from the product origin. No external script, font, media, analytics, ad, or tracking request was found.
- All discovered product links returned 200 or were explicit fragment, `mailto:`, or external links. `robots.txt` and `sitemap.xml` returned 200.

There is no backend, account, tenant, database, health endpoint, server restart state, or rate limit in this static asynchronous link-sharing game, so backend isolation and 429 checks do not apply. There is no offline or update promise and no service worker to test.

## Earlier findings

- Verification 1 F-01 is resolved: live loss and 404 headings are **Copy attempt did not pass** and **Page not found**.
- Verification 1 F-02 is resolved: sample details, link contents, microphone use, tracking, and product boundaries each have an observable declared claim test. The 21-to-21 claim audit and all individual commands passed.
- Review 1 F-01 is resolved: the two demo-banner actions now have a visible 9.41:1 focus indicator.
- Review 1 F-02 is resolved: both demo actions and the timing offset control meet the 44 px phone target requirement.
- The earlier notes about no reply-rate telemetry, no human calibration telemetry, no offline feature, and no realtime backend remain deliberate scope limits. The live copy makes none of these absent features a promise.

## Acceptance result

**PASS.** The reviewed implementation has zero findings of every severity and zero untested public claims.
