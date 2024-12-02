import { useEffect, useState } from "react";

const App = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [name, setName] = useState(""); // Track the user's name
  const [isNameSet, setIsNameSet] = useState(false); // Track if the name is set
  const [room, setRoom] = useState(""); // Track the current room
  const [rooms, setRooms] = useState<string[]>([]);
  const [roomInput, setRoomInput] = useState(""); // Input for room Code
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080");
    setSocket(socket);

    socket.onmessage = (e) => {
      const parsedData = JSON.parse(e.data);
      if (parsedData.roomId) {
        setRoom(parsedData.roomId);
      }

      if (parsedData.chatMsg) {
        setMessages((prevMessages) => [...prevMessages, parsedData.chatMsg]);
      }
      if(parsedData.rooms){
        setRooms(parsedData.rooms);
      }
    };
  }, []);

  type Message = {
    id: number;
    text: string;
    by: string; // Sender's name
  };

  const setNameHandler = () => {
    if (name.trim() && socket) {
      socket.send(
        JSON.stringify({
          type: "set-name",
          payload: {
            name: name,
          },
        })
      );
      setIsNameSet(true);
    }
  };

  const createRoom = () => {
    socket!.send(
      JSON.stringify({
        type: "create-room",
        payload: {},
      })
    );
    setMessages([]);
  };

  const joinRoom = () => {
    if (roomInput.trim()) {
      socket!.send(
        JSON.stringify({
          type: "join-room",
          payload: {
            roomId: roomInput,
          },
        })
      );
      setRoom(roomInput);
      setMessages([]);
    }
  };

  const sendMessage = () => {
    if (input.trim()) {
      socket!.send(
        JSON.stringify({
          type: "send-message",
          payload: {
            roomId: room,
            message: { text: input },
          },
        })
      );
      setInput("");
    }
    console.log(messages);
  };

  const leaveRoom = () => {
    console.log("leave room");
    socket!.send(
      JSON.stringify({
        type: "leave-room",
        payload: {
          roomId: room,
        },
      })
    );
    setRoom("");
    setMessages([]);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-100">
      {!isNameSet ? (
        <div className="flex flex-col items-center justify-center h-screen space-y-6">
          <h1 className="text-2xl font-bold text-white">Set Your Name</h1>
          <input
            type="text"
            className="w-60 px-4 py-2 bg-gray-700 text-gray-100 border border-gray-600 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && setNameHandler}
          />
          <button
            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            onClick={setNameHandler}
            
          >
            Set Name
          </button>
        </div>
      ) : !room ? (
        <div className="flex flex-col items-center justify-center flex-1 space-y-6">
          <h1 className="text-2xl font-bold text-white">
            Create or Join a Chat Room
          </h1>
          <div className="flex items-center gap-5">
            <input
              type="number"
              className="w-40 px-4 py-2 bg-gray-700 text-gray-100 border border-gray-600 rounded-md focus:outline-none focus:ring focus:ring-green-500"
              placeholder="Enter room code"
              value={roomInput}
              onChange={(e) => setRoomInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && joinRoom}
            />
            <button
              className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              onClick={joinRoom}
              
            >
              Join Room
            </button>
          </div>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            onClick={createRoom}
          >
            Create Room
          </button>

          <div className="h-[180px] w-[300px] overflow-hidden flex flex-col items-center border-2 border-white bg-gradient-to-b from-slate-700 to-slate-900 rounded-lg shadow-lg absolute bottom-5">
  <h1 className="text-2xl font-bold text-white mt-1">Rooms Online</h1>
  <div className="flex flex-col items-center justify-center space-y-2 mt-3 w-full px-4">
    {rooms.slice(0, 4).map((room, index) => (
      <div key={index} className="bg-zinc-">
        <button
          className=" text-white bg--600 hover:bg-slate-500 rounded-md transition duration-300 shadow-md"
          onClick={() => {
            setRoomInput(room);
          }}
        >
          {room}
        </button>
      </div>
    ))}
  </div>
</div>

        </div>
        
      ) : (
        <>
          <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
            <h2 className="font-bold">
              Room: {room}
            </h2>
            <button
              className="text-red-500 hover:text-red-600"
              onClick={leaveRoom}
            >
              Leave Room
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex flex-col ${
                  message.by === name ? "items-end text-[]" : ""
                }`}
              >
                <span className="font-bold">{message.by}:</span>
                <span>{message.text}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center p-4 border-t border-gray-700 bg-gray-800">
            <input
              type="text"
              className="flex-1 px-4 py-2 bg-gray-700 text-gray-100 border border-gray-600 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              onClick={sendMessage}
            >
              Send
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default App;
