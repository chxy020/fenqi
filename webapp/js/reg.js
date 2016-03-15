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
	g.codeImg = $("#imgcodebtn")[0];
	g.guid = Utils.getGuid();
	/* 元宵活动标记 */
	g.customerId = "";
	g.dengmi = Utils.offLineStore.get("dengmi",false) || "";
	g.openid = Utils.offLineStore.get("openid",false) || "";
	g.coupons_id = Utils.offLineStore.get("coupons_id",false) || "";
	g.company = Utils.offLineStore.get("company",false) || "";
	//获取图形验证码
	//sendGetImgCodeHttp();

	//g.httpTip.show();
	isWeiXin();	
	$("#inputphone").bind("blur",validPhone);
	$("#inputpwd").bind("blur",validPwd);
	$("#inputcpwd").bind("blur",validCPwd);
	$("#getcodebtn").bind("click",getValidCode);
	$("#regbtn").bind("click",regUser);
	//$("#gobtn").bind("click",gotoUserCenter);

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
		var reg = /^1[3,4,5,7,8]\d{9}$/g;
		if(phone !== ""){
			if(!reg.test(phone)){
				alert("手机号输入错误");
				//$("#inputphone").focus();
			}
		}
	}

	//验证密码6-16
	function validPwd(){
		var pwd = $("#inputpwd").val() || "";
		if((pwd.length < 6 || pwd.length > 16) && pwd !== ""){
			alert("密码输入错误:请输入字符6-16位");
			//$("#inputpwd").focus();
		}
	}

	function validCPwd(){
		var pwd = $("#inputcpwd").val() || "";
		if((pwd.length < 6 || pwd.length > 16) && pwd !== ""){
			alert("确认密码输入错误:请输入字符6-16位");
			//$("#inputcpwd").focus();
		}
		else{
			var pwd1 = $("#inputpwd").val() || "";
			if(pwd !== pwd1){
				alert("两次密码输入不一致.");
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
		//var imgCode = $("#inputimgcode").val() || "";
		if(p !== ""){
			var reg = /^1[3,4,5,7,8]\d{9}$/g;
			if(reg.test(p)){
				g.phone = p;
				sendGetCodeHttp();
				/* if(imgCode !== ""){
					if(!g.sendCode){
						
					}
				}
				else{
					alert("请输入图形验证码");
					//$("#inputimgcode").focus();
				} */
			}
			else{
				alert("手机号输入错误");
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


	//注册
	function regUser(evt){
		var phone = $("#inputphone").val() || "";
		var reg = /^1[3,4,5,7,8]\d{9}$/g;
		if(phone !== ""){
			if(reg.test(phone)){
				var pwd1 = $("#inputpwd").val() || "";
				var pwd2 = $("#inputcpwd").val() || "";
				if(pwd1 !== ""){
					if(pwd2 !== ""){
						if(pwd1 === pwd2){
							var code = $("#inputcode").val() || "";
							if(code !== ""){
								var isAgree = $("#agressck").attr("checked") == "checked" ? true : false;
								if(isAgree){
									var condi = {};
									condi.phone_number = g.phone;
									condi.password = pwd2;
									condi.validate_code = code;
									sendRegHttp(condi);
								}
								else{
									alert("请勾选同意服务协议");
								}
							}
							else{
								alert("请输入验证码");
								//$("#inputcode").focus();
							}
						}
						else{
							alert("两次密码输入不一致");
							$("#inputcpwd").val("");
							//$("#inputcpwd").focus();
						}
					}
					else{
						alert("请输入确认密码");
						//$("#inputcpwd").focus();
					}
				}
				else{
					alert("请输入密码");
					//$("#inputpwd").focus();
				}
			}
			else{
				alert("手机号输入错误");
				//$("#inputphone").focus();
			}
		}
		else{
			alert("请输入手机号");
			//$("#inputphone").focus();
		}
	}

		/* 判断是否是微信登录 */
	function isWeiXin(){
		var ua = window.navigator.userAgent.toLowerCase();
		if(ua.match(/MicroMessenger/i) == 'micromessenger'){			
			g.platform = 1;
			return true;
		}else{
			return false;
		}
	}
	//注册
	function sendRegHttp(condi){
		var url = Base.serverUrl + "user/registerCustomerController";
		var url = Base.serverUrl + "user/registerCustomerController";
		var company = g.company || "";
		var platform = 0;
		platform = g.platform || 0;
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
						g.customerId = userInfo.customerId || "";
						
						userInfo = JSON.stringify(userInfo);
						//保存用户数据
						Utils.offLineStore.set("userinfo",userInfo,false);
						var token = data.token || "";
						g.login_token = token;
						Utils.offLineStore.set("token",token,false);
						/* 判断是否是从元宵活动页过来的 */
						if(g.dengmi == "dengmi"){get_user_coupons();}else{
							location.href = "regist-result.html";
						}
						
					}
				}
				else{
					var msg = data.message || "手机号注册失败";
					alert(msg);

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
		var regPhone = /^1[3,4,5,7,8]\d{9}$/;
		var regFont = /^([\u4E00-\u9FA5|\w\-])+$/;
		if(regEMail.test(userName) || regPhone.test(userName) || regFont.test(userName)){
			if(userName !== "" && usePwd !== "" && phone !== "" && imgCode !== "" && validCode !== ""){
				sendRegHttp(userName,usePwd,validCode);
				//http://101.200.229.135:8080/api/regist?username=ytm&password=123456&mobile=18612444099&validater=3967
			}
			else{
				alert("账户信息未填");
			}
		}
		else{
			alert("用户名输入错误,请输入邮箱或者手机号");
			//$("#inputEmail3").focus();
		}

	}
	window.isWeiXin = isWeiXin;
});