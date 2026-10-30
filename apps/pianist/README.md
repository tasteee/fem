# pianist

Play piano or MIDI with your computer keyboard. Built with fem. Every color and control comes from the design system.

## Use

```sh
npm run dev:pianist               # localhost:5300
npm run build:pianist
npm test -w apps/pianist
npm run layouts -w apps/pianist   # prints the degree under every key, per layout
```

- The built-in piano is [`@tasteee/midi-piano`](../../packages/midi-piano), which plays smplr's Splendid Grand Piano. Samples download on first load.
- Pick **Built-in piano** or a MIDI output. MIDI needs a browser with Web MIDI (Chrome, Edge). Press "Find MIDI outputs" to connect.
- Hold **Space** to sustain. Notes lifted under the pedal ring until it lifts.
- Settings save to `localStorage` under `pianist:settings`.

## Layouts

Rows run bottom to top (Z, A, Q, 1). Degrees count up the scale from the root of the bottom octave.

| Layout    | Key at row r, column c                                                            |
| --------- | --------------------------------------------------------------------------------- |
| Standard  | `7r + c` (each row up is an octave)                                               |
| Thirds    | `2r + c`                                                                          |
| Fourths   | `3r + c`                                                                          |
| Chromatic | `5r + c` in semitones. Ignores the scale                                          |
| Staircase | `V B N M J K L O P 0` play degrees 0 to 9. Other keys are silent and drawn dashed |
| Random    | seeded scramble across three octaves                                              |
| Custom    | `rowStep·r + colStep·c`                                                           |

Notes outside MIDI 21 to 108 are silent and drawn dashed. Notes are spelled by letter, so E♭ minor has C♭ and G♭, and F♯ major has E♯.

## Deploy

`.github/workflows/demos.yml` builds pianist into `apps/site/demos/pianist`, so a push to `main` publishes it at `/fem/pianist/`.
