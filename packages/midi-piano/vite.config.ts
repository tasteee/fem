import { defineConfig } from 'vite'

export default defineConfig({
	build: {
		lib: {
			entry: 'src/index.ts',
			formats: ['es'],
			fileName: () => 'midi-piano.js'
		},
		rollupOptions: {
			external: ['smplr']
		}
	}
})
