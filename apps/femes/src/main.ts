import '@tasteee/fem/tokens.css'
import '@tasteee/fem-media/tokens.css'
import './app.css'
import '@tasteee/fem-media'
import { mount } from 'svelte'
import App from './App.svelte'
import { startPlayReports } from './data/report-plays'
import { registerFemesIcons } from './register-icons'
import { startRouter } from './routing/router.svelte'

registerFemesIcons()
startRouter()
startPlayReports()

// Compact everywhere, phones included. femes pages are
// light enough that compact controls stay easy to tap.
document.documentElement.setAttribute('density', 'compact')

const target = document.getElementById('app')
if (!target) throw new Error('Missing element: #app')

mount(App, { target })
