import { Configuration, OpenAIApi } from 'openai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const config = fs.readFileSync(path.resolve(__dirname, '../config.json'), 'utf-8');


const configuration = new Configuration({
  apiKey: JSON.parse(config).apiKey,
});
const openai = new OpenAIApi(configuration);

export async function questionCompletion(messages, callback) {
  try {

    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages,
      max_tokens: 3000,
      temperature: 0,
      stream: true,
      // stop: ["ME: ", "AI: "],
      frequency_penalty: 0,
      presence_penalty: 0.6
    }, {
      // timeout: 10000,
      // proxy: {
      //   port: 7890,
      //   // host: "127.0.0.1"
      // },
      responseType: 'stream',
    });
    // 实时监听回答
    completion.data.on('data', callback);
    // console.log(completion.headers);
    return completion;
  } catch (error) {
    console.log('error status =>', error);
  }
}

function chineseToUnicode(str) {
  // if(!str) return;
  let unicodeStr = "";
  for (let i = 0; i < str.length; i++) {
    let unicodeVal = str.charCodeAt(i).toString(16);
    unicodeStr += "\\u" + "0".repeat(4 - unicodeVal.length) + unicodeVal;
  }
  return unicodeStr;
}

(async () => {
  const text = [
    { role: "user", content: '你好' },
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