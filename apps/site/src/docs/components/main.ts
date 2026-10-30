import '../docs'
import './components.css'
import coreManifest from '@tasteee/fem/custom-elements.json'
import mediaManifest from '@tasteee/fem-media/custom-elements.json'
import { showToast } from '@tasteee/fem'
import { examplesByTag, groupOrder, parentByChildTag } from './examples'

// One page per component, read from the generated
// manifest, so the docs can't drift from the code.

type ManifestAttributeT = {
	name: string
	type?: { text: string }
	default?: string
	description?: string
}

type ManifestDeclarationT = {
	name: string
	tagName: string
	description: string
	attributes: ManifestAttributeT[]
	events: { name: string }[]
	slots: { name: string; description?: string }[]
}

type ComponentEntryT = {
	tagName: string
	title: string
	description: string
	group: string
	parentTag: string | undefined
	declaration: ManifestDeclarationT
}

type TableElementT = HTMLElement & { columns: unknown[]; rows: unknown[] }
type ValueElementT = HTMLElement & { value: string }

const contentElement = document.getElementById('site-content') as HTMLElement
const navContainer = document.getElementById('site-nav') as HTMLElement
const jumpContainer = document.getElementById('site-jump') as HTMLElement

// ---------- data ----------

const buildTitle = (tagName: string): string => {
	const words = tagName.replace(/^fem-/, '').split('-')
	const sentence = words.join(' ')
	return sentence.charAt(0).toUpperCase() + sentence.slice(1)
}

const getGroup = (tagName: string, parentTag: string | undefined): string => {
	const ownExample = examplesByTag[tagName]
	if (ownExample) return ownExample.group
	const parentExample = parentTag ? examplesByTag[parentTag] : undefined
	if (parentExample) return parentExample.group
	return 'Other'
}

const buildEntries = (): ComponentEntryT[] => {
	const modules: { declarations: unknown[] }[] = [...coreManifest.modules, ...mediaManifest.modules]
	const declarations = modules.flatMap((module) => module.declarations) as ManifestDeclarationT[]
	return declarations.map((declaration) => {
		const parentTag = parentByChildTag[declaration.tagName]
		return {
			tagName: declaration.tagName,
			title: buildTitle(declaration.tagName),
			description: declaration.description,
			group: getGroup(declaration.tagName, parentTag),
			parentTag,
			declaration
		}
	})
}

const entries = buildEntries()
const entryByTag = new Map(entries.map((entry) => [entry.tagName, entry]))
const topLevelEntries = entries.filter((entry) => !entry.parentTag)

const getEntriesInGroup = (group: string): ComponentEntryT[] => {
	return topLevelEntries.filter((entry) => entry.group === group)
}

const getChildEntries = (parentTag: string): ComponentEntryT[] => {
	return entries.filter((entry) => entry.parentTag === parentTag)
}

// ---------- html helpers ----------

