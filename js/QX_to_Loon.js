/****************************

说明
   t&zd; = {  , }  花括号中的逗号

***************************/

let req = $request.url.replace(/qx$/,'')
let name = '#!name= ' + req.match(/.+\/(.+)\.(conf|js|snippet|txt)/)?.[1] || '无名';
let desc = '#!desc= ' + req.match(/.+\/(.+)\.(conf|js|snippet|txt)/)?.[1] || '无名';
const stickerStartNum = 1000;
const stickerSum = 199;
let randomStickerNum = parseInt(stickerStartNum + Math.random() * stickerSum).toString();
let imgUrl = "https://raw.githubusercontent.com/chengkongyiban/StickerOnScreen/main/Stickers/Sticker_" + randomStickerNum +".png";
let icon = '#!icon = ' + imgUrl;

!(async () => {
  let body = await http(req);

	body = body.match(/[^\n]+/g);
	
let script = [];
let URLRewrite = [];
let HeaderRewrite = [];
let MapLocal = [];
let MITM = "";

body.forEach((x, y, z) => {
	x = x.replace(/^(#|;|\/\/)/gi,'#');
	let type = x.match(
		/\x20script-|enabled=|url\x20reject|echo-response|\-header|^hostname|url\x20(302|307)|\x20(request|response)-body/
	)?.[0];
	//判断注释
	
	if (x.match(/^[^#]/)){
	var noteK = "";
	}else{
	var noteK = "#";
	};
	
	if (type) {
		switch (type) {
			case "\x20script-":
			
			if (x.match(' script-')){
				
			
				z[y - 1]?.match("#") && script.push(z[y - 1]);
				let sctype = x.match('script-response') ? 'response' : 'request';
				
				let rebody = x.match('-body|-analyze') ? ',requires-body=1' : '';
				
				let proto = x.match('proto.js') ? ',binary-body-mode=1' : '';
				
				let urlInNum = x.split(" ").indexOf("url");
				
				let ptn = x.split(" ")[urlInNum - 1].replace(/#/,"");
				
				let js = x.split(" ")[urlInNum + 2];
				
				let scname = js.substring(js.lastIndexOf('/') + 1, js.lastIndexOf('.') );
				script.push(
					x.replace(
						/.+script-.+/,
						`${noteK}http-${sctype} ${ptn} script-path=${js}${rebody}${proto},script-update-interval=0,tag=${scname}`,
					),
				);
			}else{
				
			}
				break;

			case "enabled=":
				z[y - 1]?.match("#") && script.push(z[y - 1]);
				
				let cronExp = x.split(" http")[0].replace(/#/,'');
				
				let cronJs = x.split("://")[1].split(",")[0].replace(/(.+)/,'https://$1');
				
				let croName = x.split("tag=")[1].split(",")[0];
				
				script.push(
					x.replace(
						/.+enabled=.+/,
						`${noteK}cron "${cronExp}" script-path=${cronJs},timeout=60,tag=${croName}`,
					),
				);
				break;

			case "url\x20reject":

				z[y - 1]?.match("#") && URLRewrite.push(z[y - 1]);
				URLRewrite.push(x.replace(/(#)?(.*?)\x20url\x20(reject-200|reject-img|reject-dict|reject-array|reject)/, `${noteK}$2 - $3`));
				break;

			case "-header":
			if (x.match(/\(\\r\\n\)/g).length === 2){			
				z[y - 1]?.match("#") &&  HeaderRewrite.push(z[y - 1]);
let op = x.match(/\x20response-header/) ?
'http-response ' : '';
     if(x.match(/\$1\$2/)){
		  HeaderRewrite.push(x.replace(/(\^?http[^\s]+).+?n\)([^\:]+).+/,`${op}$1 header-del $2`))	
		}else{
				HeaderRewrite.push(
					x.replace(
						/(\^?http[^\s]+)[^\)]+\)([^:]+):([^\(]+).+\$1\x20?\2?\:?([^\$]+)?\$2/,
						`${op}$1 header-replace-regex $2 $3 $4''`,
					),
				);
				}
				}else{
	$notification.post('不支持这条规则转换,已跳过','',`${x}`);
				}
				break;
/*************
			case "echo-response":
				z[y - 1]?.match("#") && MapLocal.push(z[y - 1]);
				MapLocal.push(x.replace(/(\^?http[^\s]+).+(http.+)/, '$1 data="$2"'));
				break;
****************/				
			case "hostname":
				MITM = x.replace(/hostname\x20?=(.*)/, `[MITM]\nhostname = $1`);
				break;
			default:
				if (type.match("url 30")) {
					z[y - 1]?.match("#") && URLRewrite.push(z[y - 1]);
					URLRewrite.push(x.replace(/(#)?(.*?)\x20url\x20(302|307)\s(.+)/, `${noteK}$2 $4 $3`));
				} else {
					z[y - 1]?.match("#") && script.push(z[y - 1]);
					script.push(
						x.replace(
							/(#|;|\/\/)?([^\s]+)\x20url\x20(response|request)-body\x20(.+)\2-body(.+)/,
							`http-$3 $2 script-path=https://raw.githubusercontent.com/mieqq/mieqq/master/replace-body.js,requires-body=1, argument=$4->$5`,
						),
					);
				}
		} //switch结束
	}
}); //循环结束

script = (script[0] || '') && `[Script]\n${script.join("\n")}`;

URLRewrite = (URLRewrite[0] || '') && `[Rewrite]\n${URLRewrite.join("\n")}`;

HeaderRewrite = (HeaderRewrite[0] || '') && `[Header Rewrite]\n${HeaderRewrite.join("\n")}`;

MapLocal = (MapLocal[0] || '') && `[MapLocal]\n${MapLocal.join("\n")}`;

body = `${name}
${desc}
${icon}

${URLRewrite}

${HeaderRewrite}

${script}

${MITM}`.replace(/\n{2,}/g,'\n\n').replace(/\x20{2,}/g,'\x20')



 $done({ response: { status: 200 ,body:body ,headers: {'Content-Type': 'text/plain; charset=utf-8'} } });

})()
.catch((e) => {
		$notification.post(`${e}`,'','');
		$done()
	})




function http(req) {
  return new Promise((resolve, reject) =>
    $httpClient.get(req, (err, resp,data) => {
  resolve(data)
  })
)
}