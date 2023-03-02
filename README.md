## 使用步骤
### 1. git clone https://github.com/coderDulu/node-chatgpt.git

### 2. 创建config.json
~~~json
{
  "apiKey": "你的apiKey"
}
~~~
### 3. npm i 

### 4. npm start

### 5. 运行于：`ws://localhost:3100`

### 6. 发送参数格式：json，可使用`postman`测试，或搭配web使用
#### 发送参数
* text "文本"
* type "stop" 暂停接收
~~~json
{
  "text": "你的问题"
}
~~~

### 6. 配合web使用：https://github.com/coderDulu/chatgpt_web