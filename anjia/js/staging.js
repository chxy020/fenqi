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
	g.sendTime = 60;
	g.customerId = "";
	g.userPhone = "";

	//获取图形验证码
	//sendGetImgCodeHttp();

	//验证登录状态
	var loginStatus = Utils.getUserInfo();
	if(!loginStatus){
		//未登录
		//location.replace("/anjia/login.html");
	}

	//g.httpTip.show();
	$("#countbtn").bind("click",countBtnUp);

	function countFee(allprice,time){
		var numarr = [3,6,9,12,18,24,36];
		var ratearr = [0,0.01,0.04,0.07,0.1,0.13,0.16];

		var rate = ratearr[time] * allprice;
		var all = allprice + rate;
		var mouthprice = allprice / numarr[time];
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












