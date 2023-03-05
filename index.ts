import TelegramBot from 'node-telegram-bot-api';
import config from './config.json'
import { questionCompletion } from './openai';
import Bot from './utils/bot';

// @ts-ignore
const { token, baseApiUrl, proxy } = config;

// 防抖函数
function throttle(func: any, wait: number) {
  let previous = 0;
  return function (this: any, ...args: any[]) {
    const now = +new Date();
    const context = this;
    if (now - previous > wait) {
      func.apply(context, args);
      previous = now;
    }
  }
}

// 防抖实现实时发送数据
const editSendMsg = throttle((res: string, bot: TelegramBot, message_id: number, chat_id: string | number) => {
  if (res) {
    bot.editMessageText(res, {
      parse_mode: 'Markdown',
      chat_id,
      message_id
    }).then().catch(err => {
      // console.log('err');
    })
  }
}, 500);

// 保存问题和答案
const messages: {
  role: string;
  content: string;
}[] = [];


(async () => {
  try {
    const bot = Bot.getInstance(token, {
      polling: true,
      baseApiUrl: baseApiUrl ?? 'https://api.telegram.org',
      // @ts-ignore
      request: {
        proxy
      }
    })

    console.log('bot is running');

    bot.setMyCommands([
      {
        command: "/start",
        description: "开始聊天"
      },
      {
        command: "/chat",
        description: "发送消息"
      }
    ])
    bot.onText(/\/start/, (msg) => {
      const chat_id = msg.chat.id;
      bot.sendMessage(chat_id, "输入 /chat 开始聊天")
    })

    bot.onText(/\/chat (.*)/, async (msg, match) => {
      const chat_id = msg.chat.id;
      const chat = match ? match[1] : "";

      if (messages.length === 10) {
        messages.shift();
      }

      if (chat) {
        messages.push({ role: "user", content: chat })

        const { message_id } = await bot.sendMessage(chat_id, '处理中，请稍后...')
        let res = ' ';

        const result = await questionCompletion(messages.slice(-6), async data => {
          const lines = data.toString().split('\n').filter(line => line.trim() !== '');

          for (const line of lines) {
            const message = line.replace(/^data: /, '');
            if (message === '[DONE]') {
              // @ts-ignore
              result?.data.destroy();

              console.log(res);
              bot.editMessageText(res, {
                parse_mode: 'Markdown',
                chat_id,
                message_id
              }).catch(err => { })

              // 保存答案
              messages.push({
                role: "assistant",
                content: res.replace(/\s/g, '').slice(-500)
              })
              return;
            }
            try {
              const parsed = JSON.parse(message);
              // 获取回复的内容
              const { delta: { content } } = parsed.choices[0];

              if (content) {
                res += content;

                editSendMsg(`${res.replace(/^\s+|\s+$/g, '')}`, bot, message_id, chat_id);
                // editSendMsg(res, bot, message_id, chat_id);
              }

            } catch (error) {
              console.error('Could not JSON parse stream message', message, error);
            }
          }
        })
        // result && bot.sendMessage(chat_id, result);
      } else {
        bot.sendMessage(chat_id, "请输入内容，例如：/chat 你好")
      }
    })

    process.once('SIGINT', () => { bot.stopPolling(); });
  } catch (error) {
    console.log('error => ', error);
  }

})()

process.on('uncaughtException', function (err) {
  console.log('Caught an exception:');
});


