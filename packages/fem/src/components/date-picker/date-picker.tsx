import { c, useEffect, useEvent, useProp, useRef } from 'atomico'
import { buildClassName, getFlagClass, getModifierClass } from '../../foundation/class-names'
import { createStyleSheet } from '../../foundation/create-style-sheet'
import { parseIsoDate } from '../../foundation/dates'
import { foundationSheet } from '../../foundation/foundation-sheet'
import { getEffectiveTheme } from '../../foundation/get-effective-theme'
import { IconSvg } from '../../foundation/icons'
import { useFloatingPopover } from '../../foundation/use-floating-popover'
import { focusableShadow, useFormControl } from '../../foundation/use-form-control'
import { calendarBlankIcon } from '../../icons/generated'
import datePickerCss from './date-picker.css?inline'

export type DatePickerSizeT = 'small' | 'medium' | 'large'

type CalendarElementT = HTMLElement & { value: string }

const datePickerSheet = createStyleSheet(datePickerCss)

const formatDisplayDate = (isoDate: string, locale: string | undefined): string => {
	const date = parseIsoDate(isoDate)
	if (!date) return ''
	const formatter = new Intl.DateTimeFormat(locale, { dateStyle: 'medium' })
	return formatter.format(date)
}

// A box like select that opens a calendar. The value
// is an ISO date, like 2026-10-21. The panel opens in
// the inverse theme, like every floating panel.
export const DatePicker = c(
	(props) => {
		const triggerRef = useRef<HTMLButtonElement>()
		const panelRef = useRef<HTMLDivElement>()
		const wasOpenOnPressRef = useRef(false)
		const [value, setValue] = useProp<string>('value')
		const [isOpen, setOpen] = useProp<boolean>('open')
		const dispatchChange = useEvent('change', { bubbles: true, composed: true })

		const currentValue = value ?? ''
		const defaultValueRef = useRef(currentValue)
		const isMissing = Boolean(props.required) && currentValue === ''
		const isPanelOpen = Boolean(isOpen)

		useFormControl({
			formValue: currentValue,
			isMissing,
			missingMessage: 'Pick a date.',
			anchorRef: triggerRef,
			handleReset: () => setValue(defaultValueRef.current)
		})

		useFloatingPopover(triggerRef, panelRef, isPanelOpen, { placement: 'below', alignment: 'start' })

		// Opening hands focus to the calendar's current
		// day, so the arrow keys work right away.
		useEffect(() => {
			if (!isPanelOpen) return
			const calendar = panelRef.current?.querySelector('fem-calendar')
			const focusedDay = calendar?.shadowRoot?.querySelector<HTMLElement>('[tabindex="0"]')
			focusedDay?.focus()
		}, [isPanelOpen])

		const displayText = formatDisplayDate(currentValue, props.locale)
		const hasValue = displayText !== ''
		const labelText = hasValue ? displayText : props.placeholder

		const triggerElement = triggerRef.current
		const pageTheme = triggerElement ? getEffectiveTheme(triggerElement) : 'light'
		const isPageLight = pageTheme === 'light'
		const darkPanelClass = getFlagClass(isPageLight, 'isDark')
		const lightPanelClass = getFlagClass(!isPageLight, 'isLight')
		const panelClassName = buildClassName(['date-picker-panel', darkPanelClass, lightPanelClass])

		const sizeClass = getModifierClass(props.size)
		const placeholderClass = getFlagClass(!hasValue, 'isPlaceholder')
		const openClass = getFlagClass(isPanelOpen, 'isOpen')
		const disabledClass = getFlagClass(props.disabled, 'isDisabled')
		const triggerClassName = buildClassName(['date-picker', sizeClass, placeholderClass, openClass, disabledClass])
		const expandedLabel = String(isPanelOpen)

		const handleToggle = (event: Event) => {
			const toggleEvent = event as ToggleEvent
			const isNowOpen = toggleEvent.newState === 'open'
			setOpen(isNowOpen)
		}

		const handleTriggerPress = () => (wasOpenOnPressRef.current = isPanelOpen)

		const handleTriggerClick = () => {
			if (wasOpenOnPressRef.current) return
			setOpen(true)
		}

		// The calendar's own change event stays inside;
		// the picker sends one of its own and closes.
		const handleCalendarChange = (event: Event) => {
			event.stopPropagation()
			const calendar = event.target as CalendarElementT
			setValue(calendar.value)
			setOpen(false)
			dispatchChange()
			triggerRef.current?.focus()
		}

		// The name keeps the shown date in it, so voice
		// control can say what it sees.
		const triggerName = props.label ? `${props.label}: ${labelText}` : undefined

		return (
			<host shadowDom={focusableShadow}>
				<button
					ref={triggerRef}
					class={triggerClassName}
					disabled={props.disabled}
					aria-haspopup='dialog'
					aria-expanded={expandedLabel}
					aria-label={triggerName}
					onpointerdown={handleTriggerPress}
					onclick={handleTriggerClick}
				>
					<span class='date-picker-label'>{labelText}</span>
					<IconSvg icon={calendarBlankIcon} kind='bold' />
				</button>

				<div
					ref={panelRef}
					class={panelClassName}
					popover='auto'
					role='dialog'
					aria-label={props.label}
					ontoggle={handleToggle}
					onchange={handleCalendarChange}
				>
					<fem-calendar value={currentValue} min={props.min} max={props.max} locale={props.locale} weekStart={props.weekStart}></fem-calendar>
				</div>
			</host>
		)
	},
	{
		form: true,
		props: {
			name: { type: String, reflect: true },
			value: { type: String, reflect: true, value: (): string => '' },
			open: { type: Boolean, reflect: true },
			placeholder: { type: String, value: (): string => 'Pick a date' },
			label: String,
			min: String,
			max: String,
			locale: String,
			weekStart: { type: Number, value: (): number => 0 },
			size: { type: String, reflect: true, value: (): DatePickerSizeT => 'medium' },
			required: { type: Boolean, reflect: true },
			disabled: { type: Boolean, reflect: true }
		},
		styles: [foundationSheet, datePickerSheet]
	}
)
