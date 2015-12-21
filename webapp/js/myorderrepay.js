/**
 * file:个人资料
 * author:chenxy
*/
//页面初始化
$(function(){
	var g = {};
	g.customerId = "";
	g.login_token = Utils.offLineStore.get("token",false) || "";
	g.orderId = Utils.getQueryString("orderId");
	g.httpTip = new Utils.httpTip({});
	g.pa = Utils.getQueryString("pa");
	g.orderDetailInfo = {};
	g.repaymentRecordId = "";
	g.yinghuanjine = "";


	g.totalPage = 1;
	g.currentPage = 1;
	g.pageSize = 10;

	//验证登录状态
	var loginStatus = Utils.getUserInfo();
	if(!loginStatus){
		//未登录
		location.replace("../login/login.html");
	}
	else{
		getUserInfo();
		//获取订单列表
		//getUserOrderStagingList();

		//获取订单状态
		//sendGetUserInfoDicHttp();
	}
	
	g.orderInfo = Utils.offLineStore.get("repay_userorderinfo_list",false) || "";
	if(g.orderInfo != ""){
		changeOrderInfoHtml(g.orderInfo);
	}
	else{
		Utils.alert("数据错误");
		history.go(-1);
	}


	//头像
	//$(document).on("change","#avatar",avatarBtnUp);

	$("#repaybtn").bind("click",confirmRepayment);


	//获取个人资料
	function getUserInfo(){
		var info = Utils.offLineStore.get("userinfo",false) || "";
		console.log("getUserInfo",info);
		if(info !== ""){
			var obj = JSON.parse(info) || {};
			setUserInfoHtml(obj);
		}
	}
	//修改个人资料
	function setUserInfoHtml(data){
		var obj = data || {};
		//用户登录ID
		g.customerId = obj.customerId || "";

		//var phoneNumber = obj.phoneNumber || "";
		//$("#userphone").html(phoneNumber);

		/*
		var avatar = obj.icon || "";
		if(avatar !== ""){
			avatar = avatar + "?t=" + (new Date() - 0);
			$("#avatarimg").attr("src",avatar);
		}
		*/
	}


	//获取用户信息字典信息
	function sendGetUserInfoDicHttp(){
		g.httpTip.show();
		var url = Base.serverUrl + "baseCodeController/getBaseCodeByParents";
		var condi = {};
		condi.parents = "1005";
		$.ajax({
			url:url,
			data:condi,
			type:"POST",
			dataType:"json",
			context:this,
			success: function(data){
				console.log("sendGetUserInfoDicHttp",data);
				var status = data.success || false;
				if(status){
					var obj = data.obj || {};
					changeSelectHtml(obj);
				}
				else{
					var msg = data.message || "获取用户信息字典数据失败";
					Utils.alert(msg);
				}
				g.httpTip.hide();
			},
			error:function(data){
				g.httpTip.hide();
			}
		});
	}

	function changeSelectHtml(obj){
		var parents = ["1005"];
		var ids = ["orderstatus"];
		for(var i = 0,len = parents.length; i < len; i++){
			var data = obj[parents[i]] || {};
			var option = [];
			option.push('<option value="">全部订单</option>');
			for(var k in data){
				var id = k || "";
				var name = data[k] || "";
				option.push('<option value="' + id + '">' + name + '</option>');
			}
			$("#" + ids[i]).html(option.join(''));
		}
	}





	function changeOrderInfoHtml(data){
		var d = JSON.parse(data);
		var orderId = d.orderId || "";
		var repaymentRecordId = d.repaymentRecordId || "主键";
		var repaymentTypeDesc = d.repaymentTypeDesc || "";
		var repaymentPrincipal = d.repaymentPrincipal || 0;//月还款本金
		var expectRepaymentTime = d.expectRepaymentTime || "";
		var overdueTime = d.overdueTime || 0;
		var overdueInterest = d.overdueInterest || 0;
		var yinghuanjine = repaymentPrincipal  + overdueInterest ;
		var realRepaymentTime = d.realRepaymentTime || "无";

		var userorderinfo_list = Utils.offLineStore.get("userorderinfo_list",false) || "";
		var dd = JSON.parse(userorderinfo_list) || {};
		var orderId = dd.orderId || "";
		var contractNo = dd.contractNo || "";
		var packageName = dd.packageName || "";
		var packageMoney = dd.packageMoney - 0 || 0;
		var statusDes = dd.statusDes || "";
		var status = dd.status || "";
		var fenQiTimes = dd.fenQiTimes || 0;
		var poundage = dd.poundage - 0 || 0;
		var moneyMonth = dd.moneyMonth - 0 || 0;
		var noRepaymentTimes = dd.noRepaymentTimes || 0;

		g.repaymentRecordId = repaymentRecordId;
		g.yinghuanjine = poundage;

		var html = [];
		html.push('<li>');
		html.push('<div class="order-item-top">');
		html.push('<div class="order-type-name">');
		html.push('<i class="common-ico product-ico"></i>' + packageName);
		html.push('</div>');
		html.push('</div>');
		html.push('<div class="order-item-box">');
		html.push('<div class="box-item">');
		html.push('<div class="box-item-text">');
		html.push('<p><i class="common-ico product-tip3"></i>还款类型：<span class="color-green">' + repaymentTypeDesc + '</span></p>');
		html.push('</div>');
		html.push('</div>');
		html.push('<div class="box-item">');
		html.push('<div class="box-item-text">');
		html.push('<p><i class="common-ico product-tip1"></i>还款本金：<span class="color-green">' +repaymentPrincipal + '</span>元</p>');
		html.push('</div>');
		html.push('</div>');
		html.push('<div class="box-item">');
		html.push('<div class="box-item-text">');
		html.push('<p><i class="common-ico product-tip1"></i>应还时间：<span class="color-green">' + expectRepaymentTime + '</span></p>');
		html.push('</div>');
		html.push('</div>');
		html.push('<div class="box-item">');
		html.push('<div class="box-item-text">');
		html.push('<p><i class="common-ico product-tip3"></i>逾期天数：<span class="color-green">' + overdueTime + '</span>天</p>');
		html.push('</div>');
		html.push('</div>');
		html.push('<div class="box-item">');
		html.push('<div class="box-item-text">');
		html.push('<p><i class="common-ico product-tip2"></i>逾期利息：<span class="color-green">' + overdueInterest + '</span>元</p>');
		html.push('</div>');
		html.push('</div>');
		html.push('<div class="box-item">');
		html.push('<div class="box-item-text">');
		html.push('<p><i class="common-ico product-tip2"></i>应还金额：<span class="color-green">' + yinghuanjine + '</span>元</p>');
		html.push('</div>');
		html.push('</div>');
		html.push('</div>');
		html.push('<div class="order-item-box" style="border-top:1px solid #f2f2f2;">');
		html.push('<div class="box-item">');
		html.push('<div class="box-item-text">');
		html.push('<p><i class="common-ico product-tip1"></i>订单编号：<span class="color-green">' + orderId + '</span></p>');
		html.push('</div>');
		html.push('</div>');
		html.push('<div class="box-item">');
		html.push('<div class="box-item-text">');
		html.push('<p><i class="common-ico product-tip1"></i>合同编号：<span class="color-green">' + contractNo + '</span></p>');
		html.push('</div>');
		html.push('</div>');
		html.push('<div class="box-item">');
		html.push('<div class="box-item-text">');
		html.push('<p><i class="common-ico product-tip1"></i>产品类型：<span class="color-green">' + packageName + '</span></p>');
		html.push('</div>');
		html.push('</div>');
		html.push('<div class="box-item">');
		html.push('<div class="box-item-text">');
		html.push('<p><i class="common-ico product-tip3"></i>分期月数：<span class="color-green">' + fenQiTimes + '</span>个月</p>');
		html.push('</div>');
		html.push('</div>');
		html.push('<div class="box-item">');
		html.push('<div class="box-item-text">');
		html.push('<p><i class="common-ico product-tip2"></i>服务费：<span class="color-green">' + poundage + '</span>元</p>');
		html.push('</div>');
		html.push('</div>');
		html.push('<div class="box-item">');
		html.push('<div class="box-item-text">');
		html.push('<p><i class="common-ico product-tip2"></i>每月还款本金：<span class="color-green">' + moneyMonth + '</span>元</p>');
		html.push('</div>');
		html.push('</div>');
		html.push('<div class="box-item">');
		html.push('<div class="box-item-text">');
		html.push('<p><i class="common-ico product-tip3"></i>当前状态：<span class="color-green">' + statusDes +'</span></p>');
		html.push('</div>');
		html.push('</div>');
		html.push('<div class="box-item">');
		html.push('<div class="box-item-text">');
		html.push('<p><i class="common-ico product-tip2"></i>待还期数：<span class="color-green">' + noRepaymentTimes + '</span>期</p>');
		html.push('</div>');
		html.push('</div>');
		html.push('<div class="box-item">');
		html.push('<div class="box-item-text">');
		html.push('<p><i class="common-ico product-tip2"></i>总还款金额：<span class="color-green">' + packageMoney + '</span>元</p>');
		html.push('</div>');
		html.push('</div>');
		html.push('<div class="box-item">');
		html.push('<div class="box-item-text">');
		html.push('<p><i class="common-ico product-tip2"></i>待还金额：<span class="color-green">' + moneyMonth + '</span>元</p>');
		html.push('</div>');
		html.push('</div>');
		if(poundage >=5000 && g.pa == "1"){
		html.push('<br><div class="box-item">');
		html.push('<div class="box-item-text">');
		html.push('&nbsp;&nbsp;&nbsp;<div class="chk-bg chk-bg-checked" style="display:inline-block" id="cklikecoupons"><input type="checkbox" name="coupons_value1" id="coupons_value" checked="checked"  class="common-checkbox" style="display: none;"></div><p style="display:inline-block;width:auto;padding-left:0;">使用优惠券&nbsp;&nbsp;&nbsp;当前余额<span class="color-green" id="coupons_money_span">0</span>元</p>');
		html.push('</div>');
		html.push('</div>');
		}
		html.push('</div>');
		html.push('</li>');

		$("#orderinfodiv").html(html.join(''));
		if(poundage >=5000 && g.pa == "1"){
		n_click();
		get_coupons_money();
		}
	}
	function n_click(){
		$("#cklikecoupons").click(function(){
			$(this).toggleClass("chk-bg-checked");
			if($(this).find("#coupons_value").attr("checked")=="checked"){
				$(this).find("#coupons_value").attr("checked",false);
			}else{
				$(this).find("#coupons_value").attr("checked","checked");
			}
		})
	}
	function get_coupons_money(){
		g.get_coupons_money = 0;
		var condi = {};
			condi.login_token = g.login_token;
			condi.customerId = g.customerId;
		var url = Base.serverUrl + "coupon/getAvailableCouponsByCustomerId";
		$.ajax({
			url:url,
			data:condi,
			type:"POST",
			dataType:"json",
			context:this,
			success: function(data){
				var status = data.success || false;
				if(status){
					var dd = data.list;
					var coupons_money_span = dd[0].money || 0;
					var get_coupons_couponId = dd[0].couponId || "";
					$("#coupons_money_span").html(coupons_money_span);
					g.get_coupons_money = coupons_money_span;
					g.get_coupons_couponId = get_coupons_couponId;
				}
				else{
					var msg = data.message || "获取优惠券失败";
					Utils.alert(msg);
				}
				g.httpTip.hide();
			},
			error:function(data){
				g.httpTip.hide();
			}
		});
	}
	


	function repayment(id){
		var d = g.orderDetailInfo[id];

		var info = JSON.stringify(d);
		Utils.offLineStore.set("repay_userorderinfo_list",info,false);

		location.href = "repayment-list-detail.html";


	}
	function confirmRepayment(){
		var repaymentRecordId = g.repaymentRecordId;
		var yinghuanjine = g.yinghuanjine;
		var get_coupons_couponId="";
		if(yinghuanjine >= 5000 && $("#coupons_value").attr("checked")=="checked")
		{yinghuanjine = yinghuanjine - g.get_coupons_money; get_coupons_couponId = g.get_coupons_couponId;}
		
		//先判断用户有没有判定银行卡
		sendIsExistBindBankCardHttp(repaymentRecordId,yinghuanjine,get_coupons_couponId);
	}


	function sendIsExistBindBankCardHttp(repaymentRecordId,yinghuanjine,get_coupons_couponId){
		g.httpTip.show();
		var url = Base.serverUrl + "payPc/isExistBindBankCard";
		var condi = {};
		condi.customerId = g.customerId;
		condi.login_token = g.login_token;
		$.ajax({
			url:url,
			data:condi,
			type:"POST",
			dataType:"json",
			context:this,
			success: function(data){
				console.log("sendIsExistBindBankCardHttp",data);
				var status = data.success || false;
				if(status){
					//用户绑定银行卡
					
					location.href = "../card-pay/card-pay2.html?recordId=" + repaymentRecordId + "&p=" + yinghuanjine+ "&id=" + get_coupons_couponId;
				}
				else{
					//用户没有绑定银行卡
					location.href = "../bind-card/add-bind-card.html?recordId=" + repaymentRecordId + "&p=" + yinghuanjine+ "&id=" + get_coupons_couponId;
				}
				g.httpTip.hide();
			},
			error:function(data){
				g.httpTip.hide();
			}
		});
	}



	window.confirmRepayment = confirmRepayment;
	window.repayment = repayment;
	window.get_coupons_money = get_coupons_money;
	window.n_click = n_click;
});





