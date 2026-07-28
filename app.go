package main

import (
	"context"
	"fmt"

	"fishodo/internal/model"
	"fishodo/internal/service"
	"fishodo/internal/store"
)

type App struct {
	ctx         context.Context
	db          *store.DB
	userService *service.UserService
	taskService *service.TaskService
	currentUser *model.User
}

func NewApp() *App {
	return &App{}
}

func (a *App) startup(ctx context.Context) {
	a.ctx = ctx

	db, err := store.NewDB()
	if err != nil {
		fmt.Printf("failed to init db: %v\n", err)
		return
	}
	a.db = db

	userStore := store.NewUserStore(db)
	taskStore := store.NewTaskStore(db)
	a.userService = service.NewUserService(userStore)
	a.taskService = service.NewTaskService(taskStore, userStore)
}

func (a *App) beforeClose(ctx context.Context) bool {
	if a.db != nil {
		a.db.Close()
	}
	return false
}

// --- User API ---

func (a *App) Register(name string) (*model.User, error) {
	user, err := a.userService.Register(name)
	if err != nil {
		return nil, err
	}
	a.currentUser = user
	return user, nil
}

func (a *App) Login(codeID string) (*model.UserProfile, error) {
	profile, err := a.userService.GetProfile(codeID)
	if err != nil {
		return nil, err
	}
	user, _ := a.userService.GetProfile(codeID)
	if user != nil {
		a.currentUser = &model.User{CodeID: codeID}
	}
	return profile, nil
}

func (a *App) GetProfile() (*model.UserProfile, error) {
	if a.currentUser == nil {
		return nil, fmt.Errorf("not logged in")
	}
	return a.userService.GetProfile(a.currentUser.CodeID)
}

func (a *App) UpdateProfile(profile *model.UserProfile) error {
	if a.currentUser == nil {
		return fmt.Errorf("not logged in")
	}
	return a.userService.UpdateProfile(a.currentUser.CodeID, profile)
}

func (a *App) Logout() {
	a.currentUser = nil
}

// --- Task API ---

func (a *App) CreateTask(input *model.TaskInput) (*model.Task, error) {
	if a.currentUser == nil {
		return nil, fmt.Errorf("not logged in")
	}
	return a.taskService.CreateTask(a.currentUser.CodeID, input)
}

func (a *App) GetTasks(includeCompleted bool) ([]*model.Task, error) {
	if a.currentUser == nil {
		return nil, fmt.Errorf("not logged in")
	}
	return a.taskService.GetTasks(a.currentUser.CodeID, includeCompleted)
}

func (a *App) GetLocalCompletedTasks() ([]*model.Task, error) {
	if a.currentUser == nil {
		return nil, fmt.Errorf("not logged in")
	}
	return a.taskService.GetLocalCompletedTasks(a.currentUser.CodeID)
}

func (a *App) UpdateTask(taskID string, input *model.TaskInput) (*model.Task, error) {
	if a.currentUser == nil {
		return nil, fmt.Errorf("not logged in")
	}
	return a.taskService.UpdateTask(taskID, input)
}

func (a *App) ToggleTaskComplete(taskID string, completed bool) (*model.Task, error) {
	if a.currentUser == nil {
		return nil, fmt.Errorf("not logged in")
	}
	return a.taskService.ToggleComplete(taskID, completed)
}

func (a *App) DeleteTask(taskID string) error {
	if a.currentUser == nil {
		return fmt.Errorf("not logged in")
	}
	return a.taskService.DeleteTask(taskID)
}

func (a *App) ClearLocalCompleted() error {
	if a.currentUser == nil {
		return fmt.Errorf("not logged in")
	}
	return a.taskService.ClearLocalCompleted(a.currentUser.CodeID)
}
