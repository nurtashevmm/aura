-- Minimal SQLite schema
CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    pc_id INTEGER NOT NULL,
    started_at TEXT NOT NULL,
    ended_at TEXT,
    cost_per_minute REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    balance REAL NOT NULL DEFAULT 0
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_pc_id ON sessions(pc_id);
CREATE INDEX IF NOT EXISTS idx_sessions_ended_at ON sessions(ended_at);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE VIEW IF NOT EXISTS active_sessions AS
SELECT * FROM sessions WHERE ended_at IS NULL;

-- Test data
INSERT INTO users (id, username, email, balance) VALUES 
(1, 'test_user1', 'user1@test.com', 10.0),
(2, 'test_user2', 'user2@test.com', 5.0),
(3, 'test_merchant', 'merchant@test.com', 100.0);

INSERT INTO sessions (id, user_id, pc_id, started_at, ended_at, cost_per_minute) VALUES
(1, 1, 101, datetime('now', '-1 hour'), NULL, 0.05),
(2, 2, 102, datetime('now', '-30 minutes'), NULL, 0.05),
(3, 1, 101, datetime('now', '-2 hours'), datetime('now', '-1 hour'), 0.05);
