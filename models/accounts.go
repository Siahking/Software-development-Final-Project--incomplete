package models

import (
	"database/sql"
	"github.com/gin-gonic/gin"
	"github.com/go-sql-driver/mysql"
)

type Account struct {
	AccountID 	int `json:"account_id"`
	Username	string `json:"username"`
	Password string `json:"password"`
}

func CreateAccount(c *gin.Context,db sql.DB){
	
}