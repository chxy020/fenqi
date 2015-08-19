/**
 * file:找回密码
 * author:chenxy
*/

$(function(){
	var g = {};
	g.phone = "";
	g.imgCodeId = "";
	g.sendCode = false;
	g.sendTime = 60;
	g.httpTip = new Utils.httpTip({});
	g.pwdvalidater = "";
	g.userName = "";
	//手机校验信息
	g.validInfo = {};

	$("#inputphone").bind("blur",validPhone);
	$("#getcodebtn").bind("click",getValidCode);
	$("#nextbtn").bind("click",validPhoneCode);

	$("#inputpwd").bind("blur",validPwd);
	$("#inputcpwd").bind("blur",validCPwd);
	$("#changepwdbtn").bind("click",changePwd);

	//$("#sendbtn2").bind("click",enterChangePwd);
	//$("#resetbtn2").bind("click",resetPwdInfo);

	//验证手机号
	function validPhone(){
		var phone = $("#inputphone").val() || "";
		var reg = /^1[3,5,7,8]\d{9}$/g;
		if(phone !== ""){
			if(!reg.test(phone)){
				Utils.alert("手机号输入错误");
				$("#inputphone").focus();
			}
		}
	}



	//获取验证码
	function getValidCode(evt){
		//var ele = evt.currentTarget;
		//$(ele).removeClass("curr");
		//if(!this.moved){}

		var p = $("#inputphone").val() || "";
		//var imgCode = $("#inputImgCode3").val() || "";
		if(p !== ""){
			var reg = /^1[3,5,7,8]\d{9}$/g;
			if(reg.test(p)){
				g.phone = p;
				if(!g.sendCode){
					sendGetCodeHttp();
				}
			}
			else{
				Utils.alert("手机号输入错误");
				$("#inputphone").focus();
			}
		}
		else{
			$("#inputphone").focus();
		}
	}
	//重新获取验证码
	function resetGetValidCode(){
		g.sendTime = g.sendTime - 1;
		if(g.sendTime > 0){
			$("#getcodebtn").val(g.sendTime + "秒后重新发送");
			setTimeout(function(){
				resetGetValidCode();
			},1000);
		}
		else{
			$("#getcodebtn").val("重新发送");
			g.sendTime = 60;
			g.sendCode = false;

			//重新获取图形验证码,1分钟有效
			//getImgCode();
			//$("#inputImgCode3").val("");
			//$("#inputImgCode3").focus();
		}
	}
	//请求验证码
	function sendGetCodeHttp(){
		var url = Base.serverUrl + "message/sendValidateMessage";
		var condi = {};
		condi.phone_number = g.phone;
		//condi.captcha = imgCode;
		g.httpTip.show();
		$.ajax({
			url:url,
			data:condi,
			type:"POST",
			dataType:"json",
			context:this,
			//要求为Boolean类型的参数，默认为true。表示是否触发全局ajax事件。设置为false将不会触发全局ajax事件，ajaxStart或ajaxStop可用于控制各种ajax事件。
			//global:false,
			success: function(data){
				console.log("sendGetCodeHttp",data);
				var status = data.success || false;
				if(status){
					Utils.alert("验证码已发送,请注意查收");
					g.sendCode = true;
					$("#getcodebtn").val("60秒后重新发送");
					setTimeout(function(){
						resetGetValidCode();
					},1000);
				}
				else{
					var msg = data.message || "验证码获取失败";
					Utils.alert(msg);
				}
				g.httpTip.hide();
			},
			error:function(data){
				g.httpTip.hide();
			}
		});
	}



	//验证短信验证码
	function validPhoneCode(evt){
		var code = $("#inputcode").val() || "";
		if(code !== ""){
			var condi = {};
			condi.phone_number = g.phone;
			condi.validate_code = code;
			sendValidCodeHttp(condi);
		}
		else{
			Utils.alert("请输入验证码");
			$("#inputcode").focus();
		}
	}

	function sendValidCodeHttp(condi){
		var url = Base.serverUrl + "user/updatePasswordPreController";
		g.httpTip.show();
		$.ajax({
			url:url,
			data:condi,
			type:"POST",
			dataType:"json",
			context:this,
			success: function(data){
				console.log("sendValidCodeHttp",data);
				var status = data.success || false;
				if(status){
					g.validInfo = data;
					//显示第二步
				}
				else{
					var msg = data.message || "验证码校验失败";
					Utils.alert(msg);
				}
				g.httpTip.hide();
			},
			error:function(data){
				g.httpTip.hide();
			}
		});
	}



	//修改密码
	//验证密码6-16
	function validPwd(){
		var pwd = $("#inputpwd").val() || "";
		if((pwd.length < 6 || pwd.length > 16) && pwd !== ""){
			Utils.alert("密码输入错误:请输入字符6-16位");
			$("#inputpwd").focus();
		}
	}

	function validCPwd(){
		var pwd = $("#inputcpwd").val() || "";
		if((pwd.length < 6 || pwd.length > 16) && pwd !== ""){
			Utils.alert("确认密码输入错误:请输入字符6-16位");
			$("#inputcpwd").focus();
		}
		else{
			var pwd1 = $("#inputpwd").val() || "";
			if(pwd !== pwd1){
				Utils.alert("两次密码输入不一致.");
				//$("#inputcpwd").focus();
			}
		}
	}

	//重置密码
	function changePwd(evt){
		var pwd1 = $("#inputpwd").val() || "";
		var pwd2 = $("#inputcpwd").val() || "";
		if(pwd1 !== ""){
			if(pwd2 !== ""){
				if(pwd1 === pwd2){
					var condi = {};
					//{customer_id:string,token:string,password:string}
					condi.customer_id = g.validInfo.obj.customerId;
					condi.token = g.validInfo.token;
					condi.password = pwd2;
					sendChangePwdHttp(condi);
				}
				else{
					Utils.alert("两次密码输入不一致");
					$("#inputcpwd").val("");
					$("#inputcpwd").focus();
				}
			}
			else{
				Utils.alert("请输入确认密码");
				$("#inputcpwd").focus();
			}
		}
		else{
			Utils.alert("请输入密码");
			$("#inputpwd").focus();
		}
	}

	function sendChangePwdHttp(condi){
		var url = Base.serverUrl + "user/updatePasswordController";
		g.httpTip.show();
		$.ajax({
			url:url,
			data:condi,
			type:"POST",
			dataType:"json",
			context:this,
			success: function(data){
				console.log("sendChangePwdHttp",data);
				var status = data.success || false;
				if(status){
					//跳转到修改成功页面
					Utils.alert("密码重置成功");
				}
				else{
					var msg = data.message || "重置密码失败"
					Utils.alert(msg);
				}
				g.httpTip.hide();
			},
			error:function(data){
				g.httpTip.hide();
			}
		});
	}
























	//获取图形验证码
	function getImgCode(evt){
		var phone = $("#inputPhone3").val() || "";
		if(phone !== ""){
			g.imgCodeId = phone;
			//$("#imgcodebtn").attr("src",Base.imgCodeUrl + "?id=" + g.imgCodeId);
			$("#imgcodebtn").attr("src",Base.imgCodeUrl + "?id=" + g.imgCodeId + "&t=" + (new Date() - 0));
		}
	}

	//重置信息
	function resetUserInfo(evt){
		$("#inputEmail3").val("");
		$("#inputPhone3").val("");
		$("#inputImgCode3").val("");
		$("#inputCode3").val("");
	}
	function resetPwdInfo(){
		$("#inputPassword3").val("");
		$("#inputPassword4").val("");
	}

	//下一步
	function nextBtnUp(evt){
		var userName = $("#inputEmail3").val() || "";
		var phone = $("#inputPhone3").val() || "";
		var imgCode = $("#inputImgCode3").val() || "";
		var validCode = $("#inputCode3").val() || "";

		var regEMail = /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/;
		var regPhone = /^1[3,5,7,8]\d{9}$/;
		var regFont = /^([\u4E00-\u9FA5|\w\-])+$/;
		if(regEMail.test(userName) || regPhone.test(userName) || regFont.test(userName)){
			if(userName !== "" && phone !== "" && imgCode !== "" && validCode !== ""){
				sendForgetPassWordHttp(userName,phone,imgCode,validCode);
			}
			else{
				Utils.alert("用户信息未填");
			}
		}
		else{
			Utils.alert("用户名输入错误,请输入邮箱或者手机号");
			$("#inputEmail3").focus();


			//$("#pwdfirstdiv").hide();
			//$("#pwdseconddiv").show();
		}

	}

	//申请忘记密码
	function sendForgetPassWordHttp(userName,phone,imgCode,validCode){
		var url = Base.serverUrl + "/api/forgetPassword";
		var condi = {};
		condi.username = userName;
		condi.telephone = phone;
		//condi.captcha = imgCode;
		condi.validater = validCode;
		g.httpTip.show();
		$.ajax({
			url:url,
			type:"POST",
			data:condi,
			dataType:"json",
			context:this,
			global:false,
			success: function(data){
				g.httpTip.hide();
				console.log("sendForgetPassWordHttp",data);
				var status = data.status || "";
				if(status == "OK"){
					var pwdvalidater = data.result || "";
					g.pwdvalidater = pwdvalidater;
					g.userName = userName;
					$("#pwdfirstdiv").hide();
					$("#pwdseconddiv").show();
				}
				else{
					var msg = data.error + "," + data.errorDescription;
					Utils.alert(msg);

					resetUserInfo();
				}
			},
			error:function(data){
				g.httpTip.hide();
			}
		});
	}


	//重置密码
	function enterChangePwd(){
		var inputPassword3 = $("#inputPassword3").val() || "";
		var inputPassword4 = $("#inputPassword4").val() || "";

		if(inputPassword3 !== "" && inputPassword4 !== ""){
			if(inputPassword3 == inputPassword4){
				sendChangeForgetPassWordHttp(inputPassword4);
			}
			else{
				Utils.alert("两次密码不一致");
				 $("#inputPassword4").val("");
				 $("#inputPassword4").focus();
			}
		}
		else{
			if(inputPassword3 === ""){
				 $("#inputPassword3").focus();
			}
			else{
				 $("#inputPassword4").focus();
			}
		}
	}

	//申请忘记密码
	function sendChangeForgetPassWordHttp(password){
		var url = Base.serverUrl + "/api/changeForgotPassword";
		var condi = {};
		condi.username = g.userName;
		condi.validater = g.pwdvalidater;
		condi.password = password;
		g.httpTip.show();
		$.ajax({
			url:url,
			type:"POST",
			data:condi,
			dataType:"json",
			context:this,
			global:false,
			success: function(data){
				g.httpTip.hide();
				console.log("sendChangeForgetPassWordHttp",data);
				var status = data.status || "";
				if(status == "OK"){
					Utils.alert("密码重置成功");
					location.href = "login.html";
				}
				else{
					var msg = data.error + "," + data.errorDescription;
					Utils.alert(msg);
				}
			},
			error:function(data){
				g.httpTip.hide();
			}
		});
	}
});