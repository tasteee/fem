import { defineConfig } from 'vitest/config'

// Components run in a real browser: shadow DOM, form
// association, and the dialog element don't work in jsdom.
export default defineConfig({
	optimizeDeps: { include: ['atomico', 'atomico/jsx-dev-runtime'] },
	test: {
		include: ['tests/**/*.test.ts'],
		browser: {
			enabled: true,
			headless: true,
			provider: 'playwright',
			name: 'chromium',
			providerOptions: {
				launch: { executablePath: process.env.CHROMIUM_PATH || undefined }
			}
		}
	}
})
