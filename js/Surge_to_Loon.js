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
var iconStatus = urlArg.indexOf("i=") != -1 ? false : true;
var icon = "";
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

//随机图标开关，不传入参数默认为开
if (iconStatus === false){
	icon = "#!icon=";
}else{
	const stickerStartNum = 1000;
const stickerSum = 199;
let randomStickerNum = parseInt(stickerStartNum + Math.random() * stickerSum).toString();
   icon = "#!icon=" + "https://raw.githubusercontent.com/chengkongyiban/StickerOnScreen/main/Stickers/Sticker_" + randomStickerNum +".png";
};

!(async () => {
  let body = await http(req);
//判断是否断网
if(body == null){if(isSurgeiOS || isStashiOS){
	$notification.post("重写转换：未获取到body","请检查网络及节点是否畅通","认为是bug?点击通知反馈",{url:"https://t.me/zhangpeifu"})
 $done({ response: { status: 404 ,body:{} } });}else{$notification.post("重写转换：未获取到body","请检查网络及节点是否畅通","认为是bug?点击通知反馈","https://t.me/zhangpeifu")
 $done({ response: { status: 404 ,body:{} } });
}//识别客户端通知
}else{//以下开始重写及脚本转换

original = body.split("\n");
	body = body.match(/[^\r\n]+/g);
	
let script = [];
let Rule = [];
let URLRewrite = [];
let MITM = "";
let others = [];          //不支持的内容

body.forEach((x, y, z) => {
	x = x.replace(/^(#|;|\/\/)/gi,'#').replace(/(\{.*?)\,(.*?\})/gi,'$1t&zd;$2').replace(" _ reject"," - reject");
	let type = x.match(
		/http-re|\x20header-|cronexp|\x20-\x20reject|\x20data=|^hostname|\x20(302|307|header)$|(URL-REGEX|USER-AGENT|IP-CIDR|GEOIP|IP-ASN|DOMAIN)/
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
			if (x.match(/=\x20*http-re/)) {
				z[y - 1]?.match(/^#/) && script.push(z[y - 1]);
				
				let sctype = x.match('http-response') ? 'response' : 'request';
				
				let rebody = x.match('requires-body=(true|1)') ? ', requires-body=true' : '';
				
				let proto = x.match('binary-body-mode=(true|1)') ? ', binary-body-mode=true' : '';
				
				let scname = x.replace(/\x20/gi,'').split("=")[0].replace(/^#/,'');
				
				let ptn = x.replace(/\x20/gi,"").split("pattern=")[1].split(",")[0].replace(/"/gi,'');
				
				let js = x.replace(/\x20/gi,"").split("script-path=")[1].split(",")[0];
				
				let arg = [];
				
				if (x.match(/argument\x20*=.+/)){
					if (x.match(/(argument\x20*=\x20*"+.*?,.*?"+)\x20*(,\x20*\w+|$)/)
){
			arg = ', argument=' + x.match(/argument\x20*=\x20*("+.*?,.*?"+)\x20*(,\x20*\w+|$)/)[1];
}else{
			arg = ", argument=" +  x.replace(/argument\x20+=/gi,"argument=").split("argument=")[1].split(",")[0];}
			}else{}
			
				script.push(
						`${noteK}http-${sctype} ${ptn} script-path=${js}${rebody}${proto}, tag=${scname}${arg}`
					);
				
				}else{
//HeaderRewrite					
				if (x.match(/\x20header-/)){
					
					z[y - 1]?.match(/^#/) &&  URLRewrite.push(z[y - 1]);
				
					if (x.match(/header-replace-regex/)){
				URLRewrite.push(x.replace(/#?http-(response|request)\x20+/,"").replace("-regex","").replace(/([^\s]+\x20[^\s]+\x20[^\s]+)\x20[^\s]+\x20(.+)/,`${noteK}$1 $2`));
					}else{
			URLRewrite.push(`${noteK}` + x.replace(/#?http-(response|request)\x20/,""))
					};//HeaderRewrite结束
				}else{
					
				if (x.match(/http-(response|request)\x20/)){
//surge4脚本	
				z[y - 1]?.match(/^#/) && script.push(z[y - 1]);
				
				let proto = x.replace(/\x20/gi,'').match('binary-body-mode=(true|1)') ? ', binary-body-mode=true' : '';
				
				let rebody = x.replace(/\x20/gi,'').match('requires-body=(true|1)') ? ', requires-body=true' : '';
				
				let ptn = x.replace(/\x20{2,}/g," ").split(" ")[1].replace(/"/gi,'');
				
				let js = x.replace(/\x20/gi,"").split("script-path=")[1].split(",")[0];
				
				let sctype = x.match('http-response') ? 'response' : 'request';
				
				let scname = js.substring(js.lastIndexOf('/') + 1, js.lastIndexOf('.') );
				
				let arg = [];
				
				if (x.match(/argument\x20*?=.+/)){
					if (x.match(/(argument\x20*=\x20*"+.*?,.*?"+)\x20*(,\x20*\w+|$)/)
){
			arg = ', argument=' + x.match(/argument\x20*=\x20*("+.*?,.*?"+)\x20*(,\x20*\w+|$)/)[1];
}else{
			arg = ", argument=" +  x.replace(/argument\x20+=/gi,"argument=").split("argument=")[1].split(",")[0];}
			}else{}
				
				script.push(
					`${noteK}http-${sctype} ${ptn} script-path=${js}${rebody}${proto}, tag=${scname}${arg}`
				);

				}else{
let lineNum = original.indexOf(x) + 1;
others.push(lineNum + "行" + x)}

				}
				}//整个http-re结束
				
				break;
				
//不是以http-re开头的HeaderRewrite				
			case " header-":
					
					z[y - 1]?.match(/^#/) &&  URLRewrite.push(z[y - 1]);
				
					if (x.match(/header-replace-regex/)){
				URLRewrite.push(x.replace(/#?http-(response|request)\x20+/,"").replace("-regex","").replace(/([^\s]+\x20[^\s]+)\x20[^\s]+\x20(.+)/,`${noteK}$1 $2`));
					}else{
			URLRewrite.push(`${noteK}` + x.replace(/#?http-(response|request)\x20/,""))
					};//HeaderRewrite结束
				
				break;

//定时任务
			case "cronexp":
			x = x.replace(/cronexpr/gi,'cronexp').replace(/"/g,'');
				let croName = x.split("=")[0].replace(/\x20/gi,"").replace(/^#/,'')
				
				let cronJs = x.replace(/\x20/gi,"").split("script-path=")[1].split(",")[0];
				
				let cronExp = x.replace(/(.+cronexp\x20*=.+)/,"$1,").replace(/.+cronexp\x20*=\x20*(.+\x20.+?),.*/,"$1")
				
				script.push(
						`${noteK}cron "${cronExp}" script-path=${cronJs}, timeout=60, tag=${croName}`
				);
				
				break;

//REJECT

			case " - reject":

				z[y - 1]?.match(/^#/) && URLRewrite.push(z[y - 1]);
				URLRewrite.push(x.replace(/\x20{2,}/g," ").replace(/(^#)?(.+?)\x20-\x20(reject-200|reject-img|reject-dict|reject-array|reject)/, `${noteK}$2 - $3`));
				break;
			
//Mock转reject/request

			case " data=":
				
					let ptn = x.replace(/\x20{2,}/g," ").split(" data=")[0].replace(/^#|"/g,"");
					let arg = x.split(' data="')[1].split('"')[0];
					let scname = arg.substring(arg.lastIndexOf('/') + 1, arg.lastIndexOf('.') );
					
				if (arg.match(/(img\.|dict\.|array\.|200\.|blank\.)/i)){
				z[y - 1]?.match(/^#/) && URLRewrite.push(z[y - 1]);
					
				let mock2Dict = arg.match(/dict\./) ? '-dict' : '';
				let mock2Array = arg.match(/array\./) ? '-array' : '';
				let mock2200 = arg.match(/200\.|blank\./) ? '-200' : '';
				let mock2Img = x.match(/img\./) ? '-img' : '';
				URLRewrite.push(
						`${noteK}${ptn} - reject${mock2Dict}${mock2Array}${mock2200}${mock2Img}`
				);
				}else{
		
				z[y - 1]?.match(/^#/) && script.push(z[y - 1]);
		script.push(
			`${noteK}http-request ${ptn} script-path=https://raw.githubusercontent.com/xream/scripts/main/surge/modules/echo-response/index.js, tag=${scname}, argument=type=text/json&url=${arg}`)
					
				}
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
				
					URLRewrite.push(
						x.replace(/\x20{2,}/g," ").replace(/(^#)?([^\s]+)\x20([^\s]+)\x20(302|307|header)/, `${noteK}$2 $3 $4`));
				}else{
				 if (type.match(/(URL-REGEX|USER-AGENT|IP-CIDR|GEOIP|IP-ASN|DOMAIN)/)) {
					z[y - 1]?.match(/^#/)  && Rule.push(z[y - 1]);
				
					Rule.push(x.replace(/#?(.+)/,`${noteK}$1`));
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

others = (others[0] || '') && `${others.join("\n")}`;

body = `${name}
${desc}
${icon}


${Rule}


${URLRewrite}


${script}


${MITM}`
		.replace(/t&zd;/g,',')
		.replace(/(#.+\n)\n/g,'$1')
		.replace(/\n{2,}/g,'\n\n')

if (isSurgeiOS || isStashiOS) {
           others !="" && $notification.post("不支持的类型已跳过","第" + others,"点击查看原文，长按可展开查看跳过行",{url:req});
        } else {if (isLooniOS || isShadowrocket) {
       others !="" && $notification.post("不支持的类型已跳过","第" + others,"点击查看原文，长按可展开查看跳过行",req);}};

 $done({ response: { status: 200 ,body:body ,headers: {'Content-Type': 'text/plain; charset=utf-8'} } });
}//判断是否断网的反括号


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
