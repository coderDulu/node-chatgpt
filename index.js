const Koa = require('koa');
const serve = require('koa-static');
const http = require('http');
const WebSocket = require('ws');
const app = new Koa();
const port = 3000;
// 静态资源服务器
app.use(serve('public'));
// HTTP服务器
const server = http.createServer(app.callback());
// WebSocket服务器
const wss = new WebSocket.Server({ server });
wss.on('connection', (ws) => {
  console.log('Client connected');
  ws.on('message', (message) => {
    console.log(`Received message: ${message}`);
    ws.send(`Received message: ${message}`);
  });
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});
server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});