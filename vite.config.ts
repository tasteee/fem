import { svelte } from '@sveltejs/vite-plugin-svelte'
import { defineConfig } from 'vite'

export default defineConfig({
	// Only the notes example uses Svelte.
	plugins: [svelte()],
	build: {
		lib: {
			// The icon set is its own file, so apps that
			// import a few icons leave the rest behind.
			entry: { fem: 'src/index.ts', icons: 'src/icons/index.ts' },
			formats: ['es']
		}
	}
})
