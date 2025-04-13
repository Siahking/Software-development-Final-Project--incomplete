package models

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-sql-driver/mysql"
)

type Location struct {
	ID       int    `json:"id"`
	Location string `json:"location"`
}

type WorkerLocation struct {
	ID         int `json:"id"`
	WorkerID   int `json:"worker_id"`
	LocationID int `json:"location_id"`
}

type Worker struct {
	ID           int      `json:"id"`
	FirstName    string   `json:"first_name"`
	LastName     string   `json:"last_name"`
	MiddleName   *string  `json:"middle_name"`
	Gender       *string  `json:"gender"`
	Address      string   `json:"address"`
	Contact      *string  `json:"contact"`
	Age          int      `json:"age"`
	ID_Number    int      `json:"id_number"`
	Availability *string  `json:"availability"`
	Hours        []string `json:"hours"`
}

type Constraint struct {
	ID      *int    `json:"id"`
	Worker1 *int    `json:"worker1_id"`
	Worker2 *int    `json:"worker2_id"`
	Note    *string `json:"note"`
}

type DaysOff struct {
	BreakId   int     `json:"break_id"`
	WorkerId  int     `json:"worker_id"`
	StartDate *string `json:"start_date"`
	EndDate   *string `json:"end_date"`
}

type PermanentRestriction struct {
	ID        int    `json:"id"`
	WorkerId  int    `json:"worker_id"`
	DayOfWeek string `json:"day_of_week"`
	StartTime string `json:"start_time"`
	EndTime   string `json:"end_time"`
}

type Occupancy struct {
	ID        int    `json:"id"`
	WorkerId  int    `json:"worker_id"`
	EventDate string `json:"event_date"`
	Note      string `json:"note"`
}

func GetLocations(c *gin.Context, db *sql.DB) {
	rows, err := db.Query("SELECT id, location FROM locations")

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var locations []Location

	for rows.Next() {
		var loc Location
		if err := rows.Scan(&loc.ID, &loc.Location); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		locations = append(locations, loc)
	}

	if len(locations) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "No locations found"})
		return
	}

	c.IndentedJSON(http.StatusOK, locations)
}

func FindLocation(c *gin.Context, db *sql.DB) {
	var query string
	var rows *sql.Rows
	var err error
	var locations []Location

	column := c.Param("column")
	value := c.Param("value")
	baseString := "SELECT id,location FROM locations WHERE "

	if value == "0" || (column != "id" && column != "location") {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid param entry"})
		return
	} else if column == "id" {
		query = baseString + "id = ?"
		rows, err = db.Query(query, value)
	} else {
		query = baseString + "LOWER(location) LIKE LOWER(?)"
		rows, err = db.Query(query, "%"+value+"%")
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error searching for values\n" + err.Error()})
		return
	}
	defer rows.Close()

	for rows.Next() {
		var loc Location
		err := rows.Scan(&loc.ID, &loc.Location)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error while scanning location\n" + err.Error()})
			return
		}
		locations = append(locations, loc)
	}

	if len(locations) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Location not found"})
		return
	}

	c.JSON(http.StatusOK, locations)
}

func AddLocation(c *gin.Context, db *sql.DB) {
	newLocation := c.Param("location")

	if newLocation == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Null Parameter"})
		return
	}

	query := "INSERT INTO locations (location) VALUES (?)"
	_, err := db.Exec(query, newLocation)
	if err != nil {
		if mysqlErr, ok := err.(*mysql.MySQLError); ok {
			if mysqlErr.Number == 1062 {
				c.JSON(http.StatusConflict, gin.H{"error": "This location already exists"})
				return
			}
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to insert value\n" + err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Location added successfully"})
}

func DeleteEntry(c *gin.Context, db *sql.DB) {
	table := strings.TrimSpace(c.Param("table"))
	id := strings.TrimSpace(c.Param("id"))

	if table == "" || table == ":" || id == "" || id == ":" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid Input"})
		return
	}

	if table != "workers" && table != "locations" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid parameter"})
		return
	}

	query := fmt.Sprintf("DELETE FROM %s WHERE id = %s", table, id)
	var result sql.Result
	var err error

	result, err = db.Exec(query)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error in getting rows " + err.Error()})
		return
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "No rows affected" + err.Error()})
		return
	}

	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"message": "No Entry found"})
	} else {
		c.JSON(http.StatusOK, gin.H{"message": "Entry deleted successfully"})
	}
}

