import { defineConfig } from 'vite'

export default defineConfig({
	build: {
		lib: {
			entry: { 'fem-media': 'src/index.ts' },
			formats: ['es']
		},
		rollupOptions: {
			// fem and atomico come from the app, so there's
			// only ever one copy of each.
			external: [/^atomico/, /^@tasteee\/fem/]
		}
	}
})
