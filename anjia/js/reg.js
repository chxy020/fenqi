/**
 * file:注册
 * author:chenxy
*/

//页面初始化
$(function(){
	var g = {};
	g.phone = "";
	g.imgCodeId = "";
	g.sendCode = false;
	g.sendTime = 60;
	g.httpTip = new Utils.httpTip({});	
	g.company = Utils.offLineStore.get("company",false) || "";
	g.codeImg = $("#imgcodebtn")[0];
	g.guid = Utils.getGuid();
	//获取图形验证码
	/* sendGetImgCodeHttp(); 11-16*/

	//g.httpTip.show();

	$("#inputphone").bind("blur",validPhone);
	$("#inputpwd").bind("blur",validPwd);
	$("#inputcpwd").bind("blur",validCPwd);
	$("#getcodebtn").bind("click",getValidCode);
	$("#regbtn").bind("click",regUser);
	$("#gobtn").bind("click",gotoUserCenter);

	/* $("#imgcodebtn").bind("click",sendGetImgCodeHttp); 11-16*/

/* 	function sendGetImgCodeHttp(){
		//URL:  http://www.partywo.com/imageValidate/getImageValidate
		//参数: {image_key:string}
		var url = Base.serverUrl + "imageValidate/getImageValidate";
		url = url + "?image_key=" + g.guid + "&t=" + (new Date() - 0);
		g.codeImg.src = url;

		$("#inputimgcode").val("");
	} */

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
				/* if(imgCode !== ""){ */
					if(!g.sendCode){
						sendGetCodeHttp(imgCode);
					}
				/* }
				else{
					Utils.alert("请输入图形验证码");
					$("#inputimgcode").focus();
				} */
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
			//重新获取图形验证码,1分钟有效
			/* sendGetImgCodeHttp(); 11-16*/
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
					/* sendGetImgCodeHttp(); 11-16*/
				}
				g.httpTip.hide();
			},
			error:function(data){
				g.httpTip.hide();
			}
		});
	}


	//注册
	function regUser(evt){
		var phone = $("#inputphone").val() || "";
		var reg = /^1[3,5,7,8]\d{9}$/g;
		if(phone !== ""){
			if(reg.test(phone)){
				/* var name = $("#name").val() || "";
				if(name !== ""){ 11-16*/
					var pwd1 = $("#inputpwd").val() || "";
					var pwd2 = $("#inputcpwd").val() || "";
					if(pwd1 !== ""){
						if(pwd2 !== ""){
							if(pwd1 === pwd2){
								var code = $("#inputcode").val() || "";
								if(code !== ""){
									var isAgree = $("#agressck")[0].checked || false;
									if(isAgree){
										var condi = {};
										condi.name = name;
										condi.phone_number = g.phone;
										condi.password = pwd2;
										condi.validate_code = code;
										sendRegHttp(condi);
									}
									else{
										Utils.alert("请勾选同意服务协议");
									}
								}
								else{
									Utils.alert("请输入验证码");
									$("#inputcode").focus();
								}
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
				/* }
				else{
					Utils.alert("请输入用户姓名");
					$("#name").focus();
				} 11-16*/
			}
			else{
				Utils.alert("手机号输入错误");
				$("#inputphone").focus();
			}
		}
		else{
			Utils.alert("请输入手机号");
			$("#inputphone").focus();
		}
	}
	//注册
	function sendRegHttp(condi){
		var url = Base.serverUrl + "user/registerCustomerController";
		var company = g.company || "";
		var platform = 3;
		g.city = Utils.offLineStore.get("curCity",false) || "";
		var city = g.city || "";
		condi.company = company;//传城市 德维-20150901，生活家-20150901000001，朗润-20150901000002
		condi.platform = platform;//平台(0-wap 1-android 2-ios 3-pc)
		condi.city = city;//城市
		g.channel = Utils.offLineStore.get("channel",false) || "";
		condi.channel = g.channel;
		g.httpTip.show();
		$.ajax({
			url:url,
			type:"POST",
			data:condi,
			dataType:"json",
			context:this,
			success: function(data){
				console.log("sendRegHttp",data);
				var status = data.success || false;
				if(status){
					var userInfo = data.obj || "";
					if(userInfo !== ""){
						$("#reginfodiv").hide();
						$("#regsuccessdiv").show();

						userInfo = JSON.stringify(userInfo);
						//保存用户数据
						Utils.offLineStore.set("userinfo",userInfo,false);
						var token = data.token || "";

						Utils.offLineStore.set("token",token,false);
					}
				}
				else{
					var msg = data.message || "手机号注册失败";
					Utils.alert(msg);

					//重新请求图形验证码
					//sendGetImgCodeHttp();
					$("#inputcode").val("");
				}
				g.httpTip.hide();
			},
			error:function(data){
				g.httpTip.hide();
			}
		});
	}

	//进入个人中心
	function gotoUserCenter(){
		location.href = "/anjia/usercenter.html";
	}












	//以下暂时无用.....................
	//重置信息
	function resetRegInfo(evt){
		$("#inputEmail3").val("");
		$("#inputPassword3").val("");
		$("#inputPhone3").val("");
		$("#inputImgCode3").val("");
		$("#inputCode3").val("");
	}

	//注册
	function regBtnUp(evt){
		var userName = $("#inputEmail3").val() || "";
		var usePwd = $("#inputPassword3").val() || "";
		var phone = $("#inputPhone3").val() || "";
		var imgCode = $("#inputImgCode3").val() || "";
		var validCode = $("#inputCode3").val() || "";

		var regEMail = /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/;
		var regPhone = /^1[3,5,7,8]\d{9}$/;
		var regFont = /^([\u4E00-\u9FA5|\w\-])+$/;
		if(regEMail.test(userName) || regPhone.test(userName) || regFont.test(userName)){
			if(userName !== "" && usePwd !== "" && phone !== "" && imgCode !== "" && validCode !== ""){
				sendRegHttp(userName,usePwd,validCode);
				//http://101.200.229.135:8080/api/regist?username=ytm&password=123456&mobile=18612444099&validater=3967
			}
			else{
				Utils.alert("账户信息未填");
			}
		}
		else{
			Utils.alert("用户名输入错误,请输入邮箱或者手机号");
			$("#inputEmail3").focus();
		}

	}
});