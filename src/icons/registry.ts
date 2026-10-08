import type { IconT } from './icon-type'

type RegistryListenerT = () => void

const registeredIcons = new Map<string, IconT>()
const listeners = new Set<RegistryListenerT>()

// Makes icons available to <fem-icon name="...">.
// An app registers only the icons it uses, so the
// rest of the set never reaches the browser.
export const registerIcons = (icons: IconT[]) => {
	for (const icon of icons) registeredIcons.set(icon.name, icon)
	for (const listener of listeners) listener()
}

export const getIcon = (iconName: string): IconT | undefined => registeredIcons.get(iconName)

// Lets a rendered icon redraw when its icon is
// registered after it was first shown.
export const subscribeToIcons = (listener: RegistryListenerT) => {
	listeners.add(listener)
	const unsubscribe = () => listeners.delete(listener)
	return unsubscribe
}
