# Review 3 — Make and share a rhythm challenge

**Verdict: PASS**

Date: 2026-09-06

Implementation reviewed: `aa23aa145a8f50385b8698ea6e8f42910b3fba8e`

Repository and documentation baseline reviewed:
`e0559d29f359e411ab2b1ec09fad9b04ee7b7862`

Live URL: <https://beat-postcard.sociobot.in>

Finding count: **0**

Untested public claim count: **0**

## Job, audience, and first action

The job is to make an eight-beat percussion call, share its link, and let a
friend copy it and add one reply bar. It is for two friends who want a short
browser music challenge without songs, installs, accounts, or rankings. The
first action is **Try it with sample data**. It opens Mira's populated 104 BPM
call.

Fresh 1440 by 1000 desktop and 390 by 844 touch-phone contexts showed the job,
audience, first action, and playable board before scrolling. Neither viewport
had horizontal overflow. Evidence: `desktop-first.png`, `phone-first.png`, and
`live-review.json` in `/work/.evidence/beat-postcard-review-3/`.

## Clean candidate and declared claims

A detached clean worktree at the implementation commit ran with Node 22.23.2
and npm 10.9.8. `npm ci` completed with zero reported vulnerabilities. Every
command in `.factory/claims.json` was then run separately from that checkout.

- Declared commands: **21 of 21 passed**.
- Claim audit: 21 unique declarations and exactly one matching source tag for
  every declaration, with no undeclared or mismatched tags.
- `npm run test:unit`: **4 of 4 passed**.
- `npm test`: **23 of 23 passed**.
- `npm run build`: passed and produced `dist/`.
- `npm audit --audit-level=high`: zero vulnerabilities.

| Claim | Result |
| --- | --- |
| `complete-exchange`, `round-duration`, `win-loss-endings` | Pass |
| `restart-reset`, `demo-sandbox`, `sample-call` | Pass |
| `keyboard-controls`, `touch-controls`, `audio-gesture` | Pass |
| `synthesized-sounds`, `timing-check`, `settings-persist` | Pass |
| `draft-recovery`, `local-privacy`, `share-link-contents` | Pass |
| `no-microphone`, `no-tracking`, `product-boundaries` | Pass |
| `free-no-account`, `render-rate`, `invalid-recovery` | Pass |

The live pages, README, demo documentation, privacy page, terms page, and game
states were cross-checked against the declarations. Every public claim maps to
an observable passing test. The product makes no offline or update promise.

Evidence: `npm-ci-clean.log`, `claims-clean.log`, `claim-tag-audit.json`,
`unit.log`, `full-browser.log`, `build.log`, and `audit.log` in the review
evidence directory.

## Live sample and complete game run

The fresh live demo showed the persistent **Demo — sample data, nothing is
saved** label, Mira as the source, 104 BPM, and all eight expected sounds.
**Reset demo** restored the sample. After changing demo settings, pre-seeded
real draft and settings values remained byte-for-byte unchanged. **Start for
real** cleared the demo namespace and restored the real Bell draft.

One recorded deterministic run exercised the full game loop:

1. Eight deliberately wrong sounds reached **Copy attempt did not pass** with
   0/8 matches.
2. Retry restored the ready state.
3. Mira's sequence entered with the advertised keyboard controls reached
   **You copied the call** with 7/8 timed matches, an actual win.
4. Eight reply sounds reached **The two-bar reply is complete**.
5. A separate fresh browser context opened the returned link and showed both
   bars.
6. **Play again** removed the completed result and restored the original call.

Evidence: `demo-populated.png`, `loss-end.png`, `win-end.png`,
`complete-end.png`, `return-client-complete.png`, and `live-review.json`.

## Desktop, phone, keyboard, accessibility, and recovery

- A physical coordinate tap on the 390 by 844 touch profile recorded a Kick.
  The same profile had no visible target below 44 by 44 CSS pixels.
- D, F, J, and K completed the winning copy. The skip link received first
  focus. SPA route changes moved focus to the new heading. The Settings dialog
  received and returned focus. Escape closed it. The timing slider responded
  to an arrow key.
