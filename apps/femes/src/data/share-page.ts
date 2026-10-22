// Opens the phone's share sheet for this page, or
// copies the link where there is no share sheet.
export const sharePage = async (title: string) => {
	const pageUrl = window.location.href
	const canShare = typeof navigator.share === 'function'
	if (!canShare) return navigator.clipboard.writeText(pageUrl)

	try {
		await navigator.share({ title, url: pageUrl })
	} catch (shareError) {
		// Closing the share sheet throws. Nothing to do.
		const wasDismissed = shareError instanceof DOMException && shareError.name === 'AbortError'
		if (!wasDismissed) console.warn('femes: share failed', shareError)
	}
}
