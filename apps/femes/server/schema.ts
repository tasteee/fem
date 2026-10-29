import initialSql from '../migrations/0001_initial.sql'
import authSql from '../migrations/0002_auth.sql'
import socialSql from '../migrations/0003_social.sql'
import type { EnvT } from './env'

// Brings the database up to date on the first request,
// so a fresh deploy needs no command line. Each file in
// migrations/ runs once, in order, and is recorded.

const migrations = [
	{ name: '0001_initial.sql', sql: initialSql },
	{ name: '0002_auth.sql', sql: authSql },
	{ name: '0003_social.sql', sql: socialSql }
]

let readyPromise: Promise<void> | undefined

const splitStatements = (sql: string): string[] => {
	const withoutComments = sql.replace(/--.*$/gm, '')
	const statements = withoutComments.split(';').map((statement) => statement.trim())
	return statements.filter((statement) => statement !== '')
}

const listApplied = async (env: EnvT): Promise<Set<string>> => {
	// Wrangler records migrations in d1_migrations. Using
	// the same table means local and remote stay in step.
	const createSql = 'CREATE TABLE IF NOT EXISTS d1_migrations (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE, applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)'
	await env.DB.prepare(createSql).run()
	const result = await env.DB.prepare('SELECT name FROM d1_migrations').all<{ name: string }>()
	const names = result.results.map((row) => row.name)
	return new Set(names)
}

const applyMigrations = async (env: EnvT) => {
	const appliedNames = await listApplied(env)

	for (const migration of migrations) {
		const isApplied = appliedNames.has(migration.name)
		if (isApplied) continue
		const statements = splitStatements(migration.sql).map((statement) => env.DB.prepare(statement))
		const record = env.DB.prepare('INSERT INTO d1_migrations (name) VALUES (?)').bind(migration.name)
		await env.DB.batch([...statements, record])
		console.log(`femes: applied ${migration.name}`)
	}
}

// Runs once per worker instance. A failure is retried on
// the next request instead of being remembered.
export const ensureSchema = (env: EnvT): Promise<void> => {
	if (readyPromise) return readyPromise

	const clearOnFailure = (schemaError: unknown) => {
		readyPromise = undefined
		throw schemaError
	}

	readyPromise = applyMigrations(env).catch(clearOnFailure)
	return readyPromise
}
