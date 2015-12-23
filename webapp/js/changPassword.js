/**
 * file:更换手机号码
 * author:chenxy
*/

$(function(){
	var g = {};
	g.phone = "";
	g.newPhone = "";
	g.imgCodeId = "";
	g.sendCode = false;
	g.sendTime = 60;
	g.tout = null;
	g.httpTip = new Utils.httpTip({});

	g.codeImg = $("#imgcodebtn")[0];
	g.codeNewImg = $("#imgcodebtn_new")[0];
	g.guid = Utils.getGuid();
	g.guidNew = Utils.getGuid();
	g.customerId = "";
	g.login_token = Utils.offLineStore.get("token",false) || "";
	//验证登录状态
	var loginStatus = Utils.getUserInfo();
	if(!loginStatus){
		//未登录
		location.replace("../login/login.html");
	}
	else{
		getUserInfo();
	}



	$("#getcodebtn").bind("click",getValidCode);
	$("#yes_btn").bind("click",validPhoneCode);





	//获取个人资料
	function getUserInfo(){
		var info = Utils.offLineStore.get("userinfo",false) || "";
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

		var phoneNumber = obj.phoneNumber || "";
		//$("#userphone").html(phoneNumber);

		$("#inputphone").val(phoneNumber);

		var avatar = obj.icon || "";
		if(avatar !== ""){
			//avatar = avatar + "?t=" + (new Date() - 0);
			//$("#avatarimg").attr("src",avatar);
		}
	}



	//验证手机号
	function validPhone(){
		var phone = $("#inputphone").val() || "";
		var reg = /^1[3,5,7,8]\d{9}$/g;
		if(phone !== ""){
			if(!reg.test(phone)){
				alert("手机号输入错误");
				$("#inputphone").focus();
			}
		}
	}

	//获取验证码
	function getValidCode(evt){
		var p = $("#inputphone").val() || "";
		if(p !== ""){
			var reg = /^1[3,5,7,8]\d{9}$/g;
			if(reg.test(p)){
				g.phone = p;
					if(!g.sendCode){
						sendGetCodeHttp();
					}
			}
			else{
				alert("手机号输入错误");
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
			g.tout = setTimeout(function(){
				resetGetValidCode();
			},1000);
		}
		else{
			$("#getcodebtn").val("重新发送");
			g.sendTime = 60;
			g.sendCode = false;
		}
	}
	//请求验证码
	function sendGetCodeHttp(){
		var url = Base.serverUrl + "message/sendValidateMessage";
		var condi = {};
		condi.phone_number = g.phone;
		condi.validate_key = g.guid;
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
				var status = data.success || false;
				if(status){
					//alert("验证码:" + data.obj);
					alert("验证码已发送,请注意查收");
					g.sendCode = true;
					$("#getcodebtn").val("60秒后重新发送");
					setTimeout(function(){
						resetGetValidCode();
					},1000);
				}
				else{
					var msg = data.message || "验证码获取失败";
					alert(msg);
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
		var pass1 = $("#newPassword").val() || "";	
		var pass2 = $("#c_newPassword").val() || "";
		var p = $("#inputphone").val() || "";
		if(code !== ""){
			
			if(pass1 !== ""){
				if(pass2 == pass1){
					var condi = {};
					condi.phone_number = p;
					condi.validate_code = code;
					condi.password = pass1;
					sendValidCodeHttp(condi);
				}
				else{
					alert("再次输入密码与新密码不一致");
					$("#newPassword").focus();
				}		
			}
			else{
				alert("请输入密码");
				$("#newPassword").focus();
			}					
		}
		else{
			alert("请输入验证码");
			$("#inputcode").focus();
		}
	}

	function sendValidCodeHttp(condi){
		var url = Base.serverUrl + "customer/updatePassword";
		$.ajax({
			url:url,
			data:condi,
			type:"POST",
			dataType:"json",
			context:this,
			success: function(data){
				var status = data.success || false;
				if(status){
					alert("修改成功");	
					location.replace("../personal-center/index.html");
				}
				else{
					var msg = data.message || "修改密码失败";
					alert(msg);
				}
			},
			error:function(data){
			}
		});
	}

});