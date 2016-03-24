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
__html__.push('<a href="/anjia/orderdetail.html?orderId=' + __orderId__ + '">还款记录</a>');
__html__.push('<i class="common-ico ico-selected-flag"></i>');
__html__.push('</div>');
__html__.push('</li>');

__html__.push('<li>');
if(__item__ == 1){
	__html__.push('<div id="protocoldiv" class="nav-main-item selected">');
}
else{
	__html__.push('<div id="protocoldiv" class="nav-main-item">');
}
__html__.push('<a href="javascript:void(0);">用户协议</a>');
__html__.push('<i class="common-ico ico-selected-flag"></i>');
__html__.push('</div>');
__html__.push('<dl id="orderleftbtn" class="sub-left-sec-nav">');


//__html__.push('<dd class="selected" onclick="$.fn.showProtocolPop(\'../anjia/protocol/protocol-fenqi.html\',\'分期付款协议\')">');

__html__.push('<dd id="xieyi_1">');
__html__.push('<a href="javascript:void(0)">分期付款协议</a>');
__html__.push('<i class="common-ico ico-selected-flag"></i>');
__html__.push('</dd>');


__html__.push('<dd id="xieyi_2">');
__html__.push('<a href="javascript:void(0)">征信授权书</a>');
__html__.push('<i class="common-ico ico-selected-flag"></i>');
__html__.push('</dd>');


__html__.push('<dd id="xieyi_3">');
__html__.push('<a href="javascript:void(0)">客户承诺函</a>');
__html__.push('<i class="common-ico ico-selected-flag"></i>');
__html__.push('</dd>');


__html__.push('<dd id="xieyi_4">');
__html__.push('<a href="javascript:void(0)">信用咨询协议</a>');
__html__.push('<i class="common-ico ico-selected-flag"></i>');
__html__.push('</dd>');

__html__.push('<dd id="xieyi_5">');
__html__.push('<a href="javascript:void(0)">债权转让协议</a>');
__html__.push('<i class="common-ico ico-selected-flag"></i>');
__html__.push('</dd>');

__html__.push('</dl>');
__html__.push('</li>');

__html__.push('<li>');
__html__.push('<div class="nav-main-item">');
__html__.push('<a href="javascript:history.go(-1);">返回订单</a>');
__html__.push('<i class="common-ico ico-selected-flag"></i>');
__html__.push('</div>');
__html__.push('</li>');

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

/* 根据版本获取协议信息 */
	var g={};
	function showOrderDetailByHistory(orderId){
		var condi = {};
		condi.login_token = g.login_token;
		condi.orderId = orderId || "";
		var url = Base.serverUrl + "order/getProtocolInfoByOrderId";
		$.ajax({
			url:url,
			data:condi,
			type:"POST",
			dataType:"json",
			context:this,
			success: function(data){
				var status = data.success || false;
				if(status){
					var obj = data.obj || [];
					g.H = obj.version || "";
				}
				else{
					var msg = data.message || "获取用户订单失败";
				}
			},
			error:function(data){
			}
		});
	}

function OrderLeftProtocolClick(){
	showOrderDetailByHistory(__orderId__);
	$("#orderleftbtn > dd").bind("click",function(evt){
		var id = this.id || "";
		var t = id.split("_")[1] || "";
		var H = g.H || "";//判断是否有版本
		if(H != ""){
			var pages = ["","../anjia/protocol_"+H+"/protocol-fenqi.html","../anjia/protocol_"+H+"/protocol-authorization.html","../anjia/protocol_"+H+"/protocol-customer-commitment.html","../anjia/protocol_"+H+"/protocol-credit-counseling.html","../anjia/protocol_"+H+"/protocol-transfer.html"];
		}else{
			var pages = ["","../anjia/protocol/protocol-fenqi.html","../anjia/protocol/protocol-authorization.html","../anjia/protocol/protocol-customer-commitment.html","../anjia/protocol/protocol-credit-counseling.html","../anjia/protocol/protocol-transfer.html"];
		}
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


