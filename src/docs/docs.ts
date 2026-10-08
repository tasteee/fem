import '../tokens.css'
import './docs.css'
import '../index'

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

const handleClick = (event: MouseEvent) => {
	const clickedElement = event.target as HTMLElement
	const controlElement = clickedElement.closest<HTMLElement>('[data-setting], [data-accent]')
	if (!controlElement) return
	const data = controlElement.dataset
	const isAccentControl = data.accent !== undefined
	if (isAccentControl) return applyAccent(data.accent ?? '')
	const hasSetting = data.setting !== undefined && data.value !== undefined
	if (hasSetting) applySetting(data.setting ?? '', data.value ?? '')
}

document.addEventListener('click', handleClick)
