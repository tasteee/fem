-- Quiet signals. None of these numbers are ever shown
-- on a public page.

-- Plays per track per day. No listener data at all.
CREATE TABLE play_counts (
	track_id TEXT NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
	day TEXT NOT NULL,
	plays INTEGER NOT NULL DEFAULT 0,
	PRIMARY KEY (track_id, day)
);

-- An artist's saved songs. They feed playlists.
CREATE TABLE saves (
	artist_id TEXT NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
	track_id TEXT NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
	created_at TEXT NOT NULL DEFAULT (datetime('now')),
	PRIMARY KEY (artist_id, track_id)
);

CREATE INDEX saves_by_track ON saves (track_id);

-- Artists following artists.
CREATE TABLE follows (
	follower_id TEXT NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
	followed_id TEXT NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
	created_at TEXT NOT NULL DEFAULT (datetime('now')),
	PRIMARY KEY (follower_id, followed_id)
);

CREATE INDEX follows_by_followed ON follows (followed_id);
