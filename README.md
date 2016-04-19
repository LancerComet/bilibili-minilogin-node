# bilibili-minilogin-node
Node.JS 的 Bilibili 快速登陆.

# 使用方法
```
npm install
```
```
const miniLogin = require("bilibili-minilogin-node");
const accountSettings = {
    username: "",
    password: ""
};
miniLogin({ username: "USERNAME", password: "PASSWORD" }, (cookie) => console.log(cookie));
```
