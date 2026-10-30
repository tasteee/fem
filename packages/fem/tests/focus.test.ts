import { userEvent } from '@vitest/browser/context'
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, getDeepActiveElement, getFocusedHostText, isInsideComposed, mount, settle } from './helpers'

afterEach(cleanup)

type OpenableT = HTMLElement & { open: boolean }

const mountWithOpener = async (html: string) => {
	const wrapper = mount<HTMLElement>(`<div><button id="opener">Open</button>${html}<button id="after">After</button></div>`)
	await settle()
	const opener = document.getElementById('opener') as HTMLButtonElement
	opener.focus()
	return { opener, element: wrapper.querySelector('[data-under-test]') as OpenableT }
}

describe.each([
	['fem-dialog', '<fem-dialog data-under-test heading="Rename"><fem-input label="Name"></fem-input><fem-button slot="actions">Save</fem-button></fem-dialog>'],
	['fem-sheet', '<fem-sheet data-under-test heading="Filters"><fem-input label="Name"></fem-input><fem-button>Apply</fem-button></fem-sheet>']
])('%s focus', (_name, html) => {
	it('moves focus inside when opened', async () => {
		const { element } = await mountWithOpener(html)
		element.open = true
		await settle()
		const active = getDeepActiveElement()
		expect(isInsideComposed(element, active)).toBe(true)
	})

	// A native modal can hand focus to the browser's own UI, so
	// the contract is that Tab never reaches the page behind it.
	it('Tab never reaches the page behind it', async () => {
		const { element } = await mountWithOpener(html)
		element.open = true
		await settle()
		for (let step = 0; step < 8; step++) {
			await userEvent.tab()
			const active = getDeepActiveElement()!
			const isInside = isInsideComposed(element, active)
			const isBrowserUi = active === document.body
			expect(isInside || isBrowserUi, `Tab ${step + 1} reached the page behind the ${_name}`).toBe(true)
		}
	})

	it('makes the page behind it inert', async () => {
		const { element } = await mountWithOpener(html)
		element.open = true
		await settle()
		const after = document.getElementById('after') as HTMLButtonElement
		after.focus()
		expect(document.activeElement).not.toBe(after)
	})

	it('returns focus to the opener on close', async () => {
		const { opener, element } = await mountWithOpener(html)
		element.open = true
		await settle()
		element.open = false
		await settle()
		expect(document.activeElement).toBe(opener)
	})

	it('Escape closes it and returns focus to the opener', async () => {
		const { opener, element } = await mountWithOpener(html)
		element.open = true
		await settle()
		await userEvent.keyboard('{Escape}')
		await settle()
		expect(element.open).toBe(false)
		expect(document.activeElement).toBe(opener)
	})
})

describe('fem-menu focus', () => {
	const menuHtml = `
		<fem-menu data-under-test>
			<fem-button slot="trigger">Actions</fem-button>
			<fem-menu-item>Rename</fem-menu-item>
			<fem-menu-item disabled>Move</fem-menu-item>
			<fem-menu-item>Delete</fem-menu-item>
		</fem-menu>`

	const itemLabel = getFocusedHostText

	it('focuses the first enabled item when opened', async () => {
		const { element } = await mountWithOpener(menuHtml)
		element.open = true
		await settle()
		expect(itemLabel()).toBe('Rename')
	})

	it('arrow keys move through enabled items and wrap', async () => {
		const { element } = await mountWithOpener(menuHtml)
		element.open = true
		await settle()
		await userEvent.keyboard('{ArrowDown}')
		expect(itemLabel()).toBe('Delete')
		await userEvent.keyboard('{ArrowDown}')
		expect(itemLabel()).toBe('Rename')
		await userEvent.keyboard('{ArrowUp}')
		expect(itemLabel()).toBe('Delete')
	})

	it('Home and End jump to the ends', async () => {
		const { element } = await mountWithOpener(menuHtml)
		element.open = true
		await settle()
		await userEvent.keyboard('{End}')
		expect(itemLabel()).toBe('Delete')
		await userEvent.keyboard('{Home}')
		expect(itemLabel()).toBe('Rename')
	})

	it('Escape closes it and returns focus to the trigger', async () => {
		const { element } = await mountWithOpener(menuHtml)
		const trigger = element.querySelector('[slot="trigger"]') as HTMLElement
		trigger.focus()
		trigger.click()
		await settle()
		expect(element.open).toBe(true)
		await userEvent.keyboard('{Escape}')
		await settle()
		expect(element.open).toBe(false)
		expect(trigger.matches(':focus-within') || isInsideComposed(trigger, getDeepActiveElement())).toBe(true)
	})

	it('choosing an item closes the menu', async () => {
		const { element } = await mountWithOpener(menuHtml)
		element.open = true
		await settle()
		await userEvent.keyboard('{Enter}')
		await settle()
		expect(element.open).toBe(false)
	})
})

describe('fem-popover focus', () => {
	const popoverHtml = `
		<fem-popover data-under-test label="Rename track">
			<fem-button slot="trigger">Rename</fem-button>
			<fem-input label="Track name" value="safeword"></fem-input>
		</fem-popover>`

	it('moves focus into the panel when opened, since it is a dialog', async () => {
		const { element } = await mountWithOpener(popoverHtml)
		const trigger = element.querySelector('[slot="trigger"]') as HTMLElement
		trigger.click()
		await settle()
		const active = getDeepActiveElement()
		expect(isInsideComposed(element, active)).toBe(true)
		expect(active).not.toBe(document.body)
	})

	it('Escape closes it and returns focus to the trigger', async () => {
		const { element } = await mountWithOpener(popoverHtml)
		const trigger = element.querySelector('[slot="trigger"]') as HTMLElement
		trigger.focus()
		trigger.click()
		await settle()
		await userEvent.keyboard('{Escape}')
		await settle()
		expect(element.open).toBe(false)
		expect(isInsideComposed(trigger, getDeepActiveElement())).toBe(true)
	})
})
