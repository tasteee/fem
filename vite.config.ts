import { defineConfig } from 'vite'

export default defineConfig({
	build: {
		lib: {
			// The icon set is its own file, so apps that
			// import a few icons leave the rest behind.
			entry: { fem: 'src/index.ts', icons: 'src/icons/index.ts' },
			formats: ['es']
		}
	}
})
