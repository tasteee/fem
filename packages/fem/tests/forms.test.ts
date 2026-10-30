import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, mount, settle } from './helpers'

afterEach(cleanup)

const mountForm = async (controls: string) => {
	const form = mount<HTMLFormElement>(`<form>${controls}</form>`)
	await settle()
	return form
}

describe('form controls', () => {
	it('fem-input submits its value under its name', async () => {
		const form = await mountForm('<fem-input name="title" value="safeword"></fem-input>')
		expect(new FormData(form).get('title')).toBe('safeword')
	})

	it('fem-input blocks submit when required and empty', async () => {
		const form = await mountForm('<fem-input name="title" required></fem-input>')
		expect(form.checkValidity()).toBe(false)
		const input = form.querySelector('fem-input') as HTMLElement & { value: string }
		input.value = 'x'
		await settle()
		expect(form.checkValidity()).toBe(true)
	})

	it('fem-input resets with the form', async () => {
		const form = await mountForm('<fem-input name="title" value="a"></fem-input>')
		const input = form.querySelector('fem-input') as HTMLElement & { value: string }
		input.value = 'b'
		await settle()
		form.reset()
		await settle()
		expect(new FormData(form).get('title')).toBe('a')
	})

	it('fem-checkbox submits only when checked', async () => {
		const form = await mountForm('<fem-checkbox name="terms" value="yes">I agree</fem-checkbox>')
		expect(new FormData(form).has('terms')).toBe(false)
		;(form.querySelector('fem-checkbox') as HTMLElement & { checked: boolean }).checked = true
		await settle()
		expect(new FormData(form).get('terms')).toBe('yes')
	})

	it('fem-checkbox blocks submit when required and unchecked', async () => {
		const form = await mountForm('<fem-checkbox name="terms" required>I agree</fem-checkbox>')
		expect(form.checkValidity()).toBe(false)
	})

	it('fem-switch blocks submit when required and off', async () => {
		const form = await mountForm('<fem-switch name="public" required></fem-switch>')
		expect(form.checkValidity()).toBe(false)
	})
})
