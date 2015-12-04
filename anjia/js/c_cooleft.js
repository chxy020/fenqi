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
var __orderId__ = getQueryString("orderId") || "";

//var __Tel__ = "400-968-9088";
var __html__ = [];

__html__.push('<ul>');

__html__.push('<li>');
if(__item__ == 0 || __item__ == ""){
	__html__.push('<div class="nav-main-item selected">');
}
else{
	__html__.push('<div class="nav-main-item">');
}
__html__.push('<a href="/anjia/coupons.html">我的抵用券</a>');
__html__.push('<i class="common-ico ico-selected-flag"></i>');
__html__.push('</div>');
__html__.push('</li>');

/* __html__.push('<li>');
__html__.push('<div class="nav-main-item">');
__html__.push('<a href="javascript:history.go(-1);">返回订单</a>');
__html__.push('<i class="common-ico ico-selected-flag"></i>');
__html__.push('</div>');
__html__.push('</li>'); */

__html__.push('</ul>');


//onclick="$.fn.showProtocolPop(\'../anjia/protocol/protocol-fenqi.html\',\'分期付款协议\')"
//onclick="$.fn.showProtocolPop(\'../anjia/protocol/protocol-authorization.html\',\'个人征信等信息查询及使用授权书\')"
//onclick="$.fn.showProtocolPop(\'../anjia/protocol/protocol-customer-commitment.html\',\'客户承诺函\')"
// onclick="$.fn.showProtocolPop(\'../anjia/protocol/protocol-credit-counseling.html\',\'信用咨询及居间服务协议\')"
document.write(__html__.join(''));


//注册跳转事件
if(window.attachEvent){
	window.attachEvent('onload',function(){
		OrderLeftProtocolClick();
	});
}
else{
	window.addEventListener('load',function(){
		OrderLeftProtocolClick();
	},false);
}
function OrderLeftProtocolClick(){
	$("#orderleftbtn > dd").bind("click",function(evt){
		var id = this.id || "";
		var t = id.split("_")[1] || "";
		var pages = ["","../anjia/protocol/protocol-fenqi.html","../anjia/protocol/protocol-authorization.html","../anjia/protocol/protocol-customer-commitment.html","../anjia/protocol/protocol-credit-counseling.html","../anjia/protocol/protocol-transfer.html"];
		var titles = ["","分期付款协议","个人征信等信息查询及使用授权书","客户承诺函","信用咨询及居间服务协议","债权转让协议"];
		var url = pages[t] || "";
		if(url !== ""){
			$(".selected").removeClass("selected");
			$(this).addClass("selected");
			$("#protocoldiv").addClass("selected");

			var title = titles[t] || "";
			//订单数据,在协议页面可以同意引入utils.js,调用此方法获取数据
			//var orderInfo = Utils.offLineStore.get("userorderinfo_list",false) || "";
			//console.log("orderInfo",orderInfo);
			$.fn.showProtocolPop(url,title);
		}
	});
}


