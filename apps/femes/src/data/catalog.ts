import { demoArtists, demoPlaylists, demoTracks } from './demo-catalog'
import type { ArtistPageT, FemesTrackT, PlaylistPageT, TrackPageT } from './types'

// What the public pages read. Each call answers one
// page in one round trip, so it maps to one API call
// once the backend is in. Undefined means not found.

const moreTracksCount = 3

const findArtist = (artistSlug: string) => demoArtists.find((artist) => artist.slug === artistSlug)

// Private tracks never reach a listener. Unlisted ones
// open by link but stay off the profile.
const checkIsListed = (track: FemesTrackT): boolean => track.visibility === 'public'
const checkIsReachable = (track: FemesTrackT): boolean => track.visibility !== 'private'

const getArtistTracks = (artistSlug: string): FemesTrackT[] => {
	return demoTracks.filter((track) => track.artistSlug === artistSlug)
}

export const getArtistPage = async (artistSlug: string): Promise<ArtistPageT | undefined> => {
	const artist = findArtist(artistSlug)
	if (!artist) return undefined
	const tracks = getArtistTracks(artistSlug).filter(checkIsListed)
	const ownPlaylists = demoPlaylists.filter((playlist) => playlist.artistSlug === artistSlug)
	const playlists = ownPlaylists.filter((playlist) => playlist.visibility === 'public')
	return { artist, tracks, playlists }
}

export const getTrackPage = async (artistSlug: string, trackSlug: string): Promise<TrackPageT | undefined> => {
	const artist = findArtist(artistSlug)
	if (!artist) return undefined
	const artistTracks = getArtistTracks(artistSlug)
	const track = artistTracks.find((entry) => entry.slug === trackSlug)
	const isVisible = track !== undefined && checkIsReachable(track)
	if (!isVisible) return undefined
	const otherTracks = artistTracks.filter((entry) => entry.id !== track.id && checkIsListed(entry))
	const moreTracks = otherTracks.slice(0, moreTracksCount)
	return { artist, track, moreTracks }
}

export const getPlaylistPage = async (artistSlug: string, playlistSlug: string): Promise<PlaylistPageT | undefined> => {
	const artist = findArtist(artistSlug)
	if (!artist) return undefined
	const isMatch = (entry: { artistSlug: string; slug: string }) => entry.artistSlug === artistSlug && entry.slug === playlistSlug
	const playlist = demoPlaylists.find(isMatch)
	const isVisible = playlist !== undefined && playlist.visibility !== 'private'
	if (!isVisible) return undefined
	const findTrack = (trackId: string) => demoTracks.find((track) => track.id === trackId)
	const foundTracks = playlist.trackIds.map(findTrack)
	const tracks = foundTracks.filter((track): track is FemesTrackT => track !== undefined && checkIsReachable(track))
	return { artist, playlist, tracks }
}
