#### 一个用于telegram bot的chatgpt对话工具

#### api基于gpt-3.5-turbo

## 使用方法

#### 1. git本地址

#### 2. npm install

#### 3. 创建一个配置文件`config.json`
~~~json
{
  // 复制需删除注释
  // bot token
  "token": "",
  // baseApiUrl：默认为https://api.telegram.org， 可填如自己搭建的url
  "baseApiUrl": "https://api.telegram.org",
  // openai apiKey
  "apiKey": ""
}
~~~
#### 4. npm start

#### 5. 输入`/chat 你的问题`即可