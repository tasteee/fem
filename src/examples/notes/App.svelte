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

	// Lifts the screen above the phone keyboard where the
	// browser reports the keyboard height.
	$effect(() => {
		const viewport = window.visualViewport
		if (!viewport) return

		const handleViewportChange = () => {
			const keyboardInset = Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop)
			rootElement.style.setProperty('--keyboard-inset', `${keyboardInset}px`)
			// iOS draws its AutoFill pill just above the keyboard,
			// so keep the bar clear of it while the keyboard is up.
			rootElement.style.setProperty('--autofill-clearance', keyboardInset > 0 ? '48px' : '0px')
		}

		viewport.addEventListener('resize', handleViewportChange)
		return () => viewport.removeEventListener('resize', handleViewportChange)
	})
</script>

<NoteList />
<Editor />
