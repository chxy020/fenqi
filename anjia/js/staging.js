/**
 * file:我要分期
 * author:chenxy
*/

//页面初始化
$(function(){
	var g = {};
	g.phone = "";
	g.imgCodeId = "";
	g.sendCode = false;
	g.login_token = Utils.offLineStore.get("token",false) || "";
	g.channel = Utils.getQueryString("channel") || "";
	if(g.channel != ""){Utils.offLineStore.set("channel",g.channel,false);}	
	g.sendTime = 60;
	g.customerId = "";
	g.userPhone = "";

/* 判断访问的客户端是手机还是pc 如果是手机跳转手机页面 */
	function browserRedirect() { 
		var sUserAgent= navigator.userAgent.toLowerCase(); 
		var bIsIpad= sUserAgent.match(/ipad/i) == "ipad"; 
		var bIsIphoneOs= sUserAgent.match(/iphone os/i) == "iphone os"; 
		var bIsMidp= sUserAgent.match(/midp/i) == "midp"; 
		var bIsUc7= sUserAgent.match(/rv:1.2.3.4/i) == "rv:1.2.3.4"; 
		var bIsUc= sUserAgent.match(/ucweb/i) == "ucweb"; 
		var bIsAndroid= sUserAgent.match(/android/i) == "android"; 
		var bIsCE= sUserAgent.match(/windows ce/i) == "windows ce"; 
		var bIsWM= sUserAgent.match(/windows mobile/i) == "windows mobile"; 
		if (bIsIpad || bIsIphoneOs || bIsMidp || bIsUc7 || bIsUc || bIsAndroid || bIsCE || bIsWM) { 
			if(g.channel != ""){window.location.href= '/webapp/mystaging/index.html?channel=1'; }
			else{window.location.href= '/webapp/mystaging/index.html'; }
		}
	} 

	browserRedirect();
	//获取图形验证码
	//sendGetImgCodeHttp();

	/* “我要分期”判断是否登录 */
	$("#fenqi_btn3,#fenqi_btn4").bind("click",fenqi_btn_click2);
	function fenqi_btn_click2(){

		if(!loginStatus){
			location.href = "/anjia/login.html?p=1";
		}else{
			location.href = "/anjia/mystaging.html";
		}
	}
	//验证登录状态
	var loginStatus = Utils.getUserInfo();
	if(!loginStatus){
		//未登录
		//location.replace("/anjia/login.html");
	}

	//g.httpTip.show();
	$("#countbtn").bind("click",countBtnUp);
	$("#more_question").bind("click",more_question_f);
	
	//了解更多
	function more_question_f(){
		location.href = "/anjia/questions.html?typePageId=m";
	}
	function countFee(allprice,time){
		var numarr = [3,6,12,18,24,36];
		var ratearr = [0,0.04,0.07,0.1,0.13,0.16];
		var allprice_l=allprice*10000;
		var rate = ratearr[time] * allprice_l;
		var all = allprice_l + rate;
		var mouthprice = allprice_l / numarr[time];
		var obj = {};
		obj.all = all;
		obj.mouth = mouthprice.toFixed(2);
		obj.rate = rate.toFixed(2);
		obj.stagnum = numarr[time];
		return obj;
	}

	function countBtnUp(){
		var allprice = $("#allprice").val() - 0 || 0;
		var time = $("#stagingtime .selected").attr("id").split("_")[1] - 0;

		if(allprice > 0){
			var obj = countFee(allprice,time);

			$("#capitaltext").html(allprice.toFixed(2));
			$("#alltext").html(obj.all);
			$("#feetext").html(obj.rate);
			$("#mouthtext").html(obj.mouth);
		}
	}
});
$(document).ready(function(){
//	首页计算器
	$("#do_btn2").bind("click",countBtnUp2);

	function countFee2(allprice,time){
		var numarr = [3,6,12,18,24,36];
		var ratearr = [0,0.04,0.07,0.1,0.13,0.16];
		var allprice_l=allprice;
		var rate = ratearr[time] * allprice_l;
		var all = allprice_l + rate;
		var mouthprice = allprice_l / numarr[time];
		var obj = {};
		obj.all = all;
		obj.mouth = mouthprice.toFixed(2);
		obj.rate = rate.toFixed(2);
		obj.stagnum = numarr[time];
		return obj;
	}

	function countBtnUp2(){
		var allprice = $("#allprice3").val() - 0 || 0;
		var time = $("#select-option2 option:selected").attr("value") || "";

		if(allprice > 0 && time != ""){
			var obj = countFee2(allprice,time);

			//$("#capitaltext").html(allprice.toFixed(2));
			//$("#alltext").html(obj.all);
			$("#feetext3").html(obj.rate+"元");
			$("#mouthtext3").html(obj.mouth+"元");
		}else{
			Utils.alert("请输入分期金额并选择分期期数!");
		}
	}
		/* 添加千位分隔符 */
	function formatNumber(num){  
		 if(!/^(\+|-)?(\d+)(\.\d+)?$/.test(num)){  
		  return num;  
		 }  
		 var a = RegExp.$1,b = RegExp.$2,c = RegExp.$3;  
		 var re = new RegExp().compile("(\\d)(\\d{3})(,|$)");  
		 while(re.test(b)){  
		  b = b.replace(re,"$1,$2$3");  
		 }  
		 return a +""+ b +""+ c;  
		}
	
//ready_end	
})












