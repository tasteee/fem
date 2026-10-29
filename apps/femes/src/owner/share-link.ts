import { showToast } from '@tasteee/fem'

// Shares any femes path: the phone's share sheet where
// there is one, a copied link everywhere else.
export const shareLink = async (path: string, title: string) => {
	const url = `${window.location.origin}${path}`
	const canShare = typeof navigator.share === 'function'

	if (!canShare) {
		await navigator.clipboard.writeText(url)
		showToast('Link copied')
		return
	}

	try {
		await navigator.share({ title, url })
	} catch (shareError) {
		// Closing the share sheet throws. Nothing to do.
		const wasDismissed = shareError instanceof DOMException && shareError.name === 'AbortError'
		if (!wasDismissed) console.warn('femes: share failed', shareError)
	}
}
