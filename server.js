const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static(path.join(__dirname, 'public')));

wss.on('connection', function connection(ws) {
  ws.on('message', function message(data) {
    let parsed;
    try { parsed = JSON.parse(data.toString()); } catch (e) { parsed = { type: 'message', msg: data.toString() }; }
    const payload = JSON.stringify({ ...parsed, ts: Date.now() });
    // Broadcast to all connected clients
    wss.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    });
  });

  ws.send(JSON.stringify({ type: 'info', msg: 'Welcome to WebSocket chat' }));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
