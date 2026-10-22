// fem-media builds on fem, so fem's elements are
// registered first.
import '@tasteee/fem'
import { NowPlaying } from './components/now-playing/now-playing'
import { PlayButton } from './components/play-button/play-button'
import { PlayerBar } from './components/player-bar/player-bar'
import { TrackRow } from './components/track-row/track-row'

const elements: [string, CustomElementConstructor][] = [
	['fem-now-playing', NowPlaying],
	['fem-play-button', PlayButton],
	['fem-player-bar', PlayerBar],
	['fem-track-row', TrackRow]
]

for (const element of elements) {
	const tagName = element[0]
	const elementClass = element[1]
	const isDefined = customElements.get(tagName) !== undefined
	if (!isDefined) customElements.define(tagName, elementClass)
}

export { NowPlaying, PlayButton, PlayerBar, TrackRow }
export { player } from './player/player'
export type { PlayerListenerT, PlayerStateT, PlayerT, RepeatModeT, TrackT } from './player/player'
