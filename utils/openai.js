const { Configuration, OpenAIApi } =  require('openai');
const fs = require('fs');
const path = require('path');
const config = fs.readFileSync(path.resolve(__dirname, '../config.json'), 'utf-8');

const { apiKey, proxy } = JSON.parse(config);

const configuration = new Configuration({
  apiKey: apiKey,
});
const openai = new OpenAIApi(configuration);
async function questionCompletion(messages, callback) {
  try {

    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages,
      max_tokens: 3000,
      // temperature: 0.7,
      stream: true,
      // stop: ["ME: ", "AI: "],
      // frequency_penalty: 0,
      // presence_penalty: 0.6
    }, {
      proxy: proxy ? {
        host: proxy?.match(/https?:\/\/(.*):(.*)/)[1],
        port: proxy?.match(/https?:\/\/(.*):(.*)/)[2],
        // host: "127.0.0.1"
      } : false,
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


// 测试
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

module.exports =  {
  questionCompletion
}