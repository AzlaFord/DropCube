package handlers

import (
	"database/sql"
	"net/http"
)

func Upload(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			w.WriteHeader(http.StatusMethodNotAllowed)
			w.Write([]byte("Method not allowed"))
			return
		}
		_, multipartHeader, errfile := r.FormFile("file")
		if errfile != nil || multipartHeader.Filename == "" {
			w.WriteHeader(http.StatusBadRequest)
			return
		}
		if multipartHeader.Filename != "" {
			w.WriteHeader(http.StatusCreated)
			w.Write([]byte("Upload"))
		}
	}
}