const escapeHtml = (text: string): string => {
	return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

const buildLink = (entry: ComponentEntryT): string => {
	return `<a class="site-link" href="#${entry.tagName}">${entry.title}</a>`
}

// ---------- sidebar and jump ----------

const buildNavItems = (): string => {
	const groupBlocks = groupOrder.map((group) => {
		const groupEntries = getEntriesInGroup(group)
		const items = groupEntries.map((entry) => `<fem-nav-item value="${entry.tagName}">${entry.title}</fem-nav-item>`)
		return `<span class="site-nav-group">${group}</span>${items.join('')}`
	})
	return groupBlocks.join('')
}

const renderNavigation = () => {
	navContainer.innerHTML = `<fem-nav label="Components" id="component-nav">${buildNavItems()}</fem-nav>`
	const options = entries.map((entry) => `<fem-option value="${entry.tagName}">${entry.title}</fem-option>`)
	jumpContainer.innerHTML = `<fem-combobox placeholder="Find a component" label="Find a component" id="component-jump">${options.join('')}</fem-combobox>`
}

const goToTag = (tagName: string) => {
	const isSameHash = location.hash === `#${tagName}`
	if (isSameHash) return
	location.hash = tagName
}

const handleNavChange = (event: Event) => {
	const changedElement = event.target as ValueElementT
	const isNav = changedElement.id === 'component-nav' || changedElement.id === 'component-jump'
	if (!isNav) return
	goToTag(changedElement.value)
}

// ---------- pages ----------

const renderOverview = () => {
	const groupCards = groupOrder.map((group) => {
		const links = getEntriesInGroup(group).map(buildLink).join('')
		return `<fem-card padding="5" gap="3">
			<fem-heading level="4">${group}</fem-heading>
			<div class="site-link-list">${links}</div>
		</fem-card>`
	})

	contentElement.innerHTML = `
		<fem-column gap="2">
			<fem-heading level="1">Components</fem-heading>
			<fem-text color="muted">Every fem component, with a live example, its code, and its full API. Pick one from the list.</fem-text>
		</fem-column>
		<fem-grid min="240px" gap="3">${groupCards.join('')}</fem-grid>`
}

const buildAttributeRows = (declaration: ManifestDeclarationT) => {
	return declaration.attributes.map((attribute) => ({
		name: attribute.name,
		type: attribute.type?.text ?? '',
		default: attribute.default ?? '',
		description: attribute.description ?? ''
	}))
}

const attributeColumns = [
	{ key: 'name', label: 'Attribute', numeric: true },
	{ key: 'type', label: 'Values', numeric: true },
	{ key: 'default', label: 'Default', numeric: true },
	{ key: 'description', label: 'Notes' }
]

const buildEventsSection = (declaration: ManifestDeclarationT): string => {
	const hasEvents = declaration.events.length > 0
	if (!hasEvents) return ''
	const eventTags = declaration.events.map((event) => `<fem-tag>${event.name}</fem-tag>`).join('')
	return `<fem-column gap="2">
		<fem-heading level="4">Events</fem-heading>
		<fem-row gap="2" wrap>${eventTags}</fem-row>
	</fem-column>`
}

const buildSlotsSection = (declaration: ManifestDeclarationT): string => {
	const hasSlots = declaration.slots.length > 0
	if (!hasSlots) return ''
	const slotTags = declaration.slots.map((slot) => {
		const slotLabel = slot.name === '' ? 'default' : slot.name
		return `<fem-tag>${slotLabel}</fem-tag>`
	})
	return `<fem-column gap="2">
		<fem-heading level="4">Slots</fem-heading>
		<fem-row gap="2" wrap>${slotTags.join('')}</fem-row>
	</fem-column>`
}

const buildRelatedSection = (entry: ComponentEntryT): string => {
	const childEntries = getChildEntries(entry.tagName)
	const hasChildren = childEntries.length > 0
	if (hasChildren) {
		return `<fem-text size="small" color="muted">Parts: ${childEntries.map(buildLink).join(', ')}</fem-text>`
	}
	const parentEntry = entry.parentTag ? entryByTag.get(entry.parentTag) : undefined
	if (!parentEntry) return ''
	return `<fem-text size="small" color="muted">Used inside ${buildLink(parentEntry)}.</fem-text>`
}

const renderComponent = (entry: ComponentEntryT) => {
	const exampleTag = entry.parentTag ?? entry.tagName
	const example = examplesByTag[exampleTag]
	const exampleHtml = example ? example.html : `<${entry.tagName}></${entry.tagName}>`
	const hasAttributes = entry.declaration.attributes.length > 0

	const attributesSection = hasAttributes
		? `<fem-column gap="2">
			<fem-heading level="4">Attributes</fem-heading>
			<fem-table label="${entry.title} attributes" id="attribute-table"></fem-table>
		</fem-column>`
		: ''

	contentElement.innerHTML = `
		<fem-breadcrumbs>
			<fem-breadcrumb href="#">Components</fem-breadcrumb>
			<fem-breadcrumb>${entry.group}</fem-breadcrumb>
			<fem-breadcrumb>${entry.title}</fem-breadcrumb>
		</fem-breadcrumbs>

		<fem-column gap="2">
			<fem-row gap="3" wrap>
				<fem-heading level="1">${entry.title}</fem-heading>
				<fem-tag>&lt;${entry.tagName}&gt;</fem-tag>
			</fem-row>
			<fem-text color="muted">${entry.description}</fem-text>
			${buildRelatedSection(entry)}
		</fem-column>

		<div class="site-example">
			<div class="site-preview">${exampleHtml}</div>
			<div class="site-code">
				<div class="site-code-bar">
					<fem-text size="small" color="muted">HTML</fem-text>
					<fem-button size="small" kind="ghost" id="copy-code">Copy</fem-button>
				</div>
				<pre><code>${escapeHtml(exampleHtml)}</code></pre>
			</div>
		</div>

		${attributesSection}
		${buildEventsSection(entry.declaration)}
		${buildSlotsSection(entry.declaration)}`

	const attributeTable = document.getElementById('attribute-table') as TableElementT | null
	if (attributeTable) {
		attributeTable.columns = attributeColumns
		attributeTable.rows = buildAttributeRows(entry.declaration)
	}

	const copyButton = document.getElementById('copy-code')
	copyButton?.addEventListener('click', () => copyCode(exampleHtml))
}

const copyCode = async (codeText: string) => {
	try {
		await navigator.clipboard.writeText(codeText)
		showToast('Copied')
	} catch (problem) {
		showToast('Copy is blocked here. Select the code instead.')
	}
}

// ---------- routing ----------

const syncNavValue = (tagName: string) => {
	const nav = document.getElementById('component-nav') as ValueElementT | null
	const entry = entryByTag.get(tagName)
	const navTag = entry?.parentTag ?? tagName
	if (nav) nav.value = navTag
}

const renderRoute = () => {
	const tagName = decodeURIComponent(location.hash.slice(1))
	const entry = entryByTag.get(tagName)
	syncNavValue(tagName)
	window.scrollTo({ top: 0 })
	if (!entry) return renderOverview()
	renderComponent(entry)
	document.title = `${entry.title} · fem`
}

// ---------- settings ----------

const readSetting = (key: string): string | null => {
	try {
		return localStorage.getItem(key)
	} catch (problem) {
		return null
	}
}

const writeSetting = (key: string, value: string) => {
	try {
		localStorage.setItem(key, value)
	} catch (problem) {
		// Storage can be blocked. The setting still applies.
	}
}

const applyTheme = (themeValue: string) => {
	const isSystem = themeValue === 'system'
	if (isSystem) return document.documentElement.removeAttribute('theme')
	document.documentElement.setAttribute('theme', themeValue)
}

const applyDensity = (densityValue: string) => {
	document.documentElement.setAttribute('density', densityValue)
}

const handleSettingChange = (event: Event) => {
	const changedElement = event.target as ValueElementT
	const isTheme = changedElement.id === 'theme-setting'
	if (isTheme) {
		applyTheme(changedElement.value)
		writeSetting('fem-docs-theme', changedElement.value)
		return
	}
	const isDensity = changedElement.id === 'density-setting'
	if (!isDensity) return
	applyDensity(changedElement.value)
	writeSetting('fem-docs-density', changedElement.value)
}

const restoreSettings = () => {
	const savedTheme = readSetting('fem-docs-theme') ?? 'system'
	const savedDensity = readSetting('fem-docs-density') ?? 'compact'
	applyTheme(savedTheme)
	applyDensity(savedDensity)
	const themeControl = document.getElementById('theme-setting') as ValueElementT | null
	const densityControl = document.getElementById('density-setting') as ValueElementT | null
	if (themeControl) themeControl.value = savedTheme
	if (densityControl) densityControl.value = savedDensity
}

// ---------- start ----------

renderNavigation()
restoreSettings()
renderRoute()
window.addEventListener('hashchange', renderRoute)
document.addEventListener('change', handleNavChange)
document.addEventListener('change', handleSettingChange)
