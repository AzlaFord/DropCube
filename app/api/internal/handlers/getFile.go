package handlers

import (
	"database/sql"
	"fmt"
	"io"
	"net/http"
	"os"
	"strconv"
	"strings"
)

func GetFile(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var filepath string
		var filename string
		w.Header().Set("Content-Type", "application/json")
		fmt.Println("GET FILE:", r.URL.Path)
		parts := strings.Split(r.URL.Path, "/")
		idStr := parts[len(parts)-1]
		id, err := strconv.Atoi(idStr)

		if err != nil {
			w.WriteHeader(405)
			w.Write([]byte("bad request"))
			return
		}
		if r.Method != http.MethodGet {
			w.WriteHeader(405)
			w.Write([]byte("bad request"))
			return
		}
		row := db.QueryRow("SELECT filepath, filename FROM files WHERE id = $1", id)

		errScan := row.Scan(&filepath, &filename)

		if errScan != nil {
			w.WriteHeader(405)
			w.Write([]byte("bad request"))
			return
		}
		fmt.Println("PATH:", filepath)
		fmt.Println("NAME:", filename)
		file, err := os.Open(filepath)
		defer file.Close()
		w.Header().Set("Content-Disposition", "attachment; filename="+filename)
		io.Copy(w, file)
		w.WriteHeader(200)
		w.Write([]byte("ok"))
	}
}
