package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
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
	router.GET("/worker-details",func(c *gin.Context){
		c.HTML(http.StatusOK, "worker-details.html",nil)
	})
	router.GET("/get-locations", func(c *gin.Context){
		c.HTML(http.StatusOK, "get-locations.html",nil)
	})

	//multifunctional routes
	router.DELETE("delete/:table/:id",func(c *gin.Context) {
		deleteEntry(c,db)
	})
	
	//location_routes
	router.GET("/locations", func(c *gin.Context){ //
		getLocations(c, db)
	})
	router.GET("/locations/:name", func(c *gin.Context){
		findLocation(c ,db)
	})
	router.POST("/locations/:location",func(c *gin.Context) {
		addLocation(c, db)
	})

	//worker_routes
	router.GET("/workers", func(c *gin.Context){
		getWorkers(c ,db)
	});
	router.GET("/find-worker", func(c *gin.Context){
		findWorker(c ,db)
	})
	router.POST("/add-worker/:first_name/:last_name/:middle_name/:gender/:address/:contact/:age", func(c *gin.Context){
		addWorker(c, db)
	});

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

func findLocation(c *gin.Context, db *sql.DB){
	name := c.Param("name")

	var locations []Location
	query := "SELECT id, location FROM locations WHERE LOWER(location) LIKE LOWER(?)"
	rows,err := db.Query(query, "%"+name+"%")
	if err != nil {
		c.JSON(http.StatusInternalServerError,gin.H{"error":"Error searching for values\n"+err.Error()})
		return
	}
	defer rows.Close()

	for rows.Next(){
		var loc Location
		err:=rows.Scan(&loc.ID, &loc.Location)
		if err != nil{
			c.JSON(http.StatusInternalServerError, gin.H{"error":"Error while scanning location"+err.Error()})
			return
		}
		locations = append(locations,loc)
	}

	if len(locations) == 0{
		c.JSON(http.StatusNotFound,gin.H{"error":"Location not found"})
		return
	}

	c.JSON(http.StatusOK, locations)
}

func addLocation(c *gin.Context, db *sql.DB){
	newLocation := c.Param("location")

	query := "INSERT INTO locations (location) VALUES (?)"
	_, err := db.Exec(query, newLocation)
	if err != nil{
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to insert value\n"+err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message":"Location added successfully"})
}

func deleteEntry(c *gin.Context, db *sql.DB){
	table := c.Param("table")
	id := c.Param("id")

	query := fmt.Sprintf("DELETE FROM %s WHERE id = %s",table,id)
	var result sql.Result
	var err error

	result,err = db.Exec(query) 
	
	if err != nil{
		c.JSON(http.StatusInternalServerError, gin.H{"error":"Error in getting rows "+err.Error()})
		return
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil{
		c.JSON(http.StatusInternalServerError,gin.H{"error":"No rows affected"+err.Error()})
		return
	}

	if rowsAffected == 0{
		c.JSON(http.StatusNotFound,gin.H{"message":"No Entry found"})
	}else{
		c.JSON(http.StatusOK, gin.H{"message":"Entry deleted successfully"})
	}
}

func setNull(value string) sql.NullString {
	if value == "null"{
		return sql.NullString{String:"",Valid:false}
	}
	return sql.NullString{String:value, Valid:true}
}

func addWorker(c *gin.Context, db *sql.DB){

	var worker Worker
	worker.FirstName = c.Param("first_name")
	worker.LastName = c.Param("last_name")
	worker.MiddleName = setNull(c.Param("middle_name"))
	worker.Gender = setNull(c.Param("gender"))
	worker.Address = c.Param("address")
	worker.Contact = setNull(c.Param("contact"))

	value,_ := strconv.Atoi(c.Param("age"))
	worker.Age = value

	query := "INSERT INTO workers (first_name,last_name,middle_name,gender,address,contact,age) VALUES (?,?,?,?,?,?,?)"

	_,err := db.Exec(query, worker.FirstName,worker.LastName,worker.MiddleName.String,
		worker.Gender.String,worker.Address,worker.Contact.String,worker.Age)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error":"Error in adding values to the db"+err.Error()})
		return
	}

	c.JSON(http.StatusCreated,gin.H{"message":"Value inserted"})
}

func findWorker(c *gin.Context, db *sql.DB){
	baseString := "SELECT * FROM workers WHERE "
	id := c.Query("id")
	firstname := c.Query("first_name")
	lastname := c.Query("last_name")
	middlename := c.Query("middle_name")
	
	var query string
	var rows *sql.Rows
	var err error

	if id != ""{
		query = baseString + "id = ?"
		rows, err = db.Query(query, id)
	}else if firstname != "" && lastname != "" && middlename != ""{
		query = baseString + "first_name LIKE ? AND last_name LIKE ? AND middle_name LIKE"
		rows, err = db.Query(query, firstname, lastname,middlename)
	}else if firstname != "" && middlename != ""{
		query = baseString + "first_name LIKE ? AND middle_name LIKE ?"
		rows, err = db.Query(query, firstname,middlename)
	}else if lastname != "" && middlename != ""{
		query = baseString + "last_name LIKE ? AND middle_name LIKE ?"
		rows, err = db.Query(query, lastname)
	}else if firstname != ""{
		query = baseString + "first_name LIKE ?"
		rows, err = db.Query(query, firstname)
	}else if lastname != ""{
		query = baseString + "last_name LIKE ?"
		rows, err = db.Query(query, lastname)
	}else if middlename != ""{
		query = baseString + "middle_name LIKE ?"
		rows, err = db.Query(query, middlename)
	}else{
		c.JSON(http.StatusBadRequest, gin.H{"error":"Please provide firstname and the lastname"})
		return
	}

	if err != nil{
		c.JSON(http.StatusInternalServerError,gin.H{"error":"Error in query execution\n"+err.Error()})
		return
	}
	defer rows.Close()

	var workers []Worker

	for rows.Next(){
		var worker Worker
		if err := rows.Scan(&worker.ID, &worker.FirstName, &worker.LastName, &worker.MiddleName, 
            &worker.Gender, &worker.Address, &worker.Contact, &worker.Age, &worker.LocationID); err != nil{
				c.JSON(http.StatusInternalServerError, gin.H{"error":"Error scanning rows\n" + err.Error()})
			}
		workers = append(workers, worker)
	}

	if err:=rows.Err(); err != nil {
		c.JSON(http.StatusInternalServerError,gin.H{"error":"Error while going through the rows\n"+err.Error()})
		return
	}

	if len(workers) == 0{
		c.JSON(http.StatusNotFound,gin.H{"message":"No Workers found"})
	}else{
		c.IndentedJSON(http.StatusOK, workers)
	}
}

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