package model

import "time"

type Priority int

const (
	PriorityLow    Priority = 0
	PriorityMedium Priority = 1
	PriorityHigh   Priority = 2
	PriorityUrgent Priority = 3
)

type DurationType string

const (
	DurationSingleDay DurationType = "single_day"
	DurationRange     DurationType = "range"
)

type Task struct {
	ID           string       `json:"id" db:"id"`
	UserCodeID   string       `json:"userCodeId" db:"user_code_id"`
	Title        string       `json:"title" db:"title"`
	Description  string       `json:"description" db:"description"`
	CategoryTag  string       `json:"categoryTag" db:"category_tag"`
	Priority     Priority     `json:"priority" db:"priority"`
	DurationType DurationType `json:"durationType" db:"duration_type"`
	StartDate    time.Time    `json:"startDate" db:"start_date"`
	EndDate      *time.Time   `json:"endDate,omitempty" db:"end_date"`
	Completed    bool         `json:"completed" db:"completed"`
	CompletedAt  *time.Time   `json:"completedAt,omitempty" db:"completed_at"`
	CreatedAt    time.Time    `json:"createdAt" db:"created_at"`
	UpdatedAt    time.Time    `json:"updatedAt" db:"updated_at"`
	Synced       bool         `json:"synced" db:"synced"` // false means local only
}

type TaskInput struct {
	Title        string       `json:"title"`
	Description  string       `json:"description"`
	CategoryTag  string       `json:"categoryTag"`
	Priority     Priority     `json:"priority"`
	DurationType DurationType `json:"durationType"`
	StartDate    string       `json:"startDate"`
	EndDate      string       `json:"endDate,omitempty"`
}

func (t *Task) IsRangeDuration() bool {
	return t.DurationType == DurationRange && t.EndDate != nil
}
