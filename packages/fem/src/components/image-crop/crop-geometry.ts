// The math behind fem-image-crop. Plain functions, so the
// component stays about events and drawing.

export type SizeT = {
	width: number
	height: number
}

export type FrameT = {
	zoom: number
	offsetX: number
	offsetY: number
}

// The cropped area, in the source image's own pixels.
export type CropRectT = {
	x: number
	y: number
	width: number
	height: number
}

export const minZoom = 1
export const maxZoom = 4

export const initialFrame: FrameT = { zoom: 1, offsetX: 0, offsetY: 0 }

// At zoom 1 the image just covers the window, like
// object-fit: cover.
export const getCoverScale = (image: SizeT, view: SizeT): number => {
	const hasImage = image.width > 0 && image.height > 0
	if (!hasImage) return 1
	const widthScale = view.width / image.width
	const heightScale = view.height / image.height
	return Math.max(widthScale, heightScale)
}

export const getShownSize = (image: SizeT, view: SizeT, zoom: number): SizeT => {
	const scale = getCoverScale(image, view) * zoom
	return { width: image.width * scale, height: image.height * scale }
}

const clampNumber = (value: number, limit: number): number => Math.max(-limit, Math.min(limit, value))

export const clampZoom = (zoom: number): number => Math.max(minZoom, Math.min(maxZoom, zoom))

// The image may move only as far as it still fills the
// window. No empty edges, ever.
export const clampFrame = (frame: FrameT, image: SizeT, view: SizeT): FrameT => {
	const zoom = clampZoom(frame.zoom)
	const shown = getShownSize(image, view, zoom)
	const limitX = Math.max(0, (shown.width - view.width) / 2)
	const limitY = Math.max(0, (shown.height - view.height) / 2)
	return { zoom, offsetX: clampNumber(frame.offsetX, limitX), offsetY: clampNumber(frame.offsetY, limitY) }
}

// What the window shows, measured in source pixels.
export const getCropRect = (frame: FrameT, image: SizeT, view: SizeT): CropRectT => {
	const scale = getCoverScale(image, view) * frame.zoom
	const shown = getShownSize(image, view, frame.zoom)
	const leftInShown = shown.width / 2 - view.width / 2 - frame.offsetX
	const topInShown = shown.height / 2 - view.height / 2 - frame.offsetY

	return {
		x: Math.round(leftInShown / scale),
		y: Math.round(topInShown / scale),
		width: Math.round(view.width / scale),
		height: Math.round(view.height / scale)
	}
}

// Zooming keeps the point under the finger or cursor in
// place, so the image grows around what you're pointing
// at.
export const zoomAround = (frame: FrameT, nextZoom: number, focusX: number, focusY: number): FrameT => {
	const zoom = clampZoom(nextZoom)
	const ratio = zoom / frame.zoom
	const offsetX = focusX - (focusX - frame.offsetX) * ratio
	const offsetY = focusY - (focusY - frame.offsetY) * ratio
	return { zoom, offsetX, offsetY }
}
