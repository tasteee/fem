<script lang="ts">
	import { findLayout, buildKeyMap } from './music/layouts'
	import { roots } from './music/notes'
	import { scales } from './music/scales'
	import { layouts } from './music/layouts'
	import { octaveRange, rerollSeed, stepRange } from './settings'
	import Keyboard from './parts/Keyboard.svelte'
	import {
		applyOutput,
		applySettings,
		blurActive,
		connectMidi,
		live,
		midiSupported,
		settings,
		setKeyMap,
		startPlayer
	} from './player.svelte'

	const keyMap = $derived(
		buildKeyMap({
			root: settings.root,
			scale: settings.scale,
			octave: settings.octave,
			layout: settings.layout,
			seed: settings.seed,
			custom: settings.custom
		})
	)

	const layout = $derived(findLayout(settings.layout))
	const isCustom = $derived(settings.layout === 'custom')
	const isChromatic = $derived(layout.isChromatic)
	const octaves = Array.from({ length: octaveRange.max - octaveRange.min + 1 }, (_, index) => octaveRange.min + index)
	const shouldOfferMidi = $derived(midiSupported && !live.hasMidiAccess)
	const connectValue = '__connect'

	// New mappings apply on the next press. Held keys
	// keep the note they started.
	$effect(() => setKeyMap(keyMap))
	$effect(() => startPlayer())
	$effect(() => {
		settings.output
		applyOutput()
	})
	$effect(() => {
		$state.snapshot(settings)
		applySettings()
	})

	// Every change hands focus back to the page.
	const handleChange = () => setTimeout(blurActive, 0)

	const readText = (event: Event) => (event.currentTarget as HTMLInputElement).value
	const readNumber = (event: Event) => Number(readText(event))

	const handleRoot = (event: Event) => (settings.root = readText(event))
	const handleScale = (event: Event) => (settings.scale = readText(event))
	const handleOctave = (event: Event) => (settings.octave = readNumber(event))
	// Picking Random deals a fresh map each time.
	const handleLayout = (event: Event) => {
		const next = readText(event)
		if (next === 'random') settings.seed = rerollSeed()
		settings.layout = next
	}
	const handleVolume = (event: Event) => (settings.volume = readNumber(event) / 100)
	// The last option asks the browser for MIDI. The choice
	// itself does not change until a port is picked.
	const handleOutput = (event: Event) => {
		const select = event.currentTarget as HTMLInputElement
		if (select.value !== connectValue) return (settings.output = select.value)
		select.value = settings.output
		void connectMidi()
	}
	const handleRowStep = (event: Event) => (settings.custom.rowStep = readNumber(event))
	const handleColStep = (event: Event) => (settings.custom.colStep = readNumber(event))
</script>

<main class="app-page" onchangecapture={handleChange}>
	<div class="page-head">
		<fem-heading level={1} size="title">pianist</fem-heading>
		{#if live.isPianoLoading}
			<fem-row gap="2">
				<fem-spinner size="small"></fem-spinner>
				<fem-text size="small" color="muted">Loading the piano…</fem-text>
			</fem-row>
		{:else if live.midiMessage !== ''}
			<fem-text size="small" color="danger">{live.midiMessage}</fem-text>
		{:else}
			<fem-text size="small" color="muted">Play with your computer keyboard. Hold Space to sustain.</fem-text>
		{/if}
	</div>

	<div class="board">
		<Keyboard {keyMap} />
	</div>

	<fem-card padding="4">
		<div class="settings-grid">
			<fem-field label="Output">
				<fem-select value={settings.output} onchange={handleOutput}>
					<fem-option value="builtin">Built-in piano</fem-option>
					{#each live.ports as port (port.id)}
						<fem-option value={port.id}>{port.name}</fem-option>
					{/each}
					{#if shouldOfferMidi}
						<fem-option value={connectValue}>Find MIDI outputs…</fem-option>
					{/if}
				</fem-select>
			</fem-field>
			<fem-field class="layout" label="Layout">
				<fem-select value={settings.layout} onchange={handleLayout}>
					{#each layouts as item (item.id)}
						<fem-option value={item.id}>{item.label}</fem-option>
					{/each}
				</fem-select>
			</fem-field>
			<fem-field label="Key">
				<fem-select value={settings.root} onchange={handleRoot}>
					{#each roots as root (root.id)}
						<fem-option value={root.id}>{root.label}</fem-option>
					{/each}
				</fem-select>
			</fem-field>
			<fem-field label="Scale">
				<fem-select value={settings.scale} disabled={isChromatic} onchange={handleScale}>
					{#each scales as scale (scale.id)}
						<fem-option value={scale.id}>{scale.label}</fem-option>
					{/each}
				</fem-select>
			</fem-field>
			<fem-field class="wide" label="Octave">
				<fem-segmented value={String(settings.octave)} onchange={handleOctave}>
					{#each octaves as octave (octave)}
						<fem-segment value={String(octave)}>{octave}</fem-segment>
					{/each}
				</fem-segmented>
			</fem-field>
			<fem-field class="narrow" label="Volume">
				<fem-slider min={0} max={100} value={Math.round(settings.volume * 100)} onchange={handleVolume}></fem-slider>
			</fem-field>
			{#if isCustom}
				<fem-field label="Key step">
					<fem-slider min={-4} max={4} show-value value={settings.custom.colStep} onchange={handleColStep}></fem-slider>
				</fem-field>
				<fem-field label="Row step">
					<fem-slider
						min={stepRange.min}
						max={stepRange.max}
						show-value
						value={settings.custom.rowStep}
						onchange={handleRowStep}
					></fem-slider>
				</fem-field>
			{/if}
		</div>
	</fem-card>
</main>
