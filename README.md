# bilibili-minilogin
Node.JS 的 Bilibili 快速登陆.

# 使用方法
```
npm install bilibili-minilogin
```
```
const miniLogin = require("bilibili-minilogin");
miniLogin({ username: "USERNAME", password: "PASSWORD" }, (cookie) => console.log(cookie));
```
