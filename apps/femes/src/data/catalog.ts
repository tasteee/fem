import { replacePath } from '../routing/router.svelte'
import * as demoReader from './demo-catalog-reader'
import type { ArtistPageT, PlaylistPageT, TrackPageT } from './types'

// What the public pages read. Each call is one request
// for one page. Undefined means not found.
//
// `npm run dev` reads the demo catalog. A real build
// reads the API, set VITE_CATALOG=api to try it locally.

const isDemo = import.meta.env.VITE_CATALOG === 'demo'

type MovedT = { movedTo: string }

const checkIsMoved = (body: unknown): body is MovedT => {
	const isObject = typeof body === 'object' && body !== null
	return isObject && 'movedTo' in body
}

// Old links to a renamed item get the new address. The
// page reloads under it, so this request never settles.
const waitForever = <T>() => new Promise<T>(() => {})

const fetchPage = async <T>(path: string): Promise<T | undefined> => {
	const response = await fetch(path, { headers: { accept: 'application/json' } })
	const isMissing = response.status === 404
	if (isMissing) return undefined
	if (!response.ok) throw new Error(`femes: ${path} answered ${response.status}`)
	const body: unknown = await response.json()
	const isMoved = checkIsMoved(body)
	if (!isMoved) return body as T
	replacePath(body.movedTo)
	return waitForever<T>()
}

const encode = (slug: string) => encodeURIComponent(slug)

export const getArtistPage = (artistSlug: string): Promise<ArtistPageT | undefined> => {
	if (isDemo) return demoReader.getArtistPage(artistSlug)
	return fetchPage<ArtistPageT>(`/api/artists/${encode(artistSlug)}`)
}

export const getTrackPage = (artistSlug: string, trackSlug: string): Promise<TrackPageT | undefined> => {
	if (isDemo) return demoReader.getTrackPage(artistSlug, trackSlug)
	return fetchPage<TrackPageT>(`/api/artists/${encode(artistSlug)}/tracks/${encode(trackSlug)}`)
}

export const getPlaylistPage = (artistSlug: string, playlistSlug: string): Promise<PlaylistPageT | undefined> => {
	if (isDemo) return demoReader.getPlaylistPage(artistSlug, playlistSlug)
	return fetchPage<PlaylistPageT>(`/api/artists/${encode(artistSlug)}/playlists/${encode(playlistSlug)}`)
}
