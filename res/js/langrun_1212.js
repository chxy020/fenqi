﻿
//页面初始化
$(function(){
	var g = {};
	g.phone = "";
	g.imgCodeId = "";
	g.sendCode = false;
	g.sendTime = 60;
	g.login_token = Utils.offLineStore.get("token",false) || "";
	g.httpTip = new Utils.httpTip({});
	g.customerId = "";
	//验证登录状态
	var loginStatus = Utils.getUserInfo();
	if(!loginStatus){
		//未登录
	}
	else{
		getUserInfo();
	}
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
	}

	
	$("#coupons_regist_btn").bind("click",coupons_regist_click);
	
	function coupons_regist_click(){
		if(!loginStatus){
			location.href = "/anjia/login.html?p=langrun";
			return;
		}
		var url = Base.serverUrl + "coupon/claimCoupon";
		var condi = {};
		condi.login_token = g.login_token;
		condi.customerId = g.customerId;
		condi.couponId = "1";
		$.ajax({
			url:url,
			data:condi,
			type:"POST",
			dataType:"json",
			context:this,
			success: function(data){
				console.log("sendLoginHttp",data);
				var status = data.success || false;
				if(status){
					if(confirm("领取成功，是否进入个人中心查看红包")){
						location.href = "/anjia/coupons.html";
					}else{
						
					}
				}
				else{
					var msg = data.message || "领取失败";
					Utils.alert(msg);
					setTimeout(function(){
						location.href = "/anjia/usercenter.html";
					},2000);
				}
			},
			error:function(data){
			}
		});
		
		
	}
	

	
	
	
	
	
	
	
});