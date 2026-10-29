<script lang="ts">
	import type { ImageCropShapeT } from '@tasteee/fem'
	import { getErrorReason, uploadFile } from '../data/studio-api'
	import CropDialog from './CropDialog.svelte'

	type CroppedImagePickerPropsT = {
		label: string
		cropHeading: string
		src: string
		aspect: number
		shape: ImageCropShapeT
		outputWidth: number
		ratio?: string
		class?: string
		// True while the parent holds an uploaded crop it
		// hasn't saved yet; false shows the saved image.
		hasPending: boolean
		onUploaded: (key: string) => void
		onBusyChange?: (isBusy: boolean) => void
		onFailure?: (message: string) => void
	}

	// Pick an image, frame it, and upload the crop. The
	// parent only hears about the finished file's key.
	const props: CroppedImagePickerPropsT = $props()
	let pickedFile = $state<File | undefined>(undefined)
	let previewUrl = $state('')
	let isUploading = $state(false)

	const isPreviewing = $derived((props.hasPending || isUploading) && previewUrl !== '')
	const shownSource = $derived(isPreviewing ? previewUrl : props.src)
	const displayRatio = $derived(props.ratio ?? '1 / 1')

	const handlePick = (event: Event) => {
		const detail = (event as CustomEvent<{ files: File[] }>).detail
		const picker = event.currentTarget as HTMLElement & { files: File[] }
		const file = detail.files[0]
		picker.files = []
		if (file) pickedFile = file
	}

	const closeCrop = () => (pickedFile = undefined)

	const setBusy = (isBusy: boolean) => {
		isUploading = isBusy
		props.onBusyChange?.(isBusy)
	}

	// The cropped preview shows right away, while the
	// upload finishes behind it.
	const handleCropped = async (cropped: File) => {
		pickedFile = undefined
		const nextPreviewUrl = URL.createObjectURL(cropped)
		const oldPreviewUrl = previewUrl
		previewUrl = nextPreviewUrl
		if (oldPreviewUrl) URL.revokeObjectURL(oldPreviewUrl)
		setBusy(true)
		const ignoreProgress = () => {}

		try {
			const key = await uploadFile(cropped, 'image', ignoreProgress)
			props.onUploaded(key)
		} catch (uploadError) {
			props.onFailure?.(`Image didn't upload (${getErrorReason(uploadError)}).`)
		} finally {
			setBusy(false)
		}
	}
</script>

<fem-file-upload class={props.class} kind="image" accept="image/*" ratio={displayRatio} label={props.label} src={shownSource} onchange={handlePick}></fem-file-upload>
<CropDialog file={pickedFile} heading={props.cropHeading} aspect={props.aspect} shape={props.shape} outputWidth={props.outputWidth} onDone={handleCropped} onClose={closeCrop} />
