// One audio element for the whole app. Every player
// component reads from it and talks to it, so the bar,
// the big view, and every track row always agree.

export type TrackT = {
	id: string
	src: string
	title: string
	artist: string
	artwork?: string
	duration?: number
	href?: string
}

export type RepeatModeT = 'off' | 'all' | 'one'

export type PlayerStateT = {
	track: TrackT | undefined
	queue: TrackT[]
	index: number
	isPlaying: boolean
	isLoading: boolean
	currentTime: number
	duration: number
	buffered: number
	volume: number
	isMuted: boolean
	repeat: RepeatModeT
	error: string
}

export type PlayerListenerT = (state: PlayerStateT) => void

const restartThresholdSeconds = 3

const initialState: PlayerStateT = {
	track: undefined,
	queue: [],
	index: -1,
	isPlaying: false,
	isLoading: false,
	currentTime: 0,
	duration: 0,
	buffered: 0,
	volume: 1,
	isMuted: false,
	repeat: 'off',
	error: ''
}

// ---------- reading the element ----------

const getBufferedEnd = (audio: HTMLAudioElement): number => {
	const ranges = audio.buffered
	const hasRanges = ranges.length > 0
	if (!hasRanges) return 0
	return ranges.end(ranges.length - 1)
}

const getUsableDuration = (audio: HTMLAudioElement, track: TrackT | undefined): number => {
	const isKnown = Number.isFinite(audio.duration) && audio.duration > 0
	if (isKnown) return audio.duration
	return track?.duration ?? 0
}

// ---------- the player ----------

