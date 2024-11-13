package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	_ "github.com/go-sql-driver/mysql"
)

type Location struct{
	ID 			int			`json:"id"`
	Location 	string		`json:"location"`
}

type WorkerLocation struct{
	WorkerID	int			`json:"worker_id"`
	LocationID	int			`json:"location_id"`
}

type Worker struct{
	ID			int			`json:"id"`
	FirstName	string		`json:"first_name"`
	LastName	string		`json:"last_name"`
	MiddleName	*string		`json:"middle_name"`
	Gender		*string		`json:"gender"`
	Address		string		`json:"address"`
	Contact		*string		`json:"contact"`
	Age			int			`json:"age"`
	ID_Number	int			`json:"id_number"`
}

type Constraint struct{
	ID			int			`json:"id"`
	Worker_1	int			`json:"worker1_id"`
	Worker_2	int			`json:"worker2_id"`
	Note		string		`json:"note"`		
}

type DaysOff struct{
	Break_id	int			`json:"break_id"`
	Worker_id	int			`json:"worker_id"`
	Dates		[]string	`json:"dates"`
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
	router.GET("/remove-location", func(c *gin.Context){
		c.HTML(http.StatusOK, "remove-location.html",nil)
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
	router.GET("/locations/:column/:value", func(c *gin.Context){
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
	router.POST("/workers/add-worker", func(c *gin.Context) {
		addWorker(c, db)
	});

	//worker_location routes
	router.POST("/assign-location/:worker_id/:location_id", func(c *gin.Context) {
		assignWorkerToLocation(c ,db)
	})
	router.GET("/get-worker-location-connections/:column/:id", func(c *gin.Context){
		getWorkerLocationConnections(c, db)
	})
	router.DELETE("/remove-connection/:column/:id", func(c *gin.Context){
		removeConnection(c,db)
	})

	//constraint routes
	router.GET("/find-constraints",func(c *gin.Context){
		findConstraint(c,db)
	})
	router.POST("/edit-constraints/:changes/:id", func(c *gin.Context){
		editConstraints(c, db)
	})
	router.DELETE("/delete-constraint/:id",func(c *gin.Context){
		deleteConstraint(c ,db)
	})
	
	//days off routes
	router.POST("/add-days-off",func(c *gin.Context){
		addDaysOff(c, db)
	})
	router.GET("/find-day-off/:parameter/:value",func(c *gin.Context){
		findDaysOff(c,db)
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

func findLocation(c *gin.Context, db *sql.DB){
	var query string
	var rows *sql.Rows
	var err error
	var locations []Location

	column := c.Param("column")
	value := c.Param("value")
	baseString := "SELECT id,location FROM locations WHERE "

	if column == "id"{
		query = baseString + "id = ?"
		rows,err = db.Query(query, value)
	}else{
		query = baseString + "LOWER(location) LIKE LOWER(?)"
		rows,err = db.Query(query, "%"+value+"%")
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError,gin.H{"error":"Error searching for values\n"+err.Error()})
		return
	}
	defer rows.Close()

	for rows.Next(){
		var loc Location
		err:=rows.Scan(&loc.ID, &loc.Location)
		if err != nil{
			c.JSON(http.StatusInternalServerError, gin.H{"error":"Error while scanning location\n"+err.Error()})
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

func addWorker(c *gin.Context, db *sql.DB){
	var worker Worker
	if err := c.ShouldBindJSON(&worker); err != nil {
		fmt.Printf("Error:\n"+err.Error())
		c.JSON(http.StatusBadRequest, gin.H{"error":"Invalid request body"})
		return
	}

	query := "INSERT INTO workers (first_name, last_name, middle_name,gender,address,contact, age, id_number)VALUES ( ?, ?, ?, ?, ?, ?, ?, ?)"

	_,err := db.Exec(query, worker.FirstName,worker.LastName,worker.MiddleName,
		worker.Gender,worker.Address,worker.Contact,worker.Age,worker.ID_Number)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error":"Error in adding values to the db: " + err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message":"Worker added successfully"})
}

func findWorker(c *gin.Context, db *sql.DB){
	baseString := "SELECT * FROM workers WHERE "
	id := c.Query("id")
	firstname := c.Query("first_name")
	lastname := c.Query("last_name")
	middlename := c.Query("middle_name")
	id_number := c.Query("id_number")
	
	var query string
	var rows *sql.Rows
	var err error

	if id != ""{
		query = baseString + "id = ?"
		rows, err = db.Query(query, id)
	}else if id_number != ""{
		query = baseString + "id_number = ?"
		rows, err = db.Query(query, id_number)
	}else if firstname != "" && lastname != "" && middlename != "" {
		query = baseString + "first_name LIKE ? AND last_name LIKE ? AND middle_name LIKE ?"
		rows, err = db.Query(query, "%"+firstname+"%", "%"+lastname+"%", "%"+middlename+"%")
	}else if firstname != "" && middlename != ""{
		query = baseString + "first_name LIKE ? AND middle_name LIKE ?"
		rows, err = db.Query(query, "%"+firstname+"%","%"+middlename+"%")
	}else if lastname != "" && middlename != ""{
		query = baseString + "last_name LIKE ? AND middle_name LIKE ?"
		rows, err = db.Query(query, "%"+lastname+"%")
	}else if firstname != ""{
		query = baseString + "first_name LIKE ?"
		rows, err = db.Query(query, "%"+firstname+"%")
	}else if lastname != ""{
		query = baseString + "last_name LIKE ?"
		rows, err = db.Query(query, "%"+lastname+"%")
	}else if middlename != ""{
		query = baseString + "middle_name LIKE ?"
		rows, err = db.Query(query, "%"+middlename+"%")
	}else{
		c.JSON(http.StatusBadRequest, gin.H{"error":"Please provide valid search parameters"})
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
            &worker.Gender, &worker.Address, &worker.Contact, &worker.Age,&worker.ID_Number); err != nil{
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
			&worker.Age,&worker.ID_Number);
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

func assignWorkerToLocation(c *gin.Context,db *sql.DB){
	workerId := c.Param("worker_id")
	locationId := c.Param("location_id")

	query := "INSERT INTO worker_locations (worker_id,location_id) VALUES (?,?)"
	_, err := db.Exec(query,workerId,locationId)
	if err != nil{
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to insert value\n"+err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message":"Connection added successfully"})
}

func getWorkerLocationConnections(c *gin.Context, db *sql.DB){
	column := c.Param("column")
	id := c.Param("id")

	query := fmt.Sprintf("SELECT * FROM worker_locations WHERE %s = ?",column)

	rows,err := db.Query(query,id)
	if err != nil{
		c.JSON(http.StatusInternalServerError, gin.H{"error":"Failed to get values from the database\n"+err.Error()})
		return
	}
	defer rows.Close()

	var connections []WorkerLocation
	for rows.Next(){
		var connection WorkerLocation
		err := rows.Scan(&connection.WorkerID, &connection.LocationID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error":"Error scanning rows\n"+err.Error()})
			return
		}
		connections = append(connections, connection)
	}

	c.IndentedJSON(http.StatusOK,connections)
}

func removeConnection(c *gin.Context, db *sql.DB){
	column := c.Param("column")
	id := c.Param("id")

	query := fmt.Sprintf("DELETE FROM worker_locations WHERE %s = %s",column,id)
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

//code to search for constraint and return if constraint exists or not
func findConstraint(c *gin.Context,db *sql.DB){
	var query string
	var rows *sql.Rows
	var err error
	var constraints []Constraint

	id := c.Query("id")
	worker1 := c.Query("worker1")
	worker2 := c.Query("worker2")
	baseString := "SELECT * FROM worker_constraints WHERE "

	if id != ""{
		query = baseString + "id = ?"
		rows, err = db.Query(query, id)
	}else if worker1 != "" && worker2 != ""{
		query = baseString + "worker1_id = ? AND worker2_id = ?"
		rows,err = db.Query(query,worker1,worker2)
	}else if worker1 != ""{
		query = baseString + "worker1_id = ?"
		rows,err = db.Query(query,worker1)
	}else if worker2 != ""{
		query = baseString + "worker2_id = ?"
		rows, err = db.Query(query,worker2)
	}else{
		c.JSON(http.StatusBadRequest, gin.H{"error":"Please provide valid search parameters"})
		return
	}

	if err != nil{
		c.JSON(http.StatusInternalServerError, gin.H{"error":"Error in searching for constraint\n"+err.Error()})
		return
	}

	defer rows.Close()

	for rows.Next(){
		var constraint Constraint
		innerError := rows.Scan(&constraint.ID,&constraint.Worker_1,&constraint.Worker_2,&constraint.Note)
		if innerError != nil{
			c.JSON(http.StatusInternalServerError, gin.H{"error":"Error while scanning location\n"+err.Error()})
		}
		constraints = append(constraints, constraint)
	}

	if len(constraints) == 0{
		c.JSON(http.StatusNotFound,gin.H{"error":"No constraint found"})
		return
	}

	c.JSON(http.StatusOK, constraints)
}

func editConstraints(c *gin.Context, db *sql.DB){
	var constraint Constraint
	var query string
	changes := c.Param("changes")
	id := c.Param("id")

	if err := c.ShouldBindJSON(&constraint); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error":"Invalid request body\n"+err.Error()})
		return
	}

	if changes == "add"{
		query = "INSERT INTO worker_constraints (worker1_id, worker2_id,note) VALUES (?,?,?)"
		_,err := db.Exec(query,constraint.Worker_1,constraint.Worker_2,constraint.Note)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error":"Error in creating constraint\n"+err.Error()})
			return
		}
	}else{
		query = "UPDATE worker_constraints SET worker1_id = ?, worker2_id = ?, note = ? WHERE id = ?"
		_,err := db.Exec(query,constraint.Worker_1,constraint.Worker_2,constraint.Note,id)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error":"Error in modifying constraint\n"+err.Error()})
			return
		}
	}
	
	c.JSON(http.StatusCreated, gin.H{"message":"Constraint modified successfully"})
}

func deleteConstraint(c *gin.Context, db *sql.DB){
	id := c.Param("id")

	query := "DELETE FROM worker_constraints WHERE id = ?"
	result,err := db.Exec(query,id)
	
	if err != nil{
		c.JSON(http.StatusInternalServerError, gin.H{"error":"Error in deleting constraint\n"+err.Error()})
		return
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil{
		c.JSON(http.StatusInternalServerError, gin.H{"error":"No rows affected\n"+err.Error()})
		return
	}

	if rowsAffected == 0{
		c.JSON(http.StatusNotFound,gin.H{"message":"No Entry found"})
	}else{
		c.JSON(http.StatusOK, gin.H{"message":"Entry deleted successfully"})
	}
}

func addDaysOff(c *gin.Context,db *sql.DB){
	var daysOff DaysOff

	if err := c.ShouldBind(&daysOff); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error":"Invalud request body\n"+err.Error()})
		return
	}

	datesJSON,err := json.Marshal(daysOff.Dates)
	if err != nil{
		c.JSON(http.StatusInternalServerError,gin.H{"error":"Error turning code into json object\n"+err.Error()})
		return
	}

	query := "INSERT INTO days_off (worker_id,dates) VALUES (?,?)"

	_,err = db.Exec(query,daysOff.Worker_id,datesJSON)

	if err != nil{
		c.JSON(http.StatusInternalServerError, gin.H{"error":"Error in setting days off\n"+err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message":"Days off set successfully"})
}

func findDaysOff(c *gin.Context,db *sql.DB){
	var dayOffs []DaysOff
	parameter := c.Param("parameter")
	value := c.Param("value")

	query := fmt.Sprintf("SELECT * FROM days_off WHERE %s = ?",parameter)

	rows,err := db.Query(query,value)

	if err != nil{
		c.JSON(http.StatusInternalServerError,gin.H{"error":"Error in extracting values from the table\n"+err.Error()})
		return
	}
	defer rows.Close()

	for rows.Next(){
		var dates DaysOff
		var datesJSON []byte

		if err := rows.Scan(&dates.Break_id,&dates.Worker_id,&datesJSON);err != nil{
			c.JSON(http.StatusInternalServerError, gin.H{"error":"Error in retrieving values\n"+err.Error()})
			return
		}

		if err := json.Unmarshal(datesJSON, &dates.Dates); err != nil{
			c.JSON(http.StatusInternalServerError,gin.H{"error":"Error in parsing dates\n"+err.Error()})
			return
		}

		dayOffs = append(dayOffs,dates)
	}

	if err = rows.Err(); err != nil{
		c.JSON(http.StatusInternalServerError,gin.H{"error":"No values found\n"+err.Error()})
		return
	}

	c.IndentedJSON(http.StatusOK, dayOffs)
}

// func removeDaysOff(c *gin.Context,db *sql.DB){
// 	id := c.Param("id")

// 	query := "DELETE FROM days_off WHERE id = ?"

// 	_,err := db.Exec(query,id)

// 	if err != nil{
// 		c.JSON()
// 	}
// }