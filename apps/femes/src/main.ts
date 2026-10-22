import '@tasteee/fem/tokens.css'
import '@tasteee/fem-media/tokens.css'
import './app.css'
import '@tasteee/fem-media'
import { mount } from 'svelte'
import App from './App.svelte'
import { registerFemesIcons } from './register-icons'
import { startRouter } from './routing/router.svelte'

registerFemesIcons()
startRouter()

// Touch screens get roomy controls. A mouse gets compact.
const touchQuery = window.matchMedia('(pointer: coarse)')

const applyDensity = () => {
	const density = touchQuery.matches ? 'roomy' : 'compact'
	document.documentElement.setAttribute('density', density)
}

touchQuery.addEventListener('change', applyDensity)
applyDensity()

const target = document.getElementById('app')
if (!target) throw new Error('Missing element: #app')

mount(App, { target })
