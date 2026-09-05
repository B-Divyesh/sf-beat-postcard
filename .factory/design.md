# Beat Postcard visual thesis

## Direction

Beat Postcard uses an **editorial percussion astrolabe**: a large circular instrument that feels printed and machined, not a dashboard. The board is the first useful screen. Eight beat markers orbit four tactile pads, so the shareable musical phrase remains the visual subject.

This direction fits a short call-and-response game because the circle shows time returning to its first beat. Printed registration marks, blunt labels, and brass-like amber controls make the instrument readable without borrowing a music app or arcade cabinet style.

## Palette

The site has one deliberate dark treatment. The deep field keeps the amber playhead legible and gives the ivory score the feel of a physical card.

| Token | Value | Use |
| --- | --- | --- |
| `--night` | `#061827` | page background |
| `--blue` | `#0d304d` | board and raised surfaces |
| `--blue-2` | `#164765` | pressed and secondary surfaces |
| `--ivory` | `#fff4dc` | primary text and score paper |
| `--paper` | `#ead8b2` | muted rules and secondary text |
| `--amber` | `#f5ad28` | primary actions, playhead, focus |
| `--ink` | `#081723` | text on amber and ivory |
| `--coral` | `#ff826c` | errors and misses |
| `--mint` | `#78d6a3` | correct beats and wins |

Body text uses ivory on deep blue at more than 4.5:1. Amber controls use ink text. Coral and mint always appear with a word or symbol, never as the only signal.

## Type and spacing

Display text uses Georgia with compact tracking and sentence case. Controls and explanations use the local system sans-serif stack. No font is downloaded. The scale is 16, 18, 24, 34, and 52 pixels. The base spacing unit is 8 pixels; larger gaps use 16, 24, 32, 48, and 64 pixels.

## Shape and interaction grammar

- The board is a circle with eight numbered positions and four round pads.
- Ivory score strips show sequences as compact, printable rows.
- Primary buttons are amber pills with a dark lower edge, like a physical switch.
- Secondary controls are outlined and quiet. Links stay underlined.
- A selected or current beat has both a visible amber ring and an accessible state label.
- Touch targets are at least 48 by 48 CSS pixels with 8 pixels between targets.

## Motion policy

The playhead advances once per scheduled beat. Pads compress for 120 ms when struck. Route and result changes fade for 180 ms. There is no looping ambient motion and no screen shake. `prefers-reduced-motion` and the in-game Reduce motion setting remove transforms and transitions while retaining state changes.

The music scheduler uses the Web Audio clock. The UI renders on `requestAnimationFrame`, pauses when the page is hidden, and clamps long frame gaps. The target is 60 frames per second on the documented mobile profile.

## Difficulty curve

Each call has eight beats at 96–116 BPM. The player hears the full call, then repeats it over a two-beat count-in. A sound played during the current beat counts for that position. Six correct sounds win; three or more mistakes lose. Wide timing mode accepts nearly the full beat without changing the note sequence. A win opens an untimed eight-note reply bar. This produces a complete run in roughly 45 seconds.

## Asset plan and provenance

- The working instrument, beat glyphs, favicon, and texture are authored in HTML, CSS, and SVG in this repository.
- Original percussion audio is synthesized at runtime with Web Audio oscillators and filtered noise. No recordings or song files ship.
- `public/beat-postcard-social.png` and its optimized WebP copy are generated editorial stills for social previews only. They do not contain product instructions.

### Image prompt sheet

Use case: stylized-concept. Asset type: 1200 by 630 social preview. Scene: top-down editorial still life of one impossible circular percussion instrument on a deep indigo drafting table. Subject: an ivory eight-position rhythm ring surrounding four blank amber and blue drum pads, with small brass registration pins and paper grain. Style: refined screen print mixed with photographed lacquer and cut paper; precise, asymmetrical, calm. Composition: instrument large and slightly left of center, generous clean dark space around it, no interface screenshot. Light: raking warm studio light with restrained shadows. Palette: deep blue, warm ivory, amber, tiny coral accent. Avoid: people, hands, letters, numbers, readable text, logos, brands, musical notation, gradients used as decoration, neon, watermark, seams, duplicated parts.

Generated with the factory image model (`factory-image`) on 2026-09-05. The generated artwork is original to this product. Final candidates are reviewed for text artifacts, unintended symbols, seams, and palette fit before use.
