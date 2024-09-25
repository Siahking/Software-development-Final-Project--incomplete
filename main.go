package main

import (
	"database/sql"
	"fmt"
	// "io"
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
	router.POST("/new-worker/:first_name/:last_name/:middle_name/:gender/:address/:contact/:age", func(c *gin.Context){
		newWorker(c, db)
	})
	router.DELETE("/locations/:table/:field/:value",func(c *gin.Context) {
		deleteEntry(c,db)
	})
	router.GET("/locations/:name", func(c *gin.Context){
		findLocation(c ,db)
	});

	//worker_routes
	router.GET("/workers", func(c *gin.Context){
		getWorkers(c ,db)
	});
	router.GET("/find-worker", func(c *gin.Context){
		findWorker(c ,db)
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

func deleteEntry(c *gin.Context, db *sql.DB){
	table := c.Param("table")
	field := c.Param("field")
	value := c.Param("value")

	query := fmt.Sprintf("DELETE FROM %s WHERE %s = ?",table,field)
	var result sql.Result
	var err error

	if field == "id"{
		id, _ := strconv.Atoi(value)
		result,err = db.Exec(query,id) 
	}else{
		result, err = db.Exec(query,value)
	}
	if err != nil{
		c.JSON(http.StatusInternalServerError, gin.H{"error":err.Error()})
		return
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil{
		c.JSON(http.StatusInternalServerError,gin.H{"error":err.Error()})
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

func newWorker(c *gin.Context, db *sql.DB){

	var worker Worker
	worker.FirstName = c.Param("first_name")
	worker.LastName = c.Param("last_name")
	worker.MiddleName = setNull(c.Param("middle_name"))
	worker.Gender = setNull(c.Param("gender"))
	worker.Address = c.Param("address")
	worker.Contact = setNull(c.Param("contact"))
	worker.LocationID = sql.NullInt64{Int64:0,Valid:false}

	value,_ := strconv.Atoi(c.Param("age"))
	worker.Age = value

	query := "INSERT INTO workers (first_name,last_name,middle_name,gender,address,contact,age,location_id) VALUES (?,?,?,?,?,?,?,?)"

	_,err := db.Exec(query, worker.FirstName,worker.LastName,worker.MiddleName.String,
		worker.Gender.String,worker.Address,worker.Contact.String,worker.Age,worker.LocationID.Int64)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error":"Error in adding values to the db"+err.Error()})
		return
	}

	c.JSON(http.StatusCreated,gin.H{"message":"Value inserted"})
}

func findWorker(c *gin.Context, db *sql.DB){
	firstname := c.Query("first_name")
	lastname := c.Query("last_name")

	var query string
	var rows *sql.Rows
	var err error

	if firstname != "" && lastname != ""{
		query = "SELECT * FROM workers WHERE first_name = ? AND last_name = ?"
		rows, err = db.Query(query, firstname, lastname)
	}else if firstname != ""{
		query = "SELECT * FROM workers WHERE first_name = ?"
		rows, err = db.Query(query, firstname)
	}else if lastname != ""{
		query = "SELECT * FROM workers WHERE last_name = ?"
		rows, err = db.Query(query, lastname)
	}else{
		c.JSON(http.StatusBadRequest, gin.H{"error":"Please provide firstname and the lastname"})
		return
	}

	if err != nil{
		c.JSON(http.StatusInternalServerError,gin.H{"error":"Error in query execution\n"+err.Error()})
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
		c.JSON(http.StatusOK, workers)
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