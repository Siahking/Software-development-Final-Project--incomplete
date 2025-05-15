package models

import (
	"database/sql"
	"fmt"
	"net/http"
	"strconv"
	"strings"
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

func RetrieveRosters(c *gin.Context, db *sql.DB){
	var query string
	var results *sql.Rows
	var searchError error
	var rosters []Roster
	rosterId := c.Query("roster_id")
	locationId := c.Query("location_id")
	month := c.Query("month")

	if rosterId == "" && locationId == "" && month == ""{
		results,searchError = db.Query("SELECT * FROM roster")
	}else if rosterId != ""{
		query = "SELECT * FROM roster WHERE roster_id = ?"
		results,searchError = db.Query(query,rosterId)
	}else if locationId != "" && month != ""{
		query = "SELECT * FROM roster WHERE location_id = ? AND month = ?"
		results,searchError = db.Query(query,locationId,month)
	}else if month != ""{
		query = "SELECT * FROM roster WHERE month = ?"
		results, searchError = db.Query(query,month)
	}else if locationId != ""{
		query = "SELECT * FROM roster WHERE location_id = ?"
		results,searchError = db.Query(query,locationId)
	}else{
		c.JSON(http.StatusBadRequest,gin.H{"error":"Invalid param"})
		return
	}

	if searchError != nil{
		c.JSON(http.StatusInternalServerError,gin.H{"error":"Error in retrieving rosters"})
		return
	}
	defer results.Close()

	for results.Next() {
		var roster Roster

		if err := results.Scan(&roster.RosterId,&roster.LocationId,&roster.Month); err != nil {
			c.JSON(http.StatusInternalServerError,gin.H{"error":"Error in retrieving values\n" + err.Error()})
			return
		}

		rosters = append(rosters, roster)
	}

	if len(rosters) == 0 {
		c.JSON(http.StatusNotFound,gin.H{"error":"No roster found"})
		return
	}

	c.JSON(http.StatusOK, rosters)
}

func EditRoster(c *gin.Context, db *sql.DB){
	var roster Roster
	idStr := c.Param("id")

	id, conversionErr := strconv.Atoi(idStr)

	if conversionErr != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID parameter"})
		return
	}

	if err := c.ShouldBindJSON(&roster); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	query := `UPDATE roster SET
			location_id = COALESCE(?, location_id),
			month = COALESCE(?, month)
			WHERE roster_id = ?
	`

	_,err := db.Exec(query, roster.LocationId,roster.Month,id)

	if err != nil{
		fmt.Print(err.Error())
		return
	}

	c.JSON(http.StatusOK,gin.H{"message":"Roster Modified successfully"})
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

func RestrieveRosterEntries(c *gin.Context, db *sql.DB){
	var query string
	var rows *sql.Rows
	var extractionErr error
	var entries []RosterEntry
	entryId := c.Query("entry_id")
	rosterId := c.Query("roster_id")
	workerId := c.Query("worker_id")
	shift_date := c.Query("shift_date")
	shift_type := c.Query("shift_type")

	if entryId != ""{
		query = "SELECT * FROM roster_entries WHERE entry_id = ?"
		rows,extractionErr = db.Query(query,entryId)
	}else{
		baseQuery := "SELECT * FROM roster_entries WHERE "
		var conditions []string
		var args []interface{}
		if rosterId != ""{
			conditions = append(conditions, "roster_id = ?")
			args = append(args, rosterId)
		}
		if workerId != ""{
			conditions = append(conditions, "worker_id = ?")
			args = append(args, workerId)
		}
		if shift_date != ""{
			conditions = append(conditions, "shift_date = ?")
			args = append(args, shift_date)
		}
		if shift_type != ""{
			conditions = append(conditions, "shift_type = ?")
			args = append(args, shift_type)
		}

		if len(conditions) == 0{
			c.JSON(http.StatusBadRequest,gin.H{"error":"No filter parameters provided"})
			return
		}

		whereClause := strings.Join(conditions, " AND ")
		finalQuery := baseQuery + " WHERE " + whereClause 

		rows, extractionErr = db.Query(finalQuery, args...)
	}

	if extractionErr != nil{
		c.JSON(http.StatusInternalServerError, gin.H{"error":"Error in extracting values\n" + extractionErr.Error()})
		return
	}
	defer rows.Close()

	for rows.Next() {
		var entry RosterEntry
		if err := rows.Scan(&entry.EntryId, &entry.RosterId, &entry.WorkerId,&entry.ShiftDate, &entry.ShiftType); err != nil{
			c.JSON(http.StatusInternalServerError,gin.H{"error":"Error in retrieving values\n"+err.Error()})
			return
		}
		entries = append(entries, entry)
	}

	if len(entries) == 0 {
		c.JSON(http.StatusNotFound,gin.H{"error":"No entries found"})
		return
	}

	c.JSON(http.StatusOK, entries)
}

func EditRosterEntry(c *gin.Context, db *sql.DB){
	var rosterEntry RosterEntry
	idStr := c.Param("id")

	id, conversionErr := strconv.Atoi(idStr)

	if conversionErr != nil {
		c.JSON(http.StatusBadRequest,gin.H{"error":"Invalid Id Input"})
		return
	}

	if err := c.ShouldBindJSON(&rosterEntry); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		fmt.Print(err)
		return
	}

	query := `UPDATE roster_entries SET
			roster_id = COALESCE(?, roster_id),
			worker_id = COALESCE(?, worker_id),
			shift_date = COALESCE(?, shift_date),
			shift_type = COALESCE(?, shift_type)
			WHERE id = ?`

	_,err := db.Exec(query, rosterEntry.RosterId,rosterEntry.WorkerId,rosterEntry.ShiftDate,rosterEntry.ShiftType,id)

	if err != nil{
		fmt.Print(err.Error())
		return
	}

	c.JSON(http.StatusOK,gin.H{"error":"Entry edited successfully "})
}

