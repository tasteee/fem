import { c, useEvent } from 'atomico'
import { buildClassName, createStyleSheet, foundationSheet, formatDuration, getFlagClass, IconSvg } from '@tasteee/fem/foundation'
import { pauseIcon, playIcon } from '@tasteee/fem/icons'
import { Equalizer, mediaSheet } from '../../foundation/media-parts'
import { player } from '../../player/player'
import type { TrackT } from '../../player/player'
import { usePlayer } from '../../player/use-player'
import trackRowCss from './track-row.css?inline'

const trackRowSheet = createStyleSheet(trackRowCss)

// One track in a list. Tap it to play the list from
// here. The playing track shows its state, and the
// trailing slot holds actions like a menu.
export const TrackRow = c(
	(props) => {
		const dispatchPlay = useEvent<{ track: TrackT }>('play', { bubbles: true, composed: true })
		const track = props.track as TrackT | undefined
		const queue = props.queue as TrackT[]
		const trackId = track?.id ?? ''

		const isCurrent = usePlayer((state) => trackId !== '' && state.track?.id === trackId)
		const isPlaying = usePlayer((state) => state.isPlaying)
		const isCurrentPlaying = isCurrent && isPlaying

		if (!track) return <host shadowDom></host>

		const hasArtwork = Boolean(track.artwork)
		const hasHref = Boolean(track.href)
		const hasDuration = Boolean(track.duration)
		const durationText = hasDuration ? formatDuration(track.duration as number) : ''
		const overlayIcon = isCurrentPlaying ? pauseIcon : playIcon
		const overlayLabel = isCurrentPlaying ? `Pause ${track.title}` : `Play ${track.title}`

		const artClassName = buildClassName(['track-row-art', getFlagClass(isCurrent, 'isCurrent')])
		const artwork = <fem-image src={track.artwork} alt='' radius='small'></fem-image>
		const maybeArtwork = hasArtwork ? artwork : null

		const handlePlay = () => {
			dispatchPlay({ track })
			const shouldToggle = isCurrent
			if (shouldToggle) return player.toggle()
			const hasQueue = queue.length > 0
			const fullQueue = hasQueue ? queue : [track]
			player.playTrack(track, fullQueue)
		}

		const titleLink = (
			<a class='media-title media-link' href={track.href}>
				{track.title}
			</a>
		)
		const titleText = <span class='media-title'>{track.title}</span>
		const title = hasHref ? titleLink : titleText

		const equalizer = <Equalizer isPlaying={isPlaying} />
		const maybeEqualizer = isCurrent ? equalizer : null

		return (
			<host shadowDom>
				<fem-list-item interactive selected={isCurrent} description={track.artist} onselect={handlePlay}>
					<button slot='leading' class={artClassName} type='button' aria-label={overlayLabel} onclick={handlePlay}>
						{maybeArtwork}
						<span class='track-row-overlay'>
							<IconSvg icon={overlayIcon} kind='bold' />
						</span>
					</button>
					{title}
					<span slot='meta' class='track-row-meta'>
						{maybeEqualizer}
						{durationText}
					</span>
					<slot name='trailing' slot='trailing'></slot>
				</fem-list-item>
			</host>
		)
	},
	{
		props: {
			track: { type: Object },
			queue: { type: Array, value: (): TrackT[] => [] }
		},
		styles: [foundationSheet, mediaSheet, trackRowSheet]
	}
)
