package models

import (
	"database/sql"
	"fmt"

	_ "github.com/go-sql-driver/mysql"
)

func InitializeDB() (*sql.DB, error) {
	dsn := "root:J0s!@hK!ng@tcp(localhost:3306)/roster"
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		return nil, err
	}

	//Test database connection
	if err = db.Ping(); err != nil {
		return nil, fmt.Errorf("cannot connect to the database: %v", err)
	}

	fmt.Println("Connection established successfully!")
	return db, nil
}
