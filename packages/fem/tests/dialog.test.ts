import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, mount, settle } from './helpers'

afterEach(cleanup)

type DialogT = HTMLElement & { open: boolean }

describe('fem-dialog', () => {
	it('opens a modal dialog from the open flag', async () => {
		const dialog = mount<DialogT>('<fem-dialog heading="Delete"><p>Sure?</p></fem-dialog>')
		await settle()
		const inner = dialog.shadowRoot!.querySelector('dialog')!
		expect(inner.open).toBe(false)
		dialog.open = true
		await settle()
		expect(inner.open).toBe(true)
		expect(inner.matches(':modal')).toBe(true)
	})

	it('labels the dialog with its heading', async () => {
		const dialog = mount<DialogT>('<fem-dialog heading="Delete"></fem-dialog>')
		await settle()
		expect(dialog.shadowRoot!.querySelector('dialog')!.getAttribute('aria-label')).toBe('Delete')
	})

	it('closes on Escape and sends close', async () => {
		const dialog = mount<DialogT>('<fem-dialog heading="Delete" open></fem-dialog>')
		await settle()
		let closed = 0
		dialog.addEventListener('close', () => closed++)
		dialog.shadowRoot!.querySelector('dialog')!.close()
		await settle()
		expect(dialog.open).toBe(false)
		expect(closed).toBe(1)
	})
})
