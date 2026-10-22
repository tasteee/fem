import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

const a11yCodes = ['a11y_click_events_have_key_events', 'a11y_no_static_element_interactions']

export default {
	preprocess: vitePreprocess(),
	compilerOptions: {
		// fem components handle keys and roles themselves, so
		// clicks on them are not a problem. Plain elements still warn.
		warningFilter: (warning) => !(a11yCodes.includes(warning.code) && warning.message.includes('<fem-'))
	}
}
