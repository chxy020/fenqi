/**
 * file:登录
 * author:chenxy
*/

//页面初始化
$(function(){
	var g = {};
	g.codeId = "";
	g.tout = null;
	g.httpTip = new Utils.httpTip({});
	/* 元宵活动标记 */
	g.customerId = "";
	g.dengmi = Utils.offLineStore.get("dengmi",false) || "";
	g.coupons_id = Utils.offLineStore.get("coupons_id",false) || "";
	g.openid = Utils.offLineStore.get("openid",false) || "";
	var userPhone = Utils.offLineStore.get("userphone_login",true) || "";
	$("#inputphone").val(userPhone);


	$("#backbtn").bind("click",backBtnUp);

	$("#inputphone").bind("blur",validPhone);
	$("#inputpwd").bind("blur",validPwd);
	$("#loginbtn").bind("click",loginBtnUp);
	//找回密码
	//$("#findpwd").bind("click",findPwdPage);


	function backBtnUp(evt){
		history.go(-1);
	}


	//验证手机号
	function validPhone(){
		var phone = $("#inputphone").val() || "";
		var reg = /^1[3,4,5,7,8]\d{9}$/g;
		if(phone !== ""){
			if(!reg.test(phone)){
				alert("用户名/手机号输入错误");
				//$("#inputphone").focus();
			}
		}
	}

	//验证密码6-16
	function validPwd(){
		var pwd = $("#inputpwd").val() || "";
		if((pwd.length < 6 || pwd.length > 16) && pwd !== ""){
			alert("密码输入错误");
			//$("#inputpwd").focus();
		}
	}
	/* 接收页面参数 */
	function GetRequest() { 
		var url = location.search; //获取url中"?"符后的字串
	   var theRequest = [];
	   if (url.indexOf("?") != -1) {
		  var str = url.substr(1);
		  strs = str.split("&");
		  for(var i = 0; i < strs.length; i ++) {
			 theRequest[strs[i].split("=")[0]]=(strs[i].split("=")[1]);
		  }
	   }
	   return theRequest;
	}

	function loginBtnUp(evt){
		var phone = $("#inputphone").val() || "";
		var pwd = $("#inputpwd").val() || "";
		//var code = $("#inputCode3").val() || "";
		if(phone !== ""){
			if(pwd !== ""){
				var savePhone = $("#chkphone").attr("checked") == "checked" ? true : false;
				
				if(savePhone){
					Utils.offLineStore.set("userphone_login",phone,true);
				}
				var condi = {};
				condi.phone_number = phone;
				condi.password = pwd;
				sendLoginHttp(condi);
			}
			else{
				alert("请输入密码");
				//$("#inputpwd").focus();
			}
		}
		else{
			alert("请输入手机号");
			//$("#inputphone").focus();
		}
	}

	function sendLoginHttp(condi){
		var url = Base.serverUrl + "user/CustomerLoginController";
		g.httpTip.show();
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
					var userInfo = data.obj || "";
					if(userInfo !== ""){
						g.customerId = userInfo.customerId || "";
						userInfo = JSON.stringify(userInfo);
						//保存用户数据
						Utils.offLineStore.remove("weiyue_message",false);
						Utils.offLineStore.set("userinfo",userInfo,false);
						var token = data.token || "";
						g.login_token = token;
						Utils.offLineStore.set("token",token,false);
						/* 判断是否是从元宵活动页过来的 */
						var compare = GetRequest().p;
						if(compare==1){location.replace("../mystaging/mystaging.html");}//分期付款
						else if(compare==2){location.replace("../order/index.html?orderType=100507");}//还款中
						else if(compare=="langrun"){location.href = "/webapp/coupons/langrun_1212_mobi.html";}
						else if(compare=="shenghuojia"){location.href = "/webapp/coupons/shenghuojia_1212_mobi.html";}
						else if(g.dengmi == "dengmi"){get_user_coupons();}
						else{location.replace("../personal-center/index.html");}
						
						//location.replace("../personal-center/index.html");
					}
					//location.href = "center.html";
					//var token = data.result.token || "";
					//Utils.offLineStore.set("token",token,false);
					//location.href = "center.html?token=" + token + "&p=0";
				}
				else{
					//var msg = data.error || "";
					var msg = data.message || "登录失败";
					alert(msg);
					//getImgCode();
				}
				g.httpTip.hide();
			},
			error:function(data){
				g.httpTip.hide();
			}
		});
	}

//元宵活动的自动获取优惠券
	function get_user_coupons(){
		var url = Base.serverUrl + "coupon/claimCoupon";		
		var condi = {};
		condi.couponId = g.coupons_id;//优惠券id
		condi.customerId = g.customerId;
		condi.user_id = g.openid;
		condi.login_token = g.login_token;
		$.ajax({
			url:url,
			type:"POST",
			data:condi,
			dataType:"json",
			context:this,
			success: function(data){
				var status = data.success || false;
				if(status){
					/* 判断是否是从元宵活动页过来的 */
					location.href = "/webapp/coupons/index.html";

				}
				else{
					var msg = data.message || "获取优惠券失败";
					alert(msg);
					location.replace("../personal-center/index.html");
				}
			},
			error:function(data){
			}
		});
	}













	function findPwdPage(){
		location.href = "/anjia/findpwd.html";
	}

	setTimeout(function(){
		getImgCode();
	},2000);
	//换一组图片
	function getImgCode(evt){
		var userName = $("#inputEmail3").val() || "";
		if(userName !== ""){
			g.codeId = userName;
			//console.log(g.codeId);
			$("#updatecodebtn").attr("src",Base.imgCodeUrl + "?id=" + g.codeId + "&t=" + (new Date() - 0));
			clearTimeout(g.tout);
			g.tout = setTimeout(function(){
				getImgCode();
			},60000);
		}
	}

	//重置信息
	function resetRegInfo(evt){
		$("#inputEmail3").val("");
		$("#inputPassword3").val("");
		$("#inputPhone3").val("");
		$("#inputImgCode3").val("");
		$("#inputCode3").val("");
		$("#password").val("");
	}

	function codeKeyDown(evt){
		evt = evt || event;
		if(evt.keyCode == 13){
			//
			$("#loginbtn").trigger("click");
		}
	}

	//打开注册用户页面
	function openRegPage(evt){
		window.open("/anjia/reg.html");
	}
	
});