- Wide timing and reduced motion persisted through reload. Reduced-motion
  transitions measured at or below 0.001 seconds. The four-tap timing check
  completed and saved its result.
- Fresh live axe scans of home, demo, privacy, terms, invalid-pattern, and 404
  states found zero serious or critical violations. The factory URL verifier
  passed title, language, one `h1`, `main`, image alternatives, button labels,
  and console checks.
- The repaired demo focus indicator remains a 4 px dark outline against the
  amber banner. Reset and Start for real meet the 44 px target. The Settings
  timing slider also meets the 44 px target.
- Corrupt local draft and settings values recovered to an empty playable game.
  Simulated blocked audio showed a direct recovery instruction.
- The complete exchange used only the product origin, one top-level frame,
  requested no microphone, and produced no unexpected console or page errors.

## Routes, legal pages, privacy, and performance

- `/`, `/demo`, `/privacy`, `/terms`, and valid 96 and 116 BPM pattern links
  returned 200 with the expected route title, one `h1`, one `main`, header, and
  footer.
- Invalid versions, low and high tempos, invalid sounds, and invalid lengths
  opened the recovery screen with a working new-pattern action.
- `/definitely-missing` deliberately returned HTTP 404 and the designed
  **Page not found** page with a way home. This expected 404 is not a defect.
- All same-origin page links were covered by live route checks. The privacy and
  terms contact links are explicit `mailto:` links. The external factory link
  was not requested because the work order prohibits connecting to services
  outside this product.
- `robots.txt` and `sitemap.xml` returned 200. The sitemap lists home, demo,
  privacy, and terms.
- No service worker or web app manifest is installed. This matches the absence
  of an offline or update promise.
- The test phone profile at 390 by 844, 2x device scale, touch enabled, and 4x
  CPU throttling measured 60 rendered frames per second. The claim threshold
  is 55.
- Fresh Lighthouse mobile scores were Performance 100, Accessibility 100,
  Best Practices 100, and SEO 100. LCP was 1.02 seconds, total blocking time
  was 34.5 ms, and CLS was 0.
- Production JavaScript is 38,689 bytes raw and 11,446 bytes gzip. CSS is
  19,051 bytes raw and 5,056 bytes gzip.
- Live response headers include the matching CSP, HSTS, no-referrer policy,
  MIME sniffing protection, permissions policy, and frame restriction.

This is a static asynchronous link-sharing game. It has no account, backend,
tenant, database, health endpoint, server restart state, realtime room, or
rate-limited API. Backend isolation, persistence, health, and 429 checks do not
apply. The exchange was still exercised with independent real browser clients.
AI would not improve the brief's short deterministic call-and-reply job, so
there is no missed AI step.

Evidence: `live-review.json`, `url-verify/verify.json`,
`offline-keyboard-check.json`, `live-headers.txt`, `lighthouse-summary.json`,
and `deployment-match.log`.

## Candidate and live deployment

Later commits through the documentation baseline change reports or Graphify
output, not the product image. The clean candidate and live deployment use the
same assets and match byte-for-byte:

- JavaScript `index-BRlWtHOJ.js`:
  `507b7eb4dfe5cc40fd25170ab509e773f712692ab6b2579630001a4c380923e9`
- CSS `index-BIFyx05B.css`:
  `f1f3660dcb2a0bd7fa269df14b740ba97da12b614c47417f68fe78bf2481c1c0`

## Earlier findings

- Verification 1 F-01 remains resolved. Live loss and 404 headings use plain
  **Copy attempt did not pass** and **Page not found** text.
- Verification 1 F-02 remains resolved. The five formerly undeclared promise
  groups each have one declared observable test; all passed.
- Review 1 F-01 remains resolved. Both demo actions have a visible contrasting
  focus indicator.
- Review 1 F-02 remains resolved. Both demo actions and the timing slider meet
  the 44 px touch minimum.
- Earlier notes about no reply-rate telemetry, human calibration telemetry,
  offline feature, or realtime backend remain deliberate scope limits. The
  live product does not promise them.

## Acceptance result

**PASS.** The reviewed implementation has zero findings of every severity and
zero untested public claims.
