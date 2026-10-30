import '@tasteee/fem/tokens.css'
import './app.css'
import '@tasteee/fem'
import { mount } from 'svelte'
import App from './App.svelte'

const target = document.getElementById('app')
if (!target) throw new Error('Missing element: #app')

mount(App, { target })
