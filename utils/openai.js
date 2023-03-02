import { Configuration, OpenAIApi } from 'openai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { encode, decode} from 'gpt-3-encoder';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const config = fs.readFileSync(path.resolve(__dirname, '../config.json'), 'utf-8');


const configuration = new Configuration({
  apiKey: JSON.parse(config).apiKey,
});
const openai = new OpenAIApi(configuration);

export async function questionCompletion(text, callback) {
  try {
    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: text,
      max_tokens: 3000,
      temperature: 0,
      stream: true,
      stop: ["ME: ", "AI: "],
      frequency_penalty: 0,
      presence_penalty: 0.6
    }, {
      timeout: 10000,
      responseType: 'stream',
    });
    // 实时监听回答
    completion.data.on('data', callback);

    return completion;
  } catch (error) {
    // console.log(error);
    console.log(error.response);
  }
}

(async () => {
  const text = `\nHuman:你知道nodejs吗 AI:？ Human:你知道nodejs吗？ AI:\n\n是的，我知道Node.js。它是一个用于构建服务器端JavaScript应用程序的平台。`
  let res = ''
  await questionCompletion(encode(text), data => {
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
        const text = parsed.choices[0].text;

        if (text) {
          res += `${text}`
        }

      } catch (error) {
        console.error('Could not JSON parse stream message', message, error);
      }
    }
  }); // 获取result
})