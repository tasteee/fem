<script lang="ts">
	import { untrack } from 'svelte'
	import { showToast } from '../../show-toast'
	import { createEditor } from './notes-editor'
	import type { EditorT } from './notes-editor'
	import { store } from './notes-store.svelte'

	type ValueElementT = HTMLElement & { value: string }

	const weights = [
		['isRegular', 'Regular'],
		['isMedium', 'Medium'],
		['isSemibold', 'Semibold'],
		['isBold', 'Bold']
	]

	const colors = ['Red', 'Orange', 'Yellow', 'Green', 'Cyan', 'Blue', 'Purple', 'Pink']

	const textBlocks = [
		['title', 'Title'],
		['heading', 'Heading'],
		['subheading', 'Subheading'],
		['body', 'Body'],
		['small', 'Small']
	]

	const listBlocks = [
		['quote', 'quotes', 'Quote'],
		['bullets', 'list-bullets', 'Bullet list'],
		['numbers', 'list-numbers', 'Numbered list'],
		['checklist', 'list-checks', 'Checklist']
	]

	const calloutColors = ['Neutral', 'Red', 'Yellow', 'Green']

	const embeds = [
		['image', 'image', 'Image'],
		['audio', 'music-notes', 'Audio'],
		['video', 'video', 'Video']
	]

	const selectionTools = [
		['italic', 'Italic', 'text-italic'],
		['underline', 'Underline', 'text-underline'],
		['strikeThrough', 'Strikethrough', 'text-strikethrough']
	]

	let titleInput = $state<HTMLInputElement>()
	let bodyElement = $state<HTMLElement>()
	let linkInput = $state<ValueElementT>()
	let editor: EditorT | undefined

	$effect(() => {
		if (bodyElement) editor = createEditor(bodyElement)
	})

	// Loads the note into the editable fields when it changes.
	// The fields are the live copy while the note is open.
	$effect(() => {
		const note = store.currentNote
		if (!note || !titleInput || !bodyElement) return

		untrack(() => {
			editor?.forgetSelection()
			titleInput!.value = note.title
			bodyElement!.innerHTML = note.bodyHtml
		})
	})

	const closeNote = () => {
		if (!bodyElement) return
		const focusedElement = document.activeElement
		if (focusedElement instanceof HTMLElement) focusedElement.blur()
		store.closeNote(bodyElement.innerHTML, bodyElement.textContent ?? '')
	}

	const handleTitleInput = () => {
		const note = store.currentNote
		if (note && titleInput) note.title = titleInput.value
	}

	// A tap on the toolbar can collapse the text selection
	// before the click lands, mostly on phones. While a
	// press is in flight the bar ignores selection changes,
	// so the tapped button stays put and still has a
	// remembered selection to act on.
	const pressSettleMilliseconds = 400
	const pressState = { isPressingBar: false, settleTimer: 0 }

	const handleSelectionChange = () => {
		const isTypingLink = document.activeElement === linkInput
		if (isTypingLink || !editor) return
		if (pressState.isPressingBar) return
		const hasSelectedText = editor.rememberSelection()
		if (hasSelectedText === undefined) return
		store.setBarMode(hasSelectedText ? 'selection' : 'resting')
	}

	const endBarPress = () => {
		pressState.isPressingBar = false
	}

	// Also stops the press from moving focus out of the note.
	const handleBarPointerDown = (event: PointerEvent) => {
		const pressedElement = event.target as HTMLElement
		const isField = pressedElement.closest('fem-input') !== null
		if (isField) return
		event.preventDefault()
		window.clearTimeout(pressState.settleTimer)
		pressState.isPressingBar = true
	}

	const handleBarPointerEnd = () => {
		if (!pressState.isPressingBar) return
		window.clearTimeout(pressState.settleTimer)
		pressState.settleTimer = window.setTimeout(endBarPress, pressSettleMilliseconds)
	}

	const handleBodyClick = (event: MouseEvent) => {
		const checkBox = (event.target as HTMLElement).closest('.check-box')
		checkBox?.parentElement?.classList.toggle('isChecked')
	}

	const applyLink = () => {
		const linkAddress = linkInput?.value.trim() ?? ''
		if (linkAddress === '') return
		editor?.applyLink(linkAddress)
		if (linkInput) linkInput.value = ''
		store.barRow = 'none'
	}

	const applyBlockKind = (kindName: string) => {
		store.closeOverlays()
		editor?.applyBlockKind(kindName)
	}

	const insertEmbed = (embedName: string) => {
		store.closeOverlays()
		editor?.insertEmbed(embedName)
	}

	const duplicateNote = () => {
		const note = store.currentNote
		if (!note || !bodyElement) return
		const copy = store.createNote(`${note.title} copy`, bodyElement.innerHTML, [...note.tags])
		copy.preview = note.preview
		store.closeOverlays()
		showToast('Note duplicated')
	}

	const shareNote = () => {
		store.closeOverlays()
		showToast('Link copied')
	}

	const deleteNote = () => {
		store.deleteCurrentNote()
		showToast('Note deleted')
	}

	// Sheets and dialogs fire close on Escape and backdrop taps.
	const syncClose = (name: typeof store.overlay) => () => {
		if (store.overlay === name) store.closeOverlays()
	}
