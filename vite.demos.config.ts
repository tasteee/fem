import { defineConfig } from 'vite'

// Builds the docs page and the example apps as a
// static site in demos/, ready for GitHub Pages.
export default defineConfig({
	// Relative paths, so the site works from a
	// subfolder like /fem/.
	base: './',
	build: {
		outDir: 'demos',
		emptyOutDir: true,
		rollupOptions: {
			input: {
				docs: 'index.html',
				notes: 'notes/index.html'
			}
		}
	}
})
