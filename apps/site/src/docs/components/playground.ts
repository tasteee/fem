import { highlightHtml } from './highlight'

// Attribute controls for the live example. They come
// from the manifest and only touch the root element,
// so the example stays an example, not a sandbox.

type AttributeT = {
	name: string
	type?: { text: string }
	default?: string
}

type ControlKindT =
	| { kind: 'enum'; choices: string[] }
	| { kind: 'boolean' }
	| { kind: 'number' }
	| { kind: 'text' }

type ValueElementT = HTMLElement & { value: string; checked: boolean }

const DEFAULT_CHOICE = '__default'

// Attributes that fight each other. Setting one clears
// the rest, so a change always shows up in the preview.
const exclusiveGroups: Record<string, string[][]> = {
	'fem-grid': [['columns', 'min']]
}

// A number with an optional CSS unit, like 120px or 12rem.
const lengthPattern = /^(-?\d*\.?\d+)([a-z%]*)$/i

const stepLength = (text: string, direction: number, isLarge: boolean): string | undefined => {
	const match = text.trim().match(lengthPattern)
	if (!match) return undefined
	const step = isLarge ? 10 : 1
	const next = Math.round((Number(match[1]) + direction * step) * 100) / 100
	return `${next}${match[2]}`
}
const skippedNames = new Set(['name', 'value', 'label', 'type', 'placeholder', 'href', 'src'])

const readControlKind = (attribute: AttributeT, isSet: boolean): ControlKindT | undefined => {
	const typeText = attribute.type?.text ?? ''
	const choices = [...typeText.matchAll(/'([^']*)'/g)].map((match) => match[1])
	if (choices.length > 0) return { kind: 'enum', choices }
	if (typeText === 'boolean') return { kind: 'boolean' }
	if (typeText === 'number') return { kind: 'number' }
	if (typeText === 'string' && isSet) return { kind: 'text' }
	return undefined
}

