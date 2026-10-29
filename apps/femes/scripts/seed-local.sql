-- Demo rows for local runs: wrangler d1 execute femes-db --local --file scripts/seed-local.sql
INSERT INTO artists (id, slug, name, bio, email, links_json)
VALUES ('artist-tasteink', 'tasteink', 'tasteink', 'Dark pop from Texas. Songs about the things we don''t say out loud.', 'demo@example.com', '[{"label":"Instagram","url":"https://instagram.com/"}]');

INSERT INTO tracks (id, artist_id, slug, title, genre, description, visibility, audio_key, duration_seconds, position) VALUES
('track-safeword', 'artist-tasteink', 'safeword', 'safeword', 'Dark pop', 'Written at 3am in a hotel room.', 'public', 'demo/safeword.mp3', 24, 0),
('track-glass-hours', 'artist-tasteink', 'glass-hours', 'glass hours', 'Ambient', '', 'public', 'demo/glass-hours.mp3', 28, 1),
('track-low-tide', 'artist-tasteink', 'low-tide', 'low tide', 'Indie', '', 'unlisted', 'demo/low-tide.mp3', 20, 2);

INSERT INTO playlists (id, artist_id, slug, name, description, visibility)
VALUES ('playlist-drafts', 'artist-tasteink', 'late-night-drafts', 'late night drafts', 'Unfinished ideas.', 'public');

INSERT INTO playlist_tracks (playlist_id, track_id, position) VALUES
('playlist-drafts', 'track-low-tide', 0),
('playlist-drafts', 'track-safeword', 1);

INSERT INTO slug_history (artist_id, kind, old_slug, item_id)
VALUES ('artist-tasteink', 'track', 'safe-word-demo', 'track-safeword');
