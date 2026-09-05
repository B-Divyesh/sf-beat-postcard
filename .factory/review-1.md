# Review 1 — Copy and extend a rhythm

**Verdict: FAIL**

Date: 2026-09-05

Implementation reviewed: `36324c221bd3bd3e2a6d45f1d8ea61be8df61276`

Documentation reviewed: `3f0decb2cf9b6ccc256b8513e374be0030ee8f94`

Live URL: <https://beat-postcard.sociobot.in>

Finding count: **2**

Untested public claim count: **0**

## Job, audience, and first action

The job is to make an eight-beat percussion call, send its link, and have a
friend copy it and add a reply bar. It is for two friends who want a short
browser music challenge without songs, installs, accounts, or rankings. The
first action is **Try it with sample data**.

Fresh 1440 × 1000 desktop and 390 × 844 touch-phone contexts showed the job,
audience, first action, and part of the playable board before scrolling. There
was no horizontal overflow. Evidence:
`/work/.evidence/beat-postcard-review-1-live/desktop-first.png` and
`/work/.evidence/beat-postcard-review-1-live/phone-first.png`.

## Findings

### F-01 — Medium — Demo banner actions have no visible keyboard focus

On `/demo`, keyboard focus reaches **Reset demo** and **Start for real**, but
both use a 4 px amber outline on the same amber banner. The computed outline
and adjacent background are both `rgb(245, 173, 40)`, so their contrast is
1:1. The attached accessibility contract requires a designed focus indicator
with at least 3:1 contrast. A keyboard user cannot tell which banner action is
focused.

Evidence:

- `/work/.evidence/beat-postcard-review-1-live/demo-banner-controls.json`
- `/work/.evidence/beat-postcard-review-1-live/demo-phone-reset-focus.png`
- `/work/.evidence/beat-postcard-review-1-live/demo-phone-start-real-focus.png`

The two focus screenshots are visually identical at the banner controls even
though the recorded active element changes from one button to the other.

### F-02 — Low — Three phone controls are below the 44 px touch minimum

In a fresh 390 × 844 touch context, **Reset demo** and **Start for real** are
each 38 CSS px high. The Settings dialog's **Timing offset** range control is
16 CSS px high. Their widths are sufficient, but the accessibility and design
contracts require every touch target to be at least 44 × 44 CSS px.

Evidence:
`/work/.evidence/beat-postcard-review-1-live/touch-targets.json`.

The checkbox setting rows measured 72 px high and the remaining visible route
controls met the minimum. The existing mobile accessibility test checks only
the home route, which is why it does not detect these demo and Settings
controls.

## Clean checkout and claim verification

A fresh local clone was checked out at the implementation candidate. With Node
22.23.2 and npm 10.9.8, `npm ci` completed and reported zero vulnerabilities.
Every command in `.factory/claims.json` was run separately from that checkout.

- Declared claim commands: **21 of 21 passed**.
- Claim-tag audit: 21 unique IDs, 21 tags, exactly one tag per ID, no missing
  or undeclared tags, and every command used its matching ID.
- `npm run test:unit`: **4 of 4 passed**.
- `npm test`: **22 of 22 passed**.
- `npm run build`: passed and produced `dist/`.
- `npm audit --audit-level=high`: zero vulnerabilities.
- Main JavaScript: 38,689 bytes raw / 11,445 bytes gzip.
- Main CSS: 18,962 bytes raw / 5,042 bytes gzip.

Evidence:

- `/work/.evidence/beat-postcard-review-1-install.log`
- `/work/.evidence/beat-postcard-review-1-claims.log`
- `/work/.evidence/beat-postcard-review-1-claim-tag-audit.json`
- `/work/.evidence/beat-postcard-review-1-clean-verify.log`

All testable statements on the live pages, README, privacy page, terms page,
and demo documentation map to a declared observable claim. No public claim is
untested. The repository's passing accessibility test is incomplete with
respect to F-01 and F-02; passing declared commands do not cancel an observed
defect.

## Live game run and demo isolation

A fresh live demo showed the persistent **Demo — sample data, nothing is
saved** label, Mira as the source, 104 BPM, and the eight expected sounds. The
populated output is recorded in
`/work/.evidence/beat-postcard-review-1-live/demo-populated.png`.

