const Koa = require('koa');
const serve = require('koa-static');
const http = require('http');
const WebSocket = require('ws');
const { questionCompletion } =  require('./utils/openai.js')


const app = new Koa();
const port = 3200;

// 静态资源服务器
app.use(serve('public'));
// HTTP服务器
const server = http.createServer(app.callback());
// WebSocket服务器
const wss = new WebSocket.Server({ server });

wss.on('connection', function connection(ws) {
  console.log('client connect');
  let completion;
  ws.on('error', console.error);

  ws.on('message', async function message(data) {
    try {
      const { text, type, value } = JSON.parse(data.toString());

      if (type === 'status' && value === "stop") {
        console.log('stop send');
        completion.data.destroy();
        return;
      }

      if (text) {
        let res = '';  // 保存回复的数据
        console.log(text.length);
        // 开始

        completion = await questionCompletion(text, data => {
          const lines = data.toString().split('\n').filter(line => line.trim() !== '');

          for (const line of lines) {
            const message = line.replace(/^data: /, '');
            if (message === '[DONE]') {
              console.log(res);
              ws.send(JSON.stringify({
                type: "status",
                value: 'end'
              }));
              return;
            }
            try {
              const parsed = JSON.parse(message);
              // 获取回复的内容
              const { delta: { content } } = parsed.choices[0];

              if (content) {
                res += `${content}`;
                ws.send(JSON.stringify({ type: "answer", value: content })); // 发送给客户端
              }

            } catch (error) {
              console.error('Could not JSON parse stream message', message, error);
            }
          }
        }); // 获取result
      }


    } catch (error) {
      console.log(error);
    }
  });

});



server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});