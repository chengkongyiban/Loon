/*
 *Progcessed By JSDec in 0.00s
 *JSDec - JSDec.js.org
 */
const url = `https://api.03c3.cn/zb/api.php`;
const method = `GET`;
const headers = {
'User-Agent' : `Mozilla/5.0 (iPhone; CPU iPhone OS 12_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148`,
'Host' : `api.03c3.cn`,
'Connection' : `keep-alive`,
'Accept-Language' : `zh-TW,zh-Hant;q=0.9`,
'Accept-Encoding' : `gzip, deflate, br`,
'Accept' : `*/*`
};
const body = ``;

const myRequest = {
    url: url,
    method: method,
    headers: headers,
    body: body
};

$task.fetch(myRequest).then(response => {

$notify("每日60s读懂世界", '  ','墨鱼：'+JSON.parse(response.body).datatime+' 请点击通知查看内容',{"open-url":JSON.parse(response.body).imageUrl});
    $done();
}, reason => {
    console.log(reason.error);
    $done();
});
