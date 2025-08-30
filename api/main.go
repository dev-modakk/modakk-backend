package main

import (
	"database/sql"
	_ "modakk-backend/docs" // Import the generated docs
	"modakk-backend/model"
	"net/http"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
	files "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

// @title Modakk API
// @version 1.0
// @description API for managing kids gift boxes
// @host localhost:8080
// @BasePath /
func main() {
	r := gin.Default()
	r.GET("/swagger/*any", ginSwagger.WrapHandler(files.Handler))
	r.GET("/giftboxes", GetAllGiftBoxesHandler)
	r.GET("/giftboxes/:id", GetGiftBoxByIDHandler)
	r.POST("/giftboxes", CreateGiftBoxHandler)
	r.Run()
}

// GetAllGiftBoxesHandler godoc
// @Summary List all gift boxes
// @Description Get all kids gift boxes
// @Tags giftboxes
// @Produce json
// @Success 200 {array} model.KidsGiftBox
// @Failure 500 {object} map[string]string
// @Router /giftboxes [get]
func GetAllGiftBoxesHandler(c *gin.Context) {
	db, err := model.OpenDBFromEnv()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	boxes, err := model.GetAllKidsGiftBoxes(db)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, boxes)
}

// CreateGiftBoxHandler godoc
// @Summary Create a new gift box
// @Description Create a new kids gift box
// @Tags giftboxes
// @Accept json
// @Produce json
// @Param giftbox body model.KidsGiftBox true "Gift Box data"
// @Success 201 {object} model.KidsGiftBox
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /giftboxes [post]
func CreateGiftBoxHandler(c *gin.Context) {
	var giftBox model.KidsGiftBox

	// Bind JSON request body to struct
	if err := c.ShouldBindJSON(&giftBox); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON: " + err.Error()})
		return
	}

	// Open database connection
	db, err := model.OpenDBFromEnv()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Create the gift box in database
	createdBox, err := model.CreateKidsGiftBox(db, giftBox)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create gift box: " + err.Error()})
		return
	}

	c.JSON(http.StatusCreated, createdBox)
}

// GetGiftBoxByIDHandler godoc
// @Summary Get gift box by ID
// @Description Get a kids gift box by its ID
// @Tags giftboxes
// @Produce json
// @Param id path int true "Gift Box ID"
// @Success 200 {object} model.KidsGiftBox
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /giftboxes/{id} [get]
func GetGiftBoxByIDHandler(c *gin.Context) {
	id := c.Param("id")
	db, err := model.OpenDBFromEnv()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	giftBox, err := model.GetKidsGiftBoxByIDStr(db, id)
	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusNotFound, gin.H{"error": "Gift box not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, giftBox)
}