func AddWorker(c *gin.Context, db *sql.DB) {
	var worker Worker
	if err := c.ShouldBindJSON(&worker); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	if worker.FirstName == "" || worker.LastName == "" || worker.Address == "" ||
		worker.Age == 0 || worker.ID_Number == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing params"})
		return
	}

	hoursJSON, err := json.Marshal(worker.Hours)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to convert hours to JSON: \n" + err.Error()})
		return
	}

	query := "INSERT INTO workers (first_name, last_name, middle_name,gender,address,contact, age, id_number,availability,hours)VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"

	_, insertionErr := db.Exec(query, worker.FirstName, worker.LastName, worker.MiddleName,
		worker.Gender, worker.Address, worker.Contact, worker.Age, worker.ID_Number, worker.Availability, string(hoursJSON))

	if insertionErr != nil {
		if mysqlErr, ok := insertionErr.(*mysql.MySQLError); ok {
			if mysqlErr.Number == 1062 {
				c.JSON(http.StatusConflict, gin.H{"error": "Worker with this ID Number already exists"})
				return
			}
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error in adding values to the db: " + insertionErr.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Worker added successfully"})
}

func FindWorker(c *gin.Context, db *sql.DB) {
	baseString := "SELECT * FROM workers WHERE "
	id := c.Query("id")
	firstname := c.Query("first_name")
	lastname := c.Query("last_name")
	middlename := c.Query("middle_name")
	id_number := c.Query("id_number")

	var query string
	var rows *sql.Rows
	var err error

	if id != "" {
		query = baseString + "id = ?"
		rows, err = db.Query(query, id)
	} else if id_number != "" {
		query = baseString + "id_number = ?"
		rows, err = db.Query(query, id_number)
	} else if firstname != "" && lastname != "" && middlename != "" {
		query = baseString + "first_name LIKE ? AND last_name LIKE ? AND middle_name LIKE ?"
		rows, err = db.Query(query, "%"+firstname+"%", "%"+lastname+"%", "%"+middlename+"%")
	} else if firstname != "" && middlename != "" {
		query = baseString + "first_name LIKE ? AND middle_name LIKE ?"
		rows, err = db.Query(query, "%"+firstname+"%", "%"+middlename+"%")
	} else if lastname != "" && middlename != "" {
		query = baseString + "last_name LIKE ? AND middle_name LIKE ?"
		rows, err = db.Query(query, "%"+lastname+"%")
	} else if firstname != "" {
		query = baseString + "first_name LIKE ?"
		rows, err = db.Query(query, "%"+firstname+"%")
	} else if lastname != "" {
		query = baseString + "last_name LIKE ?"
		rows, err = db.Query(query, "%"+lastname+"%")
	} else if middlename != "" {
		query = baseString + "middle_name LIKE ?"
		rows, err = db.Query(query, "%"+middlename+"%")
	} else {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Please provide valid search parameters"})
		return
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error in query execution\n" + err.Error()})
		return
	}
	defer rows.Close()

	var workers []Worker

	for rows.Next() {
		var worker Worker
		var hoursJSON string

		err := rows.Scan(&worker.ID, &worker.FirstName, &worker.LastName, &worker.MiddleName,
			&worker.Gender, &worker.Address, &worker.Contact, &worker.Age, &worker.ID_Number, &worker.Availability, &hoursJSON)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error scanning rows\n" + err.Error()})
			return
		}

		if hoursJSON != "" {
			err = json.Unmarshal([]byte(hoursJSON), &worker.Hours)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Error decoding hours JSON\n" + err.Error()})
				return
			}
		} else {
			worker.Hours = []string{}
		}
		workers = append(workers, worker)
	}

	if err := rows.Err(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error while going through the rows\n" + err.Error()})
		return
	}

	if len(workers) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"message": "No Workers found"})
	} else {
		c.IndentedJSON(http.StatusOK, workers)
	}
}

