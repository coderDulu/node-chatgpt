import { WebSocketServer } from 'ws';
import { questionCompletion } from './utils/openai.js';
import { encode, decode} from 'gpt-3-encoder';

const PORT = 3100;

const wss = new WebSocketServer({ port: PORT });




wss.on('connection', function connection(ws) {
  console.log('client connect');
  let completion;
  ws.on('error', console.error);

  ws.on('message', async function message(data) {
    try {
      const { text, type } = JSON.parse(data.toString());

      if (type === 'stop') {
        completion.data.destroy();
        return;
      }

      if (text) {
        let res = '';  // 保存回复的数据
        console.log(`${text}`);
        // console.log([...Buffer.from(text)], encode(text));
        // 开始
        completion = await questionCompletion(encode(text), data => {
          const lines = data.toString().split('\n').filter(line => line.trim() !== '');

          for (const line of lines) {
            const message = line.replace(/^data: /, '');
            if (message === '[DONE]') {
              console.log(res);
              ws.send("end");
              return;
            }
            try {
              // console.log(message);
              const parsed = JSON.parse(message);
              const text = parsed.choices[0].text;
            
              if (text) {
                res += `${text}`
                ws.send(text);
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

