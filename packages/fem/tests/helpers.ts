import '../src/index'
import '../src/tokens.css'
import '../../fem-media/src/tokens.css'
import '../../fem-media/src/index'

// Mounts markup and returns the first element.
export const mount = <T extends HTMLElement>(html: string): T => {
	const wrapper = document.createElement('div')
	wrapper.innerHTML = html
	document.body.append(wrapper)
	return wrapper.firstElementChild as T
}

export const settle = () => new Promise((resolve) => setTimeout(resolve, 30))

export const cleanup = () => {
	document.body.innerHTML = ''
}

// Finds an element inside a component's shadow root.
export const inShadow = <T extends HTMLElement>(host: Element, selector: string): T => {
	return host.shadowRoot!.querySelector(selector) as T
}

// The element that really has focus, looking through
// shadow roots.
export const getDeepActiveElement = (): Element | null => {
	let active = document.activeElement
	while (active?.shadowRoot?.activeElement) active = active.shadowRoot.activeElement
	return active
}

// True when `node` is inside `container`, crossing shadow
// roots, which `contains` can't do.
export const isInsideComposed = (container: Element, node: Node | null): boolean => {
	let current: Node | null = node
	while (current) {
		if (current === container) return true
		current = current.parentNode ?? (current as ShadowRoot).host ?? null
	}
	return false
}

// The text of the component that owns the focused element.
export const getFocusedHostText = (): string => {
	const active = getDeepActiveElement()
	const owner = (active?.getRootNode() as ShadowRoot | undefined)?.host ?? active
	return owner?.textContent?.trim() ?? ''
}
