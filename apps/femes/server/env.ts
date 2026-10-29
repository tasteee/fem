// What Cloudflare hands the worker. DB and MEDIA are the
// bindings on the femes Pages project. The rest are
// environment variables set in its settings.
export type EnvT = {
	DB: D1Database
	MEDIA: R2Bucket
	ASSETS: Fetcher
	// Resend API key for sign-in emails. Secret.
	RESEND_API_KEY?: string
	// Sender, like "femes <hello@yourdomain.com>".
	MAIL_FROM?: string
	// "true" only on your own machine: sign-in links are
	// returned on screen instead of emailed.
	DEV_SHOW_LINKS?: string
}
