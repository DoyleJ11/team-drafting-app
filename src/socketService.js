// src/socketService.js

import io from "socket.io-client";

const socket = io("http://localhost:1991"); // Update with your server URL

export default socket;
