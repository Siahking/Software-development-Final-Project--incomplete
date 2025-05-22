package models

import (
	"database/sql"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"github.com/gin-gonic/gin"
	"github.com/go-sql-driver/mysql"
	"time"
)

type Roster struct {
	RosterId   int `json:"roster_id"`
	LocationId *int `json:"location_id"`
	Month      *int `json:"month"`
}

type RosterEntry struct {
	EntryId   int    `json:"entry_id"`
	RosterId  *int    `json:"roster_id"`
	WorkerId  *int    `json:"worker_id"`
	ShiftDate *string `json:"shift_date"`
	ShiftType *string `json:"shift_type"`
}

func SaveRoster(c *gin.Context, db *sql.DB) {
	var roster Roster

	if err := c.ShouldBindJSON(&roster); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	if *roster.LocationId == 0 || *roster.Month == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Both Location Id and Month for creation are required"})
		return
	}

	query := "INSERT INTO roster (location_id,month) VALUES (?,?)"

	_, insertionErr := db.Exec(query, roster.LocationId, roster.Month)

	if insertionErr != nil {
		if mysqlErr, ok := insertionErr.(*mysql.MySQLError); ok {
			switch mysqlErr.Number{
			case 3819:
				c.JSON(http.StatusBadRequest,gin.H{"error":"Invalid Month input"})
				return
			case 1452:
				c.JSON(http.StatusInternalServerError,gin.H{"error":"This Location does not exist"})
				return
			case 1062:
				c.JSON(http.StatusConflict,gin.H{"error":"A roster for this month and location already exists"})
				return
			default:
				fmt.Print(insertionErr)
			}
		}else{
			c.JSON(http.StatusInternalServerError,gin.H{"error":"Unknown error occured\n"+insertionErr.Error()})
			return
		}
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Roster added successfully"})
}

func RetrieveRosters(c *gin.Context, db *sql.DB) {
	var query string
	var results *sql.Rows
	var searchError error
	var rosters []Roster
	rosterId := c.Query("roster_id")
	locationId := c.Query("location_id")
	month := c.Query("month")

	allowedParams := map[string]bool{
		"roster_id": true,
		"location_id":true,
		"month": true,
	}

	for key := range c.Request.URL.Query() {
		if !allowedParams[key] {
			c.JSON(http.StatusBadRequest, gin.H{"error":"Unrecognized query parameter: "+ key})
			return
		}
	}

	if rosterId == "" && locationId == "" && month == "" {
		results, searchError = db.Query("SELECT * FROM roster")
	} else if rosterId != "" {
		query = "SELECT * FROM roster WHERE roster_id = ?"
		results, searchError = db.Query(query, rosterId)
	} else if locationId != "" && month != "" {
		query = "SELECT * FROM roster WHERE location_id = ? AND month = ?"
		results, searchError = db.Query(query, locationId, month)
	} else if month != "" {
		query = "SELECT * FROM roster WHERE month = ?"
		results, searchError = db.Query(query, month)
	} else if locationId != "" {
		query = "SELECT * FROM roster WHERE location_id = ?"
		results, searchError = db.Query(query, locationId)
	} else {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid param"})
		return
	}

	if searchError != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error in retrieving rosters"})
		return
	}
	defer results.Close()

	for results.Next() {
		var roster Roster

		if err := results.Scan(&roster.RosterId, &roster.LocationId, &roster.Month); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error in retrieving values\n" + err.Error()})
			return
		}

		rosters = append(rosters, roster)
	}

	if len(rosters) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "No roster matches the current criteria"})
		return
	}

	c.JSON(http.StatusOK, rosters)
}

