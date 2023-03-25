// const express = require('express');
import express from 'express';
import { questionCompletion } from './openai.js';
import bodyParser from 'body-parser'
import http from 'http';
import { WebSocketServer } from 'ws';

const app = express();
const port = 3100;



const server = http.createServer(app);
const ws = new WebSocketServer({ server });

ws.on("connection", (conn) => {
  console.log('client connect');
  conn.on("message", (data) => {
    console.log(data);
  });
});


server.listen(port, () => {
  console.log("服务器已开启，端口号：" + port);
});