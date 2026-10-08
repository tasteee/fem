import { createSeedNotes } from './notes-data'
import type { NoteT } from './notes-data'

export const allTagsLabel = 'All'

export type ScreenT = 'list' | 'editor'
export type BarModeT = 'resting' | 'selection'
export type BarRowT = 'none' | 'weight' | 'color' | 'link'
export type OverlayT = '' | 'settings-sheet' | 'delete-dialog'

const maxPreviewLength = 90

// Holds everything the screens share. Components read
// the fields and call the methods; Svelte tracks the rest.
class NotesStore {
	notes = $state<NoteT[]>(createSeedNotes())
	searchText = $state('')
	selectedTag = $state(allTagsLabel)
	currentNoteId = $state('')
	screen = $state<ScreenT>('list')
	theme = $state<'light' | 'dark'>('dark')
	barMode = $state<BarModeT>('resting')
	barRow = $state<BarRowT>('none')
	overlay = $state<OverlayT>('')
	nextNoteNumber = this.notes.length + 1

	currentNote = $derived(this.notes.find((note) => note.id === this.currentNoteId))

	tags = $derived([allTagsLabel, ...new Set(this.notes.flatMap((note) => note.tags))])

	visibleNotes = $derived(
		this.notes.filter((note) => {
			const hasTag = this.selectedTag === allTagsLabel || note.tags.includes(this.selectedTag)
			const searchableText = `${note.title} ${note.preview}`.toLowerCase()
			return hasTag && searchableText.includes(this.searchText.trim().toLowerCase())
		})
	)

	pinnedNotes = $derived(this.visibleNotes.filter((note) => note.isPinned))
	otherNotes = $derived(this.visibleNotes.filter((note) => !note.isPinned))

	setBarMode = (mode: BarModeT) => {
		if (this.barMode === mode) return
		this.barMode = mode
		this.barRow = 'none'
	}

	toggleBarRow = (row: BarRowT) => {
		this.barRow = this.barRow === row ? 'none' : row
	}

	openOverlay = (overlay: OverlayT) => {
		this.overlay = overlay
	}

	closeOverlays = () => {
		this.overlay = ''
	}

	toggleTheme = () => {
		this.theme = this.theme === 'dark' ? 'light' : 'dark'
	}

	openNote = (noteId: string) => {
		this.currentNoteId = noteId
		this.screen = 'editor'
	}

	// Saves the editor's content, then returns to the list.
	closeNote = (bodyHtml: string, previewText: string) => {
		const note = this.currentNote

		if (note) {
			note.bodyHtml = bodyHtml
			note.preview = previewText.trim().slice(0, maxPreviewLength) || 'No text yet'
		}

		this.setBarMode('resting')
		this.screen = 'list'
	}

	createNote = (title: string, bodyHtml: string, tags: string[]): NoteT => {
		const id = `n${this.nextNoteNumber}`
		this.nextNoteNumber += 1
		this.notes.unshift({ id, title, preview: 'No text yet', date: 'Today', tags, isPinned: false, bodyHtml })
		return this.notes[0]
	}

	togglePin = () => {
		const note = this.currentNote
		if (note) note.isPinned = !note.isPinned
		this.closeOverlays()
	}

	deleteCurrentNote = () => {
		const noteIndex = this.notes.findIndex((note) => note.id === this.currentNoteId)
		if (noteIndex >= 0) this.notes.splice(noteIndex, 1)
		this.currentNoteId = ''
		this.closeOverlays()
		this.setBarMode('resting')
		this.screen = 'list'
	}
}

export const store = new NotesStore()
