export type NoteT = {
	id: string
	title: string
	preview: string
	date: string
	tags: string[]
	isPinned: boolean
	bodyHtml: string
}

export const checkBoxHtml = '<span class="check-box" contenteditable="false"><fem-icon name="check" size="small"></fem-icon></span>'

const showcaseBodyHtml = `
	<p>Everything this editor can do, in one note. Select any text to style it.</p>
	<h2>Title</h2>
	<h3>Heading</h3>
	<h4>Subheading</h4>
	<p>Body text can be <span class="mark isBold">bold</span>, <span class="mark isMedium">medium</span>, <i>italic</i>, <u>underlined</u>, <s>struck</s>, <span class="mark isPink">colored</span>, or a <a href="https://example.com">link</a>.</p>
	<p class="isSmall">Small text is for side notes and credits.</p>
	<blockquote>Write the hook first. Everything else is just getting there.</blockquote>
	<ul><li>Tune the acoustic down a half step</li><li>Bring the good cable</li></ul>
	<ol><li>Record the scratch vocal</li><li>Comp the best takes</li></ol>
	<ul class="isChecklist"><li class="isChecked">${checkBoxHtml}Book the room</li><li>${checkBoxHtml}Print lyric sheets</li></ul>
	<div class="callout isNeutral">Session starts at noon. Doors open fifteen minutes early.</div>
	<div class="callout isRed">The hard drive is almost full. Clear space before recording.</div>
	<div class="callout isYellow">The bridge is still a placeholder.</div>
	<div class="callout isGreen">Verse two is done and approved.</div>
`

const buildSimpleNote = (id: string, title: string, preview: string, date: string, tags: string[]): NoteT => {
	return { id, title, preview, date, tags, isPinned: false, bodyHtml: `<p>${preview}</p>` }
}

export const createSeedNotes = (): NoteT[] => {
	const showcaseNote: NoteT = {
		id: 'n1',
		title: 'Studio day plan',
		preview: 'Everything this editor can do, in one note.',
		date: 'Today',
		tags: ['Music'],
		isPinned: true,
		bodyHtml: showcaseBodyHtml
	}

	const chorusNote = buildSimpleNote('n2', 'Chorus ideas', 'Try the melody a third higher on the last line.', 'Yesterday', [
		'Music',
		'Ideas'
	])

	chorusNote.isPinned = true

	return [
		showcaseNote,
		chorusNote,
		buildSimpleNote('n3', 'Groceries', 'Oat milk, limes, rice, coffee filters.', 'Oct 6', ['Home']),
		buildSimpleNote('n4', 'App ideas', 'A chord builder that starts from a bass line.', 'Oct 4', ['Ideas']),
		buildSimpleNote('n5', 'Books to read', 'Ask around for one good novel and one about sound.', 'Sep 29', ['Home'])
	]
}
