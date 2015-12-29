
$(document).ready(function(){	
	resize_width();	
	function resize_width(){
		var width=$("html").width();
		var size=[1.13,1.43,2.3,1.196];
		var size2=[0.38,0.15,0.23,0.29,0.26,0.25];
		var height=[];
		for(var i=0;i < size.length;i++){
			var n=i+1;
			height[i]=(width/size[i]).toFixed(0);
			$(".er_div"+n+"").css("height",height[i]+"px");
		}
		$(".er_div1 .red_box").css("top",(height[0]*size2[0]).toFixed(0)+"px");
		//$(".er_div1 .tip").css("bottom",height[0]*size2[1]);
		//$(".er_div2 .tip").css("top",(height[1]*size2[2]).toFixed(0)+"px");
		//$(".er_div3 .tip").css("top",(height[2]*size2[3]).toFixed(0)+"px");
		//$(".er_div3 .tip p.p1").css("margin-bottom",(height[2]*size2[4]).toFixed(0)+"px");
		//$(".er_div4 .tip").css("top",(height[3]*size2[5]).toFixed(0)+"px");
	}
	$(window).resize(function(){
		resize_width();	
	})
	window.resize_width=resize_width;
})

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
			location.href = "/webapp/login/login.html?p=shenghuojia";
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
						location.href = "/webapp/coupons/index.html";
					}else{
						
					}
				}
				else{
					var msg = data.message || "领取失败";
					alert(msg);
					location.href = "/webapp/personal-center/index.html";
				}
			},
			error:function(data){
			}
		});
		
		
	}
	

});