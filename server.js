const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 8080 });

let users = {}; // Store connected users with their IDs

wss.on("connection", (ws) => {
    ws.on("message", (message) => {
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
console.log("WebSocket server running on ws://localhost:8080");
