/*
 *  Bilibili Quick Login By LancerComet at 17:52, 2016.04.15.
 *  # Carry Your World #
 */

const superAgent = require("superagent");
const JSEncrypt = require("./libs/jsencript");


// 在这里填入账号密码.
const accountSettings = {
    username: "",
    password: ""
};

var initCookie = null;

(function biliLogin () {
    initVisit().then(() => getHashandKey().then(login, biliLogin), biliLogin);
})();


// 首次访问登录地址获取 sid 与 JSESSIONID.
function initVisit () {
    return new Promise((resolve, reject) => {
        superAgent
            .get("https://passport.bilibili.com/ajax/miniLogin/minilogin")
            .end((err, result) => {
                if (err) {
                    console.log("首次登陆失败.");
                    console.log("失败原因：");                    
                    console.log(err);
                    setTimeout(reject, 2000);
                    return;
                }
                var rawCookies = result.header["set-cookie"][0] + "; " + result.header["set-cookie"][1]
                rawCookies = rawCookies.match(/[a-zA-Z]*=[\S]*;/g);
                
                var cookies = {};
                
                for (var i = 0, length = rawCookies.length; i < length; i++) {
                    rawCookies[i] = rawCookies[i].replace(";", "")
                    var cookieObj = {
                        name: rawCookies[i].match(/\S*=/)[0].replace("=", ""),
                        value: rawCookies[i].match(/=\S*/)[0].replace("=", "")
                    }
                    cookies[cookieObj.name] = cookieObj.value;
                }
                
                var cookieStr = "";
                for (var item in cookies) {
                    if (item === "Path") continue;
                    cookieStr += item + "=" + cookies[item] + "; "
                }
                
                initCookie = cookieStr;
                resolve();
            });
    });
    
}


// 获取 Hash 和 Key.
function getHashandKey () {
    return new Promise((resolve, reject) => {
        
        superAgent
            .get("https://passport.bilibili.com/login")
            .query({
                act: "getkey",
                _: Date.now()
            })
            .set("Cookie", initCookie)
            .end((err, result) => {
                if (err) {
                    console.log("获取 Hash 与 Key 失败, 即将重试.");
                    console.log("失败原因：");                    
                    console.log(err);
                    setTimeout(reject, 2000);
                    return;
                }
                
                resolve(JSON.parse(result.text));  // { hash: "", key: "" }
                
            });
    });
}

// 登录.
function login (keyObj) {
    
    // 设置加密.
    var encrypt = new JSEncrypt();
    encrypt.setPublicKey(keyObj.key);
    var encryptedPassword = encrypt.encrypt(keyObj.hash + accountSettings.password);  
    
    var sendData = {
         userid: accountSettings.username,
         pwd: encryptedPassword,
         captcha: "",  // No captcha.
         keep: 1  // Keep login status. 0 for session login.
    }; 

    superAgent
        .post("https://passport.bilibili.com/ajax/miniLogin/login")
        .set("Cookie", initCookie)
        .set("Host", "passport.bilibili.com")
        .set("Referer", "https://passport.bilibili.com/ajax/miniLogin/minilogin")
        .set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.99 Safari/537.36")
        .send(sendData)
        .type("form")
        .end((err, result) => {
            if (err) {
                console.log("登录过程失败：");
                console.log(err);
                return;
            }
            
            var resultObj = result.body;
            
            if (!resultObj.status) {
                console.log("登录失败：" + resultObj.message.code);
                console.log("-626 或 -652：用户不存在");
                console.log("-105：验证码相关");
                console.log("其他状态码：与密码相关.")
            } else {
                var cookie = result.header["set-cookie"];
                console.log("登录成功，已获取 Cookie:");
                console.log(cookie)
            }
        })
}





