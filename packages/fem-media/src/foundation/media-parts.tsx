import { useEffect, useHost } from 'atomico'
import { buildClassName, createStyleSheet, getFlagClass, getModifierClass, IconSvg } from '@tasteee/fem/foundation'
import type { IconT } from '@tasteee/fem/icons'
import mediaCss from './media.css?inline'

export type MediaButtonSizeT = 'small' | 'medium' | 'large'
export type MediaButtonKindT = 'ghost' | 'solid'

export const mediaSheet = createStyleSheet(mediaCss)

type MediaButtonPropsT = {
	icon: IconT
	label: string
	size?: MediaButtonSizeT
	kind?: MediaButtonKindT
	isActive?: boolean
	isMuted?: boolean
	isDisabled?: boolean
	handleClick: (event: MouseEvent) => void
}

// A quick tap ends before the eye can see it, so a
// press is held for a minimum time, as in fem.
const minimumPressMilliseconds = 40

const findPressable = (event: Event): HTMLElement | undefined => {
	const path = event.composedPath()
	const pathElements = path.filter((entry) => entry instanceof HTMLElement) as HTMLElement[]
	return pathElements.find((element) => element.classList.contains('isPressable'))
}

// Gives every .isPressable button in a component the
// fem press: shrink and darken. One listener on the
// shadow root covers buttons that come and go.
export const usePressWithin = () => {
	const hostRef = useHost()

	useEffect(() => {
		const root = hostRef.current.shadowRoot
		if (!root) return
		let pressedElement: HTMLElement | undefined
		let pressStart = 0

		const handlePressStart = (event: Event) => {
			const pressable = findPressable(event)
			if (!pressable) return
			pressedElement = pressable
			pressStart = performance.now()
			pressable.classList.add('isPressed')
		}

		const handlePressEnd = () => {
			const element = pressedElement
			if (!element) return
			pressedElement = undefined
			const heldMilliseconds = performance.now() - pressStart
			const remainingMilliseconds = Math.max(0, minimumPressMilliseconds - heldMilliseconds)
			const releasePress = () => element.classList.remove('isPressed')
			setTimeout(releasePress, remainingMilliseconds)
		}

		root.addEventListener('pointerdown', handlePressStart)
		window.addEventListener('pointerup', handlePressEnd)
		window.addEventListener('pointercancel', handlePressEnd)

		const removeListeners = () => {
			root.removeEventListener('pointerdown', handlePressStart)
			window.removeEventListener('pointerup', handlePressEnd)
			window.removeEventListener('pointercancel', handlePressEnd)
		}

		return removeListeners
	}, [])
}

// A round transport button: play, skip, repeat. Use
// usePressWithin in the component for the press.
export const MediaButton = (props: MediaButtonPropsT) => {
	const sizeClass = getModifierClass(props.size ?? 'medium')
	const kindClass = getModifierClass(props.kind ?? 'ghost')
	const activeClass = getFlagClass(props.isActive, 'isActive')
	const mutedClass = getFlagClass(props.isMuted, 'isMuted')
	const className = buildClassName(['media-button', 'isPressable', sizeClass, kindClass, activeClass, mutedClass])
	const pressedState = props.isActive === undefined ? null : String(props.isActive)

	return (
		<button
			class={className}
			type='button'
			aria-label={props.label}
			aria-pressed={pressedState}
			disabled={props.isDisabled}
			onclick={props.handleClick}
		>
			<IconSvg icon={props.icon} kind='bold' />
		</button>
	)
}

type EqualizerPropsT = {
	isPlaying: boolean
}

export const Equalizer = (props: EqualizerPropsT) => {
	const className = buildClassName(['equalizer', getFlagClass(!props.isPlaying, 'isPaused')])

	return (
		<span class={className} aria-hidden='true'>
			<span class='equalizer-bar'></span>
			<span class='equalizer-bar'></span>
			<span class='equalizer-bar'></span>
		</span>
	)
}