The demo's reduced-motion setting was changed and **Reset demo** was used.
Pre-seeded real draft and settings values remained byte-for-byte unchanged.
After **Start for real**, the demo namespace was empty and the pre-seeded Bell
draft returned. The complete live run then proved:

1. Eight deliberately wrong sounds reached **Copy attempt did not pass** with
   0/8 matches.
2. The sample sequence entered by keyboard reached **You copied the call**
   with 7/8 timed matches, which is an actual win.
3. Eight reply sounds reached **The two-bar reply is complete**.
4. The completed link opened with both bars in a fresh browser context.
5. **Play again** removed the reply result and restored the original call.

Evidence:

- `/work/.evidence/beat-postcard-review-1-live/loss-end.png`
- `/work/.evidence/beat-postcard-review-1-live/win-end.png`
- `/work/.evidence/beat-postcard-review-1-live/complete-end.png`
- `/work/.evidence/beat-postcard-review-1-live/live-review.json`

## Routes, recovery, accessibility, privacy, and performance

- `/`, `/demo`, `/privacy`, `/terms`, valid patterns, and both 96 and 116 BPM
  boundary patterns returned 200 with route-specific titles.
- Bad versions, tempos, note values, and lengths opened the plain recovery
  screen. `/definitely-missing` returned the designed **Page not found** page
  with HTTP 404. Its failed-resource console line is the expected result of the
  deliberate 404, not a defect.
- Thirteen live page states had one `h1`, one `main`, `lang="en"`, no missing
  image alternatives, no page errors, and zero axe violations. The open
  Settings dialog also had zero axe violations.
- Skip-link focus, route focus, back-button focus, dialog focus containment
  and return, keyboard game input, phone touch input, and reduced-motion CSS
  worked. F-01 and F-02 remain despite those passes.
- Normal settings and unfinished drafts survived reload. Corrupt stored values
  recovered to an empty game. Simulated blocked audio produced a plain retry
  instruction without a console error.
- The complete demo flow made requests only to
  `https://beat-postcard.sociobot.in`, used one top-level frame, requested no
  microphone, and produced no unexpected console or page errors.
- Internal links and the external Param Factory link returned 200. Privacy and
  terms mail links are explicit `mailto:` links. `robots.txt` and `sitemap.xml`
  returned 200 and list the public routes.
- No offline or update promise is made. The live site has no service worker.
- The live phone profile at 390 × 844, 2x device scale, touch enabled, and 4x
  CPU throttling produced five 60 FPS samples.
- Fresh Lighthouse mobile scores were Performance 100, Accessibility 100,
  Best Practices 100, and SEO 100. LCP was 1.10 s, total blocking time 36 ms,
  and CLS 0.

Evidence:

- `/work/.evidence/beat-postcard-review-1-url/verify.json`
- `/work/.evidence/beat-postcard-review-1-live/live-review.json`
- `/work/.evidence/beat-postcard-review-1-live/supplemental.json`
- `/work/.evidence/beat-postcard-review-1-lighthouse-rerun.json`

This is a static asynchronous link-sharing game. It has no backend, tenant,
database, health endpoint, restart state, or rate-limited API. Backend checks
therefore do not apply. AI would not improve the brief's short, deterministic
call-and-reply loop, so there is no missed AI step.

## Candidate and live deployment

The last implementation commit is `36324c2`. Later commits through the reviewed
documentation SHA change reports and Graphify output, not the product. The
clean candidate and live page both use `/assets/index-x43LR2-L.js`; both files
have SHA-256
`baa8c86df10f3fe9749574937e120dc870ca36d357fde2cf758a819693b0a5ad`.

## Earlier findings and scope notes

Verification 1's earlier findings remain resolved:

- The loss, SPA 404, and HTTP 404 headings use **Copy attempt did not pass**
  and **Page not found**, resolving the forbidden metaphor copy.
- The five formerly undeclared claim groups now have unique declared tests for
  sample details, link contents, microphone use, tracking, and product
  boundaries. All five commands passed.

The prior scope notes remain accurate and are not defects: the product does not
silently measure the research reply-rate target, does not collect a human
calibration metric, makes no offline promise, and needs no realtime backend for
asynchronous links.

## Acceptance result

**FAIL.** The implementation has **2 findings** and **0 untested public
claims**. A PASS requires both demo-banner focus contrast and all phone touch
targets to meet the attached accessibility contract.
