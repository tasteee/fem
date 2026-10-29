<script lang="ts">
	// Lets the user pick which part of a picture to keep.
	// Drag to move, slide to zoom. Gives back a cropped file.

	type ImageCropDialogPropsT = {
		open: boolean
		file: File | undefined
		ratio: number
		outputWidth: number
		heading: string
		onConfirm: (file: File) => void
		onCancel: () => void
	}

	const props: ImageCropDialogPropsT = $props()
	const maxZoom = 4

	let frameWidth = $state(0)
	let naturalWidth = $state(0)
	let naturalHeight = $state(0)
	let zoom = $state(1)
	let offsetX = $state(0)
	let offsetY = $state(0)
	let imageUrl = $state('')
	let imageElement = $state<HTMLImageElement | undefined>(undefined)
	let dragStart: { pointerX: number; pointerY: number; offsetX: number; offsetY: number } | undefined
	let isSaving = $state(false)

	const frameHeight = $derived(frameWidth / props.ratio)
	const baseScale = $derived(naturalWidth > 0 ? Math.max(frameWidth / naturalWidth, frameHeight / naturalHeight) : 1)
	const scale = $derived(baseScale * zoom)
	const hasImage = $derived(naturalWidth > 0 && frameWidth > 0)

	// The picture always covers the whole frame.
	const clamp = (value: number, shown: number, frame: number): number => {
		const lowest = Math.min(0, frame - shown)
		return Math.min(0, Math.max(lowest, value))
	}

	const placeImage = (nextX: number, nextY: number) => {
		offsetX = clamp(nextX, naturalWidth * scale, frameWidth)
		offsetY = clamp(nextY, naturalHeight * scale, frameHeight)
	}

	// Each new file gets its own object URL and a centered start.
	$effect(() => {
		const file = props.file
		if (!props.open || !file) return
		const objectUrl = URL.createObjectURL(file)
		imageUrl = objectUrl
		naturalWidth = 0
		naturalHeight = 0
		zoom = 1
		return () => URL.revokeObjectURL(objectUrl)
	})

	const handleImageLoad = () => {
		if (!imageElement) return
		naturalWidth = imageElement.naturalWidth
		naturalHeight = imageElement.naturalHeight
		const startScale = Math.max(frameWidth / naturalWidth, frameHeight / naturalHeight)
		placeImage((frameWidth - naturalWidth * startScale) / 2, (frameHeight - naturalHeight * startScale) / 2)
	}

	const handlePointerDown = (event: PointerEvent) => {
		const target = event.currentTarget as HTMLElement
		target.setPointerCapture(event.pointerId)
		dragStart = { pointerX: event.clientX, pointerY: event.clientY, offsetX, offsetY }
	}

	const handlePointerMove = (event: PointerEvent) => {
		if (!dragStart) return
		placeImage(dragStart.offsetX + event.clientX - dragStart.pointerX, dragStart.offsetY + event.clientY - dragStart.pointerY)
	}

	const handlePointerUp = () => {
		dragStart = undefined
	}

	// Zooming keeps the middle of the frame where it was.
	const handleZoomInput = (event: Event) => {
		const nextZoom = Number((event.currentTarget as HTMLInputElement).value)
		const centerX = (frameWidth / 2 - offsetX) / scale
		const centerY = (frameHeight / 2 - offsetY) / scale
		const nextScale = baseScale * nextZoom
		zoom = nextZoom
		offsetX = clamp(frameWidth / 2 - centerX * nextScale, naturalWidth * nextScale, frameWidth)
		offsetY = clamp(frameHeight / 2 - centerY * nextScale, naturalHeight * nextScale, frameHeight)
	}

	const handleConfirm = async () => {
		const image = imageElement
		const file = props.file
		if (!image || !file || !hasImage) return
		isSaving = true
		const outputHeight = Math.round(props.outputWidth / props.ratio)
		const canvas = document.createElement('canvas')
		canvas.width = props.outputWidth
		canvas.height = outputHeight
		const context = canvas.getContext('2d')
		const sourceX = -offsetX / scale
		const sourceY = -offsetY / scale
		context?.drawImage(image, sourceX, sourceY, frameWidth / scale, frameHeight / scale, 0, 0, props.outputWidth, outputHeight)
		const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.9))
		isSaving = false
		if (!blob) return
		const baseName = file.name.replace(/\.[^.]+$/, '') || 'image'
		props.onConfirm(new File([blob], `${baseName}.jpg`, { type: 'image/jpeg' }))
	}
</script>

<fem-dialog class="studio-dialog" open={props.open} heading={props.heading} onclose={props.onCancel}>
	<div class="crop-body">
		<div
			class="crop-frame"
			style:aspect-ratio={props.ratio}
			bind:clientWidth={frameWidth}
			role="presentation"
			onpointerdown={handlePointerDown}
			onpointermove={handlePointerMove}
			onpointerup={handlePointerUp}
			onpointercancel={handlePointerUp}
		>
			{#if imageUrl}
				<img
					class="crop-image"
					class:isReady={hasImage}
					src={imageUrl}
					alt=""
					draggable="false"
					bind:this={imageElement}
					onload={handleImageLoad}
					style:width="{naturalWidth * scale}px"
					style:height="{naturalHeight * scale}px"
					style:transform="translate({offsetX}px, {offsetY}px)"
				/>
			{/if}
		</div>
		<label class="crop-zoom">
			<fem-text size="small" color="muted">Zoom</fem-text>
			<input type="range" min="1" max={maxZoom} step="0.01" value={zoom} oninput={handleZoomInput} aria-label="Zoom" />
		</label>
		<fem-text size="small" color="muted">Drag the picture to choose what shows.</fem-text>
	</div>
	<fem-button slot="actions" kind="soft" onclick={props.onCancel}>Cancel</fem-button>
	<fem-button slot="actions" loading={isSaving} onclick={handleConfirm}>Use this</fem-button>
</fem-dialog>
