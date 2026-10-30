import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const fromRoot = (path: string) => fileURLToPath(new URL(`../../${path}`, import.meta.url))

// Components run in a real browser: shadow DOM, form
// association, and the dialog element don't work in jsdom.
export default defineConfig({
	// Tests run on package source, like the docs site, so
	// fem-media finds fem with no build step.
	resolve: {
		alias: [
			{ find: /^@tasteee\/fem\/foundation$/, replacement: fromRoot('packages/fem/src/foundation/index.ts') },
			{ find: /^@tasteee\/fem\/icons$/, replacement: fromRoot('packages/fem/src/icons/index.ts') },
			{ find: /^@tasteee\/fem$/, replacement: fromRoot('packages/fem/src/index.ts') }
		]
	},
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