func GetWorkers(c *gin.Context, db *sql.DB) {
	rows, err := db.Query("SELECT * FROM workers")

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error with selecting rows\n" + err.Error()})
		return
	}
	defer rows.Close()

	var employees []Worker

	for rows.Next() {
		var worker Worker
		var hoursJSON []byte

		if err := rows.Scan(&worker.ID,
			&worker.FirstName, &worker.LastName,
			&worker.MiddleName, &worker.Gender,
			&worker.Address, &worker.Contact,
			&worker.Age, &worker.ID_Number, &worker.Availability, &hoursJSON); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error scanning rows\n" + err.Error()})
			return
		}

		if err := json.Unmarshal(hoursJSON, &worker.Hours); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error while parsing JSON hours\n" + err.Error()})
			return
		}

		employees = append(employees, worker)
	}

	if err = rows.Err(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error scanning rows\n" + err.Error()})
		return
	}

	if len(employees) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "No Employees found"})
	} else {
		c.IndentedJSON(http.StatusOK, employees)
	}
}

func AssignWorkerToLocation(c *gin.Context, db *sql.DB) {
	workerIdStr := c.Param("worker_id")
	locationIdStr := c.Param("location_id")

	if workerIdStr == "" || locationIdStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	workerId, err1 := strconv.Atoi(workerIdStr)
	locationId, err2 := strconv.Atoi(locationIdStr)

	if err1 != nil || err2 != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "WorkerId and LocationId needs to be numeric values"})
		return
	}

	query := "INSERT INTO worker_locations (worker_id,location_id) VALUES (?,?)"
	_, err := db.Exec(query, workerId, locationId)
	if err != nil {
		if mysqlErr, ok := err.(*mysql.MySQLError); ok {
			if mysqlErr.Number == 1062 {
				c.JSON(http.StatusConflict, gin.H{"error": "Worker Location link already exists"})
				return
			} else if mysqlErr.Number == 1452 {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
				return
			}
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to insert value\n" + err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Connection added successfully"})
}

func GetWorkerLocationConnections(c *gin.Context, db *sql.DB) {
	column := strings.TrimSpace(c.Param("column"))
	valueStr := c.Param("id")
	validQueries := map[string]string{
		"worker_id":   "SELECT * FROM worker_locations WHERE worker_id = ?",
		"location_id": "SELECT * FROM worker_locations WHERE location_id = ?",
		"id":          "SELECT * FROM worker_locations WHERE id = ?",
	}

	value, conversionErr := strconv.Atoi(valueStr)
	if conversionErr != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid id parameter"})
		return
	}

	query, exists := validQueries[column]
	if !exists {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid column parameter"})
		return
	}

	rows, err := db.Query(query, value)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get values from the database\n" + err.Error()})
		return
	}
	defer rows.Close()

	var connections []WorkerLocation
	for rows.Next() {
		var connection WorkerLocation
		err := rows.Scan(&connection.ID, &connection.WorkerID, &connection.LocationID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error scanning rows\n" + err.Error()})
			return
		}
		connections = append(connections, connection)
	}

	if len(connections) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "No worker location connections found"})
		return
	}

	c.JSON(http.StatusOK, connections)
}

func RemoveConnection(c *gin.Context, db *sql.DB) {
	column := c.Param("column")
	valueStr := c.Param("id")
	validQueries := map[string]string{
		"worker_id":   "DELETE FROM worker_locations WHERE worker_id = ?",
		"location_id": "DELTE FROM worker_locations WHERE location_id = ?",
		"id":          "DELETE FROM worker_locations WHERE id = ?",
	}

	value, conversionErr := strconv.Atoi(valueStr)
	if conversionErr != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid Id"})
		return
	}

	query, exists := validQueries[column]
	if !exists {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid column input"})
		return
	}

	var result sql.Result
	var err error

	result, err = db.Exec(query, value)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error in getting rows " + err.Error()})
		return
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "No rows affected" + err.Error()})
		return
	}

	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "No Entry found"})
	} else {
		c.JSON(http.StatusOK, gin.H{"message": "Entry deleted successfully"})
	}
}