const createPlayer = () => {
	let state: PlayerStateT = { ...initialState }
	let audio: HTMLAudioElement | undefined
	let frameId = 0
	const listeners = new Set<PlayerListenerT>()

	const emit = () => {
		for (const listener of listeners) listener(state)
	}

	const setState = (changes: Partial<PlayerStateT>) => {
		state = { ...state, ...changes }
		emit()
	}

	const readTimes = (element: HTMLAudioElement) => {
		setState({
			currentTime: element.currentTime,
			duration: getUsableDuration(element, state.track),
			buffered: getBufferedEnd(element)
		})
	}

	// timeupdate fires about four times a second, which
	// looks jumpy on a seek bar. While playing, time is
	// read every frame instead.
	const tick = () => {
		if (!audio) return
		readTimes(audio)
		frameId = requestAnimationFrame(tick)
	}

	const startTicking = () => {
		cancelAnimationFrame(frameId)
		frameId = requestAnimationFrame(tick)
	}

	const stopTicking = () => cancelAnimationFrame(frameId)

	const handleEnded = () => {
		const isRepeatOne = state.repeat === 'one'
		if (isRepeatOne) return restartTrack()
		const isLast = state.index >= state.queue.length - 1
		const shouldWrap = isLast && state.repeat === 'all'
		if (shouldWrap) return playAt(0)
		if (isLast) return setState({ isPlaying: false })
		playAt(state.index + 1)
	}

	const handleError = () => {
		stopTicking()
		setState({ isPlaying: false, isLoading: false, error: 'This track could not be played.' })
	}

	// The element is made on first use, so importing
	// the package on a server or in a test is safe.
	const getAudio = (): HTMLAudioElement => {
		if (audio) return audio
		const element = new Audio()
		element.preload = 'metadata'
		element.addEventListener('playing', () => setState({ isPlaying: true, isLoading: false }))
		element.addEventListener('play', startTicking)
		element.addEventListener('pause', () => {
			stopTicking()
			setState({ isPlaying: false })
		})
		element.addEventListener('waiting', () => setState({ isLoading: true }))
		element.addEventListener('canplay', () => setState({ isLoading: false }))
		element.addEventListener('loadedmetadata', () => readTimes(element))
		element.addEventListener('progress', () => setState({ buffered: getBufferedEnd(element) }))
		element.addEventListener('seeked', () => readTimes(element))
		element.addEventListener('volumechange', () => setState({ volume: element.volume, isMuted: element.muted }))
		element.addEventListener('ended', handleEnded)
		element.addEventListener('error', handleError)
		audio = element
		return element
	}

	// ---------- media session ----------

	const updateMediaSession = () => {
		const hasMediaSession = 'mediaSession' in navigator
		const track = state.track
		const canDescribe = hasMediaSession && track !== undefined
		if (!canDescribe) return
		const artwork = track.artwork ? [{ src: track.artwork, sizes: '512x512' }] : []
		navigator.mediaSession.metadata = new MediaMetadata({ title: track.title, artist: track.artist, artwork })
	}

	const registerMediaActions = () => {
		const hasMediaSession = 'mediaSession' in navigator
		if (!hasMediaSession) return
		const session = navigator.mediaSession
		session.setActionHandler('play', () => play())
		session.setActionHandler('pause', () => pause())
		session.setActionHandler('previoustrack', () => previous())
		session.setActionHandler('nexttrack', () => next())

		session.setActionHandler('seekto', (details) => {
			const hasTime = details.seekTime !== undefined
			if (hasTime) seek(details.seekTime as number)
		})
	}

	// ---------- actions ----------

	const playAt = (index: number) => {
		const track = state.queue[index]
		if (!track) return
		const element = getAudio()
		element.src = track.src
		setState({ track, index, currentTime: 0, buffered: 0, duration: track.duration ?? 0, isLoading: true, error: '' })
		updateMediaSession()
		play()
	}

	const play = async () => {
		const hasTrack = state.track !== undefined
		if (!hasTrack) return
		const element = getAudio()

		try {
			await element.play()
		} catch (playError) {
			// A newer play or pause interrupted this one.
			// The newer call decides the state.
			const wasInterrupted = playError instanceof DOMException && playError.name === 'AbortError'
			if (wasInterrupted) return
			console.warn('fem-media: play failed', playError)
			setState({ isPlaying: false, isLoading: false })
		}
	}

	const pause = () => audio?.pause()

	const toggle = () => {
		if (state.isPlaying) return pause()
		play()
	}

	const restartTrack = () => {
		seek(0)
		play()
	}

	// Back restarts the track first, like every player.
	// A second press goes to the one before.
	const previous = () => {
		const isPastStart = state.currentTime > restartThresholdSeconds
		const isFirst = state.index <= 0
		const shouldRestart = isPastStart || isFirst
		if (shouldRestart) return restartTrack()
		playAt(state.index - 1)
	}

	const next = () => {
		const isLast = state.index >= state.queue.length - 1
		const shouldWrap = isLast && state.repeat === 'all'
		if (shouldWrap) return playAt(0)
		if (isLast) return
		playAt(state.index + 1)
	}

	const seek = (seconds: number) => {
		const element = getAudio()
		const duration = getUsableDuration(element, state.track)
		const hasDuration = duration > 0
		const upperBound = hasDuration ? duration : seconds
		const clampedSeconds = Math.max(0, Math.min(upperBound, seconds))
		element.currentTime = clampedSeconds
		setState({ currentTime: clampedSeconds })
	}

	// Plays a list from one of its tracks. Playing the
	// track that is already loaded just toggles it.
	const playQueue = (queue: TrackT[], startIndex: number) => {
		const startTrack = queue[startIndex]
		if (!startTrack) return
		const isSameTrack = state.track?.id === startTrack.id
		state = { ...state, queue }
		if (isSameTrack) return toggle()
		playAt(startIndex)
	}

	const playTrack = (track: TrackT, queue?: TrackT[]) => {
		const fullQueue = queue ?? [track]
		const foundIndex = fullQueue.findIndex((entry) => entry.id === track.id)
		const isInQueue = foundIndex >= 0
		const startIndex = isInQueue ? foundIndex : 0
		const usableQueue = isInQueue ? fullQueue : [track]
		playQueue(usableQueue, startIndex)
	}

	const setVolume = (volume: number) => {
		const element = getAudio()
		element.volume = Math.max(0, Math.min(1, volume))
		const isAudible = volume > 0
		if (isAudible) element.muted = false
	}

	const toggleMuted = () => {
		const element = getAudio()
		element.muted = !element.muted
	}

	const setRepeat = (repeat: RepeatModeT) => setState({ repeat })

	const cycleRepeat = () => {
		const order: RepeatModeT[] = ['off', 'all', 'one']
		const nextIndex = (order.indexOf(state.repeat) + 1) % order.length
		setRepeat(order[nextIndex])
	}

	// Swaps the list without stopping the current track,
	// as when a playlist is reordered while it plays.
	const setQueue = (queue: TrackT[]) => {
		const currentId = state.track?.id
		const nextIndex = queue.findIndex((entry) => entry.id === currentId)
		setState({ queue, index: nextIndex })
	}

	const subscribe = (listener: PlayerListenerT): (() => void) => {
		listeners.add(listener)
		listener(state)
		return () => listeners.delete(listener)
	}

	const getState = (): PlayerStateT => state

	const checkIsCurrent = (trackId: string): boolean => state.track?.id === trackId

	const isBrowser = typeof window !== 'undefined'
	if (isBrowser) registerMediaActions()

	return {
		getState,
		subscribe,
		checkIsCurrent,
		playTrack,
		playQueue,
		setQueue,
		play,
		pause,
		toggle,
		next,
		previous,
		seek,
		setVolume,
		toggleMuted,
		setRepeat,
		cycleRepeat
	}
}

export type PlayerT = ReturnType<typeof createPlayer>

export const player = createPlayer()
