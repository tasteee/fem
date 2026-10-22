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
import datePickerCss from '../date-picker/date-picker.css?inline'

export type DateRangePickerSizeT = 'small' | 'medium' | 'large'

type RangeCalendarElementT = HTMLElement & { start: string; end: string }

// Shares its look with fem-date-picker.
const dateRangePickerSheet = createStyleSheet(datePickerCss)

// "Nov 13 – 20, 2026", with the shared parts said once.
const formatRange = (startIso: string, endIso: string, locale: string | undefined): string => {
	const startDate = parseIsoDate(startIso)
	const endDate = parseIsoDate(endIso)
	if (!startDate || !endDate) return ''
	const formatter = new Intl.DateTimeFormat(locale, { dateStyle: 'medium' })
	return formatter.formatRange(startDate, endDate)
}

// A box like select that opens a range calendar. Pick
// a start day, then an end day. Submits "start,end".
export const DateRangePicker = c(
	(props) => {
		const triggerRef = useRef<HTMLButtonElement>()
		const panelRef = useRef<HTMLDivElement>()
		const wasOpenOnPressRef = useRef(false)
		const [start, setStart] = useProp<string>('start')
		const [end, setEnd] = useProp<string>('end')
		const [isOpen, setOpen] = useProp<boolean>('open')
		const dispatchChange = useEvent('change', { bubbles: true, composed: true })

		const currentStart = start ?? ''
		const currentEnd = end ?? ''
		const defaultStartRef = useRef(currentStart)
		const defaultEndRef = useRef(currentEnd)
		const hasRange = currentStart !== '' && currentEnd !== ''
		const isMissing = Boolean(props.required) && !hasRange
		const isPanelOpen = Boolean(isOpen)
		const formValue = hasRange ? `${currentStart},${currentEnd}` : ''

		const handleReset = () => {
			setStart(defaultStartRef.current)
			setEnd(defaultEndRef.current)
		}

		useFormControl({
			formValue,
			isMissing,
			missingMessage: 'Pick a start and end date.',
			anchorRef: triggerRef,
			handleReset
		})

		useFloatingPopover(triggerRef, panelRef, isPanelOpen, { placement: 'below', alignment: 'start' })

		useEffect(() => {
			if (!isPanelOpen) return
			const calendar = panelRef.current?.querySelector('fem-calendar')
			const focusedDay = calendar?.shadowRoot?.querySelector<HTMLElement>('[tabindex="0"]')
			focusedDay?.focus()
		}, [isPanelOpen])

		const displayText = formatRange(currentStart, currentEnd, props.locale)
		const hasDisplayText = displayText !== ''
		const labelText = hasDisplayText ? displayText : props.placeholder

		const triggerElement = triggerRef.current
		const pageTheme = triggerElement ? getEffectiveTheme(triggerElement) : 'light'
		const isPageLight = pageTheme === 'light'
		const darkPanelClass = getFlagClass(isPageLight, 'isDark')
		const lightPanelClass = getFlagClass(!isPageLight, 'isLight')
		const panelClassName = buildClassName(['date-picker-panel', darkPanelClass, lightPanelClass])

		const sizeClass = getModifierClass(props.size)
		const placeholderClass = getFlagClass(!hasDisplayText, 'isPlaceholder')
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

		// The calendar sends change once both ends are
		// picked. The picker sends its own and closes.
		const handleCalendarChange = (event: Event) => {
			event.stopPropagation()
			const calendar = event.target as RangeCalendarElementT
			setStart(calendar.start)
			setEnd(calendar.end)
			setOpen(false)
			dispatchChange()
			triggerRef.current?.focus()
		}

		return (
			<host shadowDom={focusableShadow}>
				<button
					ref={triggerRef}
					class={triggerClassName}
					disabled={props.disabled}
					aria-haspopup='dialog'
					aria-expanded={expandedLabel}
					aria-label={props.label}
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
					<fem-calendar
						mode='range'
						start={currentStart}
						end={currentEnd}
						min={props.min}
						max={props.max}
						locale={props.locale}
						weekStart={props.weekStart}
					></fem-calendar>
				</div>
			</host>
		)
	},
	{
		form: true,
		props: {
			name: { type: String, reflect: true },
			start: { type: String, reflect: true, value: (): string => '' },
			end: { type: String, reflect: true, value: (): string => '' },
			open: { type: Boolean, reflect: true },
			placeholder: { type: String, value: (): string => 'Pick dates' },
			label: String,
			min: String,
			max: String,
			locale: String,
			weekStart: { type: Number, value: (): number => 0 },
			size: { type: String, reflect: true, value: (): DateRangePickerSizeT => 'medium' },
			required: { type: Boolean, reflect: true },
			disabled: { type: Boolean, reflect: true }
		},
		styles: [foundationSheet, dateRangePickerSheet]
	}
)
