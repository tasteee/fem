import { c } from 'atomico'
import { buildClassName, createStyleSheet, foundationSheet, getFlagClass, useSlotFilled } from '@tasteee/fem/foundation'
import { pauseIcon, playIcon, repeatIcon, repeatOnceIcon, skipBackIcon, skipForwardIcon } from '@tasteee/fem/icons'
import { MediaButton, mediaSheet, usePressWithin } from '../../foundation/media-parts'
import { player } from '../../player/player'
import type { PlayerStateT, TrackT } from '../../player/player'
import { usePlayer } from '../../player/use-player'
import nowPlayingCss from './now-playing.css?inline'

const nowPlayingSheet = createStyleSheet(nowPlayingCss)

type SeekEventT = CustomEvent<{ value: number }>

const readSeekValue = (event: Event): number => (event as SeekEventT).detail.value

type TitleBlockPropsT = {
	track: TrackT
	artistHref: string
}

const TitleBlock = (props: TitleBlockPropsT) => {
	const hasArtistLink = props.artistHref !== ''
	const artistLink = (
		<a class='media-artist media-link now-playing-artist' href={props.artistHref}>
			{props.track.artist}
		</a>
	)
	const artistText = <span class='media-artist now-playing-artist'>{props.track.artist}</span>
	const artist = hasArtistLink ? artistLink : artistText

	return (
		<div class='now-playing-titles'>
			<span class='media-title now-playing-title'>{props.track.title}</span>
			{artist}
		</div>
	)
}

// The big view: artwork, title, seek bar, and controls.
// With a track set it shows that track, ready to play,
// as on a share page. Without one it follows whatever
// is playing.
export const NowPlaying = c(
	(props) => {
		usePressWithin()
		const givenTrack = props.track as TrackT | undefined
		const queue = props.queue as TrackT[]

		const playingTrack = usePlayer((state: PlayerStateT) => state.track)
		const isPlaying = usePlayer((state: PlayerStateT) => state.isPlaying)
		const currentTime = usePlayer((state: PlayerStateT) => state.currentTime)
		const duration = usePlayer((state: PlayerStateT) => state.duration)
		const buffered = usePlayer((state: PlayerStateT) => state.buffered)
		const repeat = usePlayer((state: PlayerStateT) => state.repeat)
		const [hasActions, handleActionsChange] = useSlotFilled()

		const track = givenTrack ?? playingTrack
		if (!track) return <host shadowDom></host>

		const isCurrent = playingTrack?.id === track.id
		const isCurrentPlaying = isCurrent && isPlaying
		const shownTime = isCurrent ? currentTime : 0
		const knownDuration = track.duration ?? 0
		const shownDuration = isCurrent ? duration : knownDuration
		const shownBuffered = isCurrent ? buffered : 0

		const playIconShape = isCurrentPlaying ? pauseIcon : playIcon
		const playLabel = isCurrentPlaying ? 'Pause' : 'Play'
		const isRepeating = repeat !== 'off'
		const isRepeatOne = repeat === 'one'
		const repeatIconShape = isRepeatOne ? repeatOnceIcon : repeatIcon
		const hasQueue = queue.length > 0
		const fullQueue = hasQueue ? queue : [track]

		const artworkSource = track.artwork ?? ''
		const actionsClassName = buildClassName(['now-playing-actions', getFlagClass(!hasActions, 'isEmpty')])

		const handlePlay = () => {
			if (isCurrent) return player.toggle()
			player.playTrack(track, fullQueue)
		}

		const handleSeek = (event: Event) => {
			if (!isCurrent) return
			player.seek(readSeekValue(event))
		}

		const handlePrevious = () => player.previous()
		const handleNext = () => player.next()
		const handleRepeat = () => player.cycleRepeat()

		return (
			<host shadowDom>
				<div class='now-playing'>
					<fem-image class='now-playing-art' src={artworkSource} alt='' radius='container' eager></fem-image>
					<div class='now-playing-head'>
						<TitleBlock track={track} artistHref={props.artistHref} />
						<div class={actionsClassName}>
							<slot name='actions' onslotchange={handleActionsChange}></slot>
						</div>
					</div>
					<fem-scrubber
						time='below'
						value={shownTime}
						max={shownDuration}
						buffered={shownBuffered}
						disabled={!isCurrent}
						onchange={handleSeek}
					></fem-scrubber>
					<div class='now-playing-transport'>
						<MediaButton
							icon={repeatIconShape}
							label='Repeat'
							isActive={isRepeating}
							isMuted={!isRepeating}
							handleClick={handleRepeat}
						/>
						<MediaButton icon={skipBackIcon} label='Previous' isDisabled={!isCurrent} handleClick={handlePrevious} />
						<MediaButton icon={playIconShape} label={playLabel} size='large' kind='solid' handleClick={handlePlay} />
						<MediaButton icon={skipForwardIcon} label='Next' isDisabled={!isCurrent} handleClick={handleNext} />
						<span class='now-playing-transport-end'>
							<slot name='end'></slot>
						</span>
					</div>
					<slot></slot>
				</div>
			</host>
		)
	},
	{
		props: {
			track: { type: Object },
			queue: { type: Array, value: (): TrackT[] => [] },
			artistHref: { type: String, value: (): string => '' }
		},
		styles: [foundationSheet, mediaSheet, nowPlayingSheet]
	}
)
