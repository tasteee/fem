<script lang="ts">
	import { store } from './notes-store.svelte'
	import type { NoteT } from './notes-data'

	const startNewNote = () => {
		const note = store.createNote('', '<p><br></p>', [])
		store.openNote(note.id)
	}

	const handleSearchInput = (event: Event) => {
		store.searchText = (event.currentTarget as HTMLInputElement).value
	}
</script>

{#snippet section(label: string, sectionNotes: NoteT[])}
	{#if sectionNotes.length > 0}
		<div class="note-section">
			<span class="section-label">{label}</span>
			{#each sectionNotes as note (note.id)}
				<button class="note-row" onclick={() => store.openNote(note.id)}>
					<span class="note-row-title">{note.title || 'Untitled'}</span>
					<span class="note-row-preview">{note.preview}</span>
					<span class="note-row-meta">
						<span>{note.date}</span>
						{#each note.tags as tag}<fem-tag>{tag}</fem-tag>{/each}
					</span>
				</button>
			{/each}
		</div>
	{/if}
{/snippet}

<section class="screen isList">
	<div class="screen-scroll hasFooterButton">
		<div class="row">
			<h1 class="page-title">Notes</h1>
			<span class="spacer"></span>
			<fem-button shape="circle" label="Switch theme" onclick={store.toggleTheme}>
				<fem-icon name="circle-half"></fem-icon>
			</fem-button>
		</div>

		<fem-input type="search" label="Search notes" placeholder="Search notes" oninput={handleSearchInput}></fem-input>

		<div class="chip-row">
			{#each store.tags as tag (tag)}
				<fem-chip selected={tag === store.selectedTag} onclick={() => (store.selectedTag = tag)}>{tag}</fem-chip>
			{/each}
		</div>

		<div class="note-groups">
			{#if store.visibleNotes.length === 0}
				<div class="empty-state">No notes match. Try another search or tag.</div>
			{:else}
				{@render section('Pinned', store.pinnedNotes)}
				{@render section('Notes', store.otherNotes)}
			{/if}
		</div>
	</div>

	<div class="floating-action">
		<fem-button size="large" color="accent" onclick={startNewNote}>
			<fem-icon name="plus"></fem-icon>
			New note
		</fem-button>
	</div>
</section>
