import type { CropRectT } from '../components/image-crop/crop-geometry'

// Draws the cropped part of an image into a new file.
// Pair it with fem-image-crop's change event: keep the
// latest crop, then call this when the person saves.

export type CropImageInputT = {
	src: string
	crop: CropRectT
	width: number
	type?: 'image/jpeg' | 'image/png' | 'image/webp'
	quality?: number
}

const loadImage = (src: string): Promise<HTMLImageElement> => {
	const image = new Image()
	image.crossOrigin = 'anonymous'

	return new Promise((resolve, reject) => {
		image.addEventListener('load', () => resolve(image))
		image.addEventListener('error', () => reject(new Error('fem: image could not load for cropping')))
		image.src = src
	})
}

const readBlob = (canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> => {
	return new Promise((resolve, reject) => {
		const handleBlob = (blob: Blob | null) => {
			if (!blob) return reject(new Error('fem: the crop could not be saved'))
			resolve(blob)
		}

		canvas.toBlob(handleBlob, type, quality)
	})
}

// The output keeps the crop's shape at the given width.
// A small source is never scaled up past its own size.
export const cropImage = async (input: CropImageInputT): Promise<Blob> => {
	const image = await loadImage(input.src)
	const outputWidth = Math.min(input.width, input.crop.width)
	const aspect = input.crop.height / input.crop.width
	const outputHeight = Math.round(outputWidth * aspect)
	const canvas = document.createElement('canvas')
	canvas.width = outputWidth
	canvas.height = outputHeight
	const context = canvas.getContext('2d')
	if (!context) throw new Error('fem: canvas is not available')
	context.imageSmoothingQuality = 'high'
	const crop = input.crop
	context.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, outputWidth, outputHeight)
	const type = input.type ?? 'image/jpeg'
	const quality = input.quality ?? 0.9
	return readBlob(canvas, type, quality)
}
