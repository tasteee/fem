import '../../tokens.css'
import './notes.css'
import '../../index'
import * as icons from '../../icons'
import { registerIcons } from '../../icons/registry'
import { showToast } from '../../show-toast'
import { createSeedNotes } from './notes-data'
import type { NoteT } from './notes-data'
import { createEditor } from './notes-editor'
import { allTagsLabel, buildListHtml, buildTagRowHtml } from './notes-list'

registerIcons([
	icons.caretLeftIcon,
	icons.checkIcon,
	icons.circleHalfIcon,
	icons.copyIcon,
	icons.dotsThreeIcon,
	icons.imageIcon,
	icons.linkIcon,
	icons.listBulletsIcon,
	icons.listChecksIcon,
	icons.listNumbersIcon,
	icons.musicNotesIcon,
	icons.paletteIcon,
	icons.playIcon,
	icons.plusIcon,
	icons.pushPinIcon,
	icons.quotesIcon,
	icons.shareFatIcon,
	icons.textAaIcon,
	icons.textBIcon,
	icons.textItalicIcon,
	icons.textStrikethroughIcon,
	icons.textUnderlineIcon,
	icons.trashIcon,
	icons.videoIcon,
	icons.xIcon
])

type OverlayElementT = HTMLElement & { open: boolean }
type ValueElementT = HTMLElement & { value: string }
type SwapElementT = HTMLElement & { on: boolean }

const getElement = <ElementT extends HTMLElement>(selector: string): ElementT => {
	const element = document.querySelector<ElementT>(selector)
	if (!element) throw new Error(`Missing element: ${selector}`)
	return element
}

const rootElement = document.documentElement
const noteListElement = getElement<HTMLElement>('#note-list')
const tagRowElement = getElement<HTMLElement>('#tag-row')
const searchInput = getElement<ValueElementT>('#search-input')
const titleInput = getElement<HTMLInputElement>('#title-input')
const bodyElement = getElement<HTMLElement>('#editor-body')
const linkInput = getElement<ValueElementT>('#link-input')
const pinSwap = getElement<SwapElementT>('#pin-swap')
const pinLabel = getElement<HTMLElement>('#pin-label')

const notes = createSeedNotes()
const editor = createEditor(bodyElement)

const state = {
	searchText: '',
	selectedTag: allTagsLabel,
	currentNoteId: '',
	nextNoteNumber: notes.length + 1
}

// ---------- list ----------
const renderList = () => {
	tagRowElement.innerHTML = buildTagRowHtml(notes, state.selectedTag)
	noteListElement.innerHTML = buildListHtml(notes, state)
}

const selectTag = (tag: string) => {
	state.selectedTag = tag
	renderList()
}

// ---------- overlays ----------
const setOverlayOpen = (overlayId: string, isOpen: boolean) => {
	const overlayElement = document.getElementById(overlayId) as OverlayElementT | null
	if (overlayElement) overlayElement.open = isOpen
}

const closeOverlays = () => {
	const overlayElements = document.querySelectorAll<OverlayElementT>('fem-sheet, fem-dialog')
	for (const overlayElement of overlayElements) overlayElement.open = false
}

const openOverlay = (overlayId: string) => {
	closeOverlays()
	setOverlayOpen(overlayId, true)
}

// ---------- editor bar ----------
const setBarMode = (mode: string) => {
	const isSameMode = rootElement.getAttribute('bar') === mode
	if (isSameMode) return
	rootElement.setAttribute('bar', mode)
	rootElement.setAttribute('bar-row', 'none')
}

const toggleBarRow = (rowName: string) => {
	const isOpen = rootElement.getAttribute('bar-row') === rowName
	const nextRow = isOpen ? 'none' : rowName
	rootElement.setAttribute('bar-row', nextRow)
}

const handleSelectionChange = () => {
	const isTypingLink = document.activeElement === linkInput
	if (isTypingLink) return
	const hasSelectedText = editor.rememberSelection()
	const isElsewhere = hasSelectedText === undefined
	if (isElsewhere) return
	const barMode = hasSelectedText ? 'selection' : 'resting'
	setBarMode(barMode)
}

const applyLink = () => {
	const linkAddress = linkInput.value.trim()
	const isEmpty = linkAddress === ''
	if (isEmpty) return
	editor.applyLink(linkAddress)
	linkInput.value = ''
	rootElement.setAttribute('bar-row', 'none')
}

// ---------- notes ----------
const getCurrentNote = (): NoteT | undefined => notes.find((note) => note.id === state.currentNoteId)

const renderPinState = () => {
	const note = getCurrentNote()
	if (!note) return
	pinSwap.on = note.isPinned
	pinLabel.textContent = note.isPinned ? 'Unpin note' : 'Pin note'
}

const openNote = (noteId: string) => {
	state.currentNoteId = noteId
	editor.forgetSelection()
	const note = getCurrentNote()
	if (!note) return
	titleInput.value = note.title
	bodyElement.innerHTML = note.bodyHtml
	renderPinState()
	rootElement.setAttribute('screen', 'editor')
}

