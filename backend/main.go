package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"github.com/joho/godotenv"
)

type Echo struct {
	Username    string  `json:"username"`
	Message     string  `json:"message"`
	Country     string  `json:"country"`
	CountryCode string  `json:"countryCode"`
	Latitude    float64 `json:"latitude"`
	Longitude   float64 `json:"longitude"`
	Timestamp   int64   `json:"timestamp"`
}

// Upgrade HTTP connection to WebSocket
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // allow all origins
	},
}

var clients = make(map[*websocket.Conn]bool)
var broadcast = make(chan Echo)

func main() {
	// Load .env if exists
	_ = godotenv.Load()
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	router := gin.Default()
	router.GET("/ws", handleConnections)

	go handleMessages()

	fmt.Printf("🚀 HexGlobal backend running at ws://localhost:%s/ws\n", port)
	router.Run(":" + port)
}

func handleConnections(c *gin.Context) {
	ws, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Println("Error upgrading:", err)
		return
	}
	defer ws.Close()

	clients[ws] = true
	log.Println("🟢 New client connected")

	for {
		var echo Echo
		err := ws.ReadJSON(&echo)
		if err != nil {
			log.Println("❌ Client disconnected:", err)
			delete(clients, ws)
			break
		}

		log.Printf("📩 Message received from %s: %s\n", echo.Username, echo.Message)
		broadcast <- echo
	}
}

func handleMessages() {
	for {
		echo := <-broadcast
		message, err := json.Marshal(echo)
		if err != nil {
			log.Println("Error marshalling:", err)
			continue
		}

		for client := range clients {
			err := client.WriteMessage(websocket.TextMessage, message)
			if err != nil {
				log.Println("Error writing to client:", err)
				client.Close()
				delete(clients, client)
			}
		}
	}
}
