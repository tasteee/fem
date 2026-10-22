import { defineConfig } from 'vite'

export default defineConfig({
	build: {
		lib: {
			// The icon set is its own file, so apps that
			// import a few icons leave the rest behind.
			// Foundation is shared with extension packages
			// like fem-media, so they build the same way.
			entry: { fem: 'src/index.ts', icons: 'src/icons/index.ts', foundation: 'src/foundation/index.ts' },
			formats: ['es']
		},
		rollupOptions: {
			// Apps and extension packages share one copy.
			external: [/^atomico/]
		}
	}
})
