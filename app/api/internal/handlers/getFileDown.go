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

func GetFileDown(db *sql.DB) http.HandlerFunc {

	return func(w http.ResponseWriter, r *http.Request) {

		buf := make([]byte, 512)
		var filepath string
		var filename string

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
			w.WriteHeader(500)
			return
		}
		fmt.Println("PATH:", filepath)
		fmt.Println("NAME:", filename)
		file, err := os.Open(filepath)
		if err != nil {
			w.WriteHeader(404)
			w.Write([]byte("Not Found"))
			return
		}
		defer file.Close()

		n, err := file.Read(buf)
		if err != nil && err != io.EOF {
			w.WriteHeader(500)
			return
		}

		file.Seek(0, 0)
		fileType := http.DetectContentType(buf[:n])

		w.Header().Set("Content-Type", fileType)

		w.Header().Set("Content-Disposition", "attachment; filename="+filename)
		w.WriteHeader(200)
		io.Copy(w, file)
	}
}
