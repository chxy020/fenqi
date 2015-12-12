
//页面初始化
$(function(){
	var g = {};
	g.phone = "";
	g.imgCodeId = "";
	g.sendCode = false;
	g.sendTime = 60;
	g.login_token = Utils.offLineStore.get("token",false) || "";
	g.httpTip = new Utils.httpTip({});
	g.typePageId = Utils.getQueryString("typePageId") || "";
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
	//判断是哪里点过来的 g.typePageId 5 生活家 6 朗润 7燕子安家
	////传城市 德维-20150901，生活家-20150901000001，朗润-20150901000002
	typePageId_compare();
	function typePageId_compare(){
		var typePageId =g.typePageId || "9";
		var company = "";
		if(typePageId == "5"){
			company = "20150901000001";
		}else if(typePageId == "6"){
			company = "20150901000002";
		}else if(typePageId == "7"){
			company = "20150901";
		}
		Utils.offLineStore.set("company",company,false);	
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