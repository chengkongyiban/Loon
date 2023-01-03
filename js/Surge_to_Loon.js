/****************************

说明
   t&zd; = {  , }  花括号中的逗号

***************************/

let req = $request.url.replace(/sg$/,'')
let name = '#!name = ' + req.match(/.+\/(.+)\.(sgmodule|module|js)/)?.[1] || '无名';
let desc = '#!desc = ' + req.match(/.+\/(.+)\.(sgmodule|module|js)/)?.[1] || '无名';
const stickerStartNum = 1000;
const stickerSum = 199;
let randomStickerNum = parseInt(stickerStartNum + Math.random() * stickerSum).toString();
let imgUrl = "https://raw.githubusercontent.com/chengkongyiban/StickerOnScreen/main/Stickers/Sticker_" + randomStickerNum +".png";
let icon = '#!icon = ' + imgUrl;

!(async () => {
  let body = await http(req);

	body = body.match(/[^\n]+/g);
	
let script = [];
let Rule = [];
let URLRewrite = [];
let MITM = "";
let others = [];          //不支持的内容
//let MapLocal = [];
//let HeaderRewrite = [];

body.forEach((x, y, z) => {
	x = x.replace(/^(#|;|\/\/)/gi,'#');
	let type = x.match(
		/http-re|cronexp|\x20-\x20reject|\x20data=|\-header|^hostname| 30(2|7)|(URL-REGEX|USER-AGENT|IP-CIDR|GEOIP|IP-ASN|DOMAIN)/
	)?.[0];
	
	//判断注释
	
	if (x.match(/^[^#]/)){
	var noteK = "";
	}else{
	var noteK = "#";
	};
	
	if (type) {
		switch (type) {
			case "http-re":
//Surge5脚本			
			if (x.match(/=\x20?http-re/)) {
	x = x.replace(/\x20/gi,'').replace(/(\{.*?)\,(.*?\})/gi,'$1t&zd;$2');
				z[y - 1]?.match("#") && script.push(z[y - 1]);
				
				let sctype = x.match('http-response') ? 'response' : 'request';
				
				let rebody = x.match('requires-body=(true|1)') ? ', requires-body=true' : '';
				
				let proto = x.match('binary-body-mode=(true|1)') ? ', binary-body-mode=true' : '';
				
				let scname = x.replace(/\x20/gi,'').split("=")[0].replace(/#/,'');
				
				let ptn = x.replace(/\x20/gi,"").split("pattern=")[1].split(",")[0].replace(/\"/gi,'');
				
				let js = x.replace(/\x20/gi,"").split("script-path=")[1].split(",")[0];
				
				
				
				script.push(
					x.replace(
						/[^\s]+http-re[^\s]+/,
						`${noteK}http-${sctype} ${ptn} script-path=${js}${rebody}${proto}, tag=${scname}`
					),
				);
				}if (x.match(/http-(response|request)\x20/)){

//surge4脚本
					x = x.replace(/(\{.*?)\,(.*?\})/gi,'$1t&zd;$2');
					
				z[y - 1]?.match("#") && script.push(z[y - 1]);
				let proto = x.match('binary-body-mode=(true|1)') ? ', binary-body-mode=true' : '';
				let rebody = x.match('requires-body=(true|1)') ? ', requires-body=true' : '';
				
				let ptn = x.split(" ")[1].replace(/\"/gi,'');
				
				let js = x.replace(/\x20/gi,"").split("script-path=")[1].split(",")[0];
				
				let sctype = x.match('http-response') ? 'response' : 'request';
				
				let scname = js.substring(js.lastIndexOf('/') + 1, js.lastIndexOf('.') );
					
				script.push(
					x.replace(
						/.*http-(response|request)\x20.+/,
						`${noteK}http-${sctype} ${ptn} script-path=${js}${rebody}${proto}, tag=${scname}`
					),
				);
				}else{
					
				}
				
				break;
//定时任务
			case "cronexp":
			x = x.replace(/cronexp/gi,'cronexp');
				let croName = x.split("=")[0].replace(/\x20/gi,"").replace(/#/,'')
				
				let cronJs = x.replace(/\x20/gi,"").split("script-path=")[1].split(",")[0]
				
				let cronExp = x.replace(/(.+cronexpr?\x20?=\x20?.+)/,"$1,").replace(/.+cronexpr?\x20?=\x20?(.+\x20.+?),.*/,"$1")
				
				script.push(
					x.replace(
						/.+cronexp.+/,
						`${noteK}cron "${cronExp}" script-path=${cronJs}, timeout=60, tag=${croName}`,
					),
				);
				
				
				break;

//REJECT

			case "\x20-\x20reject":
			
				//let jct = x.match(/reject?[^\s]+/)[0];
				//let url = x.match(/\^?http[^\s]+/)?.[0];

				z[y - 1]?.match("#") && URLRewrite.push(z[y - 1]);
				URLRewrite.push(x.replace(/(#)?(.+?)\x20-\x20(reject-200|reject-img|reject-dict|reject-array|reject)/, `${noteK}$2 - $3`));
				break;


//Mock统统转reject，其他作用的Mock Loon无法实现

			case " data=":
				z[y - 1]?.match("#") && URLRewrite.push(z[y - 1]);
				
				let mock2Dict = x.match('dict') ? '-dict' : '';
				let mock2Array = x.match('array') ? '-array' : '';
				let mock2200 = x.match('200') ? '-200' : '';
				let mock2Img = x.match('(img|png|gif)') ? '-img' : '';
				let mock2Other = x.match('dict|array|200|img|png|gif') ? '' : '-200';
				URLRewrite.push(
					x.replace(
						/(#)?(.+)data=.+/,
						`${noteK}$2- reject${mock2Dict}${mock2Array}${mock2200}${mock2Img}${mock2Other}`
					),
				);
				
				break;
				
//hostname				
			case "hostname":
			x = x.replace(/\x20/gi,'');
				MITM = x.replace(/hostname=(%.+%)?(.*)/, `[MITM]\nhostname = $2`);
				break;
			default:
//重定向			
				if (type.match(" 30(2|7)")) {
				z[y - 1]?.match("#")  && URLRewrite.push(z[y - 1]);
				
					URLRewrite.push(x.replace(/(#)?(.+?)\x20(.+?)\x20(302|307)/, `${noteK}$2 $3 $4`));
				} 
				if (type.match(/(URL-REGEX|USER-AGENT|IP-CIDR|GEOIP|IP-ASN|DOMAIN)/)) {
					z[y - 1]?.match("#")  && Rule.push(z[y - 1]);
				
					Rule.push(x);
				}else {

//这个看不懂不做处理
					
					z[y - 1]?.match("#") && others.push(z[y - 1]);
					others.push(
						x.replace(
							/([^\s]+)\x20url\x20(response|request)-body\x20(.+)\2-body(.+)/,
							`test = type=$2,pattern=$1,requires-body=true,script-path=https://raw.githubusercontent.com/mieqq/mieqq/master/replace-body.js, argument=$3->$4`,
						),
					);


				}
		} //switch结束
	}
}); //循环结束

/*****
此处为脚本链接查重，现采用唯一性标识符
function unique (jsLink) {
  return Array.from(new Set(jsLink))
}

providers.push(
	(unique(jsLink))
	);
*****/

script = (script[0] || '') && `[Script]\n\n${script.join("\n\n")}`;

URLRewrite = (URLRewrite[0] || '') && `[Rewrite]\n\n${URLRewrite.join("\n\n")}`;

URLRewrite = URLRewrite.replace(/"/gi,'')

Rule = (Rule[0] || '') && `[Rule]\n\n${Rule.join("\n\n")}`;
/********
HeaderRewrite = (HeaderRewrite[0] || '') && `[Header Rewrite]\n${HeaderRewrite.join("\n")}`;

MapLocal = (MapLocal[0] || '') && `[MapLocal]\n${MapLocal.join("\n")}`;
********/

body = `${name}

${desc}

${icon}


${Rule}

${URLRewrite}

${script}

${MITM}`
		.replace(/#(.+)\n/g,'#$1')
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