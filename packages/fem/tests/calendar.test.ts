import { userEvent } from '@vitest/browser/context'
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, inShadow, mount, settle } from './helpers'

afterEach(cleanup)

type CalendarT = HTMLElement & { value: string; start: string; end: string }

const day = (calendar: HTMLElement, iso: string) => {
	const [year, month, date] = iso.split('-').map(Number)
	const label = new Intl.DateTimeFormat(undefined, { dateStyle: 'full' }).format(new Date(year, month - 1, date))
	return calendar.shadowRoot!.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`)!
}

const focusedLabel = (calendar: HTMLElement) =>
	calendar.shadowRoot!.activeElement?.getAttribute('aria-label')

const labelFor = (year: number, month: number, date: number) =>
	new Intl.DateTimeFormat(undefined, { dateStyle: 'full' }).format(new Date(year, month - 1, date))

describe('fem-calendar', () => {
	it('picks a day and sends change', async () => {
		const calendar = mount<CalendarT>('<fem-calendar value="2026-11-13"></fem-calendar>')
		await settle()
		let changes = 0
		calendar.addEventListener('change', () => changes++)
		day(calendar, '2026-11-20').click()
		await settle()
		expect(calendar.value).toBe('2026-11-20')
		expect(changes).toBe(1)
		expect(day(calendar, '2026-11-20').getAttribute('aria-selected')).toBe('true')
	})

	it('disables days outside min and max', async () => {
		const calendar = mount<CalendarT>('<fem-calendar value="2026-11-13" min="2026-11-10" max="2026-11-20"></fem-calendar>')
		await settle()
		expect(day(calendar, '2026-11-09').disabled).toBe(true)
		expect(day(calendar, '2026-11-15').disabled).toBe(false)
		day(calendar, '2026-11-09').click()
		await settle()
		expect(calendar.value).toBe('2026-11-13')
	})

	it('arrow keys move focus by day and week', async () => {
		const calendar = mount<CalendarT>('<fem-calendar value="2026-11-13"></fem-calendar>')
		await settle()
		day(calendar, '2026-11-13').focus()
		await userEvent.keyboard('{ArrowRight}')
		await settle()
		expect(focusedLabel(calendar)).toBe(labelFor(2026, 11, 14))
		await userEvent.keyboard('{ArrowDown}')
		await settle()
		expect(focusedLabel(calendar)).toBe(labelFor(2026, 11, 21))
		await userEvent.keyboard('{ArrowLeft}{ArrowUp}')
		await settle()
		expect(focusedLabel(calendar)).toBe(labelFor(2026, 11, 13))
	})

	it('Page Down moves a month', async () => {
		const calendar = mount<CalendarT>('<fem-calendar value="2026-11-13"></fem-calendar>')
		await settle()
		day(calendar, '2026-11-13').focus()
		await userEvent.keyboard('{PageDown}')
		await settle()
		expect(focusedLabel(calendar)).toBe(labelFor(2026, 12, 13))
	})

	it('keeps one tab stop in the grid', async () => {
		const calendar = mount<CalendarT>('<fem-calendar value="2026-11-13"></fem-calendar>')
		await settle()
		const stops = inShadow(calendar, '.calendar-grid').querySelectorAll('button[tabindex="0"]')
		expect(stops.length).toBe(1)
	})

	it('range mode: two picks make a range, in either order', async () => {
		const calendar = mount<CalendarT>('<fem-calendar mode="range" start="2026-11-20"></fem-calendar>')
		await settle()
		let changes = 0
		calendar.addEventListener('change', () => changes++)
		day(calendar, '2026-11-10').click()
		await settle()
		expect(calendar.start).toBe('2026-11-10')
		expect(calendar.end).toBe('2026-11-20')
		expect(changes).toBe(1)
	})

	it('range mode: a third pick starts over', async () => {
		const calendar = mount<CalendarT>('<fem-calendar mode="range" start="2026-11-10"></fem-calendar>')
		await settle()
		day(calendar, '2026-11-12').click()
		await settle()
		expect([calendar.start, calendar.end]).toEqual(['2026-11-10', '2026-11-12'])
		day(calendar, '2026-11-15').click()
		await settle()
		expect([calendar.start, calendar.end]).toEqual(['2026-11-15', ''])
	})
})