func EditRoster(c *gin.Context, db *sql.DB) {
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

	result, err := db.Exec(query, roster.LocationId, roster.Month, id)

	if err != nil {
		var errMsg string
		if mysqlErr, ok := err.(*mysql.MySQLError); ok {
			switch mysqlErr.Number {
			case 1452:
				errMsg = "Location with this ID does not exist"
			case 3819:
				errMsg = "Month is out of range"
			case 1062:
				errMsg = "Roster for this month and location already exists"
			default:
				fmt.Print(err)
			}
		} else {
			errMsg = "Unknown error occurred"
		}
		c.JSON(http.StatusConflict, gin.H{"error": errMsg})
		return
	}

	rowsAffected,_ := result.RowsAffected()
	if rowsAffected == 0{
		c.JSON(http.StatusNotFound, gin.H{"error":"No changes made, Entry may not exist or is already up to date"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Roster Modified successfully"})
}

func DeleteRoster(c *gin.Context, db *sql.DB) {
	var query string
	var deleteErr error
	var result sql.Result
	rosterId := c.Query("roster_id")
	locationId := c.Query("location_id")
	month := c.Query("month")

	if rosterId != "" {
		query = "DELETE FROM roster WHERE roster_id = ?"
		result, deleteErr = db.Exec(query, rosterId)
	} else if locationId != "" && month != "" {
		query = "DELETE FROM roster WHERE location_id = ? AND month = ?"
		result, deleteErr = db.Exec(query, locationId, month)
	} else if locationId != "" {
		query = "DELETE FROM roster WHERE location_id = ?"
		result, deleteErr = db.Exec(query, locationId)
	} else if month != "" {
		query = "DELETE FROM roster WHERE month = ?"
		result, deleteErr = db.Exec(query, month)
	} else {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input params"})
		return
	}

	if deleteErr != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error in deleting roster"})
		return
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "No rows affected"})
		return
	}

	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "No Entry found"})
		return
	} else {
		c.JSON(http.StatusOK, gin.H{"error": "Entry deleted successfully"})
		return
	}
}

func RosterEntryHandler(c *gin.Context, db *sql.DB) {
	var entry RosterEntry

	if err := c.ShouldBindJSON(&entry); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid Input"})
		return
	}

	layout := "2006-01-02"

	entryDate, entryDateErr := time.Parse(layout, *entry.ShiftDate)
	if entryDateErr != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date time format"})
		return
	}

	if entryDate.Before(time.Now()){
		c.JSON(http.StatusBadRequest,gin.H{"error":"Shift date must be in the future"})
		return
	}

	if *entry.RosterId == 0 || *entry.ShiftType == "" || *entry.WorkerId == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing parameters"})
		return
	}

	query := "INSERT INTO roster_entries (roster_id,worker_id,shift_date,shift_type) VALUES (?,?,?,?)"

	_, insertionError := db.Exec(query, entry.RosterId, entry.WorkerId, entry.ShiftDate, entry.ShiftType)

	if insertionError != nil {
		var errMsg string
		if mysqlErr, ok := insertionError.(*mysql.MySQLError); ok {
			switch mysqlErr.Number {
			case 1452:
				errMsg = "This roster or this worker does not exist"
			case 1062:
				errMsg = "Duplicate Entry, this shift on this date for this worker already exists"
			default:
				fmt.Print(insertionError)
			}
		} else {
			errMsg = "Unknown error occurred"
		}
		c.JSON(http.StatusConflict, gin.H{"error": errMsg})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Shift entry added successfully"})
}

func RetrieveRosterEntries(c *gin.Context, db *sql.DB) {
	var query string
	var rows *sql.Rows
	var extractionErr error
	var entries []RosterEntry
	entryId := c.Query("entry_id")
	rosterId := c.Query("roster_id")
	workerId := c.Query("worker_id")
	shift_date := c.Query("shift_date")
	shift_type := c.Query("shift_type")

	if entryId != "" {
		query = "SELECT * FROM roster_entries WHERE entry_id = ?"
		rows, extractionErr = db.Query(query, entryId)
	} else {
		baseQuery := "SELECT * FROM roster_entries WHERE "
		var conditions []string
		var args []interface{}
		if rosterId != "" {
			conditions = append(conditions, "roster_id = ?")
			args = append(args, rosterId)
		}
		if workerId != "" {
			conditions = append(conditions, "worker_id = ?")
			args = append(args, workerId)
		}
		if shift_date != "" {
			conditions = append(conditions, "shift_date = ?")
			args = append(args, shift_date)
		}
		if shift_type != "" {
			conditions = append(conditions, "shift_type = ?")
			args = append(args, shift_type)
		}

		if len(conditions) == 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "No filter parameters provided"})
			return
		}

		whereClause := strings.Join(conditions, " AND ")
		finalQuery := baseQuery + whereClause

		rows, extractionErr = db.Query(finalQuery, args...)
	}

	if extractionErr != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error in extracting values\n" + extractionErr.Error()})
		return
	}
	defer rows.Close()

	for rows.Next() {
		var entry RosterEntry
		if err := rows.Scan(&entry.EntryId, &entry.RosterId, &entry.WorkerId, &entry.ShiftDate, &entry.ShiftType); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error in retrieving values\n" + err.Error()})
			return
		}
		entries = append(entries, entry)
	}

	if len(entries) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "No entries found"})
		return
	}

	c.JSON(http.StatusOK, entries)
}

