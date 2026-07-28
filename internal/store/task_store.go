package store

import (
	"database/sql"
	"time"

	"fishodo/internal/model"
)

type TaskStore struct {
	db *DB
}

func NewTaskStore(db *DB) *TaskStore {
	return &TaskStore{db: db}
}

func (s *TaskStore) Create(task *model.Task) error {
	query := `INSERT INTO tasks (
		id, user_code_id, title, description, category_tag, priority,
		duration_type, start_date, end_date, completed, synced, created_at, updated_at
	) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`

	now := time.Now()
	_, err := s.db.Exec(query,
		task.ID, task.UserCodeID, task.Title, task.Description,
		task.CategoryTag, task.Priority, task.DurationType,
		task.StartDate, task.EndDate, task.Completed, task.Synced,
		now, now,
	)
	return err
}

func (s *TaskStore) GetByID(id string) (*model.Task, error) {
	query := `SELECT id, user_code_id, title, description, category_tag, priority,
		duration_type, start_date, end_date, completed, completed_at, synced, created_at, updated_at
		FROM tasks WHERE id = ?`

	var t model.Task
	var endDate, completedAt sql.NullTime
	err := s.db.QueryRow(query, id).Scan(
		&t.ID, &t.UserCodeID, &t.Title, &t.Description,
		&t.CategoryTag, &t.Priority, &t.DurationType,
		&t.StartDate, &endDate, &t.Completed, &completedAt,
		&t.Synced, &t.CreatedAt, &t.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	if endDate.Valid {
		t.EndDate = &endDate.Time
	}
	if completedAt.Valid {
		t.CompletedAt = &completedAt.Time
	}
	return &t, nil
}

func (s *TaskStore) GetByUserCodeID(userCodeID string, includeCompleted bool) ([]*model.Task, error) {
	query := `SELECT id, user_code_id, title, description, category_tag, priority,
		duration_type, start_date, end_date, completed, completed_at, synced, created_at, updated_at
		FROM tasks WHERE user_code_id = ?`
	args := []interface{}{userCodeID}

	if !includeCompleted {
		query += ` AND completed = FALSE`
	}
	query += ` ORDER BY priority DESC, start_date ASC, created_at ASC`

	rows, err := s.db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	return scanTasks(rows)
}

func (s *TaskStore) GetLocalCompleted(userCodeID string) ([]*model.Task, error) {
	query := `SELECT id, user_code_id, title, description, category_tag, priority,
		duration_type, start_date, end_date, completed, completed_at, synced, created_at, updated_at
		FROM tasks WHERE user_code_id = ? AND completed = TRUE AND synced = FALSE
		ORDER BY completed_at DESC`

	rows, err := s.db.Query(query, userCodeID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	return scanTasks(rows)
}

func (s *TaskStore) Update(task *model.Task) error {
	query := `UPDATE tasks SET title = ?, description = ?, category_tag = ?, priority = ?,
		duration_type = ?, start_date = ?, end_date = ?, completed = ?, completed_at = ?, synced = ?, updated_at = ?
		WHERE id = ?`

	_, err := s.db.Exec(query,
		task.Title, task.Description, task.CategoryTag, task.Priority,
		task.DurationType, task.StartDate, task.EndDate, task.Completed,
		task.CompletedAt, task.Synced, time.Now(), task.ID,
	)
	return err
}

func (s *TaskStore) Delete(id string) error {
	_, err := s.db.Exec(`DELETE FROM tasks WHERE id = ?`, id)
	return err
}

func (s *TaskStore) ClearLocalCompleted(userCodeID string) error {
	_, err := s.db.Exec(`DELETE FROM tasks WHERE user_code_id = ? AND completed = TRUE AND synced = FALSE`, userCodeID)
	return err
}

func scanTasks(rows *sql.Rows) ([]*model.Task, error) {
	var tasks []*model.Task
	for rows.Next() {
		var t model.Task
		var endDate, completedAt sql.NullTime
		err := rows.Scan(
			&t.ID, &t.UserCodeID, &t.Title, &t.Description,
			&t.CategoryTag, &t.Priority, &t.DurationType,
			&t.StartDate, &endDate, &t.Completed, &completedAt,
			&t.Synced, &t.CreatedAt, &t.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		if endDate.Valid {
			t.EndDate = &endDate.Time
		}
		if completedAt.Valid {
			t.CompletedAt = &completedAt.Time
		}
		tasks = append(tasks, &t)
	}
	return tasks, rows.Err()
}
