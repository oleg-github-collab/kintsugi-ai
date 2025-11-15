package translation

import (
	"errors"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) *Repository {
	return &Repository{db: db}
}

func (r *Repository) CreateTranslation(translation *Translation) error {
	return r.db.Create(translation).Error
}

func (r *Repository) GetTranslationByID(id uuid.UUID, userID uuid.UUID) (*Translation, error) {
	var translation Translation
	err := r.db.Where("id = ? AND user_id = ?", id, userID).First(&translation).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("translation not found")
		}
		return nil, err
	}
	return &translation, nil
}

func (r *Repository) GetUserTranslations(userID uuid.UUID, limit, offset int) ([]Translation, error) {
	var translations []Translation
	err := r.db.Where("user_id = ?", userID).
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&translations).Error

	return translations, err
}

func (r *Repository) UpdateTranslation(translation *Translation) error {
	return r.db.Save(translation).Error
}

func (r *Repository) DeleteTranslation(id uuid.UUID, userID uuid.UUID) error {
	result := r.db.Where("id = ? AND user_id = ?", id, userID).Delete(&Translation{})
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return errors.New("translation not found")
	}
	return nil
}
