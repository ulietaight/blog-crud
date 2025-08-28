let currentRound = null;

async function login(event) {
  event.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const res = await fetch('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (res.ok) {
    document.getElementById('login').style.display = 'none';
    document.getElementById('game').style.display = 'block';
    loadRound();
  } else {
    alert('Login failed');
  }
}

async function loadRound() {
  const res = await fetch('/rounds');
  const rounds = await res.json();
  if (rounds.length > 0) {
    currentRound = rounds[0];
    document.getElementById('status').innerText = currentRound.status;
  }
}

async function tap() {
  if (!currentRound) return;
  const res = await fetch(`/rounds/${currentRound.id}/tap`, { method: 'POST' });
  const data = await res.json();
  document.getElementById('points').innerText = data.points;
}

document.getElementById('loginForm').addEventListener('submit', login);
document.getElementById('tap').addEventListener('click', tap);
