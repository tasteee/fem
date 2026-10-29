import { c, useEffect, useEvent, useRef, useState } from 'atomico'
import { buildClassName, getModifierClass } from '../../foundation/class-names'
import { createStyleSheet } from '../../foundation/create-style-sheet'
import { foundationSheet } from '../../foundation/foundation-sheet'
import { clampFrame, clampZoom, getCropRect, getShownSize, initialFrame, maxZoom, minZoom, zoomAround } from './crop-geometry'
import type { CropRectT, FrameT, SizeT } from './crop-geometry'
import imageCropCss from './image-crop.css?inline'

export type ImageCropShapeT = 'square' | 'round'

const imageCropSheet = createStyleSheet(imageCropCss)
const emptySize: SizeT = { width: 0, height: 0 }
const arrowStepPixels = 16
const keyZoomStep = 0.25
const wheelZoomSpeed = 0.0015

type PointerPointT = { x: number; y: number }

type GestureT = {
	points: Map<number, PointerPointT>
	lastCenter: PointerPointT
	lastDistance: number
}

type BoxT<T> = { value: T }

const getCenter = (points: PointerPointT[]): PointerPointT => {
	const hasPoints = points.length > 0
	if (!hasPoints) return { x: 0, y: 0 }
	const total = { x: 0, y: 0 }

	for (const point of points) {
		total.x += point.x
		total.y += point.y
	}

	return { x: total.x / points.length, y: total.y / points.length }
}

const getDistance = (points: PointerPointT[]): number => {
	const hasPair = points.length >= 2
	if (!hasPair) return 0
	const first = points[0]
	const second = points[1]
	return Math.hypot(second.x - first.x, second.y - first.y)
}

const zoomToPercent = (zoom: number): number => Math.round(((zoom - minZoom) / (maxZoom - minZoom)) * 100)
const percentToZoom = (percent: number): number => minZoom + (percent / 100) * (maxZoom - minZoom)

const readSliderPercent = (event: Event): number => {
	const innerInput = event.composedPath()[0] as HTMLInputElement
	return Number(innerInput.value)
}

