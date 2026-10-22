import { c, useEffect, useEvent, useProp, useRef, useState } from 'atomico'
import { buildClassName, getFlagClass } from '../../foundation/class-names'
import { createStyleSheet } from '../../foundation/create-style-sheet'
import {
	addDays,
	addMonths,
	buildMonthGrid,
	checkDateInRange,
	checkSameMonth,
	getMonthStart,
	parseIsoDate,
	toIsoDate
} from '../../foundation/dates'
import { foundationSheet } from '../../foundation/foundation-sheet'
import { IconSvg } from '../../foundation/icons'
import { useSlidingIndicator } from '../../foundation/use-sliding-indicator'
import { caretLeftIcon, caretRightIcon } from '../../icons/generated'
import calendarCss from './calendar.css?inline'

const calendarSheet = createStyleSheet(calendarCss)

// Days the arrow keys and paging keys move by.
const dayStepsByKey: Record<string, number> = {
	ArrowLeft: -1,
	ArrowRight: 1,
	ArrowUp: -7,
	ArrowDown: 7
}

const monthStepsByKey: Record<string, number> = {
	PageUp: -1,
	PageDown: 1
}

const buildWeekdayLabels = (locale: string | undefined, weekStart: number): string[] => {
	const formatter = new Intl.DateTimeFormat(locale, { weekday: 'narrow' })
	// Jan 4, 2026 is a Sunday.
	const firstSunday = new Date(2026, 0, 4)
	return Array.from({ length: 7 }, (_, dayIndex) => formatter.format(addDays(firstSunday, dayIndex + weekStart)))
}

// One month of days. The chosen day's fill slides,
// like every selection in fem. Arrow keys move by
// day and week, Page Up and Page Down by month.
export const Calendar = c(
	(props) => {
		const hostRef = useRef<HTMLElement>()
		const gridRef = useRef<HTMLDivElement>()
		const indicatorRef = useRef<HTMLSpanElement>()
		const [value, setValue] = useProp<string>('value')
		const dispatchChange = useEvent('change', { bubbles: true, composed: true })

		const selectedDate = parseIsoDate(value)
		const today = new Date()
		const todayIso = toIsoDate(today)
		const [focusedDate, setFocusedDate] = useState<Date>(selectedDate ?? today)
		const shouldMoveFocusRef = useRef(false)

		const monthStart = getMonthStart(focusedDate)
		const gridDates = buildMonthGrid(monthStart, props.weekStart)
		const weekdayLabels = buildWeekdayLabels(props.locale, props.weekStart)
		const monthFormatter = new Intl.DateTimeFormat(props.locale, { month: 'long', year: 'numeric' })
		const monthLabel = monthFormatter.format(monthStart)
		const dayLabelFormatter = new Intl.DateTimeFormat(props.locale, { dateStyle: 'full' })
		const focusedIso = toIsoDate(focusedDate)
		const monthKey = toIsoDate(monthStart)

		const findSelectedDay = () => {
			const grid = gridRef.current
			if (!grid) return undefined
			return grid.querySelector<HTMLElement>('[aria-selected="true"]') ?? undefined
		}

		const slide = useSlidingIndicator({
			hostRef: hostRef as { current: HTMLElement },
			trackRef: gridRef,
			indicatorRef,
			itemTagName: '',
			value,
			findSelectedItem: findSelectedDay
		})

		// A new month redraws the grid, so the fill jumps
		// to its new spot, or hides if the day is elsewhere.
		useEffect(() => slide.handleItemsChange(), [monthKey])

		// Keyboard moves bring focus along to the new day.
		useEffect(() => {
			if (!shouldMoveFocusRef.current) return
			shouldMoveFocusRef.current = false
			const focusedButton = gridRef.current?.querySelector<HTMLElement>('[tabindex="0"]')
			focusedButton?.focus()
		}, [focusedIso])

		const pickDate = (date: Date) => {
			const isoDate = toIsoDate(date)
			const isInRange = checkDateInRange(isoDate, props.min, props.max)
			if (!isInRange) return
			setFocusedDate(date)
			setValue(isoDate)
			dispatchChange()
		}

		const moveFocus = (nextDate: Date) => {
			shouldMoveFocusRef.current = true
			setFocusedDate(nextDate)
		}

		const handleGridKeyDown = (event: KeyboardEvent) => {
			const dayStep = dayStepsByKey[event.key]
			const hasDayStep = dayStep !== undefined
			if (hasDayStep) {
				event.preventDefault()
				moveFocus(addDays(focusedDate, dayStep))
				return
			}

			const monthStep = monthStepsByKey[event.key]
			const hasMonthStep = monthStep !== undefined
			if (hasMonthStep) {
				event.preventDefault()
				moveFocus(addMonths(focusedDate, monthStep))
			}
		}

		const handlePreviousMonth = () => setFocusedDate(addMonths(focusedDate, -1))
		const handleNextMonth = () => setFocusedDate(addMonths(focusedDate, 1))

		const renderDay = (date: Date) => {
			const isoDate = toIsoDate(date)
			const isSelected = isoDate === value
			const isToday = isoDate === todayIso
			const isOutside = !checkSameMonth(date, monthStart)
			const isFocused = isoDate === focusedIso
			const isDisabled = !checkDateInRange(isoDate, props.min, props.max)
			const selectedClass = getFlagClass(isSelected, 'isSelected')
			const todayClass = getFlagClass(isToday, 'isToday')
			const outsideClass = getFlagClass(isOutside, 'isOutside')
			const className = buildClassName(['calendar-day', selectedClass, todayClass, outsideClass])
			const tabIndex = isFocused ? 0 : -1
			const selectedLabel = String(isSelected)
			const dayLabel = dayLabelFormatter.format(date)
			const handleDayClick = () => pickDate(date)

			return (
				<button
					key={isoDate}
					class={className}
					role='gridcell'
					tabindex={tabIndex}
					aria-selected={selectedLabel}
					aria-label={dayLabel}
					disabled={isDisabled}
					onclick={handleDayClick}
				>
					{date.getDate()}
				</button>
			)
		}

		const weekdayCells = weekdayLabels.map((weekdayLabel, weekdayIndex) => (
			<span key={weekdayIndex} class='calendar-weekday' aria-hidden='true'>
				{weekdayLabel}
			</span>
		))

		const dayCells = gridDates.map(renderDay)

		return (
			<host shadowDom>
				<div class='calendar'>
					<div class='calendar-header'>
						<span class='calendar-month' aria-live='polite'>
							{monthLabel}
						</span>
						<button class='calendar-step' aria-label='Previous month' onclick={handlePreviousMonth}>
							<IconSvg icon={caretLeftIcon} kind='bold' />
						</button>
						<button class='calendar-step' aria-label='Next month' onclick={handleNextMonth}>
							<IconSvg icon={caretRightIcon} kind='bold' />
						</button>
					</div>
					<div class='calendar-weekdays'>{weekdayCells}</div>
					<div ref={gridRef} class='calendar-grid' role='grid' aria-label={monthLabel} onkeydown={handleGridKeyDown}>
						<span ref={indicatorRef} class='slide-indicator calendar-indicator' aria-hidden='true'></span>
						{dayCells}
					</div>
				</div>
			</host>
		)
	},
	{
		props: {
			value: { type: String, reflect: true },
			min: String,
			max: String,
			locale: String,
			weekStart: { type: Number, value: (): number => 0 }
		},
		styles: [foundationSheet, calendarSheet]
	}
)
