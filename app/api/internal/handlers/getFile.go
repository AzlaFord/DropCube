package handlers

import (
	"database/sql"
	"fmt"
	"net/http"
)

func GetFile(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var filepath string
		var filename string
		w.Header().Set("Content-Type", "application/json")
		fmt.Println("GET FILE:", r.URL.Path)
		id := r.URL.PATH[:-1]
		if r.Method != http.MethodGet {
			w.WriteHeader(405)
			w.Write([]byte("bad request"))
			return
		}
		row := db.QueryRow("SELECT filepath, filename FROM files WHERE id = $1", id)
		if err != nil {
			w.WriteHeader(405)
			w.Write([]byte("bad request"))
			return
		}

		defer row.Close()
		err := row.Scan(&filepath, &filename)
		if err != nil {
			w.WriteHeader(405)
			w.Write([]byte("bad request"))
			return
		}
		fmt.Println("PATH:", filepath)
		fmt.Println("NAME:", filename)
	}
}
