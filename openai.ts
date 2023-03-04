import { Configuration, OpenAIApi } from 'openai';
import config from './config.json';

const { apiKey } = config;


const configuration = new Configuration({
  apiKey
});
const openai = new OpenAIApi(configuration);

export async function questionCompletion(messages, callback) {
  try {

    const completion = await openai.createChatCompletion({
      // model: "text-davinci-003",
      model: "gpt-3.5-turbo",
      // prompt: text,
      stream: true,
      messages,
      max_tokens: 3000,
    }, {
      // timeout: 10000,
      // @ts-ignore
      proxy: {
        port: 7890,
      },
      responseType: 'stream',
    });
    // 实时监听回答
    // @ts-ignore
    completion.data.on('data', callback);
    // console.log(completion.headers);
    // return completion.data.choices[0].message?.content;
    return completion;
  } catch (error) {
    console.log(messages);
    console.log('error status =>', error);
  }
}

(async () => {
  const text = [
    { role: 'user', content: '你好' },
    { role: 'assistant', content: '你好！我是AI助手。有什么可以帮到你的吗？' },
    { role: 'user', content: '你知道nodejs吗' },
    {
      role: 'assistant',
      content: '是的，Node.js是一个基于ChromeV8引擎的JavaScript运行时环境。在多种操作系统上，包括Windows、MacOSX、Linux等。它的应用场景非常广泛，包括Web服务器、命令行工具、桌面应用程序等。'
    },
    { role: 'user', content: 'express呢' }
  ]
  let res = ''

  await questionCompletion(text, data => {
    const lines = data.toString().split('\n').filter(line => line.trim() !== '');
    // console.log(lines);

    for (const line of lines) {
      const message = line.replace(/^data: /, '');
      if (message === '[DONE]') {
        console.log(res);
        return;
      }
      try {
        // console.log(message);
        const parsed = JSON.parse(message);
        const { delta: { content } } = parsed.choices[0];

        if (content) {
          res += `${content}`
        }

      } catch (error) {
        console.error('Could not JSON parse stream message', message, error);
      }
    }
  }); // 获取result
})