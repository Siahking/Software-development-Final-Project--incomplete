package models

import (
	"database/sql"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

type Roster struct {
	RosterId   int    `json:"roster_id"`
	LocationId int    `json:"location_id"`
	Month      string `json:"month"`
}

type RosterEntry struct {
	EntryId   int    `json:"entry_id"`
	RosterId  int    `json:"roster_id"`
	WorkerId  int    `json:"worker_id"`
	ShiftDate string `json:"shift_date"`
	ShiftType string `json:"shift_type"`
}

func SaveRoster(c *gin.Context, db *sql.DB) {
	var roster Roster

	if err := c.ShouldBindJSON(&roster); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	if roster.LocationId == 0 || roster.Month == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Both Location Id and Month for creation are required"})
		return
	}

	query := "INSERT INTO roster (location_id,month) VALUES (?,?)"

	_, insertionErr := db.Exec(query, roster.LocationId, roster.Month)

	if insertionErr != nil {
		fmt.Print(insertionErr)
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Roster added successfully"})
}

func DeleteRoster(c *gin.Context, db *sql.DB){
	var query string
	var deleteErr error
	var result sql.Result
	rosterId := c.Query("roster_id")
	locationId := c.Query("location_id")
	month := c.Query("month")

	if rosterId != ""{
		query = "DELETE FROM roster WHERE roster_id = ?"
		result,deleteErr = db.Exec(query,rosterId)
	}else if locationId != "" && month != ""{
		query = "DELETE FROM roster WHERE location_id = ? AND month = ?"
		result,deleteErr = db.Exec(query,locationId,month)
	}else if locationId != ""{
		query = "DELETE FROM roster WHERE location_id = ?"
		result, deleteErr = db.Exec(query,locationId)
	}else if month != ""{
		query = "DELETE FROM roster WHERE month = ?"
		result, deleteErr = db.Exec(query,month)
	}else{
		c.JSON(http.StatusBadRequest,gin.H{"error":"Invalid input params"})
		return
	}

	if deleteErr != nil{
		c.JSON(http.StatusInternalServerError,gin.H{"error":"Error in deleting roster"})
		return
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil{
		c.JSON(http.StatusInternalServerError,gin.H{"error":"No rows affected"})
		return
	}

	if rowsAffected == 0{
		c.JSON(http.StatusNotFound,gin.H{"error":"No Entry found"})
		return
	}else{
		c.JSON(http.StatusOK,gin.H{"error":"Entry deleted successfully"})
		return
	}
}

func RosterEntryHandler(c *gin.Context, db *sql.DB){
	var entry RosterEntry

	if err := c.ShouldBindJSON(&entry); err != nil {
		c.JSON(http.StatusBadRequest,gin.H{"error":"Invalid Input"})
		return
	}

	if entry.RosterId == 0 || entry.ShiftDate == "" || entry.ShiftType == "" || entry.WorkerId == 0{
		c.JSON(http.StatusBadRequest,gin.H{"error":"Missing parameters"})
		return
	}

	query := "INSERT INTO roster_entries (roster_id,worker_id,shift_date,shift_type) VALUES (?,?,?,?)"

	_,insertionError := db.Exec(query,entry.RosterId,entry.WorkerId,entry.ShiftDate,entry.ShiftType)

	if insertionError != nil{
		fmt.Print(insertionError)
		return
	}

	c.JSON(http.StatusCreated,gin.H{"error":"Roster entry added successfully"})
}


