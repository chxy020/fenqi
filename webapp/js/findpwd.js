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

	g.codeImg = $("#imgcodebtn")[0];
	g.guid = Utils.getGuid();

	//获取图形验证码
	sendGetImgCodeHttp();


	$("#inputphone").bind("blur",validPhone);
	$("#getcodebtn").bind("click",getValidCode);
	$("#nextbtn").bind("click",validPhoneCode);

	$("#inputpwd").bind("blur",validPwd);
	$("#inputcpwd").bind("blur",validCPwd);
	$("#changepwdbtn").bind("click",changePwd);

	$("#imgcodebtn").bind("click",sendGetImgCodeHttp);

	function sendGetImgCodeHttp(){
		//URL:  http://www.partywo.com/imageValidate/getImageValidate
		//参数: {image_key:string}
		var url = Base.serverUrl + "imageValidate/getImageValidate";
		url = url + "?image_key=" + g.guid + "&t=" + (new Date() - 0);
		g.codeImg.src = url;

		$("#inputimgcode").val("");
	}

	//验证手机号
	function validPhone(){
		var phone = $("#inputphone").val() || "";
		var reg = /^1[3,5,7,8]\d{9}$/g;
		if(phone !== ""){
			if(!reg.test(phone)){
				Utils.alert("手机号输入错误");
				//$("#inputphone").focus();
			}
		}
	}

	//获取验证码
	function getValidCode(evt){
		//var ele = evt.currentTarget;
		//$(ele).removeClass("curr");
		//if(!this.moved){}

		var p = $("#inputphone").val() || "";
		var imgCode = $("#inputimgcode").val() || "";
		if(p !== ""){
			var reg = /^1[3,5,7,8]\d{9}$/g;
			if(reg.test(p)){
				g.phone = p;
				if(imgCode !== ""){
					if(!g.sendCode){
						sendGetCodeHttp(imgCode);
					}
				}
				else{
					Utils.alert("请输入图形验证码");
					//$("#inputimgcode").focus();
				}
			}
			else{
				Utils.alert("手机号输入错误");
				//$("#inputphone").focus();
			}
		}
		else{
			//$("#inputphone").focus();
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
			sendGetImgCodeHttp();
			//$("#inputImgCode3").focus();
		}
	}
	//请求验证码
	function sendGetCodeHttp(imgCode){
		//{'phone_number':string,'validate_key':string,'validate_code':string}
		var url = Base.serverUrl + "message/sendValidateMessage";
		var condi = {};
		condi.phone_number = g.phone;
		condi.validate_key = g.guid;
		condi.validate_code = imgCode;

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
					//alert("验证码:" + data.obj);
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

					//重新请求图形验证码
					sendGetImgCodeHttp();
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
			//$("#inputcode").focus();
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
					$("#setup1").hide();
					$("#setup2").show();
					$("#setup2_line").show();
					$("#setup2_num").addClass("active");
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


	//第二步
	//修改密码
	//验证密码6-16
	function validPwd(){
		var pwd = $("#inputpwd").val() || "";
		if((pwd.length < 6 || pwd.length > 16) && pwd !== ""){
			Utils.alert("密码输入错误:请输入字符6-16位");
			//$("#inputpwd").focus();
		}
	}

	function validCPwd(){
		var pwd = $("#inputcpwd").val() || "";
		if((pwd.length < 6 || pwd.length > 16) && pwd !== ""){
			Utils.alert("确认密码输入错误:请输入字符6-16位");
			//$("#inputcpwd").focus();
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
					//$("#inputcpwd").focus();
				}
			}
			else{
				Utils.alert("请输入确认密码");
				//$("#inputcpwd").focus();
			}
		}
		else{
			Utils.alert("请输入密码");
			//$("#inputpwd").focus();
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
					//Utils.alert("密码重置成功");
					$("#setup2").hide();
					$("#setup3").show();
					$("#setup3_line").show();
					$("#setup3_num").addClass("active");
					$(".login_body img.bottom_img1").fadeOut(0);
					$(".login_body img.bottom_img2").fadeIn(0);
					setTimeout(function(){
						location.href = "login.html";
					},2000);
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
});