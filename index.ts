import express from "express";
import bodyParser from "body-parser";
import OpenAITool from "./openai";
import type { Response } from 'express'

// const cors = require("cors");
const app = express();
const port = 3200;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const openaiTool = new OpenAITool()

app.post("/api/question", async (req, res) => {
  console.log(req.body);
  // res.setHeader("Content-Type", "text/event-stream");
  handleRes(req.body, res);
});


/**
 *
 * @param {*} data 请求
 * @param {*} callback 响应回调
 * @returns
 */
async function handleRes(data: { text: any; type: any; value: any; }, res: Response) {
  try {
    const { text, type, value } = data;

    // 中止请求
    if (type === "status" && value === "stop") {
      console.log("stop send");
      // callback("[DONE]");
      res.write(
        JSON.stringify({
          type: "status",
          value: "end",
        })
      );
      openaiTool.abort()
      res.end()
    }

    // 开始请求
    if (text) {
      // 开始
      await openaiTool.request(text, (data) => {
        console.log("anwser data: ", data)
        res.write(data);
      }); // 获取result
    }
  } catch (error: any) {
    console.log(error)
    res.status(error?.status || 401)
    res.json(error)
  }
}

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
