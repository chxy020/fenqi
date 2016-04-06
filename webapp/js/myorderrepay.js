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
	g.get_coupons_money = 0;
	g.useLeastMoney = 0;//优惠券限制使用最低金额
	g.couponId = Utils.getQueryString("co") || "";//判断是否有减免服务费
	g.totalPage = 1;
	g.currentPage = 1;
	g.pageSize = 10;
	g.coupons = [];
	g.month_Poundage = false;//判断是否是分期服务费还款
	//验证登录状态
	var loginStatus = Utils.getUserInfo();
	if(!loginStatus){
		//未登录
		location.replace("../login/login.html");
	}
	else{
		getUserInfo();
		getOrderInfo();
		//获取订单列表
		//getUserOrderStagingList();
		//get_coupons_money();//获取优惠券
		//获取订单状态
		//sendGetUserInfoDicHttp();
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
		var userorderinfo_list = Utils.offLineStore.get("userorderinfo_list",false) || "";
		var dd = JSON.parse(userorderinfo_list) || {};
		var poundage = dd.poundage - 0 || 0;
		var orderId = dd.orderId || "";
		get_coupons_money(poundage,orderId);
		setTimeout(function(){
		var d = JSON.parse(data);
		var orderId = d.orderId || "";
		var repaymentRecordId = d.repaymentRecordId || "主键";
		var repaymentTypeDesc = d.repaymentTypeDesc || "";
		var totalOverdueFee = d.totalOverdueFee || 0;
		var firstExpectRepaymentTime = d.firstExpectRepaymentTime || "";
		var totalResiduePrincipal = d.totalResiduePrincipal || 0;//月还款本金
		var realRepaymentTime = d.realRepaymentTime || "无";
		var totalCurrentBalance = d.totalCurrentBalance || 0;		
		var firstOverdueTime = d.firstOverdueTime || 0;	
		var monthPoundage = d.monthPoundage || "";
		var i = d.repaymentTimes || "";//判断是第几笔付款
		g.month_Poundage = monthPoundage == "" ?  false : true ;		
		/* var userorderinfo_list = Utils.offLineStore.get("userorderinfo_list",false) || "";
		var dd = JSON.parse(userorderinfo_list) || {}; */
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
		html.push('<p><i class="common-ico product-tip1"></i>还款本金：<span class="color-green">' +totalResiduePrincipal + '</span>元</p>');
		html.push('</div>');
		html.push('</div>');
		if(g.month_Poundage && i == "1" && g.couponId == "8"){
			html.push('<div class="box-item">');
			html.push('<div class="box-item-text">');
			html.push('<p><i class="common-ico product-tip1"></i>还款服务费：<span style="color:#ff5f00;" class="color-green">享贴息活动已减免</span></p>');
			html.push('</div>');
			html.push('</div>');
		}else if(g.month_Poundage){
			html.push('<div class="box-item">');
			html.push('<div class="box-item-text">');
			html.push('<p><i class="common-ico product-tip1"></i>还款服务费：<span class="color-green">' +monthPoundage + '</span>元</p>');
			html.push('</div>');
			html.push('</div>');
		}
		html.push('<div class="box-item">');
		html.push('<div class="box-item-text">');
		html.push('<p><i class="common-ico product-tip1"></i>应还时间：<span class="color-green">' + firstExpectRepaymentTime + '</span></p>');
		html.push('</div>');
		html.push('</div>');
		html.push('<div class="box-item">');
		html.push('<div class="box-item-text">');
		html.push('<p><i class="common-ico product-tip3"></i>逾期天数：<span class="color-green">' + firstOverdueTime + '</span>天</p>');
		html.push('</div>');
		html.push('</div>');
		html.push('<div class="box-item">');
		html.push('<div class="box-item-text">');
		html.push('<p><i class="common-ico product-tip2"></i>逾期利息：<span class="color-green">' + totalOverdueFee + '</span>元</p>');
		html.push('</div>');
		html.push('</div>');
		if(g.month_Poundage && i == "1" && g.couponId == "8"){
			totalCurrentBalance = (totalCurrentBalance-monthPoundage).toFixed(2) || 0;
		}
		html.push('<div class="box-item">');
		html.push('<div class="box-item-text">');
		html.push('<p><i class="common-ico product-tip2"></i>应还金额：<span class="color-green">' + totalCurrentBalance + '</span>元</p>');
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
		//if(poundage >= g.useLeastMoney && g.get_coupons_money > 0 && g.pa == "1"){
		//var get_coupons_money = g.get_coupons_money || 0;		
		/* html.push('<br><div class="box-item">');
		html.push('<div class="box-item-text">');
		html.push('&nbsp;&nbsp;&nbsp;<div class="chk-bg cklikeCheckboxn" style="display:inline-block" ><input type="checkbox" name="coupons_value1" id="coupons_value'+i+'"  class="common-checkbox" style="display: none;"></div><p style="display:inline-block;width:auto;padding-left:0;">使用优惠券&nbsp;&nbsp;&nbsp;当前余额<span class="color-green" >'+coupons_money_span+'元</span></p>');
		html.push('</div>');
		html.push('</div>'); */
		//}
		g.yinghuanjine = totalCurrentBalance;
		if(g.pa == "1"){
			for(var i = 0; i < g.coupons.length; i++){
				var coupons_money_span = g.coupons[i][0] || "";
				html.push('<br><div class="box-item">');
				html.push('<div class="box-item-text">');
				if(g.coupons[i][3] != 0){
					html.push('&nbsp;&nbsp;&nbsp;<div class="chk-bg cklikeCheckboxn" style="display:inline-block" ><input type="checkbox" name="coupons_value1" id="coupons_value'+i+'"  class="common-checkbox" style="display: none;"></div><p style="display:inline-block;width:auto;padding-left:0;">使用优惠券&nbsp;&nbsp;&nbsp;优惠折扣<span class="color-green" >'+g.coupons[i][3]+'折</span></p>');
				}else{
					html.push('&nbsp;&nbsp;&nbsp;<div class="chk-bg cklikeCheckboxn" style="display:inline-block" ><input type="checkbox" name="coupons_value1" id="coupons_value'+i+'"  class="common-checkbox" style="display: none;"></div><p style="display:inline-block;width:auto;padding-left:0;">使用优惠券&nbsp;&nbsp;&nbsp;当前余额<span class="color-green" >'+coupons_money_span+'元</span></p>');
				}					
				html.push('</div>');
				html.push('</div>');
			}
		}	
		html.push('</div>');
		html.push('</li>');

		$("#orderinfodiv").html(html.join(''));		
		n_click();
		},500);
	}
	function n_click(){
		$(".cklikeCheckboxn").click(function(){
			if($(this).find(".common-checkbox").attr("checked")=="checked"){
				$(this).removeClass("chk-bg-checked");
				$(this).find(".common-checkbox").attr("checked",false);				
			}else{
				$(".cklikeCheckboxn").removeClass("chk-bg-checked").find(".common-checkbox").attr("checked",false);			
				$(this).addClass("chk-bg-checked").find(".common-checkbox").attr("checked","checked");		
			}					
		})
	}
	function get_coupons_money(poundage,orderId){
		g.coupons = [];
		var condi = {};
			condi.login_token = g.login_token;
			condi.customerId = g.customerId;
			condi.orderId = orderId;
			condi.useMoney = poundage || "";			
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
					if(data.list != ""){
						var dd = data.list || [];
						/* var coupons_money_span = dd[0].money || 0;
						var get_coupons_couponId = dd[0].couponId || "";
						var useLeastMoney = dd[0].useLeastMoney || 0;
						//$("#coupons_money_span").html(coupons_money_span);
						g.get_coupons_money = coupons_money_span;
						g.get_coupons_couponId = get_coupons_couponId;
						g.useLeastMoney = useLeastMoney; */
						for(var i = 0; i < dd.length; i++){
							var coupons_money_span = dd[i].money || 0;
							var get_coupons_couponId = dd[i].couponId || "";
							var useLeastMoney = dd[i].useLeastMoney || 0;
							var couponType = dd[i].couponType || "";
							var discount = dd[i].discount || 0;//折扣
							if(couponType == "1" && discount != 0){
								var coupon_money = poundage*(10-discount)/10 || 0;
								coupons_money_span = coupon_money.toFixed(2) || 0;
							}
							if(poundage >= useLeastMoney && coupons_money_span > 0){
								g.coupons[i] = [coupons_money_span,get_coupons_couponId,useLeastMoney,discount];
							}
						}
					}				
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
	function getOrderInfo(){
		g.orderInfo = Utils.offLineStore.get("repay_userorderinfo_list",false) || "";
		if(g.orderInfo != ""){
			changeOrderInfoHtml(g.orderInfo);
		}
		else{
			Utils.alert("数据错误");
			history.go(-1);
		}
	}
		


	function repayment(id){
		var d = g.orderDetailInfo[id];

		var info = JSON.stringify(d);
		Utils.offLineStore.set("repay_userorderinfo_list",info,false);

		location.href = "repayment-list-detail.html";


	}
	function confirmRepayment(){
		
		var repaymentRecordId = g.repaymentRecordId;
		var get_coupons_couponId = "";
		var get_coupons_money = "";
		var yinghuanjine = g.yinghuanjine;
		var useLeastMoney = "";
		$(".cklikeCheckboxn").each(function(n){
			if($(this).find(".common-checkbox").attr("checked")=="checked"){
				get_coupons_couponId = g.coupons[n][1] || "";
				get_coupons_money = g.coupons[n][0] || "";
				useLeastMoney = g.coupons[n][2] || "";
			}
		})
		yinghuanjine = yinghuanjine - get_coupons_money; console.log(yinghuanjine); console.log(get_coupons_couponId);
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
				//console.log("sendIsExistBindBankCardHttp",data);
				if(g.couponId == "8"){get_coupons_couponId = g.couponId;}//判断是否是还款抵券
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


	window.getOrderInfo = getOrderInfo;
	window.confirmRepayment = confirmRepayment;
	window.repayment = repayment;	
	window.n_click = n_click;
	window.get_coupons_money = get_coupons_money;
});





