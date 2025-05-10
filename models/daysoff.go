package models

import (
	"database/sql"
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-sql-driver/mysql"
)

type DaysOff struct {
	BreakId   int     `json:"break_id"`
	WorkerId  *int     `json:"worker_id"`
	StartDate *string `json:"start_date"`
	EndDate   *string `json:"end_date"`
}

// create a new day off field
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

// retrieve all dayoffs values, or retrieve values based on worker_id or break_id
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

// remove dayoff data based on break_id
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

func EditDayOff(c *gin.Context, db *sql.DB) {
	var dayOff DaysOff
	idStr := c.Param("id")

	id, conversonErr := strconv.Atoi(idStr)

	if conversonErr != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID parameter"})
		return
	}

	if err := c.ShouldBindJSON(&dayOff); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	if err := checkDates(dayOff); err != nil{
		c.JSON(http.StatusBadRequest, gin.H{"error":err.Error()})
		return
	}

	query := `UPDATE days_off SET
			worker_id = COALESCE(?, worker_id),
			start_date = COALESCE(?, start_date),
			end_date = COALESCE(?, end_date)
			WHERE break_id = ?`

	_, err := db.Exec(query, dayOff.WorkerId,dayOff.StartDate,dayOff.EndDate,id)

	if err != nil {
		var errMsg string
		if mysqlErr, ok := err.(*mysql.MySQLError); ok {
			switch mysqlErr.Number {
			case 1452:
				errMsg = "Worker with this ID does not exist"
			case 3819:
				errMsg = "Can't use the same worker value for both params"
			case 1062:
				errMsg = "Duplicate Entry, a constraint with this ID Number already exists"
			default:
				fmt.Print(err)
			}
		} else {
			errMsg = "Unknown error occurred"
		}
		c.JSON(http.StatusConflict, gin.H{"error": errMsg})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Day Off modified successfully"})
}

func checkDates(dayOff DaysOff)error{
	layout := "2006-01-02"

	startDate, startDateErr := time.Parse(layout, *dayOff.StartDate)
	endDate, endDateErr := time.Parse(layout, *dayOff.EndDate)
	if startDateErr != nil || endDateErr != nil {
		return errors.New(" Invalid date time format")
	}

	if startDate.Before(time.Now()) {
		return errors.New(" Start date must be in the future")
	}

	if endDate.Before(startDate) {
		return errors.New(" End Date must be after the start date")
	}

	return nil
}