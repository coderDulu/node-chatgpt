const express = require("express");
const bodyParser = require("body-parser");
const { questionCompletion } = require("./utils/openai.js");
const { encode, decode } = require("gpt-3-encoder");

// const cors = require("cors");
const app = express();
const port = 3200;

let completion;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// app.use(cors());

app.post("/api/question", async (req, res) => {
  console.log(req.body);
  res.setHeader("Content-Type", "text/event-stream");
  handleRes(req.body, (answer) => {
    console.log("res => ", answer);
    if (answer === "[DONE]") {
      res.write(
        JSON.stringify({
          type: "status",
          value: "end",
        })
      );

      res.end();
      // res.status(200).json({
      //   status: true,
      //   message: "answer is ended",
      // });
    } else {
      res.write(answer);
    }
  });

  // res.status(200).json({
  //   status: true,
  //   message: "请求成功",
  // });
});

/**
 *
 * @param {*} data 请求
 * @param {*} callback 响应回调
 * @returns
 */
async function handleRes(data, callback) {
  try {
    const { text, type, value } = data;

    // 中止请求
    if (type === "status" && value === "stop") {
      console.log("stop send");
      completion.data.destroy();
      callback("[DONE]");
    }
    
    const encoded = encode(JSON.stringify(text));
    console.log(encoded.length);
    // 开始请求
    if (text) {
      // 开始
      completion = await questionCompletion(text, (data) => {
        const lines = data
          .toString()
          .split("\n")
          .filter((line) => line.trim() !== "");

        for (const line of lines) {
          const message = line.replace(/^data: /, "");
          if (message === "[DONE]") {
            callback(message);
            return;
          }
          try {
            const parsed = JSON.parse(message);
            // 获取回复的内容
            const {
              delta: { content },
            } = parsed.choices[0];

            if (content) {
              const answer = JSON.stringify({ type: "answer", value: content });
              callback(answer);
            }
          } catch (error) {
            console.error(
              "Could not JSON parse stream message",
              message,
              error
            );
          }
        }
      }); // 获取result
    }
  } catch (error) {
    console.log(error);
  }
}

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