const closeNote = () => {
	const note = getCurrentNote()
	if (note) note.bodyHtml = bodyElement.innerHTML
	const focusedElement = document.activeElement
	if (focusedElement instanceof HTMLElement) focusedElement.blur()
	setBarMode('resting')
	renderList()
	rootElement.setAttribute('screen', 'list')
}

const createNote = (title: string, bodyHtml: string, tags: string[]): NoteT => {
	const id = `n${state.nextNoteNumber}`
	const note: NoteT = { id, title, preview: 'No text yet', date: 'Today', tags, isPinned: false, bodyHtml }
	state.nextNoteNumber += 1
	notes.unshift(note)
	return note
}

const startNewNote = () => {
	const note = createNote('', '<p><br></p>', [])
	openNote(note.id)
}

const duplicateNote = () => {
	const note = getCurrentNote()
	if (!note) return
	const copy = createNote(`${note.title} copy`, bodyElement.innerHTML, [...note.tags])
	copy.preview = note.preview
	closeOverlays()
	showToast('Note duplicated')
}

const shareNote = () => {
	closeOverlays()
	showToast('Link copied')
}

const togglePin = () => {
	const note = getCurrentNote()
	if (!note) return
	note.isPinned = !note.isPinned
	renderPinState()
	closeOverlays()
}

const deleteNote = () => {
	const noteIndex = notes.findIndex((note) => note.id === state.currentNoteId)
	notes.splice(noteIndex, 1)
	state.currentNoteId = ''
	closeOverlays()
	closeNote()
	showToast('Note deleted')
}

// ---------- theme ----------
const toggleTheme = () => {
	const isDark = rootElement.getAttribute('theme') === 'dark'
	const nextTheme = isDark ? 'light' : 'dark'
	rootElement.setAttribute('theme', nextTheme)
}

// ---------- events ----------
const actions: Record<string, () => void> = {
	'toggle-theme': toggleTheme,
	'new-note': startNewNote,
	'close-note': closeNote,
	'toggle-pin': togglePin,
	'duplicate-note': duplicateNote,
	'share-note': shareNote,
	'delete-note': deleteNote,
	'apply-link': applyLink
}

const applyBlockKind = (kindName: string) => {
	closeOverlays()
	editor.applyBlockKind(kindName)
}

const insertEmbed = (embedName: string) => {
	closeOverlays()
	editor.insertEmbed(embedName)
}

const toggleCheckBox = (checkBoxElement: Element) => {
	const itemElement = checkBoxElement.parentElement
	if (itemElement) itemElement.classList.toggle('isChecked')
}

const controlSelector = [
	'[data-action]',
	'[data-opens]',
	'[data-closes]',
	'[data-note-id]',
	'[data-tag]',
	'[data-mark]',
	'[data-command]',
	'[data-bar-row]',
	'[data-block]',
	'[data-embed]',
	'.check-box'
].join(', ')

const handleClick = (event: MouseEvent) => {
	const clickedElement = event.target as HTMLElement
	const target = clickedElement.closest<HTMLElement>(controlSelector)
	if (!target) return
	const data = target.dataset
	const action = actions[data.action ?? '']
	if (action) return action()
	if (data.opens) return openOverlay(data.opens)
	if (data.closes) return setOverlayOpen(data.closes, false)
	if (data.noteId) return openNote(data.noteId)
	if (data.tag) return selectTag(data.tag)
	if (data.mark) return editor.applyMark(data.mark)
	if (data.command) return editor.applyCommand(data.command)
	if (data.barRow) return toggleBarRow(data.barRow)
	if (data.block) return applyBlockKind(data.block)
	if (data.embed) return insertEmbed(data.embed)
	toggleCheckBox(target)
}

// Stops a tap on the toolbar from clearing the text
// selection it is about to act on.
const handlePointerDown = (event: PointerEvent) => {
	const pressedElement = event.target as HTMLElement
	const isToolbar = pressedElement.closest('.editor-bar') !== null
	const isField = pressedElement.closest('fem-input') !== null
	const shouldKeepSelection = isToolbar && !isField
	if (shouldKeepSelection) event.preventDefault()
}

const handleInput = (event: Event) => {
	const isSearch = event.target === searchInput
	if (!isSearch) return
	state.searchText = searchInput.value.trim().toLowerCase()
	noteListElement.innerHTML = buildListHtml(notes, state)
}

const handleTitleInput = () => {
	const note = getCurrentNote()
	if (note) note.title = titleInput.value
}

// Lifts the screen above the phone keyboard where the
// browser reports the keyboard height.
const handleViewportChange = () => {
	const viewport = window.visualViewport
	if (!viewport) return
	const keyboardInset = Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop)
	rootElement.style.setProperty('--keyboard-inset', `${keyboardInset}px`)
	// iOS draws its AutoFill pill just above the keyboard,
	// so keep the bar clear of it while the keyboard is up.
	rootElement.style.setProperty('--autofill-clearance', keyboardInset > 0 ? '48px' : '0px')
}

document.addEventListener('click', handleClick)
document.addEventListener('pointerdown', handlePointerDown)
document.addEventListener('selectionchange', handleSelectionChange)
document.addEventListener('input', handleInput)
titleInput.addEventListener('input', handleTitleInput)
if (window.visualViewport) window.visualViewport.addEventListener('resize', handleViewportChange)

renderList()
