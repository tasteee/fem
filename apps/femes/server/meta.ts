import { formatTrackCount } from '../src/parts/format-count'
import { parseRoute } from '../src/routing/routes'
import type { EnvT } from './env'
import { loadArtistPage, loadPlaylistPage, loadTrackPage } from './public-api'
import type { LookupT } from './public-api'

// Link previews. When iMessage, Discord, or Instagram
// fetch a femes link, the page's head already names the
// track, its art, and its audio.

type PageMetaT = {
	title: string
	description: string
	image: string
	type: string
	audio: string
	duration: number
	isUnlisted: boolean
}

const siteName = 'femes'
const defaultImage = '/og-default.png'

const defaultMeta: PageMetaT = {
	title: 'femes',
	description: 'A quiet place for your music.',
	image: defaultImage,
	type: 'website',
	audio: '',
	duration: 0,
	isUnlisted: false
}

const pickFirst = (values: (string | undefined)[]): string => {
	const found = values.find((value) => Boolean(value))
	return found ?? ''
}

const buildTrackMeta = async (env: EnvT, artistSlug: string, trackSlug: string): Promise<LookupT<PageMetaT>> => {
	const lookup = await loadTrackPage(env, artistSlug, trackSlug)
	if (lookup.kind !== 'found') return lookup
	const track = lookup.page.track
	const artist = lookup.page.artist
	const fallbackDescription = `Listen to ${track.title} by ${artist.name}.`

	const meta: PageMetaT = {
		title: `${track.title} · ${artist.name}`,
		description: track.description || fallbackDescription,
		image: pickFirst([track.artwork, artist.avatarUrl, defaultImage]),
		type: 'music.song',
		audio: track.src,
		duration: Math.round(track.duration ?? 0),
		isUnlisted: track.visibility === 'unlisted'
	}

	return { kind: 'found', page: meta }
}

const buildPlaylistMeta = async (env: EnvT, artistSlug: string, playlistSlug: string): Promise<LookupT<PageMetaT>> => {
	const lookup = await loadPlaylistPage(env, artistSlug, playlistSlug)
	if (lookup.kind !== 'found') return lookup
	const playlist = lookup.page.playlist
	const artist = lookup.page.artist
	const firstArtwork = lookup.page.tracks[0]?.artwork
	const fallbackDescription = `${formatTrackCount(lookup.page.tracks.length)} by ${artist.name}.`

	const meta: PageMetaT = {
		title: `${playlist.name} · ${artist.name}`,
		description: playlist.description || fallbackDescription,
		image: pickFirst([playlist.coverUrl, firstArtwork, artist.avatarUrl, defaultImage]),
		type: 'music.playlist',
		audio: '',
		duration: 0,
		isUnlisted: playlist.visibility === 'unlisted'
	}

	return { kind: 'found', page: meta }
}

const buildArtistMeta = async (env: EnvT, artistSlug: string): Promise<LookupT<PageMetaT>> => {
	const lookup = await loadArtistPage(env, artistSlug)
	if (lookup.kind !== 'found') return lookup
	const artist = lookup.page.artist
	const fallbackDescription = `Music by ${artist.name}.`

	const meta: PageMetaT = {
		title: artist.name,
		description: artist.bio || fallbackDescription,
		image: pickFirst([artist.avatarUrl, artist.headerUrl, defaultImage]),
		type: 'profile',
		audio: '',
		duration: 0,
		isUnlisted: false
	}

	return { kind: 'found', page: meta }
}

const findMeta = async (env: EnvT, pathname: string): Promise<LookupT<PageMetaT>> => {
	const route = parseRoute(pathname)
	const isTrack = route.kind === 'track'
	if (isTrack) return buildTrackMeta(env, route.artistSlug, route.trackSlug)
	const isPlaylist = route.kind === 'playlist'
	if (isPlaylist) return buildPlaylistMeta(env, route.artistSlug, route.playlistSlug)
	const isArtist = route.kind === 'artist'
	if (isArtist) return buildArtistMeta(env, route.artistSlug)
	return { kind: 'found', page: defaultMeta }
}

// ---------- writing the head ----------

const escapeAttribute = (value: string): string => {
	return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

const buildTag = (attribute: 'property' | 'name', key: string, value: string): string => {
	return `<meta ${attribute}="${key}" content="${escapeAttribute(value)}" />`
}

const buildHeadTags = (meta: PageMetaT, pageUrl: URL): string => {
	const origin = pageUrl.origin
	const imageUrl = new URL(meta.image, origin).toString()
	const tags = [
		buildTag('name', 'description', meta.description),
		buildTag('property', 'og:site_name', siteName),
		buildTag('property', 'og:type', meta.type),
		buildTag('property', 'og:title', meta.title),
		buildTag('property', 'og:description', meta.description),
		buildTag('property', 'og:url', pageUrl.toString()),
		buildTag('property', 'og:image', imageUrl),
		buildTag('name', 'twitter:card', 'summary_large_image'),
		buildTag('name', 'twitter:title', meta.title),
		buildTag('name', 'twitter:description', meta.description),
		buildTag('name', 'twitter:image', imageUrl)
	]

	const hasAudio = meta.audio !== ''
	if (hasAudio) tags.push(buildTag('property', 'og:audio', new URL(meta.audio, origin).toString()))
	const hasDuration = meta.duration > 0
	if (hasDuration) tags.push(buildTag('property', 'music:duration', String(meta.duration)))
	// Unlisted things preview in chats but stay out of
	// search engines.
	if (meta.isUnlisted) tags.push(buildTag('name', 'robots', 'noindex'))
	return tags.join('\n')
}

// The app's HTML with this page's title and preview tags.
// A renamed item redirects to its new address.
export const serveAppPage = async (request: Request, env: EnvT, appResponse: Response): Promise<Response> => {
	const pageUrl = new URL(request.url)
	const lookup = await findMeta(env, pageUrl.pathname)
	const isMoved = lookup.kind === 'moved'
	if (isMoved) return Response.redirect(new URL(lookup.path, pageUrl).toString(), 301)
	const isFound = lookup.kind === 'found'
	const meta = isFound ? lookup.page : defaultMeta
	const headTags = buildHeadTags(meta, pageUrl)

	const setTitle = (title: Element) => {
		title.setInnerContent(meta.title)
	}

	const removeTag = (tag: Element) => {
		tag.remove()
	}

	const addTags = (head: Element) => {
		head.append(headTags, { html: true })
	}

	const rewriter = new HTMLRewriter()
		.on('title', { element: setTitle })
		.on('meta[name="description"]', { element: removeTag })
		.on('head', { element: addTags })

	const response = rewriter.transform(appResponse)
	const headers = new Headers(response.headers)
	// Previews change when an artist edits, so pages are
	// never cached for long.
	headers.set('cache-control', 'public, max-age=60')
	const isMissing = lookup.kind === 'missing'
	const status = isMissing ? 404 : 200
	return new Response(response.body, { status, headers })
}
