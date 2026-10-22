import { c, useEffect, useHost, useProp, useRef } from 'atomico'
import { buildClassName, getModifierClass } from '../../foundation/class-names'
import { createStyleSheet } from '../../foundation/create-style-sheet'
import { foundationSheet } from '../../foundation/foundation-sheet'
import { focusItem, getEnabledItems } from '../../foundation/roving-focus'
import { useSlidingIndicator } from '../../foundation/use-sliding-indicator'
import radioGroupCss from './radio-group.css?inline'

export type RadioGroupKindT = 'plain' | 'list'

type RadioElementT = HTMLElement & { value: string; name: string; checked: boolean; kind: string }

const radioGroupSheet = createStyleSheet(radioGroupCss)

const getRadios = (hostElement: HTMLElement): RadioElementT[] => {
	return [...hostElement.querySelectorAll<RadioElementT>('fem-radio')]
}

const forwardKeys = ['ArrowDown', 'ArrowRight']
const backwardKeys = ['ArrowUp', 'ArrowLeft']

const getNextIndex = (key: string, currentIndex: number, itemCount: number): number => {
	const isForward = forwardKeys.includes(key)
	if (isForward) return (currentIndex + 1) % itemCount
	return (currentIndex - 1 + itemCount) % itemCount
}

// Owns a set of radios: their shared name, which one
// is checked, and arrow key movement. The list kind
// turns each radio into a row with a sliding fill.
export const RadioGroup = c(
	(props) => {
		const hostRef = useHost<HTMLElement>()
		const trackRef = useRef<HTMLDivElement>()
		const indicatorRef = useRef<HTMLSpanElement>()
		const [value, setValue] = useProp<string>('value')
		const isList = props.kind === 'list'

		const slide = useSlidingIndicator({ hostRef, trackRef, indicatorRef, itemTagName: 'fem-radio', value })

		const syncRadios = () => {
			const radioKind = isList ? 'row' : 'plain'
			for (const radio of getRadios(hostRef.current)) {
				if (props.name) radio.name = props.name
				radio.kind = radioKind
				radio.checked = radio.value === value
			}
		}

		useEffect(syncRadios, [value, props.name, props.kind])

		const handleSlotChange = () => {
			syncRadios()
			slide.handleItemsChange()
		}

		// A radio's own change event bubbles on to the
		// app. The group only records the new value.
		const handleChange = (event: Event) => {
			const changedRadio = event.target as RadioElementT
			const isRadio = changedRadio.localName === 'fem-radio'
			if (!isRadio) return
			setValue(changedRadio.value)
		}

		// Arrow keys move to the next radio and check it,
		// like a native radio group.
		const handleKeyDown = (event: KeyboardEvent) => {
			const isArrow = forwardKeys.includes(event.key) || backwardKeys.includes(event.key)
			if (!isArrow) return
			const enabledRadios = getEnabledItems(hostRef.current, 'fem-radio')
			const currentIndex = enabledRadios.findIndex((radio) => radio.matches(':focus-within'))
			const hasFocus = currentIndex !== -1
			if (!hasFocus) return
			event.preventDefault()
			const nextIndex = getNextIndex(event.key, currentIndex, enabledRadios.length)
			const nextRadio = enabledRadios[nextIndex]
			focusItem(nextRadio)
			const innerButton = nextRadio.shadowRoot?.querySelector('button')
			innerButton?.click()
		}

		// The label shows like a fem-field label, so a
		// group reads the same as a single control.
		const hasLabel = Boolean(props.label)
		const groupLabel = hasLabel ? (
			<span class='group-label' id='group-label'>
				{props.label}
			</span>
		) : null
		const labelledBy = hasLabel ? 'group-label' : undefined

		const kindClass = getModifierClass(props.kind)
		const className = buildClassName(['radio-group', kindClass])

		return (
			<host shadowDom onchange={handleChange}>
				<div class='radio-group-frame'>
					{groupLabel}
					<div ref={trackRef} class={className} role='radiogroup' aria-labelledby={labelledBy} onkeydown={handleKeyDown}>
						<span ref={indicatorRef} class='slide-indicator radio-group-indicator' aria-hidden='true'></span>
						<slot onslotchange={handleSlotChange}></slot>
					</div>
				</div>
			</host>
		)
	},
	{
		props: {
			value: { type: String, reflect: true, value: (): string => '' },
			name: { type: String, reflect: true },
			label: String,
			kind: { type: String, reflect: true, value: (): RadioGroupKindT => 'plain' }
		},
		styles: [foundationSheet, radioGroupSheet]
	}
)
