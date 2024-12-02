import { WebSocketServer, WebSocket, RawData } from "ws";

const wss = new WebSocketServer({ port: 8080 });

type message = {
  id: number;
  text: string;
  by: WebSocket;
};

type Room = {
  roomId: string;
  members: WebSocket[];
};
const rooms: Room[] = [];

wss.on("connection", (ws) => {
  ws.on("error", console.error);

  ws.on("message", (data) => {
    handleMessage(ws, data);
  });

  ws.send(
    JSON.stringify({
      message: "connected",
    })
  );
  console.log("Client connected");

  ws.on("close", () => {
    handleDisconnect(ws);
  });
});

const handleMessage = (ws: WebSocket, data: RawData) => {
  try {
    const parsedMsg = JSON.parse(data.toString());
    console.log(parsedMsg);
    console.log(parsedMsg.payload.message);

    switch (parsedMsg.type) {
      case "create-room":
        createRoom(ws);
        break;
      case "join-room":
        joinRoom(ws, parsedMsg.payload.roomId);
        break;
      case "leave-room":
        leaveRoom(ws, parsedMsg.payload.roomId);
        break;
      case "send-message":
        sendMessage(ws, parsedMsg.payload.roomId, parsedMsg.payload.message);
        break;
      default:
        ws.send(
          JSON.stringify({
            message: "invalid message type1",
          })
        );
    }
  } catch (err) {
    console.log("error ====>", err);
    ws.send(
      JSON.stringify({
        message: "invalid message type2",
      })
    );
  }
};

const createRoom = (ws: WebSocket) => {
  const roomId = generateRoomId();
  console.log(`Room created with ID: ${roomId}`);
  rooms.push({ roomId, members: [ws] });
  ws.send(
    JSON.stringify({
      message: `Room created with ID: ${roomId}`,
      roomId:roomId,
    })
  );
  console.log(rooms, "end");
};

const joinRoom = (ws: WebSocket, roomId: string) => {
  const room = rooms.find((room) => room.roomId === roomId);
  if (room) {
    room.members.push(ws);
    ws.send(
      JSON.stringify({
        message: `Joined room ${roomId}`,
      })
    );
  } else {
    ws.send(
      JSON.stringify({
        message: "Room not found",
      })
    );
  }
};

const leaveRoom = (ws: WebSocket, roomId: string) => {
  const room = rooms.find((room) => room.roomId === roomId);
  if (room) {
    room.members = room.members.filter((member) => member !== ws);
    if (room.members.length === 0) {
      const index = rooms.indexOf(room);
      rooms.splice(index, 1);
    }
    ws.send(
      JSON.stringify({
        message: `Left room ${roomId}`,
      })
    );
  } else {
    ws.send(
      JSON.stringify({
        message: "Room not found",
      })
    );
  }
};

const sendMessage = (ws: WebSocket, roomId: string, message: any) => {
  const room = rooms.find((room) => room.roomId === roomId);
  if (room) {
    console.log("msg=>", message);
    console.log("msg=>", typeof message);
    console.log("msg=>", message.by);
    room.members.forEach((member) => {
      member.send(JSON.stringify(message)); // convert message object to JSON string
    });
  } else {
    ws.send(
      JSON.stringify({
        message: "Room not found",
      })
    );
  }
};

const handleDisconnect = (ws: WebSocket) => {
  rooms.forEach((room) => {
    room.members = room.members.filter((member) => member !== ws);
  });
  console.log("Client disconnected");
};

const generateRoomId = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // Ensures a 6-digit number
};
