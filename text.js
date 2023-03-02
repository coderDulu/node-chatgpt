// 以下是一个使用Express和React的简单模板：

// 引入Express和React
const express = require('express');
const React = require('react');

// 创建Express应用
const app = express();

// 设置路由
app.get('/', (req, res) => {
  // 渲染React组件
  const component = React.createElement('h1', null, 'Hello World!');
  res.send(component);
});

// 监听端口
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});