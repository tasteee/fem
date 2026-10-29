<script lang="ts">
	import { moveTrack, signOutOfStudio, studio } from '../data/studio.svelte'
	import type { ArtistT, PlaylistT } from '../data/types'
	import { formatPlaylistCount, formatTrackCount } from '../parts/format-count'
	import SiteHeader from '../parts/SiteHeader.svelte'
	import { navigate } from '../routing/router.svelte'
	import { buildArtistPath } from '../routing/routes'
	import PlaylistShelf from '../parts/PlaylistShelf.svelte'
	import { openNewPlaylist, openProfile, openUpload } from './owner-dialogs.svelte'
	import OwnTrackMenu from './OwnTrackMenu.svelte'
	import { shareLink } from './share-link'
	import VisibilityBadge from './VisibilityBadge.svelte'

	type OwnArtistViewPropsT = {
		artist: ArtistT
	}

	type TabT = 'tracks' | 'playlists'
	type ReorderDetailT = { from: number; to: number }

	// The artist's own page. It looks like the public one,
	// with controls only they see: upload, edit, reorder,
	// and every track's "⋯".
	const props: OwnArtistViewPropsT = $props()
	let selectedTab = $state<TabT>('tracks')

	const isTracksTab = $derived(selectedTab === 'tracks')
	const hasTracks = $derived(studio.tracks.length > 0)
	const trackCountLabel = $derived(formatTrackCount(studio.tracks.length))
	const playlistCountLabel = $derived(formatPlaylistCount(studio.playlists.length))
	const countLabel = $derived(isTracksTab ? trackCountLabel : playlistCountLabel)
	const pagePath = $derived(buildArtistPath(props.artist.slug))
	const hasBio = $derived(props.artist.bio !== '')

	const handleTabChange = (event: Event) => {
		const segmented = event.currentTarget as HTMLElement & { value: TabT }
		selectedTab = segmented.value
	}

	const handleReorder = (event: Event) => {
		const detail = (event as CustomEvent<ReorderDetailT>).detail
		moveTrack(detail.from, detail.to)
	}

	const handleShare = () => shareLink(pagePath, props.artist.name)
	const handleNewPlaylist = () => openNewPlaylist()

	const handleSignOut = async () => {
		await signOutOfStudio()
		navigate('/')
	}

	// A playlist with any song that isn't yours is one of
	// your picks. Worked out here so it updates the moment
	// a song is added.
	const ownTrackIds = $derived(new Set(studio.tracks.map((track) => track.id)))

	const markGuests = (playlist: PlaylistT): PlaylistT => {
		const hasGuests = playlist.trackIds.some((trackId) => !ownTrackIds.has(trackId))
		return { ...playlist, hasGuests }
	}

	const shelfPlaylists = $derived(studio.playlists.map(markGuests))
</script>

<div class="app-page">
	<SiteHeader />
	<div class="profile-header">
		<fem-image src={props.artist.headerUrl} alt="" ratio="4 / 1" radius="container" eager></fem-image>
	</div>
	<div class="profile-layout">
		<div class="profile-intro">
			<span class="profile-avatar-ring">
				<fem-avatar size="large" name={props.artist.name} src={props.artist.avatarUrl}></fem-avatar>
			</span>
			<fem-heading level={1} size="display">{props.artist.name}</fem-heading>
			{#if hasBio}
				<fem-text>{props.artist.bio}</fem-text>
			{:else}
				<fem-text color="muted">Add a line about your music in Edit profile.</fem-text>
			{/if}
			<div class="profile-links">
				{#each props.artist.links as link (link.url)}
					<a class="profile-link" href={link.url} target="_blank" rel="noopener noreferrer">
						<fem-icon name="link" size="small"></fem-icon>
						{link.label}
					</a>
				{/each}
			</div>
			<div class="profile-actions">
				<fem-play-button queue={studio.tracks}></fem-play-button>
				<fem-button kind="soft" onclick={openProfile}>Edit profile</fem-button>
				<fem-button kind="soft" shape="circle" label="Share" onclick={handleShare}>
					<fem-icon name="share-fat"></fem-icon>
				</fem-button>
				<fem-menu>
					<fem-button slot="trigger" kind="ghost" shape="circle" label="More">
						<fem-icon name="dots-three"></fem-icon>
					</fem-button>
					<fem-menu-item onclick={handleSignOut}>Sign out</fem-menu-item>
				</fem-menu>
			</div>
		</div>
		<div class="profile-body">
			<div class="manage-row isNoWrap">
				<fem-segmented value={selectedTab} onchange={handleTabChange}>
					<fem-segment value="tracks">Tracks</fem-segment>
					<fem-segment value="playlists">Playlists</fem-segment>
				</fem-segmented>
				<span class="numeric muted">{countLabel}</span>
				<span class="studio-toolbar-spacer"></span>
				{#if isTracksTab}
					<fem-button shape="circle" label="Upload tracks" onclick={openUpload}>
						<fem-icon name="upload-simple"></fem-icon>
					</fem-button>
				{:else}
					<fem-button shape="circle" label="New playlist" onclick={handleNewPlaylist}>
						<fem-icon name="plus"></fem-icon>
					</fem-button>
				{/if}
			</div>

			{#if isTracksTab}
				{#if hasTracks}
					<fem-sortable class="track-list" label="Your tracks" gap="0" onreorder={handleReorder}>
						{#each studio.tracks as track (track.id)}
							<fem-track-row {track} queue={studio.tracks}>
								<span slot="trailing" class="row-action">
									<VisibilityBadge visibility={track.visibility} />
									<OwnTrackMenu {track} />
								</span>
							</fem-track-row>
						{/each}
					</fem-sortable>
					<fem-text size="small" color="muted">Drag to reorder. Listeners see public tracks in this order.</fem-text>
				{:else}
					<fem-card class="studio-empty">
						<fem-empty-state heading="Your first track">
							<fem-icon slot="icon" name="music-notes"></fem-icon>
							Upload audio and get a link anyone can listen to. No account needed to listen.
							<fem-button slot="actions" onclick={openUpload}>Upload tracks</fem-button>
						</fem-empty-state>
					</fem-card>
				{/if}
			{:else}
				<PlaylistShelf artistName={props.artist.name} playlists={shelfPlaylists} showVisibility>
					{#snippet newTile()}
						<button class="playlist-tile-new" type="button" onclick={handleNewPlaylist}>
							<fem-icon name="plus"></fem-icon>
							New playlist
						</button>
					{/snippet}
				</PlaylistShelf>
			{/if}
		</div>
	</div>
</div>
