package service

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"time"

	"fishodo/internal/model"
	"fishodo/internal/store"
)

type TaskService struct {
	taskStore *store.TaskStore
	userStore *store.UserStore
}

func NewTaskService(taskStore *store.TaskStore, userStore *store.UserStore) *TaskService {
	return &TaskService{taskStore: taskStore, userStore: userStore}
}

func (s *TaskService) CreateTask(userCodeID string, input *model.TaskInput) (*model.Task, error) {
	exists, err := s.userStore.Exists(userCodeID)
	if err != nil {
		return nil, err
	}
	if !exists {
		return nil, fmt.Errorf("user not found")
	}

	startDate, err := time.Parse("2006-01-02", input.StartDate)
	if err != nil {
		return nil, fmt.Errorf("parse start date: %w", err)
	}

	var endDate *time.Time
	if input.DurationType == model.DurationRange && input.EndDate != "" {
		parsed, err := time.Parse("2006-01-02", input.EndDate)
		if err != nil {
			return nil, fmt.Errorf("parse end date: %w", err)
		}
		endDate = &parsed
	}

	id, err := generateTaskID()
	if err != nil {
		return nil, err
	}

	task := &model.Task{
		ID:           id,
		UserCodeID:   userCodeID,
		Title:        input.Title,
		Description:  input.Description,
		CategoryTag:  input.CategoryTag,
		Priority:     input.Priority,
		DurationType: input.DurationType,
		StartDate:    startDate,
		EndDate:      endDate,
		Completed:    false,
		Synced:       false,
	}

	if err := s.taskStore.Create(task); err != nil {
		return nil, fmt.Errorf("create task: %w", err)
	}
	return task, nil
}

func (s *TaskService) GetTasks(userCodeID string, includeCompleted bool) ([]*model.Task, error) {
	return s.taskStore.GetByUserCodeID(userCodeID, includeCompleted)
}

func (s *TaskService) GetLocalCompletedTasks(userCodeID string) ([]*model.Task, error) {
	return s.taskStore.GetLocalCompleted(userCodeID)
}

func (s *TaskService) UpdateTask(taskID string, input *model.TaskInput) (*model.Task, error) {
	task, err := s.taskStore.GetByID(taskID)
	if err != nil {
		return nil, err
	}
	if task == nil {
		return nil, fmt.Errorf("task not found")
	}

	task.Title = input.Title
	task.Description = input.Description
	task.CategoryTag = input.CategoryTag
	task.Priority = input.Priority
	task.DurationType = input.DurationType

	startDate, err := time.Parse("2006-01-02", input.StartDate)
	if err != nil {
		return nil, fmt.Errorf("parse start date: %w", err)
	}
	task.StartDate = startDate

	if input.DurationType == model.DurationRange && input.EndDate != "" {
		parsed, err := time.Parse("2006-01-02", input.EndDate)
		if err != nil {
			return nil, fmt.Errorf("parse end date: %w", err)
		}
		task.EndDate = &parsed
	} else {
		task.EndDate = nil
	}

	if err := s.taskStore.Update(task); err != nil {
		return nil, err
	}
	return task, nil
}

func (s *TaskService) ToggleComplete(taskID string, completed bool) (*model.Task, error) {
	task, err := s.taskStore.GetByID(taskID)
	if err != nil {
		return nil, err
	}
	if task == nil {
		return nil, fmt.Errorf("task not found")
	}

	task.Completed = completed
	if completed {
		now := time.Now()
		task.CompletedAt = &now
		task.Synced = false
	} else {
		task.CompletedAt = nil
	}

	if err := s.taskStore.Update(task); err != nil {
		return nil, err
	}
	return task, nil
}

func (s *TaskService) DeleteTask(taskID string) error {
	return s.taskStore.Delete(taskID)
}

func (s *TaskService) ClearLocalCompleted(userCodeID string) error {
	return s.taskStore.ClearLocalCompleted(userCodeID)
}

func generateTaskID() (string, error) {
	bytes := make([]byte, 12)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}
