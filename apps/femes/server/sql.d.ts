// esbuild bundles .sql files as plain text.
declare module '*.sql' {
	const sql: string
	export default sql
}
