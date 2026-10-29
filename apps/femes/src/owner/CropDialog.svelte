<script lang="ts">
	import type { CropRectT, ImageCropShapeT } from '@tasteee/fem'
	import { cropImage } from '@tasteee/fem/foundation'

	type CropDialogPropsT = {
		file: File | undefined
		heading: string
		aspect: number
		shape: ImageCropShapeT
		outputWidth: number
		onDone: (cropped: File) => void
		onClose: () => void
	}

	// Frames a picked image before it uploads. Only the
	// cropped part leaves the browser.
	const props: CropDialogPropsT = $props()
	let sourceUrl = $state('')
	let latestCrop: CropRectT | undefined
	let isSaving = $state(false)
	let failure = $state('')

	// Each new file gets its own address, released once
	// it's no longer shown.
	$effect(() => {
		const file = props.file
		if (!file) return
		const objectUrl = URL.createObjectURL(file)
		sourceUrl = objectUrl
		latestCrop = undefined
		failure = ''
		return () => URL.revokeObjectURL(objectUrl)
	})

	const isOpen = $derived(props.file !== undefined)
	const hasFailure = $derived(failure !== '')

	const handleCropChange = (event: Event) => {
		latestCrop = (event as CustomEvent<CropRectT>).detail
	}

	const buildCroppedName = (fileName: string): string => {
		const baseName = fileName.replace(/\.[^.]+$/, '')
		return `${baseName}.jpg`
	}

	const handleSave = async () => {
		const file = props.file
		const crop = latestCrop
		if (!file || !crop) return
		isSaving = true
		failure = ''

		try {
			const blob = await cropImage({ src: sourceUrl, crop, width: props.outputWidth })
			const cropped = new File([blob], buildCroppedName(file.name), { type: 'image/jpeg' })
			props.onDone(cropped)
		} catch (cropError) {
			console.error('femes: crop failed', cropError)
			failure = "Couldn't crop this image. Try another file."
		} finally {
			isSaving = false
		}
	}
</script>

<fem-dialog class="studio-dialog isWide" open={isOpen} heading={props.heading} onclose={props.onClose}>
	<fem-column gap="3">
		<fem-image-crop src={sourceUrl} aspect={props.aspect} shape={props.shape} label={props.heading} onchange={handleCropChange}></fem-image-crop>
		<fem-text size="small" color="muted">Drag to move. Pinch, scroll, or use the slider to zoom.</fem-text>
		{#if hasFailure}
			<fem-text size="small" color="danger">{failure}</fem-text>
		{/if}
	</fem-column>
	<fem-button slot="actions" kind="soft" onclick={props.onClose}>Cancel</fem-button>
	<fem-button slot="actions" loading={isSaving} onclick={handleSave}>Use this</fem-button>
</fem-dialog>
