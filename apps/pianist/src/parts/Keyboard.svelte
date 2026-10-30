<script lang="ts">
	import { keyRows, rowOffsets } from '../music/keys'
	import type { KeyInfoT } from '../music/layouts'
	import { blurActive, live, pressSource, releaseSource, setPedal } from '../player.svelte'

	type KeyboardPropsT = { keyMap: Map<string, KeyInfoT> }

	const props: KeyboardPropsT = $props()

	// Top row first, like the real keyboard.
	const rowsTopFirst = keyRows.map((row, index) => ({ row, index })).reverse()

	const isPressed = (code: string) => live.pressed.includes(code) || live.pressed.includes(`pointer:${code}`)

	const handlePointerDown = (event: PointerEvent, code: string) => {
		event.preventDefault()
		blurActive()
		const element = event.currentTarget as HTMLElement
		element.setPointerCapture(event.pointerId)
		pressSource(`pointer:${code}`, props.keyMap.get(code))
	}

	const handlePointerUp = (code: string) => releaseSource(`pointer:${code}`)

	const handlePedalDown = (event: PointerEvent) => {
		event.preventDefault()
		blurActive()
		;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
		setPedal(true)
	}

	const handlePedalUp = () => setPedal(false)
</script>

<div class="keyboard" role="group" aria-label="Keyboard">
	{#each rowsTopFirst as { row, index } (index)}
		<div class="keyboard-row" style:--row-offset={rowOffsets[index]}>
			{#each row as keyCap (keyCap.code)}
				{@const key = props.keyMap.get(keyCap.code)}
				{@const isSilent = key?.midi === undefined}
				<button
					type="button"
					tabindex="-1"
					class="keycap"
					class:isSilent
					class:isRoot={key?.isRoot && !isSilent}
					class:isPressed={isPressed(keyCap.code)}
					aria-label={isSilent ? `${keyCap.label}, no note` : `${keyCap.label}, ${key?.name}`}
					onpointerdown={(event) => handlePointerDown(event, keyCap.code)}
					onpointerup={() => handlePointerUp(keyCap.code)}
					onpointercancel={() => handlePointerUp(keyCap.code)}
				>
					<span class="keycap-note">{isSilent ? '' : key?.name}</span>
					<span class="keycap-label">{keyCap.label}</span>
				</button>
			{/each}
		</div>
	{/each}
	<button
		type="button"
		tabindex="-1"
		class="keycap pedal"
		class:isPressed={live.isPedalDown}
		aria-label="Sustain pedal, Space"
		aria-pressed={live.isPedalDown}
		onpointerdown={handlePedalDown}
		onpointerup={handlePedalUp}
		onpointercancel={handlePedalUp}
	>
		<span class="keycap-label">Sustain · Space</span>
	</button>
</div>
