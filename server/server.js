// server.js

const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Middleware (if needed)
app.use(express.json());

// Sample route
app.get("/", (req, res) => {
  res.send("Server is running");
});

// Socket.io setup
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // Handle events here
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 1991;
server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
