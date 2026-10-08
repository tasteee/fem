<script lang="ts">
	import Editor from './Editor.svelte'
	import NoteList from './NoteList.svelte'
	import { store } from './notes-store.svelte'

	const rootElement = document.documentElement

	// The stylesheet reads these off the root element.
	$effect(() => {
		rootElement.setAttribute('theme', store.theme)
		rootElement.setAttribute('screen', store.screen)
	})

	const keyboardMinimumHeight = 120

	// Phones lay the page out behind the keyboard, so the
	// screen is pinned to the visible area instead. The
	// keyboard also covers the home bar, so the bar drops
	// its safe area gap while the keyboard is open.
	$effect(() => {
		const viewport = window.visualViewport
		if (!viewport) return

		const handleViewportChange = () => {
			const hiddenHeight = window.innerHeight - viewport.height
			const isKeyboardOpen = hiddenHeight > keyboardMinimumHeight
			const keyboardState = isKeyboardOpen ? 'open' : 'closed'
			rootElement.style.setProperty('--viewport-top', `${viewport.offsetTop}px`)
			rootElement.style.setProperty('--viewport-height', `${viewport.height}px`)
			rootElement.setAttribute('keyboard', keyboardState)
		}

		const stopWatching = () => {
			viewport.removeEventListener('resize', handleViewportChange)
			viewport.removeEventListener('scroll', handleViewportChange)
		}

		viewport.addEventListener('resize', handleViewportChange)
		viewport.addEventListener('scroll', handleViewportChange)
		handleViewportChange()
		return stopWatching
	})
</script>

<NoteList />
<Editor />
