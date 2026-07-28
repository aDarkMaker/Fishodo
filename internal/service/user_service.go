package service

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"time"

	"fishodo/internal/model"
	"fishodo/internal/store"
)

type UserService struct {
	userStore *store.UserStore
}

func NewUserService(userStore *store.UserStore) *UserService {
	return &UserService{userStore: userStore}
}

func (s *UserService) Register(name string) (*model.User, error) {
	codeID, err := generateCodeID()
	if err != nil {
		return nil, fmt.Errorf("generate code id: %w", err)
	}

	user := &model.User{
		CodeID:   codeID,
		Name:     name,
		Gender:   model.GenderOther,
		Birthday: time.Now(),
	}

	if err := s.userStore.Create(user); err != nil {
		return nil, fmt.Errorf("create user: %w", err)
	}
	return user, nil
}

func (s *UserService) GetProfile(codeID string) (*model.UserProfile, error) {
	user, err := s.userStore.GetByCodeID(codeID)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, fmt.Errorf("user not found")
	}
	return user.ToProfile(), nil
}

func (s *UserService) UpdateProfile(codeID string, profile *model.UserProfile) error {
	user, err := s.userStore.GetByCodeID(codeID)
	if err != nil {
		return err
	}
	if user == nil {
		return fmt.Errorf("user not found")
	}

	user.Name = profile.Name
	user.QQ = profile.QQ
	user.Phone = profile.Phone
	user.Signature = profile.Signature
	user.Gender = profile.Gender

	if profile.Birthday != "" {
		birthday, err := time.Parse("2006-01-02", profile.Birthday)
		if err != nil {
			return fmt.Errorf("parse birthday: %w", err)
		}
		user.Birthday = birthday
	}

	return s.userStore.Update(user)
}

func (s *UserService) DeleteAccount(codeID string) error {
	return s.userStore.Delete(codeID)
}

func generateCodeID() (string, error) {
	bytes := make([]byte, 8)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}