// Create constraint
func CreateConstrant(c *gin.Context, db *sql.DB) {
	var constraint Constraint

	if err := c.ShouldBindJSON(&constraint); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	query := "INSERT INTO worker_constraints (worker1_id,worker2_id,note) VALUES (?,?,?)"

	_, err := db.Exec(query, constraint.Worker1, constraint.Worker2, constraint.Note)

	if err != nil {
		var errMsg string
		if mysqlErr, ok := err.(*mysql.MySQLError); ok {
			switch mysqlErr.Number {
			case 1452:
				errMsg = "Worker with this ID does not exist"
			case 1048:
				errMsg = "Null worker cannot exist"
			case 3819:
				errMsg = "Can't use the same worker value for both params"
			case 1062:
				errMsg = "Duplicate constraint entry,Constraint already exists"
			default:
				errMsg = "Database error"
			}
		} else {
			errMsg = "Unknown error occurred"
		}
		c.JSON(http.StatusConflict, gin.H{"error": errMsg})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Successful entry"})
}

// code to search for constraint and return if constraint exists or not
func FindConstraint(c *gin.Context, db *sql.DB) {
	var query string
	var rows *sql.Rows
	var err error
	var constraints []Constraint

	idStr := c.Query("id")
	worker1Str := c.Query("worker1")
	worker2Str := c.Query("worker2")
	baseString := "SELECT * FROM worker_constraints WHERE "
	var id int
	var worker1 int
	var worker2 int

	parameters := []string{idStr, worker1Str, worker2Str}
	variables := []*int{&id, &worker1, &worker2}

	for i, parameter := range parameters {
		if parameter == "" {
			*variables[i] = 0
		} else {
			value, err := strconv.Atoi(parameter)
			if err != nil || value < 1 {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input " + parameter})
				return
			}
			*variables[i] = value
		}
	}

	if id == 0 && worker1 == 0 && worker2 == 0 {
		rows, err = db.Query("SELECT * FROM worker_constraints")
	} else if id > 0 {
		query = baseString + "id = ?"
		rows, err = db.Query(query, id)
	} else if worker1 > 0 && worker2 > 0 {
		query = baseString + "worker1_id = ? AND worker2_id = ?"
		rows, err = db.Query(query, worker1, worker2)
	} else if worker1 > 0 {
		query = baseString + "worker1_id = ?"
		rows, err = db.Query(query, worker1)
	} else if worker2 > 0 {
		query = baseString + "worker2_id = ?"
		rows, err = db.Query(query, worker2)
	} else {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Please provide valid search parameters"})
		return
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error in searching for constraint\n" + err.Error()})
		return
	}

	defer rows.Close()

	for rows.Next() {
		var constraint Constraint
		innerError := rows.Scan(&constraint.ID, &constraint.Worker1, &constraint.Worker2, &constraint.Note)
		if innerError != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error while scanning location\n" + err.Error()})
			return
		}
		constraints = append(constraints, constraint)
	}

	if len(constraints) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "No constraint found"})
		return
	}

	c.IndentedJSON(http.StatusOK, constraints)
}

func EditConstraints(c *gin.Context, db *sql.DB) {
	var constraint Constraint
	idStr := c.Param("id")

	id, conversonErr := strconv.Atoi(idStr)

	if conversonErr != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid parameter"})
		return
	}

	if err := c.ShouldBindJSON(&constraint); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	query := `UPDATE worker_constraints SET 
			worker1_id = COALESCE(?, worker1_id),
			worker2_id = COALESCE(?, worker2_id),
			note = COALESCE(?, note) 
			WHERE id = ?`

	_, err := db.Exec(query, constraint.Worker1, constraint.Worker2, constraint.Note, id)

	if err != nil {
		var errMsg string
		if mysqlErr, ok := err.(*mysql.MySQLError); ok {
			switch mysqlErr.Number {
			case 1452:
				errMsg = "Worker with this ID does not exist"
			case 3819:
				errMsg = "Can't use the same worker value for both params"
			case 1062:
				errMsg = "Duplicate Entry, a constraint for these workers already exists"
			default:
				fmt.Print(err)
			}
		} else {
			errMsg = "Unknown error occurred"
		}
		c.JSON(http.StatusConflict, gin.H{"error": errMsg})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Constraint modified successfully"})
}

func DeleteConstraint(c *gin.Context, db *sql.DB) {
	idStr := c.Param("id")

	id, err := strconv.Atoi(idStr)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid id parameter"})
		return
	}

	query := "DELETE FROM worker_constraints WHERE id = ?"
	result, err := db.Exec(query, id)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error in deleting constraint\n" + err.Error()})
		return
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "No rows affected\n" + err.Error()})
		return
	}

	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Constraint does not exist"})
	} else {
		c.JSON(http.StatusOK, gin.H{"message": "Entry deleted successfully"})
	}
}

