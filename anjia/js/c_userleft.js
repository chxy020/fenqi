/**
 * 通用头部
*/

//获取url参数
function getQueryString(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
	var r = window.location.search.substr(1).match(reg);
	if (r != null && typeof r != "undefined"){
		return unescape(r[2]);
	}
	else{
		return "";
	}
}

var __item__ = getQueryString("item") || "";
var __ostatus__ = getQueryString("ostatus") || "";

//var __Tel__ = "400-968-9088";
var __html__ = [];

__html__.push('<ul>');

//~ __html__.push('<li>');
//~ if(__item__ == 0 || __item__ == ""){
	//~ __html__.push('<div class="nav-main-item selected">');
//~ }
//~ else{
	//~ __html__.push('<div class="nav-main-item">');
//~ }
//~ __html__.push('<a href="/anjia/usercenter.html?item=0">个人账户</a>');
//~ __html__.push('<i class="common-ico ico-selected-flag"></i>');
//~ __html__.push('</div>');
//~ __html__.push('</li>');

__html__.push('<li>');
if(__item__ == 1 || __item__ == ""){
	__html__.push('<div class="nav-main-item selected">');
}
else{
	__html__.push('<div class="nav-main-item">');
}
__html__.push('<a href="/anjia/usercenter.html?item=1">我的订单</a>');
__html__.push('<i class="common-ico ico-selected-flag"></i>');
__html__.push('</div>');
__html__.push('<dl class="sub-left-sec-nav">');

if(__ostatus__ == "100506"){
	__html__.push('<dd class="selected">');
}
else{
	__html__.push('<dd>');
}
__html__.push('<a href="/anjia/usercenter.html?item=1&ostatus=100506">待放款</a>');
__html__.push('<i class="common-ico ico-selected-flag"></i>');
__html__.push('</dd>');

if(__ostatus__ == "100507"){
	__html__.push('<dd class="selected">');
}
else{
	__html__.push('<dd>');
}
__html__.push('<a href="/anjia/usercenter.html?item=1&ostatus=100507">还款中</a>');
__html__.push('<i class="common-ico ico-selected-flag"></i>');
__html__.push('</dd>');

if(__ostatus__ == "100508"){
	__html__.push('<dd class="selected">');
}
else{
	__html__.push('<dd>');
}
__html__.push('<a href="/anjia/usercenter.html?item=1&ostatus=100508">已还清</a>');
__html__.push('<i class="common-ico ico-selected-flag"></i>');
__html__.push('</dd>');
__html__.push('</dl>');
__html__.push('</li>');
__html__.push('<li>');

if(__item__ == 2){
	__html__.push('<div class="nav-main-item selected">');
}
else{
	__html__.push('<div class="nav-main-item">');
}
__html__.push('<a href="/anjia/userinfo.html?item=2">编辑资料</a>');
__html__.push('<i class="common-ico ico-selected-flag"></i>');
__html__.push('</div>');
__html__.push('</li>');
__html__.push('<li>');

if(__item__ == 3){
	__html__.push('<div class="nav-main-item selected">');
}
else{
	__html__.push('<div class="nav-main-item">');
}
__html__.push('<a href="/anjia/changephone.html?item=3">换绑手机</a>');
__html__.push('<i class="common-ico ico-selected-flag"></i>');
__html__.push('</div>');
__html__.push('</li>');
__html__.push('</ul>');
document.write(__html__.join(''));


