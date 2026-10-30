import { svelte } from '@sveltejs/vite-plugin-svelte'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const fromRoot = (path: string) => fileURLToPath(new URL(`../../${path}`, import.meta.url))

// pianist runs on the package's source, so a fix in a
// component shows up here with no publish step.
const sourceAliases = [
	{ find: /^@tasteee\/fem\/tokens\.css$/, replacement: fromRoot('packages/fem/src/tokens.css') },
	{ find: /^@tasteee\/fem\/icons$/, replacement: fromRoot('packages/fem/src/icons/index.ts') },
	{ find: /^@tasteee\/fem\/foundation$/, replacement: fromRoot('packages/fem/src/foundation/index.ts') },
	{ find: /^@tasteee\/fem$/, replacement: fromRoot('packages/fem/src/index.ts') },
	{ find: /^@tasteee\/midi-piano$/, replacement: fromRoot('packages/midi-piano/src/index.ts') }
]

export default defineConfig({
	plugins: [svelte()],
	resolve: { alias: sourceAliases },
	server: { port: 5300 },
	// Relative paths, so it works from a subfolder of
	// GitHub Pages like /fem/pianist/.
	base: './',
	build: { outDir: 'dist', emptyOutDir: true },
	test: { include: ['src/**/*.test.ts'] }
})
