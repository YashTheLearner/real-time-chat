"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const dotenv_1 = __importDefault(require("dotenv"));
const https_1 = __importDefault(require("https"));
const fs_1 = __importDefault(require("fs"));
dotenv_1.default.config(); // Load environment variables from .env file
const port = parseInt(process.env.PORT || "8080"); // Ensure port is 8080
// Load SSL certificates
const server = https_1.default.createServer({
    key: fs_1.default.readFileSync('/etc/letsencrypt/live/backend.yashprojects.live/privkey.pem'),
    cert: fs_1.default.readFileSync('/etc/letsencrypt/live/backend.yashprojects.live/fullchain.pem'),
});
const wss = new ws_1.WebSocketServer({ server });
server.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
const rooms = [];
// wss.on("connection", (ws) => {
//   ws.on("error", console.error);
//   ws.on("message", (data) => {
//     handleMessage(ws, data);
//   });
//   ws.send(
//     JSON.stringify({
//       message: "connected",
//     })
//   );
//   console.log("Client connected");
// ws.on("close", () => {
//   handleDisconnect(ws);
// });
// });
// const handleMessage = (ws: WebSocket, data: RawData) => {
//   try {
//     const parsedMsg = JSON.parse(data.toString());
//     console.log(parsedMsg);
//     console.log(parsedMsg.payload.message);
//     switch (parsedMsg.type) {
//       case "create-room":
//         createRoom(ws);
//         break;
//       case "join-room":
//         joinRoom(ws, parsedMsg.payload.roomId);
//         break;
//       case "leave-room":
//         leaveRoom(ws, parsedMsg.payload.roomId);
//         break;
//       case "send-message":
//         sendMessage(ws, parsedMsg.payload.roomId, parsedMsg.payload.message);
//         break;
//       default:
//         ws.send(
//           JSON.stringify({
//             message: "invalid message type1",
//           })
//         );
//     }
//   } catch (err) {
//     console.log("error ====>", err);
//     ws.send(
//       JSON.stringify({
//         message: "invalid message type2",
//       })
//     );
//   }
// };
// const sendMessage = (ws: WebSocket, roomId: string, message: any) => {
//   const room = rooms.find((room) => room.roomId === roomId);
//   if (room) {
//     console.log("msg=>", message);
//     console.log("msg=>", typeof message);
//     console.log("msg=>", message.by);
//     room.members.forEach((member) => {
//       member.send(JSON.stringify({chatMsg:message})); // convert message object to JSON string
//     });
//   } else {
//     ws.send(
//       JSON.stringify({
//         message: "Room not found",
//       })
//     );
//   }
// };
const handleDisconnect = (ws) => {
    rooms.forEach((room) => {
        room.members = room.members.filter((member) => member !== ws);
        if (room.members.length === 0) {
            const index = rooms.indexOf(room);
            rooms.splice(index, 1);
        }
    });
    console.log("Client disconnected");
};
// const generateRoomId = () => {
//   return Math.floor(100000 + Math.random() * 900000).toString(); // Ensures a 6-digit number
// };
// ---------------------
wss.on("connection", (ws) => {
    ws.clientId = generateId(); // Assign unique client ID
    ws.name = "Anonymous"; // Default name for the client
    ws.on("message", (data) => {
        handleMessage(ws, data);
    });
    ws.on("close", () => {
        handleDisconnect(ws);
    });
    setInterval(() => {
        ws.send(JSON.stringify({
            rooms: rooms.map((room) => room.roomId),
        }));
    }, 3000);
    ws.send(JSON.stringify({
        message: "connected",
        clientId: ws.clientId,
    }));
    console.log(`Client connected with ID: ${ws.clientId}`);
});
const handleMessage = (ws, data) => {
    try {
        const parsedMsg = JSON.parse(data.toString());
        switch (parsedMsg.type) {
            case "set-name":
                ws.name = parsedMsg.payload.name; // Update the name for the client
                ws.send(JSON.stringify({
                    message: `Name set to ${ws.name}`,
                }));
                break;
            case "send-message":
                sendMessage(ws, parsedMsg.payload.roomId, parsedMsg.payload.message);
                break;
            case "create-room":
                createRoom(ws);
                break;
            case "join-room":
                joinRoom(ws, parsedMsg.payload.roomId);
                break;
            case "leave-room":
                leaveRoom(ws, parsedMsg.payload.roomId);
                break;
            default:
                ws.send(JSON.stringify({
                    message: "invalid message type1",
                }));
        }
    }
    catch (err) {
        console.error("Error handling message:", err);
        ws.send(JSON.stringify({
            message: "Invalid message format",
        }));
    }
};
const sendMessage = (ws, roomId, message) => {
    const room = rooms.find((room) => room.roomId === roomId);
    if (room) {
        room.members.forEach((member) => {
            member.send(JSON.stringify({
                chatMsg: {
                    text: message.text,
                    by: ws.name, // Use the name of the sender
                },
            }));
        });
    }
    else {
        ws.send(JSON.stringify({
            message: "Room not found",
        }));
    }
};
const createRoom = (ws) => {
    const roomId = generateId();
    console.log(`Room created with ID: ${roomId}`);
    rooms.push({ roomId, members: [ws] });
    ws.send(JSON.stringify({
        message: `Room created with ID: ${roomId}`,
        roomId: roomId,
    }));
    console.log(rooms, "end");
};
const joinRoom = (ws, roomId) => {
    const room = rooms.find((room) => room.roomId === roomId);
    if (room) {
        room.members.push(ws);
        ws.send(JSON.stringify({
            message: `Joined room ${roomId}`,
        }));
    }
    else {
        ws.send(JSON.stringify({
            message: "Room not found",
        }));
    }
};
const leaveRoom = (ws, roomId) => {
    const room = rooms.find((room) => room.roomId === roomId);
    if (room) {
        room.members = room.members.filter((member) => member !== ws);
        if (room.members.length === 0) {
            const index = rooms.indexOf(room);
            rooms.splice(index, 1);
        }
        ws.send(JSON.stringify({
            message: `Left room ${roomId}`,
        }));
    }
    else {
        ws.send(JSON.stringify({
            message: "Room not found",
        }));
    }
};
const generateId = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // Ensures a 6-digit number
};
// Graceful Shutdown
const shutdown = () => {
    console.log("Shutting down WebSocket server...");
    // Close all active WebSocket connections
    wss.clients.forEach((client) => {
        if (client.readyState === ws_1.WebSocket.OPEN) {
            client.close(1001, "Server shutting down"); // Close with status code 1001 (Going Away)
        }
    });
    // Stop the WebSocket server
    wss.close(() => {
        console.log("WebSocket server closed.");
        server.close(() => {
            console.log("HTTPS server closed.");
            process.exit(0); // Exit the process
        });
    });
};
// Listen for termination signals
process.on("SIGINT", shutdown); // Handle Ctrl+C (SIGINT)
process.on("SIGTERM", shutdown); // Handle termination signal (SIGTERM)
