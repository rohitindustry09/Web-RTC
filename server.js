const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let users = {}; // Store connected users with their IDs

wss.on("connection", (ws) => {
    ws.on("message", (message) => {
        try {
            const data = JSON.parse(message);

            switch (data.type) {
                case "register":
                    users[data.id] = ws;
                    console.log(`User ${data.id} connected`);
                    break;

                case "call":
                    if (users[data.to]) {
                        users[data.to].send(JSON.stringify({ type: "incomingCall", from: data.from, offer: data.offer }));
                    }
                    break;

                case "answer":
                    if (users[data.to]) {
                        users[data.to].send(JSON.stringify({ type: "callAccepted", answer: data.answer }));
                    }
                    break;

                case "iceCandidate":
                    if (users[data.to]) {
                        users[data.to].send(JSON.stringify({ type: "iceCandidate", candidate: data.candidate }));
                    }
                    break;
            }
        } catch (err) {
            console.error("Invalid JSON received:", err);
        }
    });

    ws.on("close", () => {
        for (let id in users) {
            if (users[id] === ws) {
                delete users[id];
                console.log(`User ${id} disconnected`);
                break;
            }
        }
    });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
                        