// Pick the part of an image to keep: drag to move, pinch,
// scroll, or the slider to zoom. The window's shape is
// the crop's shape. It only measures; change carries the
// crop in the image's own pixels, and cropImage() from
// the foundation turns that into a file.
export const ImageCrop = c(
	(props) => {
		const viewportRef = useRef<HTMLDivElement>()
		const gestureRef = useRef<BoxT<GestureT>>()
		const [imageSize, setImageSize] = useState<SizeT>(emptySize)
		const [viewSize, setViewSize] = useState<SizeT>(emptySize)
		const [frame, setFrame] = useState<FrameT>(initialFrame)
		const dispatchChange = useEvent<CropRectT>('change', { bubbles: true, composed: true })
		if (!gestureRef.current) gestureRef.current = { value: { points: new Map(), lastCenter: { x: 0, y: 0 }, lastDistance: 0 } }
		const gesture = gestureRef.current.value

		// The window's size decides how big the image draws.
		useEffect(() => {
			const viewport = viewportRef.current
			if (!viewport) return

			const handleResize = () => {
				const box = viewport.getBoundingClientRect()
				setViewSize({ width: box.width, height: box.height })
			}

			const observer = new ResizeObserver(handleResize)
			observer.observe(viewport)
			return () => observer.disconnect()
		}, [])

		// A new image starts centered and unzoomed.
		useEffect(() => {
			setImageSize(emptySize)
			setFrame(initialFrame)
		}, [props.src])

		const hasImage = imageSize.width > 0 && viewSize.width > 0

		useEffect(() => {
			if (!hasImage) return
			dispatchChange(getCropRect(frame, imageSize, viewSize))
		}, [frame, imageSize, viewSize])

		const applyFrame = (nextFrame: FrameT) => setFrame(clampFrame(nextFrame, imageSize, viewSize))

		const handleImageLoad = (event: Event) => {
			const image = event.currentTarget as HTMLImageElement
			setImageSize({ width: image.naturalWidth, height: image.naturalHeight })
			setFrame(initialFrame)
		}

		// Points are relative to the window's center, which is
		// where the offsets are measured from.
		const toViewPoint = (event: PointerEvent | WheelEvent): PointerPointT => {
			const box = (viewportRef.current as HTMLDivElement).getBoundingClientRect()
			return { x: event.clientX - box.left - box.width / 2, y: event.clientY - box.top - box.height / 2 }
		}

		const resetGesture = () => {
			const points = [...gesture.points.values()]
			gesture.lastCenter = getCenter(points)
			gesture.lastDistance = getDistance(points)
		}

		const handlePointerDown = (event: PointerEvent) => {
			if (!hasImage) return
			const viewport = event.currentTarget as HTMLElement
			viewport.setPointerCapture(event.pointerId)
			gesture.points.set(event.pointerId, toViewPoint(event))
			resetGesture()
		}

		// One finger moves. Two fingers move and pinch.
		const handlePointerMove = (event: PointerEvent) => {
			const isTracked = gesture.points.has(event.pointerId)
			if (!isTracked) return
			gesture.points.set(event.pointerId, toViewPoint(event))
			const points = [...gesture.points.values()]
			const center = getCenter(points)
			const distance = getDistance(points)
			const isPinch = points.length >= 2 && gesture.lastDistance > 0
			const pinchRatio = isPinch ? distance / gesture.lastDistance : 1
			const zoomed = zoomAround(frame, frame.zoom * pinchRatio, center.x, center.y)
			const moveX = center.x - gesture.lastCenter.x
			const moveY = center.y - gesture.lastCenter.y
			gesture.lastCenter = center
			gesture.lastDistance = distance
			applyFrame({ zoom: zoomed.zoom, offsetX: zoomed.offsetX + moveX, offsetY: zoomed.offsetY + moveY })
		}

		const handlePointerEnd = (event: PointerEvent) => {
			gesture.points.delete(event.pointerId)
			resetGesture()
		}

		const handleWheel = (event: WheelEvent) => {
			if (!hasImage) return
			event.preventDefault()
			const focus = toViewPoint(event)
			const nextZoom = frame.zoom * (1 - event.deltaY * wheelZoomSpeed)
			applyFrame(zoomAround(frame, nextZoom, focus.x, focus.y))
		}

		// Arrows move the image, + and - zoom it.
		const handleKeyDown = (event: KeyboardEvent) => {
			const moves: Record<string, PointerPointT> = {
				ArrowLeft: { x: arrowStepPixels, y: 0 },
				ArrowRight: { x: -arrowStepPixels, y: 0 },
				ArrowUp: { x: 0, y: arrowStepPixels },
				ArrowDown: { x: 0, y: -arrowStepPixels }
			}

			const move = moves[event.key]
			const isZoomIn = event.key === '+' || event.key === '='
			const isZoomOut = event.key === '-'
			const isHandled = move !== undefined || isZoomIn || isZoomOut
			if (!isHandled) return
			event.preventDefault()
			if (move) return applyFrame({ ...frame, offsetX: frame.offsetX + move.x, offsetY: frame.offsetY + move.y })
			const direction = isZoomIn ? 1 : -1
			applyFrame(zoomAround(frame, frame.zoom + direction * keyZoomStep, 0, 0))
		}

		const handleSliderInput = (event: Event) => {
			const nextZoom = clampZoom(percentToZoom(readSliderPercent(event)))
			applyFrame(zoomAround(frame, nextZoom, 0, 0))
		}

		const shown = getShownSize(imageSize, viewSize, frame.zoom)
		const frameStyle = [
			`--image-crop-aspect: ${props.aspect}`,
			`--image-crop-width: ${shown.width}px`,
			`--image-crop-height: ${shown.height}px`,
			`--image-crop-x: ${frame.offsetX}px`,
			`--image-crop-y: ${frame.offsetY}px`
		].join('; ')
		const className = buildClassName(['image-crop', getModifierClass(props.shape)])
		const zoomPercent = zoomToPercent(frame.zoom)
		const viewportLabel = `${props.label}. Drag to move. Pinch, scroll, or use plus and minus to zoom.`

		return (
			<host shadowDom>
				<div class={className} style={frameStyle}>
					<div
						ref={viewportRef}
						class='image-crop-viewport'
						tabindex='0'
						role='img'
						aria-label={viewportLabel}
						onpointerdown={handlePointerDown}
						onpointermove={handlePointerMove}
						onpointerup={handlePointerEnd}
						onpointercancel={handlePointerEnd}
						onwheel={handleWheel}
						onkeydown={handleKeyDown}
					>
						<img class='image-crop-image' src={props.src} alt='' draggable={false} onload={handleImageLoad} />
					</div>
					<fem-slider class='image-crop-zoom' label='Zoom' min={0} max={100} value={zoomPercent} oninput={handleSliderInput}></fem-slider>
				</div>
			</host>
		)
	},
	{
		props: {
			src: { type: String, value: (): string => '' },
			aspect: { type: Number, value: (): number => 1 },
			shape: { type: String, reflect: true, value: (): ImageCropShapeT => 'square' },
			label: { type: String, value: (): string => 'Crop image' }
		},
		styles: [foundationSheet, imageCropSheet]
	}
)
