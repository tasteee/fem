import type { NoteT } from './notes-data'

export type ListFilterT = {
	searchText: string
	selectedTag: string
}

export const allTagsLabel = 'All'

const getAllTags = (notes: NoteT[]): string[] => {
	const tagSet = new Set<string>()

	for (const note of notes) {
		for (const tag of note.tags) tagSet.add(tag)
	}

	return [allTagsLabel, ...tagSet]
}

const buildChipHtml = (tag: string, selectedTag: string): string => {
	const isSelected = tag === selectedTag
	const selectedAttribute = isSelected ? ' selected' : ''
	return `<fem-chip data-tag="${tag}"${selectedAttribute}>${tag}</fem-chip>`
}

const buildTagHtml = (tag: string): string => `<fem-tag>${tag}</fem-tag>`

const buildRowHtml = (note: NoteT): string => {
	const displayTitle = note.title || 'Untitled'
	const tagsHtml = note.tags.map(buildTagHtml).join('')

	return `
		<button class="note-row" data-note-id="${note.id}">
			<span class="note-row-title">${displayTitle}</span>
			<span class="note-row-preview">${note.preview}</span>
			<span class="note-row-meta"><span>${note.date}</span>${tagsHtml}</span>
		</button>
	`
}

const buildSectionHtml = (label: string, sectionNotes: NoteT[]): string => {
	const isEmpty = sectionNotes.length === 0
	if (isEmpty) return ''
	const rowsHtml = sectionNotes.map(buildRowHtml).join('')
	return `<div class="note-section"><span class="section-label">${label}</span>${rowsHtml}</div>`
}

const checkNoteMatches = (note: NoteT, filter: ListFilterT): boolean => {
	const isAllTags = filter.selectedTag === allTagsLabel
	const hasTag = isAllTags || note.tags.includes(filter.selectedTag)
	if (!hasTag) return false
	const searchableText = `${note.title} ${note.preview}`.toLowerCase()
	return searchableText.includes(filter.searchText)
}

export const buildTagRowHtml = (notes: NoteT[], selectedTag: string): string => {
	const buildChip = (tag: string) => buildChipHtml(tag, selectedTag)
	return getAllTags(notes).map(buildChip).join('')
}

export const buildListHtml = (notes: NoteT[], filter: ListFilterT): string => {
	const visibleNotes = notes.filter((note) => checkNoteMatches(note, filter))
	const hasNotes = visibleNotes.length > 0
	if (!hasNotes) return '<div class="empty-state">No notes match. Try another search or tag.</div>'
	const pinnedNotes = visibleNotes.filter((note) => note.isPinned)
	const otherNotes = visibleNotes.filter((note) => !note.isPinned)
	return buildSectionHtml('Pinned', pinnedNotes) + buildSectionHtml('Notes', otherNotes)
}
