import { c } from 'atomico'
import { foundationSheet } from '@tasteee/fem/foundation'
import { pauseIcon, playIcon } from '@tasteee/fem/icons'
import { MediaButton, mediaSheet, usePressWithin } from '../../foundation/media-parts'
import type { MediaButtonKindT, MediaButtonSizeT } from '../../foundation/media-parts'
import { player } from '../../player/player'
import type { TrackT } from '../../player/player'
import { usePlayer } from '../../player/use-player'

// Plays a track, or a whole list from its first track,
// and turns to pause while that track plays. Use it for
// "Play" on a profile or playlist header.
export const PlayButton = c(
	(props) => {
		usePressWithin()
		const track = props.track as TrackT | undefined
		const queue = props.queue as TrackT[]
		const startTrack = track ?? queue[0]
		const startId = startTrack?.id ?? ''

		const currentId = usePlayer((state) => state.track?.id ?? '')
		const isPlaying = usePlayer((state) => state.isPlaying)
		const isCurrent = startId !== '' && currentId === startId
		const isInQueue = queue.some((entry) => entry.id === currentId)
		const isOurs = isCurrent || isInQueue
		const isThisPlaying = isPlaying && isOurs

		const icon = isThisPlaying ? pauseIcon : playIcon
		const label = isThisPlaying ? 'Pause' : 'Play'
		const hasNothing = startTrack === undefined

		const handleClick = () => {
			const shouldPause = isThisPlaying
			if (shouldPause) return player.pause()
			if (isOurs) return player.play()
			if (!startTrack) return
			const hasQueue = queue.length > 0
			const fullQueue = hasQueue ? queue : [startTrack]
			player.playTrack(startTrack, fullQueue)
		}

		return (
			<host shadowDom>
				<MediaButton
					icon={icon}
					label={label}
					size={props.size}
					kind={props.kind}
					isDisabled={hasNothing}
					handleClick={handleClick}
				/>
			</host>
		)
	},
	{
		props: {
			track: { type: Object },
			queue: { type: Array, value: (): TrackT[] => [] },
			size: { type: String, reflect: true, value: (): MediaButtonSizeT => 'large' },
			kind: { type: String, reflect: true, value: (): MediaButtonKindT => 'solid' }
		},
		styles: [foundationSheet, mediaSheet]
	}
)
