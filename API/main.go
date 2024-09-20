package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	_ "github.com/go-sql-driver/mysql"
)

type Location struct{
	ID 			int		`json:"id"`
	Location 	string	`json:"location"`
}

func getLocations(c *gin.Context, db *sql.DB){
	rows,err := db.Query("SELECT id, location FROM locations")
	if err != nil {
		c.JSON(http.StatusInternalServerError,gin.H{"error":err.Error()})
		return
	}
	defer rows.Close()

	var locations []Location

	for rows.Next() {
		var loc Location
		if err := rows.Scan(&loc.ID, &loc.Location); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error":err.Error()})
			return
		}
		locations = append(locations, loc)
	}

	if err = rows.Err(); err != nil{
		c.JSON(http.StatusInternalServerError,gin.H{"error":err.Error()})
		return
	}

	c.IndentedJSON(http.StatusOK, locations)
};

func findLocation(c *gin.Context, db *sql.DB){
	name := c.Param("name")

	var loc Location
	query := "SELECT id, location FROM locations WHERE LOWER(location) = LOWER(?)"
	err := db.QueryRow(query, name).Scan(&loc.ID, &loc.Location)
	if err == sql.ErrNoRows{
		c.JSON(http.StatusNotFound, gin.H{"error":"Location not found"})
		return
	}else if err != nil {
		c.JSON(http.StatusInternalServerError,gin.H{"error":err.Error()})
		return
	}

	c.JSON(http.StatusOK, loc)
}

func deleteLocation(c *gin.Context, db *sql.DB){
	id := c.Param("id")

	query := "DELETE FROM locations WHERE id = ?"
	_, err:= db.Exec(query, id)
	if err != nil{
		c.JSON(http.StatusInternalServerError, gin.H{"error":err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": fmt.Sprintf("Location with ID %s deleted", id)})
}

func addLocation(c *gin.Context, db *sql.DB){
	var newLocation Location

	if err := c.BindJSON(&newLocation); err != nil{
		c.JSON(http.StatusBadRequest, gin.H{"error":"Invalid input"})
		return
	}

	query := "INSERT INTO locations (location) VALUES (?)"
	_, err := db.Exec(query, newLocation.Location)
	if err != nil{
		fmt.Println("Failed to insert value")
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message":"Location added successfully"})
}

func main(){
	// Set up database connection
	dsn := "root:J0s!@hK!ng@tcp(localhost:3306)/roster"
	db, err := sql.Open("mysql",dsn)
	if err != nil{
		log.Fatal(err)
	}
	defer db.Close()

	//Test database connection
	if err = db.Ping(); err != nil {
		log.Fatal("Cannot connect to the database:", err)
	}
	fmt.Println("Connection established successfully!")

	//Get the router ready
	router := gin.Default()

	//routes
	router.GET("/locations", func(c *gin.Context){
		getLocations(c, db)
	})
	router.POST("/locations", func(c *gin.Context){
		addLocation(c, db)
	})
	router.DELETE("/locations/:id", func(c *gin.Context){
		deleteLocation(c ,db)
	})
	router.GET("/locations/:name", func(c *gin.Context){
		findLocation(c ,db)
	});

	fmt.Println("Starting Gin server on :8080")
	log.Fatal(router.Run(":8080"))
};