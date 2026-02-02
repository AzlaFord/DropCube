package main

import (
	"dropcube-api/internal/handlers"
	"dropcube-api/internal/middleware"
	"log"
	"net/http"
)

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/health", handlers.HealthHandler)
	mux.HandleFunc("/upload", handlers.Upload)
	loggedMux := middleware.Middleware(mux)

	log.Println("Server running on :8080")
	if err := http.ListenAndServe(":8080", loggedMux); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
