# Demo sandbox

## Entry point

Open `https://beat-postcard.sociobot.in/demo`, or press **Try it with sample data** on the first screen.

## Sample data

The demo loads a labelled call from Mira at 104 BPM:

1. Kick
2. Tick
3. Clap
4. Tick
5. Kick
6. Bell
7. Clap
8. Tick

The sample opens at the playable listen-and-copy step. A successful copy opens an empty reply bar. Finishing eight reply beats produces a populated two-bar link.

## Isolation

Demo state uses keys under `beat-postcard:demo:*`. Real drafts and settings use `beat-postcard:real:*`. Demo code never reads or writes the real namespace.

The persistent banner reads **Demo — sample data, nothing is saved**. **Reset demo** clears the demo namespace and restores Mira’s call. **Start for real** clears the demo namespace before opening the real creator. Existing real data remains unchanged.

## Verification

```bash
npm test -- --grep @claim:demo-sandbox
```

The browser check seeds realistic real data, changes and resets the sample, confirms the real values are unchanged, then returns to the restored real draft.
