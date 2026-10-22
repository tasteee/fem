# @tasteee/fem-media

Music pieces for [fem](../fem/README.md): one shared audio engine and the components that drive it.

## Use

```ts
import '@tasteee/fem/tokens.css'
import '@tasteee/fem-media/tokens.css'
import '@tasteee/fem-media' // registers fem too
import { player } from '@tasteee/fem-media'
import type { TrackT } from '@tasteee/fem-media'
```

```html
<fem-track-row .track=${track} .queue=${tracks}></fem-track-row>
<fem-play-button .queue=${tracks}></fem-play-button>
<fem-now-playing .track=${track} .queue=${tracks}></fem-now-playing>
<fem-player-bar expandable></fem-player-bar>
```

In plain HTML, `track` and `queue` take JSON.

## Pieces

| Tag | What |
| --- | --- |
| `fem-track-row` | One track in a list. Tap to play the list from there. Shows the playing state. |
| `fem-play-button` | Plays a track or a list. Turns to pause while it plays. |
| `fem-player-bar` | The mini player. Folds to track + play button under 720px. Sends `expand`. |
| `fem-now-playing` | Big artwork, title, seek, controls. Shows a given track, or follows the player. |

## The player

One `<audio>` element for the whole app, so every piece agrees.

- **Data flow:** components call `player`, `player` drives the audio element, the element's events update state, and subscribers redraw.
- **Time** is read every frame while playing, so seek bars move smoothly.
- **Media Session** is set up, so lock screens and headphone buttons work.

```ts
player.playTrack(track, queue)  // play from a track
player.toggle()
player.next()
player.previous()               // restarts first if past 3s
player.seek(seconds)
player.setVolume(0.8)
player.cycleRepeat()            // off → all → one
player.setQueue(tracks)         // after a reorder, keeps playing

const stop = player.subscribe((state) => console.log(state.track, state.currentTime))
```

## Track

```ts
type TrackT = {
	id: string
	src: string
	title: string
	artist: string
	artwork?: string
	duration?: number // seconds, shown before the file loads
	href?: string // makes the title a link
}
```
