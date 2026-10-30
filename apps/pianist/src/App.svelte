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
	const isRandom = $derived(settings.layout === 'random')
	const isChromatic = $derived(layout.isChromatic)
	const octaves = Array.from({ length: octaveRange.max - octaveRange.min + 1 }, (_, index) => octaveRange.min + index)
	const shouldOfferMidi = $derived(midiSupported && !live.hasMidiAccess)

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
	const handleLayout = (event: Event) => (settings.layout = readText(event))
	const handleVolume = (event: Event) => (settings.volume = readNumber(event) / 100)
	const handleOutput = (event: Event) => (settings.output = readText(event))
	const handleRowStep = (event: Event) => (settings.custom.rowStep = readNumber(event))
	const handleColStep = (event: Event) => (settings.custom.colStep = readNumber(event))
	const handleReroll = () => {
		settings.seed = rerollSeed()
		blurActive()
	}
	const handleConnect = () => {
		void connectMidi()
		blurActive()
	}
</script>

<main class="app-page" onchangecapture={handleChange}>
	<div class="page-head">
		<fem-heading level={1} size="title">pianist</fem-heading>
		<fem-text size="small" color="muted">Play with your computer keyboard. Hold Space to sustain.</fem-text>
	</div>

	<div class="board">
		<Keyboard {keyMap} />
	</div>

	<fem-card padding="4" gap="4">
		<div class="settings-grid">
			<fem-field label="Output">
				<fem-select value={settings.output} onchange={handleOutput}>
					<fem-option value="builtin">Built-in piano</fem-option>
					{#each live.ports as port (port.id)}
						<fem-option value={port.id}>{port.name}</fem-option>
					{/each}
				</fem-select>
			</fem-field>
			<fem-field label="Layout" help={layout.help}>
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
			<fem-field label="Scale" help={isChromatic ? 'Chromatic layouts ignore the scale.' : ''}>
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
		</div>

		{#if isCustom}
			<div class="settings-grid">
				<fem-field label="Key step" help="Degrees between neighbors in a row.">
					<fem-slider min={-4} max={4} show-value value={settings.custom.colStep} onchange={handleColStep}></fem-slider>
				</fem-field>
				<fem-field label="Row step" help="Degrees between rows.">
					<fem-slider
						min={stepRange.min}
						max={stepRange.max}
						show-value
						value={settings.custom.rowStep}
						onchange={handleRowStep}
					></fem-slider>
				</fem-field>
			</div>
		{/if}

		{#if isRandom}
			<fem-row gap="3" align-x="between">
				<fem-text size="small" color="muted">Seed <fem-text numeric size="small">{settings.seed}</fem-text></fem-text>
				<fem-button size="small" kind="soft" onclick={handleReroll}>Shuffle</fem-button>
			</fem-row>
		{/if}

		{#if shouldOfferMidi}
			<fem-row gap="3" align-x="between" wrap>
				<fem-text size="small" color="muted">Want to play a MIDI device?</fem-text>
				<fem-button size="small" kind="soft" onclick={handleConnect}>Find MIDI outputs</fem-button>
			</fem-row>
		{/if}
		{#if !midiSupported}
			<fem-banner color="info">This browser has no MIDI output. The built-in piano still works.</fem-banner>
		{/if}
		{#if live.midiMessage !== ''}
			<fem-banner color="warning">{live.midiMessage}</fem-banner>
		{/if}
	</fem-card>
</main>