func DeleteRosterEntry(c *gin.Context, db *sql.DB){
	var query string
	var result sql.Result
	var deleteErr error
	entryId := c.Query("entry_id")
	rosterId := c.Query("roster_id")
	workerId := c.Query("worker_id")
	shift_date := c.Query("shift_date")
	shift_type := c.Query("shift_type")

	if entryId != ""{
		query = "DELETE * FROM roster_entries WHERE entry_id = ?"
		result,deleteErr = db.Exec(query,entryId)
	}else{
		baseQuery := "DELETE * FROM roster_entries WHERE "
		var conditions []string
		var args []interface{}
		if rosterId != ""{
			conditions = append(conditions, "roster_id = ?")
			args = append(args, rosterId)
		}
		if workerId != ""{
			conditions = append(conditions, "worker_id = ?")
			args = append(args, workerId)
		}
		if shift_date != ""{
			conditions = append(conditions, "shift_date = ?")
			args = append(args, shift_date)
		}
		if shift_type != ""{
			conditions = append(conditions, "shift_type = ?")
			args = append(args, shift_type)
		}

		if len(conditions) == 0{
			c.JSON(http.StatusBadRequest,gin.H{"error":"No filter parameters provided"})
			return
		}

		whereClause := strings.Join(conditions, " AND ")
		finalQuery := baseQuery + " WHERE " + whereClause 

		result, deleteErr = db.Exec(finalQuery, args...)
	}

	if deleteErr != nil{
		c.JSON(http.StatusInternalServerError, gin.H{"error":"Error in extracting values\n" + deleteErr.Error()})
		return
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		c.JSON(http.StatusInternalServerError,gin.H{"error":"Error in checking rows\n"+err.Error()})
		return
	}

	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "No Entry found"})
	} else {
		c.JSON(http.StatusOK, gin.H{"message": "Entry deleted successfully"})
	}
}
