const resolve = require("rollup-plugin-node-resolve");
const commonjs = require('rollup-plugin-commonjs')
const json = require('@rollup/plugin-json')

module.exports = {
  input: "./index.js", // 替换为你的main.js文件路径
  output: {
    file: "./out/bundle.js", // 输出的bundle文件名
    format: "cjs", // 或者其他适合你项目的格式
  },
  // @ts-ignore
  plugins: [json(), resolve(), commonjs()],
};
