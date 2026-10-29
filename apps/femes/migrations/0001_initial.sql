-- femes: artists, tracks, playlists.
-- File bytes live in R2. These rows hold their keys.

CREATE TABLE artists (
	id TEXT PRIMARY KEY,
	slug TEXT NOT NULL UNIQUE,
	name TEXT NOT NULL,
	bio TEXT NOT NULL DEFAULT '',
	email TEXT NOT NULL UNIQUE,
	avatar_key TEXT NOT NULL DEFAULT '',
	header_key TEXT NOT NULL DEFAULT '',
	links_json TEXT NOT NULL DEFAULT '[]',
	created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE tracks (
	id TEXT PRIMARY KEY,
	artist_id TEXT NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
	slug TEXT NOT NULL,
	title TEXT NOT NULL,
	genre TEXT NOT NULL DEFAULT '',
	description TEXT NOT NULL DEFAULT '',
	visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'unlisted', 'private')),
	audio_key TEXT NOT NULL,
	artwork_key TEXT NOT NULL DEFAULT '',
	duration_seconds REAL NOT NULL DEFAULT 0,
	position INTEGER NOT NULL DEFAULT 0,
	created_at TEXT NOT NULL DEFAULT (datetime('now')),
	UNIQUE (artist_id, slug)
);

CREATE INDEX tracks_by_artist ON tracks (artist_id, position);

CREATE TABLE playlists (
	id TEXT PRIMARY KEY,
	artist_id TEXT NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
	slug TEXT NOT NULL,
	name TEXT NOT NULL,
	description TEXT NOT NULL DEFAULT '',
	cover_key TEXT NOT NULL DEFAULT '',
	visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'unlisted', 'private')),
	created_at TEXT NOT NULL DEFAULT (datetime('now')),
	UNIQUE (artist_id, slug)
);

CREATE TABLE playlist_tracks (
	playlist_id TEXT NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
	track_id TEXT NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
	position INTEGER NOT NULL,
	PRIMARY KEY (playlist_id, track_id)
);

-- A renamed track or playlist keeps its old link working.
CREATE TABLE slug_history (
	artist_id TEXT NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
	kind TEXT NOT NULL CHECK (kind IN ('track', 'playlist')),
	old_slug TEXT NOT NULL,
	item_id TEXT NOT NULL,
	PRIMARY KEY (artist_id, kind, old_slug)
);
