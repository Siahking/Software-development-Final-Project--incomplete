package models

import (
	"database/sql"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/go-sql-driver/mysql"
)

type WorkerLocation struct {
	ID         int `json:"id"`
	WorkerID   int `json:"worker_id"`
	LocationID int `json:"location_id"`
}

//assign workers to location using workerid and locationid
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

//retrieve all connections between workers and locations based on workerid or location id
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

//remove worker to locations connection based on the connection id, worker id or location id
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