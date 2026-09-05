# Verification 3 — Make and share a rhythm challenge

**Verdict: PASS**

Date: 2026-09-05
Implementation reviewed: `aa23aa145a8f50385b8698ea6e8f42910b3fba8e`
Repair documentation reviewed: `089ff4df07ff0486cc8c9828d023c470e6b96fa6`
Live URL: <https://beat-postcard.sociobot.in>

Finding count: **0**
Untested public claim count: **0**

## Job, audience, and first action

The job is to make an eight-beat percussion call, send its link, and let a friend copy it and add one reply bar. It is for two friends who want a short browser music challenge without songs, installs, accounts, or rankings. The first action is **Try it with sample data**; it opens Mira's populated call.

Fresh 1440 × 1000 desktop and 390 × 844, 2x touch-phone contexts showed this job, audience, sample action, and the playable board before scrolling. The desktop board ended at 846 px inside the 1000 px viewport; the phone board started at 674 px inside the 844 px viewport. Neither view had horizontal overflow. Evidence: `desktop-first.png`, `phone-first.png`, and `live-check.json` in `/work/.evidence/beat-postcard-verify-3/`.

## Clean candidate verification

A new detached worktree at the implementation commit completed `npm ci` with Node 22.23.2 and npm 10.9.8. `npm audit --audit-level=high` reported zero vulnerabilities. These checks ran in that worktree, not in the existing dirty working tree.

- `npm run test:unit`: **4 of 4 passed**.
- `npm test`: **23 of 23 passed**.
- `npm run build`: passed and wrote `dist/`.
- Production JavaScript: 38,689 bytes raw and 11,446 bytes gzip.
- Production CSS: 19,051 bytes raw and 5,056 bytes gzip.
- Claim-tag audit: 21 declarations, 21 unique matching tags, no missing, duplicate, or undeclared tags.

Every command in `.factory/claims.json` was run separately and passed:

| Claim | Result |
| --- | --- |
| `complete-exchange` | Pass |
| `round-duration` | Pass |
| `win-loss-endings` | Pass |
| `restart-reset` | Pass |
| `demo-sandbox` | Pass |
| `sample-call` | Pass |
| `keyboard-controls` | Pass |
| `touch-controls` | Pass |
| `audio-gesture` | Pass |
| `synthesized-sounds` | Pass |
| `timing-check` | Pass |
| `settings-persist` | Pass |
| `draft-recovery` | Pass |
| `local-privacy` | Pass |
| `share-link-contents` | Pass |
| `no-microphone` | Pass |
| `no-tracking` | Pass |
| `product-boundaries` | Pass |
| `free-no-account` | Pass |
| `render-rate` | Pass |
| `invalid-recovery` | Pass |

Evidence: `npm-ci.log`, `npm-audit.log`, `claims.log`, and `clean-quality.log` in `/work/.evidence/beat-postcard-verify-3/`.

## Live product verification

The deployed JavaScript and CSS exactly matched the clean candidate by SHA-256. The live asset names were `index-BRlWtHOJ.js` and `index-BIFyx05B.css`; both comparisons passed.

The fresh `/demo` page showed the persistent **Demo — sample data, nothing is saved** label, Mira as source, 104 BPM, and all eight populated sounds. Reset restored the sample. With pre-seeded real Bell draft and settings values, **Start for real** restored the real draft and the demo did not change either real value.

One deterministic live run recorded all required end states:

1. Eight deliberately wrong sounds reached **Copy attempt did not pass**.
2. The sample sequence reached **You copied the call**.
3. Eight reply sounds reached **The two-bar reply is complete**.
4. Its completed link opened in a separate fresh browser context.

The recorded end-state evidence is `loss-end.png`, `win-end.png`, `complete-end.png`, and `live-check.json`. The complete sample exchange made requests only to `https://beat-postcard.sociobot.in`, used one top-level frame, and produced no page or console errors.

Routes `/`, `/demo`, `/privacy`, `/terms`, valid 96 and 116 BPM patterns, `robots.txt`, and `sitemap.xml` returned 200. Invalid low/high tempo, note, and length patterns displayed the recovery page. `/definitely-missing` returned the designed **Page not found** page with HTTP 404; that deliberate response is expected behavior, not a finding. All discovered same-origin page links passed.

The factory URL check passed live title, language, one `h1`, `main`, image alternatives, button labels, and console checks. Live Playwright axe scans of home, demo, privacy, terms, invalid pattern, static 404, and a completed link found zero serious or critical violations. Reduced-motion transition duration was 0.000001 seconds. All visible phone targets on home, demo, and Settings were at least 44 px. Both demo-banner keyboard focus rings measured 4 px and 9.41:1 contrast. The 390 × 844, 2x touch profile under 4x CPU throttling measured 60 FPS, above the 55 FPS claim threshold.

No backend exists: the game is a static asynchronous link-sharing product. Tenant isolation, persistence across a server restart, health checks, and 429/Retry-After checks do not apply. There is no offline or update promise and no service worker to test.

## Earlier findings and scope review

- Verification 1 F-01 is resolved: live loss and 404 headings are plain **Copy attempt did not pass** and **Page not found**.
- Verification 1 F-02 is resolved: the five formerly undeclared promise groups each have an observable declared claim; the 21-to-21 audit and every command passed.
- Strict review 1 F-01 is resolved: both demo actions show a dark 4 px focus ring at 9.41:1 contrast against the amber banner.
- Strict review 1 F-02 is resolved: both banner actions and the timing slider meet the 44 px touch minimum in a live phone context.
- The earlier notes about no telemetry for the research reply-rate target, no human calibration telemetry, no offline feature, and no realtime backend remain deliberate product scope, not defects. No visitor-facing claim makes those absent features a promise.

## Acceptance result

**PASS.** The reviewed implementation has zero findings at every severity and zero untested public claims.
