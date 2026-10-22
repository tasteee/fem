// Plain calendar dates, in local time, written as
// ISO strings like 2026-10-21. No time of day, so no
// time zone surprises.

export type CalendarDateT = { year: number; month: number; day: number }

const padNumber = (value: number, width: number): string => String(value).padStart(width, '0')

export const toIsoDate = (date: Date): string => {
	const year = padNumber(date.getFullYear(), 4)
	const month = padNumber(date.getMonth() + 1, 2)
	const day = padNumber(date.getDate(), 2)
	return `${year}-${month}-${day}`
}

export const parseIsoDate = (isoDate: string | undefined): Date | undefined => {
	if (!isoDate) return undefined
	const parts = isoDate.split('-').map(Number)
	const hasThreeParts = parts.length === 3
	if (!hasThreeParts) return undefined
	const date = new Date(parts[0], parts[1] - 1, parts[2])
	const isValid = !Number.isNaN(date.getTime())
	if (!isValid) return undefined
	return date
}

export const addDays = (date: Date, dayCount: number): Date => {
	return new Date(date.getFullYear(), date.getMonth(), date.getDate() + dayCount)
}

// Keeps the day when it can, so Jan 31 plus one
// month lands on the last day of February.
export const addMonths = (date: Date, monthCount: number): Date => {
	const targetMonthStart = new Date(date.getFullYear(), date.getMonth() + monthCount, 1)
	const lastDayOfTarget = new Date(targetMonthStart.getFullYear(), targetMonthStart.getMonth() + 1, 0).getDate()
	const day = Math.min(date.getDate(), lastDayOfTarget)
	return new Date(targetMonthStart.getFullYear(), targetMonthStart.getMonth(), day)
}

export const getMonthStart = (date: Date): Date => new Date(date.getFullYear(), date.getMonth(), 1)

export const checkSameMonth = (firstDate: Date, secondDate: Date): boolean => {
	const isSameYear = firstDate.getFullYear() === secondDate.getFullYear()
	const isSameMonth = firstDate.getMonth() === secondDate.getMonth()
	return isSameYear && isSameMonth
}

// The six weeks shown for a month, starting on the
// chosen first day of the week.
export const buildMonthGrid = (monthStart: Date, weekStart: number): Date[] => {
	const leadingDayCount = (monthStart.getDay() - weekStart + 7) % 7
	const gridStart = addDays(monthStart, -leadingDayCount)
	return Array.from({ length: 42 }, (_, dayOffset) => addDays(gridStart, dayOffset))
}

export const checkDateInRange = (isoDate: string, minimum: string | undefined, maximum: string | undefined): boolean => {
	const isBeforeMinimum = Boolean(minimum) && isoDate < (minimum ?? '')
	if (isBeforeMinimum) return false
	const isAfterMaximum = Boolean(maximum) && isoDate > (maximum ?? '')
	return !isAfterMaximum
}
