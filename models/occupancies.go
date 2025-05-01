package models

import (
	"database/sql"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-sql-driver/mysql"
)

type Occupancy struct {
	ID        int    `json:"id"`
	WorkerId  int    `json:"worker_id"`
	EventDate string `json:"event_date"`
	Note      string `json:"note"`
}

//occupancy is used to store which days workers are assigned to when they are assigned to different days to work
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
		if mysqlErr, ok := err.(*mysql.MySQLError); ok {
			if mysqlErr.Number == 1062 {
				c.JSON(http.StatusConflict,gin.H{"error":"This Occupancy for this worker already exists"})
				return
			}
		}
		c.JSON(http.StatusInternalServerError,gin.H{"error":"Error in inserting values,\n" + err.Error()})
		return
	}

	c.JSON(http.StatusCreated,gin.H{"message":"Occupancy added successfully"})
}

//retrieve all occupancies or retrieve occupancies by worker_id,event_date or note
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
		c.JSON(http.StatusNotFound,gin.H{"error":"No values found"})
		return
	}

	c.JSON(http.StatusOK,occupancies)
}

//remove occupancyby occupancy id
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

//delete all stored records from the occupancy table
func EmptyOccupancies(c *gin.Context, db *sql.DB){
	query := "DELETE FROM occupancy"

	_, err := db.Exec(query)

	if err != nil{
		c.JSON(http.StatusInternalServerError,gin.H{"error":"Error in clearing table\n"+err.Error()})
		return
	}
	c.JSON(http.StatusOK,gin.H{"message":"Table cleared successfully"})
}