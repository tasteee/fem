import { userEvent } from '@vitest/browser/context'
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, inShadow, mount, settle } from './helpers'

afterEach(cleanup)

type ComboboxT = HTMLElement & { value: string }

const keys = `
	<fem-combobox name="key" placeholder="Type a key">
		<fem-option value="d-minor">D minor</fem-option>
		<fem-option value="f-minor">F minor</fem-option>
		<fem-option value="c-major">C major</fem-option>
	</fem-combobox>`

const setup = async () => {
	const combobox = mount<ComboboxT>(keys)
	await settle()
	const input = inShadow<HTMLInputElement>(combobox, 'input')
	input.focus()
	return { combobox, input }
}

const visibleValues = (combobox: HTMLElement) =>
	[...combobox.querySelectorAll<HTMLElement & { value: string }>('fem-option')]
		.filter((option) => !option.hidden)
		.map((option) => option.value)

describe('fem-combobox', () => {
	it('has combobox semantics and starts closed', async () => {
		const { input } = await setup()
		expect(input.getAttribute('role')).toBe('combobox')
		expect(input.getAttribute('aria-expanded')).toBe('false')
	})

	it('filters options as you type', async () => {
		const { combobox, input } = await setup()
		await userEvent.keyboard('minor')
		await settle()
		expect(input.getAttribute('aria-expanded')).toBe('true')
		expect(visibleValues(combobox)).toEqual(['d-minor', 'f-minor'])
	})

	it('shows empty text when nothing matches', async () => {
		const { combobox } = await setup()
		await userEvent.keyboard('zzz')
		await settle()
		expect(visibleValues(combobox)).toEqual([])
		expect(inShadow(combobox, '.combobox-empty').textContent).toBe('No matches')
	})

	it('picks with arrow keys and Enter, and sends change', async () => {
		const { combobox, input } = await setup()
		let changes = 0
		combobox.addEventListener('change', () => changes++)
		await userEvent.keyboard('{ArrowDown}{ArrowDown}{Enter}')
		await settle()
		expect(combobox.value).toBe('f-minor')
		expect(input.value).toBe('F minor')
		expect(changes).toBe(1)
		expect(input.getAttribute('aria-expanded')).toBe('false')
	})

	it('Escape closes and restores the chosen label', async () => {
		const { combobox, input } = await setup()
		combobox.value = 'c-major'
		await settle()
		await userEvent.keyboard('zz')
		await settle()
		await userEvent.keyboard('{Escape}')
		await settle()
		expect(input.getAttribute('aria-expanded')).toBe('false')
		expect(input.value).toBe('C major')
	})

	it('submits the chosen value with the form', async () => {
		const form = mount<HTMLFormElement>(`<form>${keys}</form>`)
		await settle()
		;(form.querySelector('fem-combobox') as ComboboxT).value = 'd-minor'
		await settle()
		expect(new FormData(form).get('key')).toBe('d-minor')
	})

	it('blocks submit when required and empty', async () => {
		const form = mount<HTMLFormElement>('<form><fem-combobox name="k" required><fem-option value="a">A</fem-option></fem-combobox></form>')
		await settle()
		expect(form.checkValidity()).toBe(false)
	})
})