func AddDaysOff(c *gin.Context, db *sql.DB) {
	var daysOff DaysOff

	if err := c.ShouldBind(&daysOff); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalud request body\n" + err.Error()})
		return
	}

	if daysOff.StartDate == nil || daysOff.EndDate == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Start Date and End date are required"})
		return
	}

	layout := "2006-01-02"

	startDate, startDateErr := time.Parse(layout, *daysOff.StartDate)
	endDate, endDateErr := time.Parse(layout, *daysOff.EndDate)
	if startDateErr != nil || endDateErr != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date time format"})
		return
	}

	if startDate.Before(time.Now()) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Start date must be in the future"})
		return
	}

	if endDate.Before(startDate) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "End Date must be after the start date"})
		return
	}

	query := "INSERT INTO days_off (worker_id,start_date,end_date) VALUES (?,?,?)"
	_, err := db.Exec(query, daysOff.WorkerId, *daysOff.StartDate, *daysOff.EndDate)

	if err != nil {
		if mysqlErr, ok := err.(*mysql.MySQLError); ok {
			if mysqlErr.Number == 1062 {
				c.JSON(http.StatusConflict, gin.H{"error": "These days for this user already exists"})
				return
			} else if mysqlErr.Number == 1452 {
				c.JSON(http.StatusConflict, gin.H{"error": "This worker does not exist"})
				return
			}
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error in inserting values\n" + err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Days off added successfully"})
}

func GetDaysOff(c *gin.Context, db *sql.DB) {
	var rows *sql.Rows
	var err error
	var dayOffs []DaysOff
	column := c.Param("column")
	value := c.Param("value")

	if column == "" {
		rows, err = db.Query("SELECT * FROM days_off")
	} else if column == "worker_id" {
		query := "SELECT * FROM days_off WHERE worker_id = ?"
		rows, err = db.Query(query, value)
	} else if column == "break_id" {
		query := "SELECT * FROM days_off WHERE break_id = ?"
		rows, err = db.Query(query, value)
	} else {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid column entry"})
		return
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error in extracting values from the table\n" + err.Error()})
		return
	}
	defer rows.Close()

	for rows.Next() {
		var dates DaysOff

		if err := rows.Scan(&dates.BreakId, &dates.WorkerId, &dates.StartDate, &dates.EndDate); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error in retrieving values\n" + err.Error()})
			return
		}

		dayOffs = append(dayOffs, dates)
	}

	if len(dayOffs) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "No values found"})
		return
	}

	c.JSON(http.StatusOK, dayOffs)
}

func RemoveDaysOff(c *gin.Context, db *sql.DB) {
	idStr := c.Param("id")

	id, err := strconv.Atoi(idStr)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Id is not a number"})
		return
	}

	query := "DELETE FROM days_off WHERE break_id = ?"

	result, err := db.Exec(query, id)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error in performing query" + err.Error()})
		return
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "No rows affected\n" + err.Error()})
		return
	}

	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "No Entry found"})
	} else {
		c.JSON(http.StatusOK, gin.H{"message": "Entry deleted successfully"})
	}
}

func CreatePermanentRestriction(c *gin.Context, db *sql.DB) {
	var permanentRestriction PermanentRestriction

	if err := c.ShouldBindJSON(&permanentRestriction); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	dayOfWeek := permanentRestriction.DayOfWeek
	startTime := permanentRestriction.StartTime
	endTime := permanentRestriction.EndTime

	if dayOfWeek == "Any" {
		if startTime == "" && endTime == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Please provide valid time values"})
			return
		}
	} else if startTime == "" && endTime != "" || endTime == "" && startTime != "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Please insert a start time and a end time"})
		return
	}

	if startTime == "" {
		startTime = "00:00:00"
	} else if startTime == "00:00" {
		startTime = "24:00:00"
	}
	if endTime == "" {
		endTime = "00:00:00"
	} else if endTime == "00:00" {
		endTime = "24:00:00"
	}

	query := "INSERT INTO permanent_restrictions (worker_id,day_of_week,start_time,end_time) VALUES (?,?,?,?)"
	_, err := db.Exec(query, permanentRestriction.WorkerId, dayOfWeek, startTime, endTime)

	if err != nil {
		if mysqlErr, ok := err.(*mysql.MySQLError); ok {
			if mysqlErr.Number == 1062 {
				c.JSON(http.StatusConflict, gin.H{"error": "The restriction for this worker already exists or this worker already has a restriction for this day"})
				return
			} else if mysqlErr.Number == 1452 {
				c.JSON(http.StatusBadRequest, gin.H{"error": "This worker does not exist"})
				return
			} else if mysqlErr.Number == 1265 {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid Day of Week"})
				return
			}
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to insert values due to error\n" + err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Restriction created"})
}

