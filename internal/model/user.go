package model

import "time"

type Gender string

const (
	GenderMale   Gender = "male"
	GenderFemale Gender = "female"
	GenderOther  Gender = "other"
)

type User struct {
	CodeID    string    `json:"codeId" db:"code_id"`
	Name      string    `json:"name" db:"name"`
	QQ        string    `json:"qq" db:"qq"`
	Phone     string    `json:"phone" db:"phone"`
	Signature string    `json:"signature" db:"signature"`
	Gender    Gender    `json:"gender" db:"gender"`
	Birthday  time.Time `json:"birthday" db:"birthday"`
	CreatedAt time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt time.Time `json:"updatedAt" db:"updated_at"`
}

type UserProfile struct {
	CodeID    string `json:"codeId"`
	Name      string `json:"name"`
	QQ        string `json:"qq"`
	Phone     string `json:"phone"`
	Signature string `json:"signature"`
	Gender    Gender `json:"gender"`
	Birthday  string `json:"birthday"`
}

func (u *User) ToProfile() *UserProfile {
	return &UserProfile{
		CodeID:    u.CodeID,
		Name:      u.Name,
		QQ:        u.QQ,
		Phone:     u.Phone,
		Signature: u.Signature,
		Gender:    u.Gender,
		Birthday:  u.Birthday.Format("2026-01-01"),
	}
}
