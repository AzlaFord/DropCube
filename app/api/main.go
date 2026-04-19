package main

import (
	"dropcube-api/internal/db"
	"dropcube-api/internal/handlers"
	"dropcube-api/internal/middleware"
	"log"
	"net/http"

	"github.com/joho/godotenv"
)

func main() {
	godotenv.Load()
	db, err := db.ConnectDB()
	if err != nil {
		log.Fatalf("Cannot connect to DB: %v", err)
	}

	mux := http.NewServeMux()
	mux.HandleFunc("/files", handlers.ListFiles(db))
	mux.HandleFunc("/health", handlers.HealthHandler)
	mux.HandleFunc("/upload", handlers.Upload(db))
	loggedMux := middleware.Middleware(mux)

	log.Println("Server running on :8080")
	if err := http.ListenAndServe(":8080", loggedMux); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
