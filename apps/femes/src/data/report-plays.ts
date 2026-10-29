import { player } from '@tasteee/fem-media'
import type { PlayerStateT } from '@tasteee/fem-media'

// Counts a play once a song has really been heard: 30
// seconds, or half of a shorter song. Each song counts
// once per visit. Nothing about the listener is sent.

const fullPlaySeconds = 30
const isDemo = import.meta.env.VITE_CATALOG === 'demo'
const reportedTrackIds = new Set<string>()

const getThresholdSeconds = (state: PlayerStateT): number => {
	const hasDuration = state.duration > 0
	if (!hasDuration) return fullPlaySeconds
	return Math.min(fullPlaySeconds, state.duration / 2)
}

const sendPlay = async (trackId: string) => {
	try {
		const body = JSON.stringify({ trackId })
		await fetch('/api/plays', { method: 'POST', headers: { 'content-type': 'application/json' }, body, keepalive: true })
	} catch (playError) {
		// A missed count is fine. Listening never breaks.
		console.warn('femes: play not counted', playError)
	}
}

const handlePlayerChange = (state: PlayerStateT) => {
	const trackId = state.track?.id
	if (!trackId) return
	const wasReported = reportedTrackIds.has(trackId)
	if (wasReported) return
	const hasBeenHeard = state.isPlaying && state.currentTime >= getThresholdSeconds(state)
	if (!hasBeenHeard) return
	reportedTrackIds.add(trackId)
	sendPlay(trackId)
}

export const startPlayReports = () => {
	if (isDemo) return
	player.subscribe(handlePlayerChange)
}