func EditRosterEntry(c *gin.Context, db *sql.DB) {
	var rosterEntry RosterEntry
	idStr := c.Param("id")

	id, conversionErr := strconv.Atoi(idStr)

	if conversionErr != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid Id Input"})
		return
	}

	if err := c.ShouldBindJSON(&rosterEntry); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		fmt.Print(err)
		return
	}

	if rosterEntry.ShiftDate != nil{
		layout := "2006-01-02"

		entryDate, entryDateErr := time.Parse(layout, *rosterEntry.ShiftDate)
		if entryDateErr != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date time format"})
			return
		}

		if entryDate.Before(time.Now()){
			c.JSON(http.StatusBadRequest,gin.H{"error":"Shift date must be in the future"})
			return
		}
	}

	query := `UPDATE roster_entries SET
			roster_id = COALESCE(?, roster_id),
			worker_id = COALESCE(?, worker_id),
			shift_date = COALESCE(?, shift_date),
			shift_type = COALESCE(?, shift_type)
			WHERE entry_id = ?`

	result, _ := db.Exec(query, rosterEntry.RosterId, rosterEntry.WorkerId, rosterEntry.ShiftDate, rosterEntry.ShiftType, id)

	rowsAffected,_ := result.RowsAffected()
	if rowsAffected == 0{
		c.JSON(http.StatusNotFound, gin.H{"error":"No changes made, Entry may not exist or is already up to date"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"error": "Entry edited successfully "})
}

func DeleteRosterEntry(c *gin.Context, db *sql.DB) {
	var query string
	var result sql.Result
	var deleteErr error
	entryId := c.Query("entry_id")
	rosterId := c.Query("roster_id")
	workerId := c.Query("worker_id")
	shift_date := c.Query("shift_date")
	shift_type := c.Query("shift_type")

	if entryId != "" {
		query = "DELETE FROM roster_entries WHERE entry_id = ?"
		result, deleteErr = db.Exec(query, entryId)
	} else {
		baseQuery := "DELETE FROM roster_entries WHERE "
		var conditions []string
		var args []interface{}
		if rosterId != "" {
			conditions = append(conditions, "roster_id = ?")
			args = append(args, rosterId)
		}
		if workerId != "" {
			conditions = append(conditions, "worker_id = ?")
			args = append(args, workerId)
		}
		if shift_date != "" {
			layout := "2006-01-02"
			entryDate, entryDateErr := time.Parse(layout, shift_date)
			if entryDateErr != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date time format"})
				return
			}

			if entryDate.Before(time.Now()){
				c.JSON(http.StatusBadRequest,gin.H{"error":"Shift date must be in the future"})
				return
			}

			conditions = append(conditions, "shift_date = ?")
			args = append(args, shift_date)
		}
		if shift_type != "" {
			conditions = append(conditions, "shift_type = ?")
			args = append(args, shift_type)
		}

		if len(conditions) == 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "No filter parameters provided"})
			return
		}

		whereClause := strings.Join(conditions, " AND ")
		finalQuery := baseQuery + whereClause

		result, deleteErr = db.Exec(finalQuery, args...)
	}

	if deleteErr != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error in extracting values\n" + deleteErr.Error()})
		return
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error in checking rows\n" + err.Error()})
		return
	}

	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "No Entry found, Entry matching params does not exist"})
	} else {
		c.JSON(http.StatusOK, gin.H{"message": "Entry deleted successfully"})
	}
}
