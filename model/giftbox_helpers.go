package model

import (
	"database/sql"
	"strconv"
)

func GetKidsGiftBoxByIDStr(db *sql.DB, idStr string) (*KidsGiftBox, error) {
	id, err := strconv.Atoi(idStr)
	if err != nil {
		return nil, err
	}
	return GetKidsGiftBoxByID(db, id)
}
