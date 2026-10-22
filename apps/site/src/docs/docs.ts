import '@tasteee/fem/tokens.css'
import '@tasteee/fem-media/tokens.css'
import './docs.css'
import '@tasteee/fem'
import '@tasteee/fem-media'
import { showToast } from '@tasteee/fem'
import * as icons from '@tasteee/fem/icons'
import { registerIcons } from '@tasteee/fem'

// The docs page shows a sample of the set. A real
// app would import and register only what it uses.
const docsIcons = [
	icons.heartIcon,
	icons.playIcon,
	icons.pauseIcon,
	icons.plusIcon,
	icons.xIcon,
	icons.checkIcon,
	icons.magnifyingGlassIcon,
	icons.gearSixIcon,
	icons.lightningIcon,
	icons.pencilSimpleIcon,
	icons.trashIcon,
	icons.shareFatIcon,
	icons.chatCircleIcon,
	icons.musicNotesIcon,
	icons.houseIcon,
	icons.pushPinIcon,
	icons.dotsThreeIcon,
	icons.imageIcon,
	icons.noteIcon,
	icons.lightbulbIcon,
	icons.userIcon,
	icons.dotsSixVerticalIcon,
	icons.skipBackIcon,
	icons.skipForwardIcon,
	icons.queueIcon,
	icons.speakerHighIcon,
	icons.shuffleIcon,
	icons.repeatIcon
]

registerIcons(docsIcons)

const rootElement = document.documentElement

const applySetting = (settingName: string, settingValue: string) => {
	rootElement.setAttribute(settingName, settingValue)
}

// An empty value removes the override, so the
// accent falls back to its neutral default.
const applyAccent = (accentValue: string) => {
	const isDefault = accentValue === ''
	if (isDefault) return rootElement.style.removeProperty('--accent')
	rootElement.style.setProperty('--accent', accentValue)
}

type OverlayElementT = HTMLElement & { open: boolean }

const setOverlayOpen = (overlayId: string, isOpen: boolean) => {
	const overlayElement = document.getElementById(overlayId) as OverlayElementT | null
	if (overlayElement) overlayElement.open = isOpen
}

const handleClick = (event: MouseEvent) => {
	const clickedElement = event.target as HTMLElement
	const selector = '[data-setting], [data-accent], [data-toast], [data-opens], [data-closes]'
	const controlElement = clickedElement.closest<HTMLElement>(selector)
	if (!controlElement) return
	const data = controlElement.dataset
	if (data.toast !== undefined) return showToast(data.toast)
	if (data.opens !== undefined) return setOverlayOpen(data.opens, true)
	if (data.closes !== undefined) return setOverlayOpen(data.closes, false)
	if (data.accent !== undefined) return applyAccent(data.accent)
	const hasSetting = data.setting !== undefined && data.value !== undefined
	if (hasSetting) applySetting(data.setting ?? '', data.value ?? '')
}

document.addEventListener('click', handleClick)

// Shows what the demo form would send, in place of
// sending it anywhere.
const formElement = document.querySelector<HTMLFormElement>('#demo-form')
const formOutput = document.querySelector<HTMLElement>('#demo-form-output')

const buildEntryText = (entry: [string, FormDataEntryValue]): string => `${entry[0]}=${entry[1]}`

const handleSubmit = (event: SubmitEvent) => {
	event.preventDefault()
	if (!formElement || !formOutput) return
	const formData = new FormData(formElement)
	const entryTexts = [...formData.entries()].map(buildEntryText)
	formOutput.textContent = entryTexts.join('  ')
}

if (formElement) formElement.addEventListener('submit', handleSubmit)

// Removable tags in the docs disappear when removed.
const handleTagRemove = (event: Event) => {
	const removedTag = event.target as HTMLElement
	const isTag = removedTag.localName === 'fem-tag'
	if (isTag) removedTag.remove()
}

document.addEventListener('remove', handleTagRemove)

type CollapsibleElementT = HTMLElement & { collapsed: boolean }

// The collapsible nav demo flips on a button press.
const handleCollapseToggle = (event: MouseEvent) => {
	const clickedElement = event.target as HTMLElement
	const toggleButton = clickedElement.closest<HTMLElement>('[data-toggle-collapsed]')
	if (!toggleButton) return
	const targetId = toggleButton.dataset.toggleCollapsed ?? ''
	const targetElement = document.getElementById(targetId) as CollapsibleElementT | null
	if (targetElement) targetElement.collapsed = !targetElement.collapsed
}

document.addEventListener('click', handleCollapseToggle)
