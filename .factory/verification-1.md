# Verification 1 — Copy and extend a rhythm

**Verdict: FAIL**

Reviewed implementation: `15382346ecc2c5fa7d9e4f26fedcb855e505a050`  
Documentation reviewed: `f783d4db039ea9cb6d3f42848c76a54dffabdb86`  
Live URL: <https://beat-postcard.sociobot.in>  
Date: 2026-09-05

The live JavaScript asset was `/assets/index-ztzSc59t.js`. Its SHA-256 was
`f6a6ea53cffee394661b71b6e0ca4a4b5ccaffc9531088f984d041816c89645c`, exactly
matching a clean production build of the reviewed candidate.

Beat Postcard's job is to let two friends exchange a short eight-beat rhythm
challenge through a browser link. It is for friends who want a small music game
without song libraries, installs, accounts, or rankings. Before scrolling, the
fresh desktop and phone pages state that job and audience and offer **Try it with
sample data** as the first action. The desktop also shows the board fully; the
phone shows the game panel and the start of the board, with no horizontal
overflow.

## Findings

### F-01 — Low — public headings use forbidden metaphor copy

The supplied plain-words contract explicitly prohibits metaphor or mood
headings. The loss end screen says **“The call got away”**. The dynamic unknown
route and the HTTP 404 page say **“This page has no rhythm.”** These do not name
the result or recovery action in plain words. The HTTP 404 status and recovery
link themselves are correct; this finding is about the required copy contract,
not the deliberate 404 response.

Evidence: live loss end screen in
`/work/.evidence/beat-postcard-verify-1/loss-end.png`; live 404 at
`/definitely-missing`; candidate locations `src/main.ts:422`,
`src/main.ts:574`, and `public/404.html:20`.

### F-02 — Medium — public claims are missing declared observable tests

The 16 entries in `.factory/claims.json` all have passing commands, but the
page and README make further visitor-facing promises that are neither listed
there nor directly asserted by one of those commands. This violates the claims
contract and leaves five public claim groups untested:

1. The sample is specifically Mira's **104 BPM** call.
2. A shared link contains only tempo and selected sounds, and no name or timing
   score.
3. The game does not request a microphone.
4. The game has no analytics, ads, or tracking pixels.
5. The game has no song uploads, rankings, public profiles, or biometric rhythm
   profiles.

The existing `demo-sandbox`, `local-privacy`, and `free-no-account` tests cover
related behavior, but do not make the listed promises observable assertions.
Either add one declared test per public claim group or remove/narrow the copy.

## What passed

- Clean checkout at `03bd8e055f61f80cdad3eac2d124486a17e38061`; documented
  `npm ci` completed with zero vulnerabilities.
- Every command declared in `.factory/claims.json` ran separately and passed:
  **16/16**. Log: `/tmp/beat-postcard-clean-claims.log`.
- `npm run test:unit`: **4/4** passed.
- `npm test`: **17/17** browser tests passed, including the repository's
  Playwright/axe scans, keyboard, reduced-motion, and phone layout tests.
- `npm run build` passed and produced `dist/`; main JS was 38.69 kB raw / 11.53
  kB gzip and CSS was 18.96 kB raw / 5.02 kB gzip.
- Fresh live desktop and 390 × 844 touch contexts had the plain job, audience,
  sample action, no horizontal overflow, and no page or console errors.
  Screens: `/work/.evidence/beat-postcard-verify-1/desktop-first.png` and
  `/work/.evidence/beat-postcard-verify-1/phone-first.png`.
- Live demo used its persistent label, reset to Mira's sample, removed demo
  keys on **Start for real**, and preserved pre-seeded real draft/settings data.
- A fresh creator context made a call; a fresh receiver context reached a loss,
  then won, added eight reply notes, and created a completed two-bar link; a
  third fresh context opened that completed link. Evidence:
  `/work/.evidence/beat-postcard-verify-1/live-evidence.json` and
  `/work/.evidence/beat-postcard-verify-1/complete-end.png`.
- Live `/`, `/demo`, `/privacy`, `/terms`, and a valid pattern returned 200.
  The deliberately missing route returned the designed HTTP 404. Its browser
  console records the expected failed-resource message for that 404 only.
- Live Playwright/axe scans of home, demo, privacy, terms, invalid pattern, and
  404 found zero serious or critical violations. Each had one `h1`, one `main`,
  no missing image alt attributes, and no unexpected console errors.
- Internal live links returned 200. Privacy and terms routes and their titles
  work. No offline/update promise is made, so no service-worker test applies.

The standalone `npx @axe-core/cli` attempt could not locate a system Chrome in
this container. The repository's pinned Playwright/axe integration is the
allowed alternative and completed successfully against the live routes.

## Earlier findings and known gaps

No earlier verifier report exists in this checkout. The prior handoff's stated
gaps were reviewed: there is no telemetry-based 25% reply measure, no human
calibration metric, no offline promise, and no realtime multiplayer service.
Those are documented scope decisions, not new functional findings. The two
findings above are current and unresolved.

## Acceptance result

This verification is **FAIL**: finding count is **2** and untested public claim
count is **5**. Do not declare a product PASS until both findings are resolved
and every public claim has a declared, observable test.
