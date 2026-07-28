package store

import (
	"database/sql"
	"fmt"
	"os"
	"path/filepath"

	_ "modernc.org/sqlite"
)

type DB struct {
	*sql.DB
}

func NewDB() (*DB, error) {
	homeDir, err := os.UserHomeDir()
	if err != nil {
		return nil, fmt.Errorf("get home dir: %w", err)
	}

	dbDir := filepath.Join(homeDir, ".fishodo")
	if err := os.MkdirAll(dbDir, 0755); err != nil {
		return nil, fmt.Errorf("create db dir: %w", err)
	}

	dbPath := filepath.Join(dbDir, "fishodo.db")
	db, err := sql.Open("sqlite", dbPath+"?_pragma=foreign_keys(1)&_pragma=journal_mode(WAL)")
	if err != nil {
		return nil, fmt.Errorf("open sqlite: %w", err)
	}

	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("ping sqlite: %w", err)
	}

	store := &DB{db}
	if err := store.migrate(); err != nil {
		return nil, fmt.Errorf("migrate: %w", err)
	}

	return store, nil
}

func (db *DB) migrate() error {
	queries := []string{
		`CREATE TABLE IF NOT EXISTS users (
			code_id TEXT PRIMARY KEY,
			name TEXT NOT NULL DEFAULT '',
			qq TEXT DEFAULT '',
			phone TEXT DEFAULT '',
			signature TEXT DEFAULT '',
			gender TEXT DEFAULT 'other',
			birthday DATE,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
		)`,
		`CREATE TABLE IF NOT EXISTS tasks (
			id TEXT PRIMARY KEY,
			user_code_id TEXT NOT NULL,
			title TEXT NOT NULL,
			description TEXT DEFAULT '',
			category_tag TEXT DEFAULT '',
			priority INTEGER DEFAULT 1,
			duration_type TEXT DEFAULT 'single_day',
			start_date DATE NOT NULL,
			end_date DATE,
			completed BOOLEAN DEFAULT FALSE,
			completed_at DATETIME,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			synced BOOLEAN DEFAULT FALSE,
			FOREIGN KEY (user_code_id) REFERENCES users(code_id) ON DELETE CASCADE
		)`,
		`CREATE INDEX IF NOT EXISTS idx_tasks_user_code_id ON tasks(user_code_id)`,
		`CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed)`,
		`CREATE INDEX IF NOT EXISTS idx_tasks_start_date ON tasks(start_date)`,
		`CREATE INDEX IF NOT EXISTS idx_tasks_synced ON tasks(synced)`,
	}

	for _, q := range queries {
		if _, err := db.Exec(q); err != nil {
			return err
		}
	}
	return nil
}

func (db *DB) Close() error {
	return db.DB.Close()
}
