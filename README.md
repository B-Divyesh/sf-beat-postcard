# Beat Postcard

Beat Postcard is a free two-person browser rhythm game. Make an eight-beat percussion call, share its link, and let a friend copy it and add a reply bar. A scripted round finishes in under 45 seconds.

It is for friends who want a short music challenge without copyrighted songs, installs, accounts, or rankings.

Live game: <https://beat-postcard.sociobot.in>

One-click sample: <https://beat-postcard.sociobot.in/demo>

## Play

1. Press **Enable sound**, or press a percussion pad.
2. Make eight beats with the pads or the D, F, J, and K keys.
3. Create and send the call link.
4. The recipient hears the call and copies at least six sounds.
5. The recipient adds eight beats and sends the completed reply link back.

The challenge has a win screen and a loss screen. **Play again** clears the reply and restores the original call. Wide timing, reduced motion, mute, and timing-offset settings persist after reload. A four-tap check can set the timing offset in under 20 seconds.

Touch controls work at phone sizes. The measured test profile is 390 by 844 pixels, 2x device scale, and four-times CPU throttling. The board maintains at least 55 rendered frames per second on that profile.

## Sample mode

Press **Try it with sample data**, or open `/demo`. The sample is Mira’s 104 BPM eight-beat call. A persistent banner identifies sample mode.

Sample state uses `beat-postcard:demo:*` local-storage keys. **Reset demo** removes those keys and reloads the sample. **Start for real** removes them and returns to the real draft. The demo never changes `beat-postcard:real:*` data.

See [.factory/demo.md](.factory/demo.md) for the verification contract.

## Privacy and audio

The game is a static site. Drafts and settings stay in the browser. Creating a share link sends no data to another origin. The link itself contains the tempo and sound choices, so anyone with it can play the pattern.

Sound starts only after a player presses **Enable sound** or a pad. Kick, Clap, Tick, and Bell are synthesized with Web Audio. There are no downloaded songs, samples, analytics, ads, identity records, payments, or biometric rhythm profiles.

Read the deployed [privacy page](https://beat-postcard.sociobot.in/privacy) and [terms](https://beat-postcard.sociobot.in/terms).

## Local setup

Requirements: Node.js 22 and npm 10.

```bash
npm ci
npm run dev
```

Open <http://127.0.0.1:5173>. Vite serves deep links during development.

## Test and build

Playwright 1.58.2 is pinned. The factory image already provides its Chromium browser. On another machine, install it once with `npx playwright install chromium`.

```bash
npm run test:unit
npm test
npm run build
```

`npm test` runs the browser outcomes in `.factory/claims.json`, plus route, accessibility, mobile, and console checks. `npm run build` writes the static site to `dist/`.

Run one claim with its documented command. For example:

```bash
npm test -- --grep @claim:complete-exchange
```

## Deploy

Deploy the contents of `dist/` to the product-owned Static Web App. Keep `staticwebapp.config.json` at the site root so deep links and security headers are applied.

The factory deployment command is:

```bash
/opt/fleet/lib/deploy-static.sh beat-postcard dist
```

No backend, database, environment variable, third-party font, or runtime API is required.

## Link format

Pattern links use `/p/v1-<tempo>-<call>-<reply>`. Each bar contains eight digits from 0 to 3. A call link omits the reply. Invalid versions, tempos, notes, and lengths open a recovery screen.

## License

Code is available under the [MIT License](LICENSE). The generated social artwork is original to Beat Postcard; its prompt and provenance are recorded in [.factory/design.md](.factory/design.md).
