import http from 'http';
import fs from 'fs';
import { WebSocketServer } from 'ws';

const PORT = 3001;


const server = http.createServer((req, res) => {
    fs.readFile('./public/index.html', (err, data) => {
        if (err) {
            res.writeHead(500);
            return res.end('Error loading index.html');
        }

        res.writeHead(200, { 'Content-Type': 'text/html'});
        res.end(data);
    });
});

const wss = new WebSocketServer({ server: server });

wss.on('connection', (socket, req) => {
    const username = new URL(req.url, "http://localhost").searchParams.get(
  "username",
);
    sendmsg({type: 'system', text: `${username} has joined`});
    socket.on('message', (raw) => {
    const parsed_raw = JSON.parse(raw);
    const { username, text } = parsed_raw;
    sendmsg({ type: 'chat', username, text });
    
});

    socket.on('close', () => { sendmsg({type: 'system', text: `${username} has left`})
    });
});

function sendmsg(msgobj) {
    wss.clients.forEach((item) => {
        if (item.readyState === item.OPEN) {
            item.send(JSON.stringify(msgobj));
        }

    });
};

server.listen(PORT, () => { console.log('Chat server running at http://localhost:3001');});

