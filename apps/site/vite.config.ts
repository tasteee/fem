import { svelte } from '@sveltejs/vite-plugin-svelte'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const fromRoot = (path: string) => fileURLToPath(new URL(`../../${path}`, import.meta.url))

// The site runs on the packages' source, so a change in
// a component shows up here with no package build step.
const sourceAliases = [
	{ find: /^@tasteee\/fem\/tokens\.css$/, replacement: fromRoot('packages/fem/src/tokens.css') },
	{ find: /^@tasteee\/fem\/icons$/, replacement: fromRoot('packages/fem/src/icons/index.ts') },
	{ find: /^@tasteee\/fem\/foundation$/, replacement: fromRoot('packages/fem/src/foundation/index.ts') },
	{ find: /^@tasteee\/fem\/custom-elements\.json$/, replacement: fromRoot('packages/fem/custom-elements.json') },
	{ find: /^@tasteee\/fem$/, replacement: fromRoot('packages/fem/src/index.ts') },
	{ find: /^@tasteee\/fem-media\/custom-elements\.json$/, replacement: fromRoot('packages/fem-media/custom-elements.json') },
	{ find: /^@tasteee\/fem-media$/, replacement: fromRoot('packages/fem-media/src/index.ts') }
]

// Builds the docs page, the component docs, and the
// example apps as a static site, ready for GitHub Pages.
export default defineConfig({
	plugins: [svelte()],
	resolve: { alias: sourceAliases },
	// Relative paths, so the site works from a
	// subfolder like /fem/.
	base: './',
	build: {
		outDir: 'demos',
		emptyOutDir: true,
		rollupOptions: {
			input: {
				docs: 'index.html',
				notes: 'notes/index.html',
				components: 'components/index.html'
			}
		}
	}
})
