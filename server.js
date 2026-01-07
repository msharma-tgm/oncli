const WebSocket = require('ws');

const PASSWORD = "123";
const wss = new WebSocket.Server({ port: 8080 });
const clients = new Set();

wss.on('connection', (ws) => {
  let authenticated = false;

  ws.on('message', (message) => {
    if (!authenticated) {
      try {
        const data = JSON.parse(message);
        if (data.password === PASSWORD) {
          authenticated = true;
          clients.add(ws);
          ws.send(JSON.stringify({ status: 'ok', msg: 'Authenticated' }));
          console.log('Client authenticated, total:', clients.size);
        } else {
          ws.send(JSON.stringify({ status: 'error', msg: 'Wrong password' }));
          ws.close();
        }
      } catch (e) {
        ws.send(JSON.stringify({ status: 'error', msg: 'Invalid password format' }));
        ws.close();
      }
      return;
    }

    // Relay authenticated messages
    for (const client of clients) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    }
  });

  ws.on('close', () => {
    if (authenticated) clients.delete(ws);
    console.log('Client disconnected, total:', clients.size);
  });
});

console.log('WebSocket server running on ws://localhost:8080');
