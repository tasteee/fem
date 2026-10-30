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

export type CalendarModeT = 'single' | 'range'

const calendarSheet = createStyleSheet(calendarCss)

// Puts two ISO dates in order, earliest first.
const orderDates = (firstIso: string, secondIso: string): [string, string] => {
	const isInOrder = firstIso <= secondIso
	if (isInOrder) return [firstIso, secondIso]
	return [secondIso, firstIso]
}

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
		const [start, setStart] = useProp<string>('start')
		const [end, setEnd] = useProp<string>('end')
		// In range mode, the day under the pointer while
		// only the start is picked, to preview the range.
		const [hoverIso, setHoverIso] = useState('')
		const isRangeMode = props.mode === 'range'
		const dispatchChange = useEvent('change', { bubbles: true, composed: true })

		const anchorIso = isRangeMode ? start : value
		const selectedDate = parseIsoDate(anchorIso)
		const today = new Date()
		const todayIso = toIsoDate(today)
		const [focusedDate, setFocusedDate] = useState<Date>(selectedDate ?? today)
		const shouldMoveFocusRef = useRef(false)

		const monthStart = getMonthStart(focusedDate)
		const gridDates = buildMonthGrid(monthStart, props.weekStart)
		const weekdayLabels = buildWeekdayLabels(props.locale, props.weekStart)
		const monthFormatter = new Intl.DateTimeFormat(props.locale, { month: 'long', year: 'numeric' })
		const monthLabel = monthFormatter.format(monthStart)
		const monthNameFormatter = new Intl.DateTimeFormat(props.locale, { month: 'long' })
		const monthName = monthNameFormatter.format(monthStart)
		const yearFormatter = new Intl.DateTimeFormat(props.locale, { year: 'numeric' })
		const yearName = yearFormatter.format(monthStart)
		const dayLabelFormatter = new Intl.DateTimeFormat(props.locale, { dateStyle: 'full' })
		const focusedIso = toIsoDate(focusedDate)
		const monthKey = toIsoDate(monthStart)

		// Range mode draws its own fill, so nothing slides.
		const findSelectedDay = () => {
			const grid = gridRef.current
			if (!grid) return undefined
			if (isRangeMode) return undefined
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

		// The first pick starts a range. The second ends
		// it, in either order. A third starts over.
		const pickRangeDate = (isoDate: string) => {
			const hasOpenRange = Boolean(start) && !end
			if (!hasOpenRange) {
				setStart(isoDate)
				setEnd('')
				return
			}
			const orderedDates = orderDates(start ?? isoDate, isoDate)
			setStart(orderedDates[0])
			setEnd(orderedDates[1])
			setHoverIso('')
			dispatchChange()
		}

		const pickDate = (date: Date) => {
			const isoDate = toIsoDate(date)
			const isInRange = checkDateInRange(isoDate, props.min, props.max)
			if (!isInRange) return
			setFocusedDate(date)
			if (isRangeMode) return pickRangeDate(isoDate)
			setValue(isoDate)
			dispatchChange()
		}

		// The range to draw: the chosen one, or a preview
		// from the start to the hovered day.
		const hasOpenRange = isRangeMode && Boolean(start) && !end
		const hasHover = hoverIso !== ''
		const isPreviewing = hasOpenRange && hasHover
		const previewEnd = isPreviewing ? hoverIso : end
		const hasBothEnds = Boolean(start) && Boolean(previewEnd)
		const drawnRange = hasBothEnds ? orderDates(start ?? '', previewEnd ?? '') : undefined
		const rangeStartIso = drawnRange ? drawnRange[0] : start
		const rangeEndIso = drawnRange ? drawnRange[1] : ''

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
		const handlePreviousYear = () => setFocusedDate(addMonths(focusedDate, -12))
		const handleNextYear = () => setFocusedDate(addMonths(focusedDate, 12))

		const renderDay = (date: Date) => {
			const isoDate = toIsoDate(date)
			const isRangeStart = isRangeMode && isoDate === rangeStartIso
			const isRangeEnd = isRangeMode && isoDate === rangeEndIso
			const isAfterRangeStart = isoDate > (rangeStartIso ?? '')
			const isBeforeRangeEnd = isoDate < rangeEndIso
			const hasRangeEnd = Boolean(rangeEndIso)
			const isBetween = isRangeMode && hasRangeEnd && isAfterRangeStart && isBeforeRangeEnd
			const isSingleSelected = !isRangeMode && isoDate === value
			const isSelected = isSingleSelected || isRangeStart || isRangeEnd
			const isToday = isoDate === todayIso
			const isOutside = !checkSameMonth(date, monthStart)
			const isFocused = isoDate === focusedIso
			const isDisabled = !checkDateInRange(isoDate, props.min, props.max)
			const selectedClass = getFlagClass(isSelected, 'isSelected')
			const todayClass = getFlagClass(isToday, 'isToday')
			const outsideClass = getFlagClass(isOutside, 'isOutside')
			const rangeStartClass = getFlagClass(isRangeStart && Boolean(rangeEndIso), 'isRangeStart')
			const rangeEndClass = getFlagClass(isRangeEnd, 'isRangeEnd')
			const betweenClass = getFlagClass(isBetween, 'isBetween')
			const className = buildClassName([
				'calendar-day',
				selectedClass,
				todayClass,
				outsideClass,
				rangeStartClass,
				rangeEndClass,
				betweenClass
			])
			const tabIndex = isFocused ? 0 : -1
			const selectedLabel = String(isSelected)
			const dayLabel = dayLabelFormatter.format(date)
			const handleDayClick = () => pickDate(date)
			const handleDayEnter = () => {
				if (hasOpenRange) setHoverIso(isoDate)
			}

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
					onpointerenter={handleDayEnter}
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
		// Each week is a row, as the grid role requires.
		const weekRows = Array.from({ length: dayCells.length / 7 }, (_, weekIndex) => (
			<div key={weekIndex} class='calendar-week' role='row'>
				{dayCells.slice(weekIndex * 7, weekIndex * 7 + 7)}
			</div>
		))

		return (
			<host shadowDom>
				<div class='calendar'>
					<div class='calendar-header' aria-live='polite' aria-label={monthLabel}>
						<div class='calendar-stepper isMonth'>
							<button class='calendar-step' aria-label='Previous month' onclick={handlePreviousMonth}>
								<IconSvg icon={caretLeftIcon} kind='bold' />
							</button>
							<span class='calendar-stepper-label'>{monthName}</span>
							<button class='calendar-step' aria-label='Next month' onclick={handleNextMonth}>
								<IconSvg icon={caretRightIcon} kind='bold' />
							</button>
						</div>
						<div class='calendar-stepper isYear'>
							<button class='calendar-step' aria-label='Previous year' onclick={handlePreviousYear}>
								<IconSvg icon={caretLeftIcon} kind='bold' />
							</button>
							<span class='calendar-stepper-label'>{yearName}</span>
							<button class='calendar-step' aria-label='Next year' onclick={handleNextYear}>
								<IconSvg icon={caretRightIcon} kind='bold' />
							</button>
						</div>
					</div>
					<div class='calendar-weekdays'>{weekdayCells}</div>
					<div ref={gridRef} class='calendar-grid' role='grid' aria-label={monthLabel} onkeydown={handleGridKeyDown}>
						<span ref={indicatorRef} class='slide-indicator calendar-indicator' aria-hidden='true'></span>
						{weekRows}
					</div>
				</div>
			</host>
		)
	},
	{
		props: {
			mode: { type: String, reflect: true, value: (): CalendarModeT => 'single' },
			value: { type: String, reflect: true },
			// Range mode reads and writes start and end.
			start: { type: String, reflect: true },
			end: { type: String, reflect: true },
			min: String,
			max: String,
			locale: String,
			weekStart: { type: Number, value: (): number => 0 }
		},
		styles: [foundationSheet, calendarSheet]
	}
)
