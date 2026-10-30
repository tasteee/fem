<script lang="ts">
	import { boardRows, pedalCode } from '../music/keys'
	import type { KeyInfoT } from '../music/layouts'
	import { blurActive, live, pressSource, releaseSource, setPedal } from '../player.svelte'

	type KeyboardPropsT = { keyMap: Map<string, KeyInfoT> }

	const props: KeyboardPropsT = $props()

	const isPressed = (code: string) => live.pressed.includes(`pointer:${code}`) || live.pressed.includes(code)
	const isGlowing = (code: string) => live.glowing.includes(code)

	const handlePointerDown = (event: PointerEvent, code: string) => {
		event.preventDefault()
		blurActive()
		;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
		if (code === pedalCode) return setPedal(true)
		pressSource(`pointer:${code}`, props.keyMap.get(code))
	}

	const handlePointerUp = (code: string) => {
		if (code === pedalCode) return setPedal(false)
		releaseSource(`pointer:${code}`)
	}

	const getLabel = (code: string, label: string, key: KeyInfoT | undefined) => {
		if (code === pedalCode) return 'Sustain'
		if (!key) return label
		return key.midi === undefined ? `${label}, no note` : `${label}, ${key.name}`
	}
</script>

<div class="keyboard" role="group" aria-label="Keyboard">
	{#each boardRows as row, rowIndex (rowIndex)}
		<div class="keyboard-row">
			{#each row as boardKey (boardKey.code)}
				{@const key = props.keyMap.get(boardKey.code)}
				{@const isPedal = boardKey.code === pedalCode}
				{@const isNoteKey = key !== undefined}
				{@const isSilent = isNoteKey && key.midi === undefined}
				<button
					type="button"
					tabindex="-1"
					class="keycap"
					class:isNote={isNoteKey}
					class:isMod={!isNoteKey && !isPedal}
					class:isPedal
					class:isSilent
					class:isRoot={isNoteKey && key.isRoot && !isSilent}
					class:isPressed={isPedal ? live.isPedalDown : isPressed(boardKey.code) || isGlowing(boardKey.code)}
					style:--span={boardKey.span}
					aria-label={getLabel(boardKey.code, boardKey.label, key)}
					aria-pressed={isPedal ? live.isPedalDown : undefined}
					aria-disabled={!isNoteKey && !isPedal ? 'true' : undefined}
					onpointerdown={isNoteKey || isPedal ? (event) => handlePointerDown(event, boardKey.code) : undefined}
					onpointerup={isNoteKey || isPedal ? () => handlePointerUp(boardKey.code) : undefined}
					onpointercancel={isNoteKey || isPedal ? () => handlePointerUp(boardKey.code) : undefined}
				>
					{#if isNoteKey}
						<span class="keycap-note">{isSilent ? '' : key.name}</span>
						<span class="keycap-label">{boardKey.label}</span>
					{:else}
						<span class="keycap-label keycap-center">{isPedal ? 'sustain · space' : boardKey.label}</span>
					{/if}
				</button>
			{/each}
		</div>
	{/each}
</div>
