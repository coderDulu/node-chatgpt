import TelegramBot from 'node-telegram-bot-api';

class Bot {
  static instance: Bot | null = null;
  token: string | undefined;

  constructor(token: string, config?: TelegramBot.ConstructorOptions) {
    if (Bot.instance) {
      return Bot.instance;
    }
    this.token = token;
    Bot.instance = this;
  }

  static getInstance(token: string, options?: TelegramBot.ConstructorOptions) {
    return new TelegramBot(token, options);
  }
}

export default Bot;