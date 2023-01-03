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
//脚本							
				z[y - 1]?.match("#") && script.push(z[y - 1]);
				let sctype = x.match('script-response') ? 'response' : 'request';
				
				let rebody = x.match('-body|-analyze') ? ', requires-body=true' : '';
				
				let proto = x.match('proto.js') ? ', binary-body-mode=true' : '';
				
				let urlInNum = x.split(" ").indexOf("url");
				
				let ptn = x.split(" ")[urlInNum - 1].replace(/#/,"");
				
				let js = x.split(" ")[urlInNum + 2];
				
				let scname = js.substring(js.lastIndexOf('/') + 1, js.lastIndexOf('.') );
				script.push(
					x.replace(
						/.+script-.+/,
						`${noteK}http-${sctype} ${ptn} script-path=${js}${rebody}${proto}, tag=${scname}`,
					),
				);
			}else{
				
			}
				break;
				
//定时任务

			case "enabled=":
				z[y - 1]?.match("#") && script.push(z[y - 1]);
				
				let cronExp = x.split(" http")[0].replace(/#/,'');
				
				let cronJs = x.split("://")[1].split(",")[0].replace(/(.+)/,'https://$1');
				
				let croName = x.split("tag=")[1].split(",")[0];
				
				script.push(
					x.replace(
						/.+enabled=.+/,
						`${noteK}cron "${cronExp}" script-path=${cronJs}, timeout=60, tag=${croName}`,
					),
				);
				break;
				
//reject				

			case "url\x20reject":

				z[y - 1]?.match("#") && URLRewrite.push(z[y - 1]);
				URLRewrite.push(x.replace(/(#)?(.*?)\x20url\x20(reject-200|reject-img|reject-dict|reject-array|reject)/, `${noteK}$2 - $3`));
				break;

//headerRewrite 不懂这个欢迎赐教

			case "-header":
			if (x.match(/\(\\r\\n\)/g).length === 2){			
				z[y - 1]?.match("#") &&  URLRewrite.push(z[y - 1]);
let op = x.match(/\x20response-header/) ?
'http-response ' : '';
     if(x.match(/\$1\$2/)){
		  URLRewrite.push(x.replace(/(\^?http[^\s]+).+?n\)([^\:]+).+/,`${op}$1 header-del $2`))	
		}else{
				URLRewrite.push(
					x.replace(
						/(\^?http[^\s]+)[^\)]+\)([^:]+):([^\(]+).+\$1\x20?\2?\:?([^\$]+)?\$2/,
						`${op}$1 header-replace-regex $2 $3 $4''`,
					),
				);
				}
				}else{
					
				}
				break;
/*************
Mock Loon不支持

			case "echo-response":
				z[y - 1]?.match("#") && MapLocal.push(z[y - 1]);
				MapLocal.push(x.replace(/(\^?http[^\s]+).+(http.+)/, '$1 data="$2"'));
				break;
****************/				

//mitm
			case "hostname":
				MITM = x.replace(/hostname\x20?=(.*)/, `[MITM]\n\nhostname = $1`);
				break;
//302/307				
			default:
				if (type.match("url 30")) {
					z[y - 1]?.match("#") && URLRewrite.push(z[y - 1]);
					URLRewrite.push(x.replace(/(#)?(.*?)\x20url\x20(302|307)\s(.+)/, `${noteK}$2 $4 $3`));
				} else {
//带参数脚本					
					z[y - 1]?.match("#") && script.push(z[y - 1]);
					script.push(
						x.replace(
							/(#)?([^\s]+)\x20url\x20(response|request)-body\x20(.+)\2-body(.+)/,
							`http-$3 $2 script-path=https://raw.githubusercontent.com/mieqq/mieqq/master/replace-body.js, requires-body=true, argument=$4->$5`,
						),
					);
				}
		} //switch结束
	}
}); //循环结束

script = (script[0] || '') && `[Script]\n\n${script.join("\n\n")}`;

URLRewrite = (URLRewrite[0] || '') && `[Rewrite]\n\n${URLRewrite.join("\n")}`;

//HeaderRewrite = (HeaderRewrite[0] || '') && `[Header Rewrite]\n${HeaderRewrite.join("\n")}`;

MapLocal = (MapLocal[0] || '') && `[MapLocal]\n\n${MapLocal.join("\n\n")}`;

body = `${name}
${desc}
${icon}


${URLRewrite}

${HeaderRewrite}

${script}

${MITM}`
		.replace(/(#.+\n)\n/g,'$1')
		.replace(/t&zd;/g,',')
		.replace(/\n{2,}/g,'\n\n')
		.replace(/"{2,}/g,'"')
		.replace(/\x20{2,}/g,' ')
		



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