import '../tokens.css'
import './docs.css'
import '../index'
import { showToast } from '../show-toast'

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
