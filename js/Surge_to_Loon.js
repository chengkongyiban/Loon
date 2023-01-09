/****************************

说明
   t&zd; = {  , }  花括号中的逗号
原脚本作者@小白脸 脚本修改@chengkongyiban
感谢@xream 的指导
插件图标用的 @Keikinn 的 StickerOnScreen项目，感谢

***************************/
const isStashiOS = 'undefined' !== typeof $environment && $environment['stash-version'] && ua.indexOf('Macintosh') === -1
const isSurgeiOS = 'undefined' !== typeof $environment && $environment['surge-version'];
const isShadowrocket = 'undefined' !== typeof $rocket;
const isLooniOS = 'undefined' != typeof $loon && /iPhone/.test($loon);

var name = "";
var desc = "";
let req = $request.url.replace(/sg$|sg\?.*/,'');
let urlArg = $request.url.replace(/.+sg(\?.*)/,'$1');
var original = [];//用于获取原文行号
//获取参数
var nName = urlArg.indexOf("n=") != -1 ? (urlArg.split("n=")[1].split("&")[0].split("+")) : null;
var Pin0 = urlArg.indexOf("y=") != -1 ? (urlArg.split("y=")[1].split("&")[0].split("+")).map(decodeURIComponent) : null;
var Pout0 = urlArg.indexOf("x=") != -1 ? (urlArg.split("x=")[1].split("&")[0].split("+")).map(decodeURIComponent) : null;
//修改名字和简介
if (nName === null){
	name = req.match(/.+\/(.+)\.(module|js|sgmodule)/)?.[1] || '无名';
    desc = name;
}else{
	name = nName[0] != "" ? nName[0] : req.match(/.+\/(.+)\.(module|js|sgmodule)/)?.[1];
	desc = nName[1] != undefined ? nName[1] : nName[0];
};
name = "#!name=" + decodeURIComponent(name);
desc = "#!desc=" + decodeURIComponent(desc);

const stickerStartNum = 1000;
const stickerSum = 199;
let randomStickerNum = parseInt(stickerStartNum + Math.random() * stickerSum).toString();
let icon = "#!icon=" + "https://raw.githubusercontent.com/chengkongyiban/StickerOnScreen/main/Stickers/Sticker_" + randomStickerNum +".png";

