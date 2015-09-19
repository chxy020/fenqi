/**
 * file:关于我们
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


});