</script>

<svelte:document
	onselectionchange={handleSelectionChange}
	onpointerup={handleBarPointerEnd}
	onpointercancel={handleBarPointerEnd}
/>

<section class="screen isEditor">
	<div class="top-bar">
		<fem-button shape="circle" kind="ghost" label="Back to notes" onclick={closeNote}>
			<fem-icon name="caret-left"></fem-icon>
		</fem-button>
		<span class="spacer"></span>
		<fem-swap label="Pin note" on={store.currentNote?.isPinned ?? false} onclick={store.togglePin}>
			<fem-icon slot="off" name="push-pin"></fem-icon>
			<fem-icon slot="on" name="push-pin" kind="fill"></fem-icon>
		</fem-swap>
		<fem-button shape="circle" label="Note settings" onclick={() => store.openOverlay('settings-sheet')}>
			<fem-icon name="dots-three"></fem-icon>
		</fem-button>
	</div>

	<div class="screen-scroll">
		<input
			class="editor-title"
			bind:this={titleInput}
			oninput={handleTitleInput}
			autocomplete="off"
			autocorrect="off"
			placeholder="Title"
			aria-label="Note title"
		/>
		<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
		<div
			class="editor-body"
			bind:this={bodyElement}
			onclick={handleBodyClick}
			contenteditable="true"
			spellcheck="false"
			role="textbox"
			tabindex="0"
			aria-multiline="true"
			aria-label="Note body"
		></div>
	</div>

	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="editor-bar" onpointerdown={handleBarPointerDown}>
		<div class="bar-row isWeight" class:isOpen={store.barMode === 'selection' && store.barRow === 'weight'}>
			{#each weights as [markClass, label]}
				<fem-button size="small" kind="ghost" onclick={() => editor?.applyMark(markClass)}>
					<span class="weight-sample {markClass}">{label}</span>
				</fem-button>
			{/each}
		</div>

		<div class="bar-row isColor" class:isOpen={store.barMode === 'selection' && store.barRow === 'color'}>
			<button class="color-dot isClear" onclick={() => editor?.applyMark('isPlain')} aria-label="No color">
				<fem-icon name="x" size="small"></fem-icon>
			</button>
			{#each colors as color}
				<button
					class="color-dot is{color}"
					onclick={() => editor?.applyMark(`is${color}`)}
					aria-label={color}
				></button>
			{/each}
		</div>

		<div class="bar-row isLink" class:isOpen={store.barMode === 'selection' && store.barRow === 'link'}>
			<fem-input bind:this={linkInput} type="url" label="Link address" placeholder="Paste a link"></fem-input>
			<fem-button color="accent" onclick={applyLink}>Add</fem-button>
		</div>

		<div class="bar-row isResting" class:isOpen={store.barMode === 'resting'}>
			<fem-button shape="circle" kind="ghost" label="Text style" onclick={() => store.openOverlay('style-sheet')}>
				<fem-icon name="text-aa"></fem-icon>
			</fem-button>
			<fem-button shape="circle" kind="ghost" label="Insert" onclick={() => store.openOverlay('insert-sheet')}>
				<fem-icon name="plus"></fem-icon>
			</fem-button>
		</div>

		<div class="bar-row isSelection" class:isOpen={store.barMode === 'selection'}>
			<fem-button shape="circle" kind="ghost" label="Weight" onclick={() => store.toggleBarRow('weight')}>
				<fem-icon name="text-b"></fem-icon>
			</fem-button>
			{#each selectionTools as [command, label, icon]}
				<fem-button shape="circle" kind="ghost" {label} onclick={() => editor?.applyCommand(command)}>
					<fem-icon name={icon}></fem-icon>
				</fem-button>
			{/each}
			<fem-button shape="circle" kind="ghost" label="Color" onclick={() => store.toggleBarRow('color')}>
				<fem-icon name="palette"></fem-icon>
			</fem-button>
			<fem-button shape="circle" kind="ghost" label="Link" onclick={() => store.toggleBarRow('link')}>
				<fem-icon name="link"></fem-icon>
			</fem-button>
		</div>
	</div>
</section>

<fem-sheet heading="Text style" open={store.overlay === 'style-sheet'} onclose={syncClose('style-sheet')}>
	<div class="tile-row">
		{#each textBlocks as [kind, label]}
			<button class="style-tile" onclick={() => applyBlockKind(kind)} aria-label={label}>
				<span class="size-sample is{label}" aria-hidden="true">Aa</span>
			</button>
		{/each}
	</div>

	<div class="tile-row">
		{#each listBlocks as [kind, icon, label]}
			<button class="style-tile" onclick={() => applyBlockKind(kind)} aria-label={label}>
				<fem-icon name={icon}></fem-icon>
			</button>
		{/each}
	</div>

	<div class="tile-row">
		{#each calloutColors as color}
			<button class="style-tile" onclick={() => applyBlockKind(`callout${color}`)} aria-label="{color} callout">
				<span class="color-dot is{color}"></span>
			</button>
		{/each}
	</div>
</fem-sheet>

<fem-sheet heading="Insert" open={store.overlay === 'insert-sheet'} onclose={syncClose('insert-sheet')}>
	{#each embeds as [name, icon, label]}
		<fem-button wide onclick={() => insertEmbed(name)}><fem-icon name={icon}></fem-icon>{label}</fem-button>
	{/each}
</fem-sheet>

<fem-sheet heading="Note settings" open={store.overlay === 'settings-sheet'} onclose={syncClose('settings-sheet')}>
	<fem-button wide onclick={store.togglePin}>
		<fem-icon name="push-pin"></fem-icon>{store.currentNote?.isPinned ? 'Unpin note' : 'Pin note'}
	</fem-button>
	<fem-button wide onclick={duplicateNote}><fem-icon name="copy"></fem-icon>Duplicate</fem-button>
	<fem-button wide onclick={shareNote}><fem-icon name="share-fat"></fem-icon>Share</fem-button>
	<fem-button wide kind="soft" color="danger" onclick={() => store.openOverlay('delete-dialog')}>
		<fem-icon name="trash"></fem-icon>Delete note
	</fem-button>
</fem-sheet>

<fem-dialog heading="Delete this note?" open={store.overlay === 'delete-dialog'} onclose={syncClose('delete-dialog')}>
	You can't undo this. The note is removed for good.
	<fem-button slot="actions" onclick={store.closeOverlays}>Cancel</fem-button>
	<fem-button slot="actions" color="danger" onclick={deleteNote}>Delete note</fem-button>
</fem-dialog>
