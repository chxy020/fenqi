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
	//获取图形验证码
	sendGetImgCodeHttp();
	sendGetNewImgCodeHttp();

	g.customerId = "";
	g.login_token = Utils.offLineStore.get("token",false) || "";
	//验证登录状态
	var loginStatus = Utils.getUserInfo();
	if(!loginStatus){
		//未登录
		location.replace("login.html");
	}
	else{
		getUserInfo();
	}

	$("#inputphone").bind("blur",validPhone);
	$("#getcodebtn").bind("click",getValidCode);
	$("#imgcodebtn").bind("click",sendGetImgCodeHttp);
	$("#nextbtn").bind("click",validPhoneCode);

	$("#inputphone_new").bind("blur",validNewPhone);
	$("#getcodebtn_new").bind("click",getValidNewCode);
	$("#imgcodebtn_new").bind("click",sendGetNewImgCodeHttp);
	$("#changephonebtn").bind("click",validNewPhoneCode);




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

		var phoneNumber = obj.phoneNumber || "";
		$("#inputphone").val(phoneNumber);
	}

	function sendGetImgCodeHttp(){
		//URL:  http://www.partywo.com/imageValidate/getImageValidate
		//参数: {image_key:string}
		var url = Base.serverUrl + "imageValidate/getImageValidate";
		url = url + "?image_key=" + g.guid + "&t=" + (new Date() - 0);
		g.codeImg.src = url;

		$("#inputimgcode").val("");
	}
	function sendGetNewImgCodeHttp(){
		//URL:  http://www.partywo.com/imageValidate/getImageValidate
		//参数: {image_key:string}
		var url = Base.serverUrl + "imageValidate/getImageValidate";
		url = url + "?image_key=" + g.guidNew + "&t=" + (new Date() - 0);
		g.codeNewImg.src = url;

		$("#inputimgcode_new").val("");
	}


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
					$("#inputimgcode").focus();
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
			$("#getcodebtn").html(g.sendTime + "秒后重新发送");
			g.tout = setTimeout(function(){
				resetGetValidCode();
			},1000);
		}
		else{
			$("#getcodebtn").html("重新发送");
			g.sendTime = 60;
			g.sendCode = false;

			//重新获取图形验证码,1分钟有效
			sendGetImgCodeHttp();
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
					alert("验证码:" + data.obj);
					Utils.alert("验证码已发送,请注意查收");
					g.sendCode = true;
					$("#getcodebtn").html("60秒后重新发送");
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
			$("#inputcode").focus();
		}
	}

	function sendValidCodeHttp(condi){
		//URL:  http://www.partywo.com/user/updatePhoneNumberPreController
		//参数: {phone_number:string,validate_code:string}
		var url = Base.serverUrl + "user/updatePhoneNumberPreController";
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

					g.sendCode = false;
					g.sendTime = 60;
					clearTimeout(g.tout);
					//显示第二步
					$("#setup1").hide();
					$("#setup2").show();
					$("#progressimg1").attr("src","images/center/findpwd5.png");
					$("#setupimg1").attr("src","images/center/findpwd2.png");
					$("#setupspan1").addClass("b");
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
	//验证手机号
	function validNewPhone(){
		var phone = $("#inputphone_new").val() || "";
		var reg = /^1[3,5,7,8]\d{9}$/g;
		if(phone !== ""){
			if(!reg.test(phone)){
				Utils.alert("手机号输入错误");
				$("#inputphone_new").focus();
			}
		}
	}

	//获取验证码
	function getValidNewCode(evt){
		//var ele = evt.currentTarget;
		//$(ele).removeClass("curr");
		//if(!this.moved){}

		var p = $("#inputphone_new").val() || "";
		var imgCode = $("#inputimgcode_new").val() || "";
		if(p !== ""){
			var reg = /^1[3,5,7,8]\d{9}$/g;
			if(reg.test(p)){
				g.newPhone = p;
				if(imgCode !== ""){
					if(!g.sendCode){
						g.sendTime = 60;

						sendGetNewCodeHttp(imgCode);
					}
				}
				else{
					Utils.alert("请输入图形验证码");
					$("#inputimgcode_new").focus();
				}
			}
			else{
				Utils.alert("手机号输入错误");
				$("#inputphone_new").focus();
			}
		}
		else{
			$("#inputphone_new").focus();
		}
	}
	//重新获取验证码
	function resetGetNewValidCode(){
		g.sendTime = g.sendTime - 1;
		if(g.sendTime > 0){
			$("#getcodebtn_new").html(g.sendTime + "秒后重新发送");
			setTimeout(function(){
				resetGetNewValidCode();
			},1000);
		}
		else{
			$("#getcodebtn_new").html("重新发送");
			g.sendTime = 60;
			g.sendCode = false;

			//重新获取图形验证码,1分钟有效
			sendGetNewImgCodeHttp();
		}
	}
	//请求验证码
	function sendGetNewCodeHttp(imgCode){
		//{'phone_number':string,'validate_key':string,'validate_code':string}
		var url = Base.serverUrl + "message/sendValidateMessage";
		var condi = {};
		condi.phone_number = g.newPhone;
		condi.validate_key = g.guidNew;
		condi.validate_code = imgCode;

		g.httpTip.show();
		$.ajax({
			url:url,
			data:condi,
			type:"POST",
			dataType:"json",
			context:this,
			success: function(data){
				console.log("sendGetNewCodeHttp",data);
				var status = data.success || false;
				if(status){
					alert("验证码:" + data.obj);
					Utils.alert("验证码已发送,请注意查收");
					g.sendCode = true;
					$("#getcodebtn_new").html("60秒后重新发送");
					setTimeout(function(){
						resetGetNewValidCode();
					},1000);
				}
				else{
					var msg = data.message || "验证码获取失败";
					Utils.alert(msg);

					//重新请求图形验证码
					sendGetNewImgCodeHttp();
				}
				g.httpTip.hide();
			},
			error:function(data){
				g.httpTip.hide();
			}
		});
	}

	//重置手机
	function validNewPhoneCode(evt){
		var code = $("#inputcode_new").val() || "";
		if(code !== ""){
			var condi = {};
			condi.customer_id = g.customerId;
			condi.token = g.login_token;
			condi.phoneNumber = g.newPhone;
			condi.validate_code = code;
			sendNewValidCodeHttp(condi);
		}
		else{
			Utils.alert("请输入验证码");
			$("#inputcode_new").focus();
		}
	}

	function sendNewValidCodeHttp(condi){
		//URL:  http://www.partywo.com/user/updatePhoneNumberController
		//参数: {customer_id:string,token:string,phoneNumber:string,validate_code:string}
		var url = Base.serverUrl + "user/updatePhoneNumberController";
		g.httpTip.show();
		$.ajax({
			url:url,
			data:condi,
			type:"POST",
			dataType:"json",
			context:this,
			success: function(data){
				console.log("sendNewValidCodeHttp",data);
				var status = data.success || false;
				if(status){
					//退出登录
					Utils.loginOut(true);

					//显示第三步
					$("#setup2").hide();
					$("#setup3").show();
					$("#progressimg2").attr("src","images/center/findpwd5.png");
					$("#setupimg2").attr("src","images/center/findpwd3.png");
					$("#setupspan2").addClass("b");
					$("#newphone").html("恭喜您,新的绑定手机号:" + g.newPhone);
					setTimeout(function(){
						location.href = "login.html";
					},2000);
				}
				else{
					var msg = data.message || "验证码校验失败";
					Utils.alert(msg);

					//重新获取图形验证码
					//sendGetNewImgCodeHttp();
					$("#inputimgcode_new").val("");
					$("#inputcode_new").val("");
				}
				g.httpTip.hide();
			},
			error:function(data){
				g.httpTip.hide();
			}
		});
	}
});