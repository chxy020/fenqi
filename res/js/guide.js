
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
	g.typePageId = Utils.getQueryString("typePageId") || "";
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

	
	$("#fenqi_btn7").bind("click",fenqi_btn_click2);
	$("#tip2_left_btn").bind("click",function(){btn_click(1)});
	$("#tip2_right_btn").bind("click",function(){btn_click(2)});
	$("#tip3_left_btn").bind("click",function(){btn_click2(1)});
	$("#tip3_right_btn").bind("click",function(){btn_click2(2)});
	$("#tip4_left_btn").bind("click",function(){btn_click3(1)});
	$("#tip4_right_btn").bind("click",function(){btn_click3(2)});
	$("#tip5_left_btn").bind("click",function(){btn_click4(1)});
	$("#tip5_right_btn").bind("click",function(){btn_click4(2)});
	function fenqi_btn_click2(){

		if(!loginStatus){
			location.href = "/anjia/login.html?p=1";
		}else{
			location.href = "/anjia/mystaging.html";
		}
	}
	var now = 1;
	function  btn_click(direct){
		if(direct == 1){
			if(now <= 1){now = 5;}
			now--;
		}
		else if(direct == 2){
			if(now >= 4){now = 0;}
			now++;
		}
		$(".er_div4 .tip1 ul li:nth-child("+now+")").addClass("active").siblings("li").removeClass("active");
		$(".er_div4 .tip4  div.box").attr("class","box").addClass("bg"+now+"");
	}
	var now2 = 1;
	function  btn_click2(direct){
		if(direct == 1){
			if(now2 <= 1){now2 = 3;}
			now2--;
		}
		else if(direct == 2){
			if(now2 >= 2){now2 = 0;}
			now2++;
		}
		$(".er_div5 .tip1 ul li:nth-child("+now2+")").addClass("active").siblings("li").removeClass("active");
		$(".er_div5 .tip4  div.box").attr("class","box").addClass("bg"+now2+"");
	}
	var now3 = 1;
	function  btn_click3(direct){
		if(direct == 1){
			if(now3 <= 1){now3 = 3;}
			now3--;
		}
		else if(direct == 2){
			if(now3 >= 2){now3 = 0;}
			now3++;
		}
		$(".er_div6 .tip1 ul li:nth-child("+now3+")").addClass("active").siblings("li").removeClass("active");
		$(".er_div6 .tip4  div.box").attr("class","box").addClass("bg"+now3+"");
	}
	var now4 = 1;
	function  btn_click4(direct){
		if(direct == 1){
			if(now4 <= 1){now4 = 4;}
			now4--;
		}
		else if(direct == 2){
			if(now4 >= 3){now4 = 0;}
			now4++;
		}
		$(".er_div7 .tip1 ul li:nth-child("+now4+")").addClass("active").siblings("li").removeClass("active");
		$(".er_div7 .tip4  div.box").attr("class","box").addClass("bg"+now4+"");
	}
	/* 标签click */
	$(".er_div4 .tip1 ul li").each(function(n){
		$(this).click(function(){
			now = n+1;
			$(".er_div4 .tip1 ul li:nth-child("+now+")").addClass("active").siblings("li").removeClass("active");
			$(".er_div4 .tip4  div.box").attr("class","box").addClass("bg"+now+"");
		})
	})
	$(".er_div5 .tip1 ul li").each(function(n){
		$(this).click(function(){
			now2 = n+1;
			$(".er_div5 .tip1 ul li:nth-child("+now2+")").addClass("active").siblings("li").removeClass("active");
			$(".er_div5 .tip4  div.box").attr("class","box").addClass("bg"+now2+"");
		})
	})
	$(".er_div6 .tip1 ul li").each(function(n){
		$(this).click(function(){
			now3 = n+1;
			$(".er_div6 .tip1 ul li:nth-child("+now3+")").addClass("active").siblings("li").removeClass("active");
			$(".er_div6 .tip4  div.box").attr("class","box").addClass("bg"+now3+"");
		})
	})
	
});