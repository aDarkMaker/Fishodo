package store

import (
	"database/sql"
	"time"

	"fishodo/internal/model"
)

type UserStore struct {
	db *DB
}

func NewUserStore(db *DB) *UserStore {
	return &UserStore{db: db}
}

func (s *UserStore) Create(user *model.User) error {
	query := `INSERT INTO users (code_id, name, qq, phone, signature, gender, birthday, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`

	now := time.Now()
	_, err := s.db.Exec(query,
		user.CodeID, user.Name, user.QQ, user.Phone,
		user.Signature, user.Gender, user.Birthday, now, now,
	)
	return err
}

func (s *UserStore) GetByCodeID(codeID string) (*model.User, error) {
	query := `SELECT code_id, name, qq, phone, signature, gender, birthday, created_at, updated_at
		FROM users WHERE code_id = ?`

	var u model.User
	var birthday sql.NullTime
	err := s.db.QueryRow(query, codeID).Scan(
		&u.CodeID, &u.Name, &u.QQ, &u.Phone,
		&u.Signature, &u.Gender, &birthday, &u.CreatedAt, &u.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	if birthday.Valid {
		u.Birthday = birthday.Time
	}
	return &u, nil
}

func (s *UserStore) Update(user *model.User) error {
	query := `UPDATE users SET name = ?, qq = ?, phone = ?, signature = ?, gender = ?, birthday = ?, updated_at = ?
		WHERE code_id = ?`

	_, err := s.db.Exec(query,
		user.Name, user.QQ, user.Phone, user.Signature,
		user.Gender, user.Birthday, time.Now(), user.CodeID,
	)
	return err
}

func (s *UserStore) Delete(codeID string) error {
	_, err := s.db.Exec(`DELETE FROM users WHERE code_id = ?`, codeID)
	return err
}

func (s *UserStore) Exists(codeID string) (bool, error) {
	var count int
	err := s.db.QueryRow(`SELECT COUNT(1) FROM users WHERE code_id = ?`, codeID).Scan(&count)
	return count > 0, err
}