// Attributes are kept as an ordered list so the code
// block can show them in the order the example wrote.
const parseAttributes = (text: string): [string, string | null][] => {
	const pairs: [string, string | null][] = []
	for (const match of text.matchAll(/([^\s=]+)(?:="([^"]*)")?/g)) pairs.push([match[1], match[2] ?? null])
	return pairs
}

// An override is a value, null for a bare boolean
// attribute, or false when the attribute is removed.
type OverrideT = string | null | false

const buildCode = (source: string, rootTag: string, overrides: Map<string, OverrideT>): string => {
	const openingPattern = new RegExp(`^<${rootTag}([^>]*)>`)
	const opening = source.match(openingPattern)
	if (!opening) return source
	const pairs = parseAttributes(opening[1])
	for (const [name, value] of overrides) {
		const index = pairs.findIndex(([pairName]) => pairName === name)
		if (value === false) {
			if (index !== -1) pairs.splice(index, 1)
			continue
		}
		if (index === -1) pairs.push([name, value])
		else pairs[index] = [name, value]
	}
	const attributeText = pairs
		.map(([name, value]) => (value === null ? ` ${name}` : ` ${name}="${value}"`))
		.join('')
	return `<${rootTag}${attributeText}>` + source.slice(opening[0].length)
}

const buildControl = (attribute: AttributeT, control: ControlKindT, current: string | null): string => {
	const label = attribute.name
	if (control.kind === 'enum') {
		const selected = current ?? DEFAULT_CHOICE
		const defaultText = attribute.default ? `default (${attribute.default.replace(/"/g, '')})` : 'default'
		const options = [DEFAULT_CHOICE, ...control.choices].map((choice) => {
			const text = choice === DEFAULT_CHOICE ? defaultText : choice
			return `<fem-option value="${choice}"${choice === selected ? ' selected' : ''}>${text}</fem-option>`
		})
		return `<fem-select size="small" label="${label}" value="${selected}">${options.join('')}</fem-select>`
	}
	if (control.kind === 'boolean') return `<fem-switch label="${label}"${current !== null ? ' checked' : ''}></fem-switch>`
	const inputType = control.kind === 'number' ? 'number' : 'text'
	const placeholder = attribute.default?.replace(/"/g, '') ?? ''
	return `<fem-input size="small" type="${inputType}" label="${label}" placeholder="${placeholder}" value="${current ?? ''}"></fem-input>`
}

export const mountPlayground = (
	controlsElement: HTMLElement,
	previewElement: HTMLElement,
	codeElement: HTMLElement,
	source: string,
	attributes: AttributeT[],
	onReset: () => void
) => {
	const root = previewElement.firstElementChild
	if (!root) return
	const rootTag = root.tagName.toLowerCase()
	const overrides = new Map<string, OverrideT>()
	// Read the authored attributes from the source. The live
	// element also carries defaults the component reflects.
	const authored = new Map(parseAttributes(source.match(new RegExp(`^<${rootTag}([^>]*)>`))?.[1] ?? ''))

	const showCode = () => {
		codeElement.innerHTML = highlightHtml(buildCode(source, rootTag, overrides))
	}

	const apply = (name: string, value: string | null) => {
		overrides.set(name, value)
		root.setAttribute(name, value ?? '')
		showCode()
	}

	const remove = (name: string) => {
		overrides.set(name, false)
		root.removeAttribute(name)
		showCode()
	}

	const clearControl = (name: string) => {
		const control = controlsElement.querySelector(`[data-attribute="${name}"] > :last-child`) as ValueElementT | null
		if (!control) return
		control.value = control.tagName === 'FEM-SELECT' ? DEFAULT_CHOICE : ''
	}

	const clearRivals = (name: string) => {
		const groups = exclusiveGroups[rootTag] ?? []
		const rivals = groups.filter((group) => group.includes(name)).flat()
		for (const rival of rivals) {
			if (rival === name) continue
			const isAlreadyCleared = overrides.get(rival) === false || (!overrides.has(rival) && !authored.has(rival))
			if (isAlreadyCleared) continue
			remove(rival)
			clearControl(rival)
		}
	}

	const cells: string[] = []
	const wired: { attribute: AttributeT; control: ControlKindT }[] = []
	for (const attribute of attributes) {
		if (skippedNames.has(attribute.name)) continue
		const isAuthored = authored.has(attribute.name)
		const control = readControlKind(attribute, isAuthored)
		if (!control) continue
		const current = isAuthored ? authored.get(attribute.name) ?? '' : null
		const caption = control.kind === 'boolean' ? '' : `<fem-text size="small" color="muted">${attribute.name}</fem-text>`
		cells.push(`<div class="site-control" data-attribute="${attribute.name}">${caption}${buildControl(attribute, control, current)}</div>`)
		wired.push({ attribute, control })
	}
	if (cells.length === 0) return

	controlsElement.innerHTML = `${cells.join('')}<fem-button size="small" kind="ghost" id="reset-playground">Reset</fem-button>`
	controlsElement.hidden = false

	const handleChange = (event: Event) => {
		const target = event.target as ValueElementT
		const cell = target.closest('.site-control') as HTMLElement | null
		const entry = wired.find(({ attribute }) => attribute.name === cell?.dataset.attribute)
		if (!entry) return
		const { attribute, control } = entry
		if (control.kind === 'boolean') {
			if (target.checked) apply(attribute.name, null)
			else remove(attribute.name)
			return
		}
		const value = target.value
		const isEmpty = value === '' || value === DEFAULT_CHOICE
		if (isEmpty) return remove(attribute.name)
		// A count below one means nothing, so wait for a real one.
		if (control.kind === 'number' && !(Number(value) >= 1)) return
		clearRivals(attribute.name)
		apply(attribute.name, value)
	}

	// Arrow keys step a length and keep its unit, the way a
	// number input would, so 120px becomes 121px.
	const handleKeyDown = (event: KeyboardEvent) => {
		const isUp = event.key === 'ArrowUp'
		const isDown = event.key === 'ArrowDown'
		if (!isUp && !isDown) return
		const target = event.target as ValueElementT
		const cell = target.closest('.site-control') as HTMLElement | null
		const entry = wired.find(({ attribute }) => attribute.name === cell?.dataset.attribute)
		if (entry?.control.kind !== 'text') return
		const stepped = stepLength(target.value, isUp ? 1 : -1, event.shiftKey)
		if (stepped === undefined) return
		event.preventDefault()
		target.value = stepped
		clearRivals(entry.attribute.name)
		apply(entry.attribute.name, stepped)
	}

	controlsElement.addEventListener('change', handleChange)
	controlsElement.addEventListener('input', handleChange)
	controlsElement.addEventListener('keydown', handleKeyDown)
	controlsElement.querySelector('#reset-playground')?.addEventListener('click', onReset)
}
