package model

import (
	"database/sql"

	"github.com/lib/pq"
)

// KidsGiftBox represents a gift box for kids.
type KidsGiftBox struct {
	ID          int      `json:"id"`
	Title       string   `json:"title"`
	Description string   `json:"description"`
	Contains    string   `json:"contains"`
	Notes       string   `json:"notes"`
	Images      []string `json:"images"`
	Price       float64  `json:"price"`
}

// CreateKidsGiftBox inserts a new KidsGiftBox into the database and returns the created box.
func CreateKidsGiftBox(db *sql.DB, box KidsGiftBox) (KidsGiftBox, error) {
	query := `INSERT INTO kids_gift_boxes (title, description, contains, notes, images, price) 
	          VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`
	err := db.QueryRow(query, box.Title, box.Description, box.Contains, box.Notes, pq.Array(box.Images), box.Price).Scan(&box.ID)
	if err != nil {
		return KidsGiftBox{}, err
	}
	return box, nil
}

// CreateKidsGiftBoxesTable creates the kids_gift_boxes table if it doesn't exist.
func CreateKidsGiftBoxesTable(db *sql.DB) error {
	query := `
    CREATE TABLE IF NOT EXISTS kids_gift_boxes (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,         -- ✅ Added column
        description TEXT NOT NULL,
        contains TEXT,
        notes TEXT,
        images TEXT[],
        price NUMERIC(10,2) NOT NULL
    )`
	_, err := db.Exec(query)
	return err
}

// Create inserts a new KidsGiftBox into the database.
func (k *KidsGiftBox) Create(db *sql.DB) error {
	query := `INSERT INTO kids_gift_boxes (title, description, contains, notes, images, price) 
	          VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`
	err := db.QueryRow(query, k.Title, k.Description, k.Contains, k.Notes, pq.Array(k.Images), k.Price).Scan(&k.ID)
	return err
}

// GetKidsGiftBoxByID retrieves a KidsGiftBox by its ID.
func GetKidsGiftBoxByID(db *sql.DB, id int) (*KidsGiftBox, error) {
	query := `SELECT id, title, description, contains, notes, images, price 
	          FROM kids_gift_boxes WHERE id = $1`
	var k KidsGiftBox
	var images []string
	err := db.QueryRow(query, id).Scan(&k.ID, &k.Title, &k.Description, &k.Contains, &k.Notes, pq.Array(&images), &k.Price)
	if err != nil {
		return nil, err
	}
	k.Images = images
	return &k, nil
}

// GetAllKidsGiftBoxes retrieves all KidsGiftBoxes from the database.
func GetAllKidsGiftBoxes(db *sql.DB) ([]KidsGiftBox, error) {
	query := `SELECT id, title, description, contains, notes, images, price FROM kids_gift_boxes`
	rows, err := db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var boxes []KidsGiftBox
	for rows.Next() {
		var k KidsGiftBox
		var images []string
		if err := rows.Scan(&k.ID, &k.Title, &k.Description, &k.Contains, &k.Notes, pq.Array(&images), &k.Price); err != nil {
			return nil, err
		}
		k.Images = images
		boxes = append(boxes, k)
	}
	return boxes, nil
}