func GetRestrictions(c *gin.Context, db *sql.DB) {
	var restrictions []PermanentRestriction
	rows, err := db.Query("SELECT * FROM permanent_restrictions")

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error in retrieving values" + err.Error()})
		return
	}
	defer rows.Close()

	for rows.Next() {
		var restriction PermanentRestriction
		if err := rows.Scan(&restriction.ID, &restriction.WorkerId, &restriction.DayOfWeek,
			&restriction.StartTime, &restriction.EndTime); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error in scanning rows"})
			return
		}
		restrictions = append(restrictions, restriction)
	}

	if len(restrictions) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "No restrictions found"})
		return
	}

	c.JSON(http.StatusOK, restrictions)
}

func FindRestriction(c *gin.Context, db *sql.DB) {
	var restrictions []PermanentRestriction
	column := strings.TrimSpace(c.Param("column"))
	id := strings.TrimSpace(c.Param("id"))

	if column != "worker_id" && column != "id" || id == "" || id == ":" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid search params, must be 'worker_id' or 'id'"})
		return
	}

	query := fmt.Sprintf("SELECT * FROM permanent_restrictions WHERE %s = ?", column)
	rows, err := db.Query(query, id)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error in extracting values"})
		return
	}
	defer rows.Close()

	for rows.Next() {
		var restriction PermanentRestriction

		err := rows.Scan(&restriction.ID, &restriction.WorkerId, &restriction.DayOfWeek, &restriction.StartTime,
			&restriction.EndTime)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error in scanning rows\n" + err.Error()})
			return
		}

		restrictions = append(restrictions, restriction)
	}

	if len(restrictions) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "No values found"})
		return
	}

	c.JSON(http.StatusOK, restrictions)
}

func DeleteRestriction(c *gin.Context, db *sql.DB) {
	id := strings.TrimSpace(c.Param("id"))

	if id == "" || id == ":" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid Id"})
		return
	}

	query := "DELETE FROM permanent_restrictions WHERE id = ?"
	result, err := db.Exec(query, id)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error in deleting restriction"})
		return
	}

	rowsAffected, _ := result.RowsAffected()

	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Restriction does not exist"})
	} else {
		c.JSON(http.StatusOK, gin.H{"message": "Entry deleted successfully"})
	}
}

func CreateNewOccupancy(c *gin.Context, db *sql.DB) {
	var occupancy Occupancy

	if err := c.ShouldBindJSON(&occupancy); err != nil {
		c.JSON(http.StatusBadRequest,gin.H{"error":"Invalid request body"})
		return
	}

	layout := "2006-01-02"

	_,eventDateError := time.Parse(layout,occupancy.EventDate)

	if eventDateError != nil{
		c.JSON(http.StatusBadRequest,gin.H{"error":"Invalid date format,\n" + eventDateError.Error()})
		return
	}

	query := "INSERT INTO occupancy (worker_id,event_date,note) VALUES (?,?,?)"
	_, err := db.Exec(query, occupancy.WorkerId,occupancy.EventDate,occupancy.Note)

	if err != nil{
		c.JSON(http.StatusInternalServerError,gin.H{"error":"Error in inserting values,\n" + err.Error()})
		return
	}

	c.JSON(http.StatusCreated,gin.H{"message":"Occupancy added successfully"})
}