!(async () => {
  let body = await http(req);
original = body.split("\n");
	body = body.match(/[^\n]+/g);
	
let script = [];
let Rule = [];
let URLRewrite = [];
let MITM = "";
let others = [];          //不支持的内容


body.forEach((x, y, z) => {
	x = x.replace(/^(#|;|\/\/)/gi,'#');
	let type = x.match(
		/http-re|cronexp|\x20-\x20reject|\x20data=|^hostname|\x20(302|307|header)$|(URL-REGEX|USER-AGENT|IP-CIDR|GEOIP|IP-ASN|DOMAIN)/
	)?.[0];

//去掉注释
if(Pin0 != null)	{
	for (let i=0; i < Pin0.length; i++) {
  const elem = Pin0[i];
	if (x.indexOf(elem) != -1){
		x = x.replace(/^#/,"")
	}else{};
};//循环结束
}else{};//去掉注释结束

//增加注释
if(Pout0 != null){
	for (let i=0; i < Pout0.length; i++) {
  const elem = Pout0[i];
	if (x.indexOf(elem) != -1 && x.indexOf("hostname") == -1){
		x = x.replace(/(.+)/,"#$1")
	}else{};
};//循环结束
}else{};//增加注释结束
	
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
				z[y - 1]?.match(/^#/) && script.push(z[y - 1]);
				
				let sctype = x.match('http-response') ? 'response' : 'request';
				
				let rebody = x.match('requires-body=(true|1)') ? ', requires-body=true' : '';
				
				let proto = x.match('binary-body-mode=(true|1)') ? ', binary-body-mode=true' : '';
				
				let scname = x.replace(/\x20/gi,'').split("=")[0].replace(/#/,'');
				
				let ptn = x.replace(/\x20/gi,"").split("pattern=")[1].split(",")[0].replace(/\"/gi,'');
				
				let js = x.replace(/\x20/gi,"").split("script-path=")[1].split(",")[0];
				
				let arg = [];
				
				if (x.match("argument")){
			arg = ", argument=" +  x.replace(/argument\x20=/gi,"argument=").split("argument=")[1].split(",")[0];
			}else{}
			
				script.push(
					x.replace(
						/[^\s]+http-re[^\s]+/,
						`${noteK}http-${sctype} ${ptn} script-path=${js}${rebody}${proto}${arg}, tag=${scname}`
					),);
				

				}else{
//HeaderRewrite					
				if (x.match(/\x20header-/)){
					
					z[y - 1]?.match(/^#/) &&  URLRewrite.push("    " + z[y - 1]);
				
					if (x.match(/header-replace-regex/)){
				URLRewrite.push(x.replace(/#?http-(response|request)\x20/,"").replace("-regex","").replace(/([^\s]+\x20[^\s]+\x20[^\s]+)\x20[^\s]+\x20(.+)/,`${noteK}$1 $2`));
					}else{
			URLRewrite.push(`${noteK}` + x.replace(/#?http-(response|request)\x20/,""))
					};//HeaderRewrite结束
				}else{
					
				if (x.match(/http-(response|request)\x20/)){
//surge4脚本
					x = x.replace(/(\{.*?)\,(.*?\})/gi,'$1t&zd;$2');
					
				z[y - 1]?.match(/^#/) && script.push(z[y - 1]);
				
				let proto = x.replace(/\x20/gi,'').match('binary-body-mode=(true|1)') ? ', binary-body-mode=true' : '';
				
				let rebody = x.replace(/\x20/gi,'').match('requires-body=(true|1)') ? ', requires-body=true' : '';
				
				let ptn = x.split(" ")[1].replace(/\"/gi,'');
				
				let js = x.replace(/\x20/gi,"").split("script-path=")[1].split(",")[0];
				
				let sctype = x.match('http-response') ? 'response' : 'request';
				
				let scname = js.substring(js.lastIndexOf('/') + 1, js.lastIndexOf('.') );
				
				if (x.match("argument")){
			arg = `, argument=` +  x.replace(/argument\x20=/gi,"argument=").split("argument=")[1].split(",")[0];
				}else{}
				
				script.push(
					x.replace(
						/.*http-(response|request)\x20.+/,`${noteK}http-${sctype} ${ptn} script-path=${js}${rebody}${proto}${arg}, tag=${scname}`
					),
				);

				}else{
let lineNum = original.indexOf(x) + 1;
others.push(lineNum + "行" + x)}

				}
				}//整个http-re结束
				
				break;
//定时任务


			case "cronexp":
			x = x.replace(/cronexpr/gi,'cronexp');
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

			case " - reject":

				z[y - 1]?.match(/^#/) && URLRewrite.push(z[y - 1]);
				URLRewrite.push(x.replace(/(#)?(.+?)\x20-\x20(reject-200|reject-img|reject-dict|reject-array|reject)/, `${noteK}$2 - $3`));
				break;


//Mock统统转reject，其他作用的Mock Loon无法实现

			case " data=":
				z[y - 1]?.match(/^#/) && URLRewrite.push(z[y - 1]);
				
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
			x = x.replace(/,$/,'').replace(/\x20/gi,'');
				MITM = x.replace(/hostname=(%.+%)?(.*)/, `[MITM]\n\nhostname = $2`);
				break;
			default:
//重定向
				if (type.match(" (302|307|header)")){
				z[y - 1]?.match(/^#/)  && URLRewrite.push(z[y - 1]);
				
					URLRewrite.push(x.replace(/(#)?([^\s]+)\x20([^\s]+)\x20(302|307|header)/, `${noteK}$2 $3 $4`));
				}else{
				 if (type.match(/(URL-REGEX|USER-AGENT|IP-CIDR|GEOIP|IP-ASN|DOMAIN)/)) {
					z[y - 1]?.match(/^#/)  && Rule.push(z[y - 1]);
				
					Rule.push(x);
				}else{
let lineNum = original.indexOf(x) + 1;
others.push(lineNum + "行" + x)}
			}
		} //switch结束
	}
}); //循环结束

script = (script[0] || '') && `[Script]\n\n${script.join("\n\n")}`;

URLRewrite = (URLRewrite[0] || '') && `[Rewrite]\n\n${URLRewrite.join("\n")}`;

URLRewrite = URLRewrite.replace(/"/gi,'')

Rule = (Rule[0] || '') && `[Rule]\n\n${Rule.join("\n")}`;

others = (others[0] || '') && `${others.join("\n\n")}`;

body = `${name}
${desc}
${icon}


${Rule}


${URLRewrite}


${script}


${MITM}`
		.replace(/t&zd;/g,',')
		.replace(/"{2,}/g,'"')
		.replace(/\x20{2,}/g,' ')
		.replace(/(#.+\n)\n/g,'$1')
		.replace(/\n{2,}/g,'\n\n')

if (isSurgeiOS || isStashiOS) {
           others !="" && $notification.post("不支持的类型已跳过","第" + others,"点击查看原文，长按可展开查看跳过行",{url:req});
        } else {if (isLooniOS || isShadowrocket) {
       others !="" && $notification.post("不支持的类型已跳过","第" + others,"点击查看原文，长按可展开查看跳过行",req);}};

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