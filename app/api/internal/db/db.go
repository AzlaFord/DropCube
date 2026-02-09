package db

import (
	"database/sql"
	"os"

	_ "github.com/lib/pq"
)

func ConnectDB() (*sql.DB, error) {
	host := os.Getenv("DB_HOST")
	port := os.Getenv("DB_PORT")
	user := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASSWORD")
	name := os.Getenv("DB_NAME")
	db, err := sql.Open("postgres", "postgres://"+user+":"+password+"@"+host+":"+port+"/"+name+"?sslmode=disable")
	if err != nil {
		return db, err
	}
	errPing := db.Ping()
	if errPing != nil {
		return db, errPing
	}
	return db, nil
}
