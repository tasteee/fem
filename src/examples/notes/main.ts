import '../../tokens.css'
import './notes.css'
import '../../index'
import { mount } from 'svelte'
import App from './App.svelte'
import './register-icons'

const target = document.getElementById('app')
if (!target) throw new Error('Missing element: #app')

mount(App, { target })
