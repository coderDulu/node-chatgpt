import { WebSocketServer } from 'ws';
import { questionCompletion } from './utils/openai.js';
import { encode, decode } from 'gpt-3-encoder';

const PORT = 3200;

const wss = new WebSocketServer({ port: PORT });




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

wss.on('listening', () => {
  console.log(`listening in ${PORT}`);
})

