-- Sign-in by email link. Only hashes are stored, so a
-- leaked table can't be used to sign in.

CREATE TABLE login_tokens (
	token_hash TEXT PRIMARY KEY,
	email TEXT NOT NULL,
	expires_at TEXT NOT NULL
);

CREATE TABLE sessions (
	session_hash TEXT PRIMARY KEY,
	email TEXT NOT NULL,
	expires_at TEXT NOT NULL
);

CREATE INDEX sessions_by_email ON sessions (email);
