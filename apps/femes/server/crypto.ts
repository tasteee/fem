const toBase64Url = (bytes: Uint8Array): string => {
	let binary = ''
	for (const byte of bytes) binary += String.fromCharCode(byte)
	return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

// 32 random bytes: unguessable sign-in and session tokens.
export const createToken = (): string => {
	const bytes = new Uint8Array(32)
	crypto.getRandomValues(bytes)
	return toBase64Url(bytes)
}

export const hashToken = async (token: string): Promise<string> => {
	const data = new TextEncoder().encode(token)
	const digest = await crypto.subtle.digest('SHA-256', data)
	return toBase64Url(new Uint8Array(digest))
}

export const createId = (prefix: string): string => `${prefix}_${crypto.randomUUID().replace(/-/g, '')}`
