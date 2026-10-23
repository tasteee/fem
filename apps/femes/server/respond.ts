const jsonHeaders = { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }

export const respondJson = (body: unknown, status = 200): Response => {
	const text = JSON.stringify(body)
	return new Response(text, { status, headers: jsonHeaders })
}

export const respondMissing = (): Response => respondJson({ error: 'not-found' }, 404)

export const respondMoved = (path: string): Response => respondJson({ movedTo: path }, 200)

export const respondError = (status: number, error: string): Response => respondJson({ error }, status)

export const readJson = async <T>(request: Request): Promise<T | undefined> => {
	try {
		return (await request.json()) as T
	} catch {
		return undefined
	}
}
