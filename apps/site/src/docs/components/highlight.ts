// Tiny HTML highlighter for the docs code blocks. The
// examples are all HTML, so tags, attribute names,
// attribute values and punctuation are all it needs.

const escapeText = (text: string): string => {
	return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

const wrap = (kind: string, text: string): string => {
	return `<span class="tok-${kind}">${escapeText(text)}</span>`
}

const highlightAttributes = (attributeText: string): string => {
	const attributePattern = /([^\s=]+)(?:(=)("[^"]*"|'[^']*'))?|(\s+)/g
	return attributeText.replace(attributePattern, (match, name, equals, value, space) => {
		if (space) return space
		if (!equals) return wrap('attr', name)
		return wrap('attr', name) + wrap('punct', equals) + wrap('value', value)
	})
}

const tagPattern = /(<\/?)([a-zA-Z][\w-]*)([^>]*?)(\/?>)/g

export const highlightHtml = (source: string): string => {
	let result = ''
	let cursor = 0
	for (const match of source.matchAll(tagPattern)) {
		const [whole, open, name, attributes, close] = match
		result += escapeText(source.slice(cursor, match.index))
		result += wrap('punct', open) + wrap('tag', name) + highlightAttributes(attributes) + wrap('punct', close)
		cursor = match.index + whole.length
	}
	return result + escapeText(source.slice(cursor))
}
