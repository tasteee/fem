import { createToken, hashToken } from './crypto'
import type { EnvT } from './env'
import { readJson, respondError, respondJson } from './respond'

// Sign-in by email link. No passwords. A link works once
// and dies after 15 minutes. A session lasts 30 days.

const linkMinutes = 15
const sessionDays = 30
const sessionCookie = 'femes_session'
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const addMinutes = (minutes: number): string => new Date(Date.now() + minutes * 60_000).toISOString()

const readCookie = (request: Request, name: string): string | undefined => {
	const header = request.headers.get('cookie') ?? ''
	const pairs = header.split(';').map((pair) => pair.trim())
	const prefix = `${name}=`
	const match = pairs.find((pair) => pair.startsWith(prefix))
	return match?.slice(prefix.length)
}

// Local runs use plain http, where a Secure cookie would
// never be sent back.
const buildCookie = (url: URL, value: string, maxAgeSeconds: number): string => {
	const isHttps = url.protocol === 'https:'
	const secureFlag = isHttps ? '; Secure' : ''
	return `${sessionCookie}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSeconds}${secureFlag}`
}

// ---------- sending the link ----------

const buildEmailHtml = (link: string): string => {
	return `<p>Here's your femes sign-in link. It works once, for ${linkMinutes} minutes.</p><p><a href="${link}">Sign in to femes</a></p><p>If you didn't ask for this, ignore it.</p>`
}

const sendLinkEmail = async (env: EnvT, email: string, link: string): Promise<boolean> => {
	const canSend = Boolean(env.RESEND_API_KEY) && Boolean(env.MAIL_FROM)
	if (!canSend) return false
	const body = { from: env.MAIL_FROM, to: [email], subject: 'Your femes sign-in link', html: buildEmailHtml(link) }

	const response = await fetch('https://api.resend.com/emails', {
		method: 'POST',
		headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
		body: JSON.stringify(body)
	})

	if (!response.ok) console.error('femes: sign-in email failed', response.status, await response.text())
	return response.ok
}

export const handleRequestLink = async (request: Request, env: EnvT): Promise<Response> => {
	const input = await readJson<{ email?: string }>(request)
	const email = (input?.email ?? '').trim().toLowerCase()
	const isValid = emailPattern.test(email) && email.length <= 254
	if (!isValid) return respondError(400, 'invalid-email')

	const token = createToken()
	const tokenHash = await hashToken(token)
	const insertSql = 'INSERT INTO login_tokens (token_hash, email, expires_at) VALUES (?, ?, ?)'
	await env.DB.prepare(insertSql).bind(tokenHash, email, addMinutes(linkMinutes)).run()

	const origin = new URL(request.url).origin
	const link = `${origin}/api/auth/verify?token=${token}`
	const shouldShowLink = env.DEV_SHOW_LINKS === 'true'
	if (shouldShowLink) return respondJson({ sent: true, devLink: link })

	const wasSent = await sendLinkEmail(env, email, link)
	if (!wasSent) return respondError(503, 'email-unavailable')
	return respondJson({ sent: true })
}

// ---------- using the link ----------

const redirectTo = (url: URL, path: string, cookie?: string): Response => {
	const headers = new Headers({ location: new URL(path, url).toString() })
	if (cookie) headers.append('set-cookie', cookie)
	return new Response(null, { status: 302, headers })
}

export const handleVerifyLink = async (request: Request, env: EnvT): Promise<Response> => {
	const url = new URL(request.url)
	const token = url.searchParams.get('token') ?? ''
	const tokenHash = await hashToken(token)
	const nowText = new Date().toISOString()

	// Taking the row and deleting it in one statement makes
	// the link single-use even if clicked twice at once.
	const takeSql = 'DELETE FROM login_tokens WHERE token_hash = ? AND expires_at > ? RETURNING email'
	const row = await env.DB.prepare(takeSql).bind(tokenHash, nowText).first<{ email: string }>()
	if (!row) return redirectTo(url, '/signin?expired=1')

	const sessionToken = createToken()
	const sessionHash = await hashToken(sessionToken)
	const sessionSql = 'INSERT INTO sessions (session_hash, email, expires_at) VALUES (?, ?, ?)'
	const expiresAt = addMinutes(sessionDays * 24 * 60)
	await env.DB.prepare(sessionSql).bind(sessionHash, row.email, expiresAt).run()

	const cookie = buildCookie(url, sessionToken, sessionDays * 24 * 60 * 60)
	return redirectTo(url, '/studio', cookie)
}

export const handleSignOut = async (request: Request, env: EnvT): Promise<Response> => {
	const sessionToken = readCookie(request, sessionCookie)

	if (sessionToken) {
		const sessionHash = await hashToken(sessionToken)
		await env.DB.prepare('DELETE FROM sessions WHERE session_hash = ?').bind(sessionHash).run()
	}

	const url = new URL(request.url)
	const headers = new Headers({ 'set-cookie': buildCookie(url, '', 0) })
	return new Response(null, { status: 204, headers })
}

// The signed-in email, or undefined.
export const getSessionEmail = async (request: Request, env: EnvT): Promise<string | undefined> => {
	const sessionToken = readCookie(request, sessionCookie)
	if (!sessionToken) return undefined
	const sessionHash = await hashToken(sessionToken)
	const nowText = new Date().toISOString()
	const sql = 'SELECT email FROM sessions WHERE session_hash = ? AND expires_at > ?'
	const row = await env.DB.prepare(sql).bind(sessionHash, nowText).first<{ email: string }>()
	return row?.email
}

// Writes must come from femes itself. With SameSite
// cookies this closes cross-site request forgery.
export const checkIsSameOrigin = (request: Request): boolean => {
	const origin = request.headers.get('origin')
	const ownOrigin = new URL(request.url).origin
	return origin === ownOrigin
}
