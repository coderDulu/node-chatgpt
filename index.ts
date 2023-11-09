import express from "express";
import bodyParser from "body-parser";
import OpenAITool from "./openai";

// const cors = require("cors");
const app = express();
const port = 3200;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const openaiTool = new OpenAITool()

app.post("/api/question", async (req: { body: any; }, res: { setHeader: (arg0: string, arg1: string) => void; write: (arg0: string) => void; end: () => void; }) => {
  console.log(req.body);
  res.setHeader("Content-Type", "text/event-stream");
  handleRes(req.body, (answer: string) => {
    console.log("res => ", answer);
    if (answer === "[DONE]") {
      res.write(
        JSON.stringify({
          type: "status",
          value: "end",
        })
      );

      res.end();
    } else {
      res.write(answer);
    }
  });
});

/**
 *
 * @param {*} data 请求
 * @param {*} callback 响应回调
 * @returns
 */
async function handleRes(data: { text: any; type: any; value: any; }, callback: { (answer: any): void; (arg0: string): void; }) {
  try {
    const { text, type, value } = data;

    // 中止请求
    if (type === "status" && value === "stop") {
      console.log("stop send");
      callback("[DONE]");
      openaiTool.abort()
    }
    
    // 开始请求
    if (text) {
      // 开始
      await openaiTool.request(text, (data) => {
        console.log("anwser data: ", data)
      }); // 获取result
    }
  } catch (error) {
    console.log(error);
  }
}

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
