import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, inShadow, mount, settle } from './helpers'

afterEach(cleanup)

type PickerT = HTMLElement & { value: string; open: boolean }

const pickDay = (picker: PickerT, iso: string) => {
	const calendar = inShadow(picker, 'fem-calendar')
	const [year, month, date] = iso.split('-').map(Number)
	const label = new Intl.DateTimeFormat(undefined, { dateStyle: 'full' }).format(new Date(year, month - 1, date))
	calendar.shadowRoot!.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`)!.click()
}

describe('fem-date-picker', () => {
	it('shows the placeholder, then the formatted value', async () => {
		const picker = mount<PickerT>('<fem-date-picker placeholder="Pick one"></fem-date-picker>')
		await settle()
		expect(inShadow(picker, '.date-picker-label').textContent).toBe('Pick one')
		picker.value = '2026-11-13'
		await settle()
		expect(inShadow(picker, '.date-picker-label').textContent).toContain('2026')
	})

	it('announces a dialog popup on the trigger', async () => {
		const picker = mount<PickerT>('<fem-date-picker label="Release date"></fem-date-picker>')
		await settle()
		const trigger = inShadow(picker, 'button')
		expect(trigger.getAttribute('aria-haspopup')).toBe('dialog')
		expect(trigger.getAttribute('aria-expanded')).toBe('false')
	})

	it('opens on click', async () => {
		const picker = mount<PickerT>('<fem-date-picker value="2026-11-13"></fem-date-picker>')
		await settle()
		inShadow<HTMLButtonElement>(picker, 'button').click()
		await settle()
		expect(picker.open).toBe(true)
		expect(inShadow(picker, 'button').getAttribute('aria-expanded')).toBe('true')
	})

	it('picking a day sets the value, sends one change, and closes', async () => {
		const picker = mount<PickerT>('<fem-date-picker value="2026-11-13"></fem-date-picker>')
		await settle()
		let changes = 0
		picker.addEventListener('change', () => changes++)
		inShadow<HTMLButtonElement>(picker, 'button').click()
		await settle()
		pickDay(picker, '2026-11-20')
		await settle()
		expect(picker.value).toBe('2026-11-20')
		expect(changes).toBe(1)
		expect(picker.open).toBe(false)
	})

	it('submits the ISO value with the form and resets', async () => {
		const form = mount<HTMLFormElement>('<form><fem-date-picker name="when" value="2026-11-13"></fem-date-picker></form>')
		await settle()
		const picker = form.querySelector('fem-date-picker') as PickerT
		picker.value = '2026-12-01'
		await settle()
		expect(new FormData(form).get('when')).toBe('2026-12-01')
		form.reset()
		await settle()
		expect(new FormData(form).get('when')).toBe('2026-11-13')
	})

	it('blocks submit when required and empty', async () => {
		const form = mount<HTMLFormElement>('<form><fem-date-picker name="when" required></fem-date-picker></form>')
		await settle()
		expect(form.checkValidity()).toBe(false)
	})
})
