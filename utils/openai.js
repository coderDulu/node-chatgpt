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


export async function questionCompletion(text, callback) {
  try {
    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: text,
      max_tokens: 3000,
      temperature: 0,
      stream: true,
      stop: [" ME:", " AI:"],
      // frequency_penalty: 0,
      // presence_penalty: 0.6
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
