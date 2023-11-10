import OpenAI from "openai";
import * as dotenv from "dotenv";
import type { ChatCompletionMessageParam } from "openai/resources";
import type { Stream } from "openai/streaming";
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.APIKEY,
});

class OpenAITool {
  stream: Stream<OpenAI.Chat.Completions.ChatCompletionChunk> | null = null

  async request(messages: Array<ChatCompletionMessageParam>, callback: (data: any) => void) {
    this.stream = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages,
      stream: true,
    });

    for await (const chunk of this.stream) {
      const anwser = chunk.choices[0].delta.content
      callback(anwser)
    }
  }

  abort() {
    this.stream?.controller.abort()
  }

}


// const openAITool = new OpenAITool()

// openAITool.request([{ role: 'user', content: '你好' }], (data) => {
//   console.log(data)
// })


export default OpenAITool
