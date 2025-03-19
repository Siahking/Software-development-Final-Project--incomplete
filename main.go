package main

import (
	"fmt"
	"log"
	"time"

	"final-project/models"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	_ "github.com/go-sql-driver/mysql"
)

func main() {
	// Set up database connection
	db, err := models.InitializeDB()
	if err != nil {
		log.Fatal("Error connecting to database: ", err)
	}
	defer db.Close()

	//Get the router ready
	router := gin.Default()

	//AlLow cors
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://127.0.0.1:5501","http://127.0.0.1:5500", "http://localhost:5500"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	//get routes
	models.RegisterRoutes(router, db)

	fmt.Println("Starting Gin server on :8080")
	log.Fatal(router.Run(":8080"))
}
