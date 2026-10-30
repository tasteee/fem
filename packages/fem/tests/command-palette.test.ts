import { userEvent } from '@vitest/browser/context'
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, inShadow, mount, settle } from './helpers'

afterEach(cleanup)

type PaletteT = HTMLElement & { open: boolean }

const setup = async (attrs = '') => {
	const palette = mount<PaletteT>(`
		<fem-command-palette ${attrs}>
			<fem-command-group heading="Tracks">
				<fem-command-item value="new-track">New track</fem-command-item>
				<fem-command-item value="open" keywords="dark pop">Open safeword</fem-command-item>
			</fem-command-group>
			<fem-command-group heading="Account">
				<fem-command-item value="sign-out">Sign out</fem-command-item>
				<fem-command-item value="locked" disabled>Locked</fem-command-item>
			</fem-command-group>
		</fem-command-palette>`)
	await settle()
	const input = inShadow<HTMLInputElement>(palette, 'input')
	const hiddenValues = () =>
		[...palette.querySelectorAll<HTMLElement & { value: string }>('fem-command-item')]
			.filter((item) => item.hidden)
			.map((item) => item.value)
	return { palette, input, hiddenValues }
}

describe('fem-command-palette', () => {
	it('opens with Ctrl+K and focuses the search', async () => {
		const { palette, input } = await setup()
		await userEvent.keyboard('{Control>}k{/Control}')
		await settle()
		expect(palette.open).toBe(true)
		expect(inShadow<HTMLDialogElement>(palette, 'dialog').open).toBe(true)
		expect(palette.shadowRoot!.activeElement).toBe(input)
	})

	it('Ctrl+K again closes it', async () => {
		const { palette } = await setup('open')
		await settle()
		await userEvent.keyboard('{Control>}k{/Control}')
		await settle()
		expect(palette.open).toBe(false)
	})

	it('ignores the hotkey when hotkey is empty', async () => {
		const { palette } = await setup('hotkey=""')
		await userEvent.keyboard('{Control>}k{/Control}')
		await settle()
		expect(palette.open).toBeFalsy()
	})

	it('filters by label', async () => {
		const { input, hiddenValues } = await setup('open')
		await settle()
		input.focus()
		await userEvent.keyboard('sign')
		await settle()
		expect(hiddenValues()).toEqual(['new-track', 'open', 'locked'])
	})

	it('filters by keywords', async () => {
		const { input, hiddenValues } = await setup('open')
		await settle()
		input.focus()
		await userEvent.keyboard('dark')
		await settle()
		expect(hiddenValues()).toEqual(['new-track', 'sign-out', 'locked'])
	})

	it('hides groups with no matching commands', async () => {
		const { palette, input } = await setup('open')
		await settle()
		input.focus()
		await userEvent.keyboard('sign')
		await settle()
		const groups = palette.querySelectorAll<HTMLElement>('fem-command-group')
		expect(groups[0].hidden).toBe(true)
		expect(groups[1].hidden).toBe(false)
	})

	it('shows empty text when nothing matches', async () => {
		const { palette, input } = await setup('open')
		await settle()
		input.focus()
		await userEvent.keyboard('zzzz')
		await settle()
		expect(inShadow(palette, '.command-palette-empty').textContent).toBe('No matching commands')
	})

	it('arrow keys move the highlight and skip disabled commands', async () => {
		const { palette, input } = await setup('open')
		await settle()
		input.focus()
		const activeValue = () => palette.querySelector<HTMLElement & { value: string }>('fem-command-item[active]')?.value
		expect(activeValue()).toBe('new-track')
		await userEvent.keyboard('{ArrowDown}{ArrowDown}')
		await settle()
		expect(activeValue()).toBe('sign-out')
		// Wraps past the disabled last row.
		await userEvent.keyboard('{ArrowDown}')
		await settle()
		expect(activeValue()).toBe('new-track')
	})

	it('Enter runs the highlighted command, sends select, and closes', async () => {
		const { palette, input } = await setup('open')
		await settle()
		input.focus()
		let picked = ''
		palette.addEventListener('select', (event) => (picked = (event as CustomEvent).detail.value))
		await userEvent.keyboard('{ArrowDown}{Enter}')
		await settle()
		expect(picked).toBe('open')
		expect(palette.open).toBe(false)
	})

	it('does not run a disabled command', async () => {
		const { palette } = await setup('open')
		await settle()
		let picked = 0
		palette.addEventListener('select', () => picked++)
		palette.querySelector<HTMLElement>('fem-command-item[disabled]')!.click()
		await settle()
		expect(picked).toBe(0)
		expect(palette.open).toBe(true)
	})

	it('starts fresh on each open', async () => {
		const { palette, input } = await setup('open')
		await settle()
		input.focus()
		await userEvent.keyboard('sign')
		palette.open = false
		await settle()
		palette.open = true
		await settle()
		expect(input.value).toBe('')
	})
})
