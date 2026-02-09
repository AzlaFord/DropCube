package handlers

import (
	"database/sql"
	"io"
	"net/http"
	"os"
	"time"
)

func Upload(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			w.WriteHeader(http.StatusMethodNotAllowed)
			w.Write([]byte("Method not allowed"))
			return
		}
		file, multipartHeader, errfile := r.FormFile("file")
		if errfile != nil || multipartHeader.Filename == "" {
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		dst, err := os.Create("internal/uploads/" + multipartHeader.Filename)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		defer dst.Close()
		_, err = io.Copy(dst, file)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		filename := multipartHeader.Filename
		filepath := "internal/uploads/" + filename
		size := multipartHeader.Size
		uploadedAt := time.Now()
		_, err = db.Exec(
			"INSERT INTO files(filename, filepath, size, uploaded_at) VALUES($1,$2,$3,$4)",
			filename, filepath, size, uploadedAt,
		)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		if multipartHeader.Filename != "" {
			w.WriteHeader(http.StatusCreated)
			w.Write([]byte("Upload successful"))

		}
	}
}
