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
