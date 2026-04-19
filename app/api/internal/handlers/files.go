package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
)

type File struct {
	ID       int
	Filename string
	Size     int64
}

func ListFiles(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		var files []File
		fmt.Println("LIST HIT")
		if r.Method != http.MethodGet {
			w.WriteHeader(405)
			w.Write([]byte("bad request"))
			return
		}
		rows, err := db.Query("Select id, filename, size From files")
		if err != nil {
			w.WriteHeader(405)
			w.Write([]byte("bad request"))
			return
		}
		defer rows.Close()
		for rows.Next() {
			var file File
			err = rows.Scan(&file.ID, &file.Filename, &file.Size)
			if err != nil {
				w.WriteHeader(http.StatusInternalServerError)
				return
			}
			files = append(files, file)
		}

		if err := rows.Err(); err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		w.WriteHeader(200)
		w.Write([]byte("OK LIST"))
		json.NewEncoder(w).Encode(files)
		return
	}
}
