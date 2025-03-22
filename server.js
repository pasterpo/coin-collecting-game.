const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(__dirname));

const players = {};
let coins = generateCoins();

// Handle new connections
io.on("connection", (socket) => {
  console.log("New player connected:", socket.id);

  socket.on("newPlayer", (username) => {
    players[socket.id] = {
      username,
      x: Math.random() * 600,
      y: Math.random() * 400,
      score: 0,
    };
    io.emit("updatePlayers", players);
    io.emit("updateCoins", coins);
  });

  socket.on("movePlayer", (key) => {
    if (!players[socket.id]) return;

    let speed = 5;
    if (key === "ArrowUp") players[socket.id].y -= speed;
    if (key === "ArrowDown") players[socket.id].y += speed;
    if (key === "ArrowLeft") players[socket.id].x -= speed;
    if (key === "ArrowRight") players[socket.id].x += speed;

    checkCoinCollision(socket.id);
    io.emit("updatePlayers", players);
  });

  socket.on("disconnect", () => {
    delete players[socket.id];
    io.emit("updatePlayers", players);
  });
});

// Generate random coins
function generateCoins() {
  let coinArray = [];
  for (let i = 0; i < 5; i++) {
    coinArray.push({
      x: Math.random() * 600,
      y: Math.random() * 400,
    });
  }
  return coinArray;
}

// Check if player collects a coin
function checkCoinCollision(playerId) {
  let player = players[playerId];
  coins = coins.filter((coin) => {
    let dx = player.x - coin.x;
    let dy = player.y - coin.y;
    let distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < 15) {
      player.score += 10;
      io.emit("updateLeaderboard", Object.values(players));
      return false; // Remove collected coin
    }
    return true;
  });

  if (coins.length === 0) {
    coins = generateCoins();
    io.emit("updateCoins", coins);
  }
}

server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
