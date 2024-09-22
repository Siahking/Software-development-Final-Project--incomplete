package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gin-contrib/cors"
	_ "github.com/go-sql-driver/mysql"
)

type Location struct{
	ID 			int		`json:"id"`
	Location 	string	`json:"location"`
}

type Worker struct{
	ID			int				`json:"id"`
	FirstName	string			`json:"first_name"`
	LastName	string			`json:"last_name"`
	MiddleName	sql.NullString	`json:"middle_name"`
	Gender		sql.NullString	`json:"gender"`
	Address		string			`json:"address"`
	Contact		sql.NullString	`json:"contact"`
	Age			int				`json:"age"`
	LocationID	sql.NullInt64	`json:"location_id"`
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

	//AlLow cors
	router.Use(cors.New(cors.Config{
		AllowOrigins:     	[]string{"http://127.0.0.1:5500", "http://localhost:5500"},
		AllowMethods:     	[]string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     	[]string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    	[]string{"Content-Length"},
		AllowCredentials: 	true,
		MaxAge: 			12 * time.Hour,
	}))

	// serve static files from the static directory
	router.Static("/static","./static")

	// serve html templates from templates directory
	router.LoadHTMLGlob("templates/*.html")

	// routes for html pages
	router.GET("/", func(c *gin.Context){
		c.HTML(http.StatusOK, "home.html",nil)
	})
	router.GET("/create-roster", func(c *gin.Context){
		c.HTML(http.StatusOK, "create-roster.html",nil)
	})
	router.GET("/add-worker", func(c *gin.Context){
		c.HTML(http.StatusOK, "add-worker.html",nil)
	})
	router.GET("/remove-worker", func(c *gin.Context){
		c.HTML(http.StatusOK, "remove-worker.html",nil)
	})
	router.GET("/get-workers",func(c *gin.Context){
		c.HTML(http.StatusOK, "get-workers.html",nil)
	})
	router.GET("/find-workers",func(c *gin.Context){
		c.HTML(http.StatusOK, "find-worker.html",nil)
	})
	router.GET("/get-locations", func(c *gin.Context){
		c.HTML(http.StatusOK, "get-locations.html",nil)
	})
	
	//location_routes
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

	//worker_routes
	router.GET("/workers", func(c *gin.Context){
		getWorkers(c ,db)
	})

	fmt.Println("Starting Gin server on :8080")
	log.Fatal(router.Run(":8080"))
};

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

func getWorkers(c *gin.Context, db *sql.DB){
	rows,err := db.Query("SELECT * FROM workers")
	if err != nil{
		c.JSON(http.StatusInternalServerError,gin.H{"error":"Error with selecting rows\n"+err.Error()})
		return
	}
	defer rows.Close()

	var employees []Worker

	for rows.Next(){
		var worker Worker
		if err := rows.Scan(&worker.ID,
			&worker.FirstName,&worker.LastName,
			&worker.MiddleName,&worker.Gender,
			&worker.Address,&worker.Contact,
			&worker.Age,&worker.LocationID);
			err != nil{
				c.JSON(http.StatusInternalServerError, gin.H{"error":"Error scanning rows\n"+err.Error()})
				return
			}
			employees = append(employees, worker)
	}
		if err = rows.Err(); err != nil{
			c.JSON(http.StatusInternalServerError, gin.H{"error":"Error scanning rows\n" + err.Error()})
			return
		}
	
	c.IndentedJSON(http.StatusOK, employees)
}

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