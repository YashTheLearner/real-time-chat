import { useState } from "react";

const App = () => {

    const [room, setRoom] = useState(""); // Track the current room
    const [roomInput, setRoomInput] = useState(""); // Input for room name
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");

    const createRoom = () => {
       
          console.log("createRoom");
            setRoom("lund");
            setMessages([]); // Clear messages when a new room is created
        
    };

    const joinRoom = () => {
        if (roomInput.trim()) {
            // setRoom(roomInput);
            setMessages([]); // Clear messages when joining a new room
        }
    };

    const sendMessage = () => {
        if (input.trim()) {
            // setMessages([...messages, { id: Date.now(), text: input, type: "sent" }]);
            setInput("");
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gray-900 text-gray-100">
            {!room ? (
                <div className="flex flex-col items-center justify-center flex-1 space-y-6">
                <h1 className="text-2xl font-bold text-white">Create or Join a Chat Room</h1>

                {/* Create Room Section */}
                <div className="bg--300">
                <div className="flex items-center gap-5">
                    <input
                        type="text"
                        className="w-40 px-4 py-2 bg-gray-700 text-gray-100 border border-gray-600 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
                        placeholder="Enter room name"
                        value={roomInput}
                        onChange={(e) => setRoomInput(e.target.value)}
                    />
                    <button
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                        onClick={createRoom}
                    >
                        Create Room
                    </button>
                </div>

                <div className="bg-slate-500 m-5 h-[2px]"></div>

                {/* Join Room Section */}
                <div className="flex items-center gap-5">
                    <input
                        type="number"
                        className="w-40 px-4 py-2 bg-gray-700 text-gray-100 border border-gray-600 rounded-md focus:outline-none focus:ring focus:ring-green-500"
                        placeholder="Enter room code"
                        value={roomInput}
                        onChange={(e) => setRoomInput(e.target.value)}
                    />
                    <button
                        className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                        onClick={joinRoom}
                    >
                        Join Room
                    </button>
                </div>
                </div>
            </div>
            ) : (
                <>
                    {/* Chat Header */}
                    <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
                        <h2 className="font-bold">Room: {room}</h2>
                        <button
                            className="text-red-500 hover:text-red-600"
                            onClick={() => setRoom("")}
                        >
                            Leave Room
                        </button>
                    </div>

                    {/* Chat Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((message) => (
                            <div
                                key={message}
                                className={`flex ${""
                                    // message.type === "sent" ? "justify-end" : "justify-start"
                                }`}
                            >
                                <div
                                    className={`max-w-xs p-3 rounded-lg ${
                                        // message?.type === "sent"
                                            // ? "bg-blue-500 text-white"
                                            // : "bg-gray-700 text-gray-200"""
                                            ""
                                    }`}
                                >
                                    {/* {message.text} */}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Chat Input */}
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
