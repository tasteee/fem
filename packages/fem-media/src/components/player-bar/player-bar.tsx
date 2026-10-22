import { c, useEvent } from 'atomico'
import { buildClassName, createStyleSheet, foundationSheet, getFlagClass } from '@tasteee/fem/foundation'
import { pauseIcon, playIcon, repeatIcon, repeatOnceIcon, skipBackIcon, skipForwardIcon } from '@tasteee/fem/icons'
import { speakerHighIcon, speakerLowIcon, speakerXIcon } from '@tasteee/fem/icons'
import { MediaButton, mediaSheet, usePressWithin } from '../../foundation/media-parts'
import { player } from '../../player/player'
import type { PlayerStateT, RepeatModeT } from '../../player/player'
import { usePlayer } from '../../player/use-player'
import playerBarCss from './player-bar.css?inline'

const playerBarSheet = createStyleSheet(playerBarCss)

type SeekEventT = CustomEvent<{ value: number }>

const readSeekValue = (event: Event): number => (event as SeekEventT).detail.value

const getVolumeIcon = (volume: number, isMuted: boolean) => {
	const isSilent = isMuted || volume === 0
	if (isSilent) return speakerXIcon
	const isQuiet = volume < 0.5
	if (isQuiet) return speakerLowIcon
	return speakerHighIcon
}

const getRepeatLabel = (repeat: RepeatModeT): string => {
	const isOne = repeat === 'one'
	if (isOne) return 'Repeat one'
	const isAll = repeat === 'all'
	if (isAll) return 'Repeat all'
	return 'Repeat off'
}

const readSliderValue = (event: Event): number => {
	const innerInput = event.composedPath()[0] as HTMLInputElement
	return Number(innerInput.value)
}

const checkHasNext = (state: PlayerStateT): boolean => {
	const isLast = state.index >= state.queue.length - 1
	const canWrap = state.repeat === 'all'
	return !isLast || canWrap
}

// Reads every slice the bar needs. Each is a plain
// value, so the bar only redraws when one changes.
const usePlayerBarState = () => {
	return {
		track: usePlayer((state: PlayerStateT) => state.track),
		isPlaying: usePlayer((state: PlayerStateT) => state.isPlaying),
		currentTime: usePlayer((state: PlayerStateT) => state.currentTime),
		duration: usePlayer((state: PlayerStateT) => state.duration),
		buffered: usePlayer((state: PlayerStateT) => state.buffered),
		volume: usePlayer((state: PlayerStateT) => state.volume),
		isMuted: usePlayer((state: PlayerStateT) => state.isMuted),
		repeat: usePlayer((state: PlayerStateT) => state.repeat),
		hasNext: usePlayer(checkHasNext)
	}
}

// The mini player that sits along the bottom of an app.
// Wide, it shows transport, seek, and volume. Narrow,
// it folds to the track and a play button, with a thin
// progress line. Tap the track to send expand.
export const PlayerBar = c(
	(props) => {
		usePressWithin()
		const dispatchExpand = useEvent('expand', { bubbles: true, composed: true })
		const bar = usePlayerBarState()
		const track = bar.track
		const hasTrack = track !== undefined
		const emptyFlag = hasTrack ? null : ''

		if (!track) return <host shadowDom data-empty={emptyFlag}></host>

		const playIconShape = bar.isPlaying ? pauseIcon : playIcon
		const playLabel = bar.isPlaying ? 'Pause' : 'Play'
		const volumeIcon = getVolumeIcon(bar.volume, bar.isMuted)
		const volumeLabel = bar.isMuted ? 'Unmute' : 'Mute'
		const volumePercent = bar.isMuted ? 0 : Math.round(bar.volume * 100)
		const isRepeating = bar.repeat !== 'off'
		const isRepeatOne = bar.repeat === 'one'
		const repeatIconShape = isRepeatOne ? repeatOnceIcon : repeatIcon
		const repeatLabel = getRepeatLabel(bar.repeat)
		const hasDuration = bar.duration > 0
		const progressRatio = hasDuration ? bar.currentTime / bar.duration : 0
		const progressStyle = `--player-progress: ${progressRatio}`
		const hasArtwork = Boolean(track.artwork)

		const artwork = <fem-image class='player-bar-art' src={track.artwork} alt='' radius='small'></fem-image>
		const artworkPlaceholder = <span class='player-bar-art isEmpty'></span>
		const art = hasArtwork ? artwork : artworkPlaceholder
		const expandLabel = `Open ${track.title}`
		const trackClassName = buildClassName(['player-bar-track', getFlagClass(props.expandable, 'isExpandable')])

		const handleExpand = () => dispatchExpand()
		const handleToggle = () => player.toggle()
		const handlePrevious = () => player.previous()
		const handleNext = () => player.next()
		const handleRepeat = () => player.cycleRepeat()
		const handleMute = () => player.toggleMuted()
		const handleSeek = (event: Event) => player.seek(readSeekValue(event))
		const handleVolume = (event: Event) => player.setVolume(readSliderValue(event) / 100)

		return (
			<host shadowDom data-empty={emptyFlag}>
				<div class='player-bar' style={progressStyle}>
					<span class='player-bar-progress' aria-hidden='true'></span>
					<button class={trackClassName} type='button' aria-label={expandLabel} onclick={handleExpand}>
						{art}
						<span class='player-bar-text'>
							<span class='media-title'>{track.title}</span>
							<span class='media-artist'>{track.artist}</span>
						</span>
					</button>
					<div class='player-bar-center'>
						<div class='player-bar-transport'>
							<MediaButton
								icon={repeatIconShape}
								label={repeatLabel}
								size='small'
								isActive={isRepeating}
								isMuted={!isRepeating}
								handleClick={handleRepeat}
							/>
							<MediaButton icon={skipBackIcon} label='Previous' size='small' handleClick={handlePrevious} />
							<MediaButton icon={playIconShape} label={playLabel} kind='solid' handleClick={handleToggle} />
							<MediaButton
								icon={skipForwardIcon}
								label='Next'
								size='small'
								isDisabled={!bar.hasNext}
								handleClick={handleNext}
							/>
							<span class='player-bar-transport-spacer'></span>
						</div>
						<fem-scrubber
							class='player-bar-scrubber'
							time='sides'
							value={bar.currentTime}
							max={bar.duration}
							buffered={bar.buffered}
							onchange={handleSeek}
						></fem-scrubber>
					</div>
					<div class='player-bar-end'>
						<slot name='actions'></slot>
						<MediaButton icon={volumeIcon} label={volumeLabel} size='small' handleClick={handleMute} />
						<fem-slider
							class='player-bar-volume'
							label='Volume'
							value={volumePercent}
							oninput={handleVolume}
						></fem-slider>
					</div>
					<div class='player-bar-compact-play'>
						<MediaButton icon={playIconShape} label={playLabel} handleClick={handleToggle} />
					</div>
				</div>
			</host>
		)
	},
	{
		props: {
			expandable: { type: Boolean, reflect: true }
		},
		styles: [foundationSheet, mediaSheet, playerBarSheet]
	}
)