func RetrieveOccupancies(c *gin.Context, db *sql.DB){
	var occupancies []Occupancy
	var rows *sql.Rows
	var err error
	column := c.Param("column")
	value := c.Param("value")
	
	if column == "" {
		rows, err = db.Query("SELECT * FROM occupancy")
	}else if column == "worker_id"{
		query := "SELECT * FROM occupancy WHERE worker_id = ?"
		rows, err = db.Query(query,value)
	}else if column == "event_date"{
		query := "SELECT * FROM occupancy WHERE event_date = ?"
		rows, err = db.Query(query,value)
	}else if column == "note"{
		query := "SELECT * FROM occupancy WHERE note = ?"
		rows, err = db.Query(query,value)
	}else{
		c.JSON(http.StatusBadRequest,gin.H{"error":"Invalid column entry"})
		return
	}

	if err != nil{
		c.JSON(http.StatusInternalServerError,gin.H{"error":"Error in exctracting values\n"+err.Error()})
		return
	}
	defer rows.Close()

	for rows.Next() {
		var occupancy Occupancy

		if err := rows.Scan(&occupancy.ID, &occupancy.WorkerId, &occupancy.EventDate, &occupancy.Note); err != nil{
			c.JSON(http.StatusInternalServerError,gin.H{"error":"Error in retrieving values\n"+ err.Error()})
			return
		}

		occupancies = append(occupancies, occupancy)
	}
	
	if len(occupancies) == 0{
		c.JSON(http.StatusNotFound,gin.H{"error":"No values found for given criteria"})
		return
	}

	c.JSON(http.StatusOK,occupancies)
}

func RemoveOccupancy(c *gin.Context, db *sql.DB) {
	idStr := c.Param("id")

	id, conversionErr := strconv.Atoi(idStr)

	if conversionErr != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error":"Invalid id Parameter"})
		return
	}

	query := "DELETE FROM occupancy WHERE id = ?"
	result, err := db.Exec(query, id)

	if err != nil {
		c.JSON(http.StatusInternalServerError,gin.H{"error":"Error in deleting occupancy\n"+err.Error()})
		return
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "No rows affected\n" + err.Error()})
		return
	}

	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Occupancy does not exist"})
	} else {
		c.JSON(http.StatusOK, gin.H{"message": "Entry deleted successfully"})
	}
}

// info retrieval functions
func RetrieveWorkersOrLocation(c *gin.Context, db *sql.DB) {
	column := strings.TrimSpace(c.Param("column"))
	valueStr := c.Param("id")

	validQueries := map[string]string{
		"worker_id":   "SELECT l.* FROM locations l JOIN worker_locations wl on l.id = wl.location_id WHERE wl.worker_id = ?",
		"location_id": "SELECT w.* FROM workers w JOIN worker_locations wl ON w.id = wl.worker_id WHERE wl.location_id = ?",
	}

	value, conversionErr := strconv.Atoi(valueStr)
	if conversionErr != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid id parameter"})
		return
	}

	query, exists := validQueries[column]
	if !exists {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid column parameter"})
		return
	}

	rows, err := db.Query(query, value)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve values from database\n" + err.Error()})
		return
	}
	defer rows.Close()

	var connections interface{}
	found := false

	if column == "worker_id" {
		var locations []Location
		for rows.Next() {
			found = true
			var location Location
			err := rows.Scan(&location.ID, &location.Location)

			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to scan locations\n" + err.Error()})
				return
			}
			locations = append(locations, location)
		}
		connections = locations
	} else {
		var workers []Worker
		for rows.Next() {
			found = true
			var worker Worker
			var hoursJSON string
			err := rows.Scan(&worker.ID, &worker.FirstName, &worker.LastName, &worker.MiddleName,
				&worker.Gender, &worker.Address, &worker.Contact, &worker.Age, &worker.ID_Number,
				&worker.Availability, &hoursJSON)

			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to scan workers\n" + err.Error()})
				return
			}

			if hoursJSON != "" {
				conversionErr := json.Unmarshal([]byte(hoursJSON), &worker.Hours)
				if conversionErr != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Error in decoding hours JSON\n" + err.Error()})
					return
				}
			} else {
				worker.Hours = []string{}
			}
			workers = append(workers, worker)
		}
		connections = workers
	}

	if !found {
		c.JSON(http.StatusNotFound, gin.H{"error": "No values retrieved for given params"})
		return
	}

	c.JSON(http.StatusOK, connections)
}
