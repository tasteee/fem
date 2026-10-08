import { checkBoxHtml } from './notes-data'

type BlockKindT = {
	tag: string
	className: string
	isList: boolean
}

const blockKinds: Record<string, BlockKindT> = {
	title: { tag: 'h2', className: '', isList: false },
	heading: { tag: 'h3', className: '', isList: false },
	subheading: { tag: 'h4', className: '', isList: false },
	body: { tag: 'p', className: '', isList: false },
	small: { tag: 'p', className: 'isSmall', isList: false },
	quote: { tag: 'blockquote', className: '', isList: false },
	calloutNeutral: { tag: 'div', className: 'callout isNeutral', isList: false },
	calloutRed: { tag: 'div', className: 'callout isRed', isList: false },
	calloutYellow: { tag: 'div', className: 'callout isYellow', isList: false },
	calloutGreen: { tag: 'div', className: 'callout isGreen', isList: false },
	bullets: { tag: 'ul', className: '', isList: true },
	numbers: { tag: 'ol', className: '', isList: true },
	checklist: { tag: 'ul', className: 'isChecklist', isList: true }
}

const playIconHtml = '<fem-icon name="play" kind="fill"></fem-icon>'

const embedHtml: Record<string, string> = {
	image: '<div class="embed isImage" contenteditable="false"><fem-icon name="image" size="large"></fem-icon>Image</div>',
	video: `<div class="embed isVideo" contenteditable="false">${playIconHtml}Video, 02:14</div>`,
	audio: `<div class="embed isAudio" contenteditable="false">${playIconHtml}<fem-progress value="0" label="Playback"></fem-progress><span class="embed-time">01:11</span></div>`
}

export type EditorT = {
	rememberSelection: () => boolean | undefined
	forgetSelection: () => void
	applyMark: (markClass: string) => void
	applyCommand: (commandName: string) => void
	applyLink: (linkAddress: string) => void
	applyBlockKind: (kindName: string) => void
	insertEmbed: (embedName: string) => void
}

// Holds the editing logic for one editable element.
// Tool buttons live outside it, so the last selection
// inside the body is remembered and restored.
export const createEditor = (bodyElement: HTMLElement): EditorT => {
	const state: { savedRange: Range | null } = { savedRange: null }

	// Returns whether text is selected in the body, or
	// undefined when the selection is somewhere else.
	const rememberSelection = (): boolean | undefined => {
		const selection = document.getSelection()
		const hasRange = selection !== null && selection.rangeCount > 0
		if (!hasRange) return undefined
		const range = selection.getRangeAt(0)
		const isInsideBody = bodyElement.contains(range.commonAncestorContainer)
		if (!isInsideBody) return undefined
		state.savedRange = range.cloneRange()
		return !range.collapsed
	}

	const forgetSelection = () => {
		state.savedRange = null
	}

	const restoreSelection = (): Selection | null => {
		const selection = document.getSelection()
		if (!selection || !state.savedRange) return selection
		selection.removeAllRanges()
		selection.addRange(state.savedRange)
		return selection
	}

	const applyMark = (markClass: string) => {
		const selection = restoreSelection()
		const hasRange = selection !== null && selection.rangeCount > 0
		if (!hasRange) return
		const range = selection.getRangeAt(0)
		if (range.collapsed) return
		const markElement = document.createElement('span')
		markElement.className = `mark ${markClass}`
		markElement.appendChild(range.extractContents())
		range.insertNode(markElement)
		selection.selectAllChildren(markElement)
	}

	const applyCommand = (commandName: string) => {
		restoreSelection()
		document.execCommand(commandName)
	}

	const applyLink = (linkAddress: string) => {
		restoreSelection()
		document.execCommand('createLink', false, linkAddress)
	}

	const getCurrentBlock = (): Element | undefined => {
		const blocks = [...bodyElement.children]
		const lastBlock = blocks[blocks.length - 1]
		if (!state.savedRange) return lastBlock
		const startNode = state.savedRange.startContainer
		const currentBlock = blocks.find((block) => block.contains(startNode))
		return currentBlock ?? lastBlock
	}

	// A list yields one line per item, so changing its
	// kind keeps every item.
	const getBlockLines = (block: Element): Element[] => {
		const isList = block.matches('ul, ol')
		if (isList) return [...block.children]
		return [block]
	}

	const moveLineContent = (sourceElement: Element, targetElement: Element) => {
		const childNodes = [...sourceElement.childNodes]

		for (const childNode of childNodes) {
			const isCheckBox = childNode instanceof Element && childNode.classList.contains('check-box')
			if (isCheckBox) continue
			targetElement.appendChild(childNode)
		}
	}

	const buildBlock = (kind: BlockKindT, lineElement: Element): Element => {
		const blockElement = document.createElement(kind.tag)
		blockElement.className = kind.className
		moveLineContent(lineElement, blockElement)
		return blockElement
	}

	const buildListItem = (kind: BlockKindT, lineElement: Element): Element => {
		const itemElement = document.createElement('li')
		const isChecklist = kind.className === 'isChecklist'
		if (isChecklist) itemElement.innerHTML = checkBoxHtml
		moveLineContent(lineElement, itemElement)
		return itemElement
	}

	const buildList = (kind: BlockKindT, lineElements: Element[]): Element => {
		const listElement = document.createElement(kind.tag)
		listElement.className = kind.className
		for (const lineElement of lineElements) listElement.appendChild(buildListItem(kind, lineElement))
		return listElement
	}

	const placeCaretAtEnd = (element: Element) => {
		const range = document.createRange()
		range.selectNodeContents(element)
		range.collapse(false)
		state.savedRange = range
	}

	const applyBlockKind = (kindName: string) => {
		const block = getCurrentBlock()
		const kind = blockKinds[kindName]
		if (!block || !kind) return
		const isEmbed = block.classList.contains('embed')
		if (isEmbed) return
		const lineElements = getBlockLines(block)
		const buildFromLine = (lineElement: Element) => buildBlock(kind, lineElement)
		const newElements = kind.isList ? [buildList(kind, lineElements)] : lineElements.map(buildFromLine)
		block.replaceWith(...newElements)
		const lastElement = newElements[newElements.length - 1]
		if (lastElement) placeCaretAtEnd(lastElement)
	}

	const insertEmbed = (embedName: string) => {
		const html = `${embedHtml[embedName] ?? ''}<p><br></p>`
		const block = getCurrentBlock()
		if (!block) return bodyElement.insertAdjacentHTML('beforeend', html)
		block.insertAdjacentHTML('afterend', html)
		const embedElement = block.nextElementSibling
		if (embedElement) embedElement.scrollIntoView({ block: 'center', behavior: 'smooth' })
	}

	return { rememberSelection, forgetSelection, applyMark, applyCommand, applyLink, applyBlockKind, insertEmbed }
}
