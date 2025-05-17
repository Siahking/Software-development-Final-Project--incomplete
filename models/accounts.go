package models

import (
	"database/sql"
	"net/http"
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/go-sql-driver/mysql"
	"strconv"
)

type Account struct {
	AccountID int     `json:"account_id"`
	Username  *string `json:"username"`
	Password  *string `json:"password"`
}

func CreateAccount(c *gin.Context, db *sql.DB) {
	var account Account

	if err := c.ShouldBindJSON(&account); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	if *account.Username == "" || *account.Password == "" {
		c.JSON(http.StatusBadRequest,gin.H{"error":"Invalid Params"})
		return
	}

	query := "INSERT INTO user_accounts (username,password) VALUES (?,?)"

	_,insertionErr := db.Exec(query, account.Username,account.Password)

	if insertionErr != nil {
		if mysqlErr, ok := insertionErr.(*mysql.MySQLError); ok {
			if mysqlErr.Number == 1062 {
				c.JSON(http.StatusConflict, gin.H{"error": "An accout with this username already exists"})
				return
			}
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error in creating account: " + insertionErr.Error()})
		return
	}

	c.JSON(http.StatusCreated,gin.H{"message":"Account created successfully"})
}

func RetrieveAccounts(c *gin.Context, db *sql.DB){
	baseString := "SELECT * FROM user_accounts WHERE "
	accountId := c.Query("account_id")
	username := c.Query("username")
	var accounts []Account

	var query string
	var rows *sql.Rows
	var err error

	if accountId != ""{
		query = baseString + "account_id = ?"
		rows, err = db.Query(query,accountId)
	}else if username != ""{
		query = baseString + "username = ?"
		rows, err = db.Query(query,username)
	}else{
		c.JSON(http.StatusBadRequest,gin.H{"error":"Invalid params"})
		return
	}

	if err != nil{
		c.JSON(http.StatusInternalServerError,gin.H{"error":"Error in retreiving values\n"+err.Error()})
		return
	}
	defer rows.Close()

	for rows.Next(){
		var account Account

		err := rows.Scan(&account.AccountID,&account.Username,&account.Password)

		if err != nil{
			c.JSON(http.StatusInternalServerError,gin.H{"error":"Error in scanning rows\n"+err.Error()})
			return
		}

		accounts = append(accounts, account)
	}

	if len(accounts) == 0{
		c.JSON(http.StatusNotFound,gin.H{"error":"No Accounts found"})
		return
	}else{
		c.JSON(http.StatusOK,accounts)
	}
}

func EditAccount(c *gin.Context, db *sql.DB){
	var account Account
	idStr := c.Param("id")

	id, conversionErr := strconv.Atoi(idStr)

	if conversionErr != nil{
		c.JSON(http.StatusBadRequest,gin.H{"error":"Invalid ID parameter"})
		return
	}

	if err := c.ShouldBind(&account); err != nil {
		c.JSON(http.StatusBadRequest,gin.H{"error":"Invalid request body"})
		return
	}

	query := `UPDATE user_accounts SET
		username = COALESCE(?, username),
		password = COALESCE(?, password)
		WHERE account_id = ?
	`

	result, err := db.Exec(query, account.Username,account.Password,id)

	if err != nil{
		fmt.Print(err.Error())
		return
	}

	rowsAffected,_ := result.RowsAffected()
	if rowsAffected == 0{
		c.JSON(http.StatusNotFound,gin.H{"error":"No changes made"})
		return
	}

	c.JSON(http.StatusOK,gin.H{"message":"Account modified successfully"})
}

func DeleteAccount(c *gin.Context, db *sql.DB){
	baseString := "DELETE FROM user_accounts WHERE "
	accountId := c.Query("account_id")
	username := c.Query("username")

	var query string
	var result sql.Result
	var err error

	if accountId != ""{
		query = baseString + "account_id = ?"
		result, err = db.Exec(query,accountId)
	}else if username != ""{
		query = baseString + "username = ?"
		result, err = db.Exec(query,username)
	}else{
		c.JSON(http.StatusBadRequest,gin.H{"error":"Invalid params"})
		return
	}

	if err != nil{
		c.JSON(http.StatusBadRequest,gin.H{"error":"Error in deleting values\n" + err.Error()})
		return
	}

	rowsAffected,_ := result.RowsAffected()
	if rowsAffected == 0{
		c.JSON(http.StatusNotFound,gin.H{"error":"No Entry found for given params"})
		return
	}else{
		c.JSON(http.StatusOK,gin.H{"message":"Account deleted successfully"})
	}
}
