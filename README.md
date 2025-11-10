# HexGlobal — Real-Time Global Message Wall

HexGlobal is a real-time, interactive messaging platform that visualizes live messages ("echoes") from users worldwide on a 3D globe. Messages appear as glowing points on the globe, providing a captivating way to explore global conversations with language translation and sentiment insights.

---
<img width="1344" height="632" alt="image" src="https://github.com/user-attachments/assets/f23da65c-9937-4c95-b3f4-7f2e017ad342" />
---

<img width="1341" height="621" alt="image" src="https://github.com/user-attachments/assets/6b4dd076-2980-4b97-add8-3a30126e33e4" />


## Features

- **Real-time communication:** WebSocket-based messaging for instant updates.
- **3D globe visualization:** Uses `globe.gl` and `three.js` to render messages geospatially.
- **Multi-language support:** Automatically detects user language and provides message translations.
- **Sentiment analysis:** Evaluates the emotional tone of messages for richer insights.
- **Responsive UI:** Modern React frontend with smooth animations via Framer Motion.
- **Robust backend:** Built with Go (Gin framework) for efficient WebSocket handling and broadcasting.

---

## Tech Stack

- Frontend: React, TypeScript, Framer Motion, globe.gl, three.js
- Backend: Go, Gin, Gorilla WebSocket
- Deployment: Environment-ready for cloud hosting

---

## Getting Started

### Prerequisites

- Go 1.25+
- Node.js 20+
- Yarn or npm

### Backend Setup

```bash
cd backend
go mod download
go run main.go
