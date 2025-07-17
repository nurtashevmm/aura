-- Create pending_topups table for OCR payment verification (SQLite compatible)
CREATE TABLE pending_topups (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    expected_amount INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'rejected', 'error')),
    matched_cheque_data TEXT,
    file_url TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Index for faster pending status lookups
CREATE INDEX idx_pending_topups_status ON pending_topups(status);
CREATE INDEX idx_pending_topups_user ON pending_topups(user_id);
