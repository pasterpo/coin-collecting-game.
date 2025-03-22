const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 600;
canvas.height = 400;

const players = {};
const coins = [];
const coinCount = 10;
const playerSpeed = 2;

function startGame() {
  const username = document.getElementById('username').value;
  if (!username) return alert('Enter a username');

  document.getElementById('login').style.display = 'none';
  document.getElementById('gameContainer').style.display = 'block';

  // Add player to game
  players[username] = {
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    score: 0,
    color: getRandomColor(),
  };

  spawnCoins();
  updateGame();
  window.addEventListener('keydown', (e) => movePlayer(e, username));
}

function getRandomColor() {
  return `hsl(${Math.random() * 360}, 100%, 50%)`;
}

function spawnCoins() {
  coins.length = 0;
  for (let i = 0; i < coinCount; i++) {
    coins.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
    });
  }
}

function movePlayer(event, username) {
  const player = players[username];
  if (event.key === 'ArrowUp') player.y -= playerSpeed;
  if (event.key === 'ArrowDown') player.y += playerSpeed;
  if (event.key === 'ArrowLeft') player.x -= playerSpeed;
  if (event.key === 'ArrowRight') player.x += playerSpeed;

  collectCoins(username);
}

function collectCoins(username) {
  const player = players[username];
  coins.forEach((coin, index) => {
    const distance = Math.hypot(player.x - coin.x, player.y - coin.y);
    if (distance < 15) {
      player.score++;
      coins.splice(index, 1);
      spawnCoins();
    }
  });
}

function updateLeaderboard() {
  const leaderboard = Object.entries(players)
    .sort((a, b) => b[1].score - a[1].score)
    .slice(0, 10);

  const leaderboardList = document.getElementById('leaderboardList');
  leaderboardList.innerHTML = '';
  leaderboard.forEach(([username, player]) => {
    const li = document.createElement('li');
    li.textContent = `${username}: ${player.score} coins`;
    leaderboardList.appendChild(li);
  });
}

function drawPlayers() {
  Object.values(players).forEach((player) => {
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.arc(player.x, player.y, 10, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawCoins() {
  coins.forEach((coin) => {
    ctx.fillStyle = 'gold';
    ctx.beginPath();
    ctx.arc(coin.x, coin.y, 5, 0, Math.PI * 2);
    ctx.fill();
  });
}

function updateGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawPlayers();
  drawCoins();
  updateLeaderboard();
  requestAnimationFrame(updateGame);
}
