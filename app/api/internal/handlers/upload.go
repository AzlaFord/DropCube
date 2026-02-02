package handlers

import "net/http"

func Upload(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		w.Write([]byte("method not allowed"))
		return
	}
	w.WriteHeader(http.StatusCreated)
	w.Write([]byte("Upload"))
}
