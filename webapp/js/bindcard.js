/**
 * file:绑定银行卡
 * author:chenxy
*/

//页面初始化
$(function(){
	var g = {};
	g.phone = "";
	g.imgCodeId = "";
	g.sendCode = false;
	g.sendTime = 60;
	g.login_token = Utils.offLineStore.get("token",false) || "";
	g.httpTip = new Utils.httpTip({});
	g.couponId = Utils.getQueryString("id") || "";
	g.repaymentRecordId = Utils.getQueryString("recordId") || "";
	g.price = Utils.getQueryString("p") - 0 || 0;

	g.codeImg = $("#imgcodebtn")[0];
	g.guid = Utils.getGuid();
	g.customerId = "";
	g.bindBankCardId = "";
	g.bindCondi = {};
	g.codelist = [];
	//获取图形验证码
	/* sendGetImgCodeHttp(); 11-16*/

	//验证登录状态
	var loginStatus = Utils.getUserInfo();
	if(!loginStatus){
		//未登录
		location.replace("/webapp/login/login.html");
	}
	else{
		setTimeout(function(){$("#myModal1").click()},500);//显示弹窗
		getUserInfo();
		//获取订单列表
		//getUserOrderStagingList();

		//获取订单状态
		//sendGetUserInfoDicHttp();

		//获取绑定唯一编号
		sendGetBindBankCardId();
		//获取限额
		sendGetBankXianeListHttp();		
		
	}


	//$("#username").bind("blur",validNoEmpty);
	//$("#idcardno").bind("blur",validNoEmpty);
	//$("#idcardno").bind("blur",validIsIdentity);
	//$("#cardno").bind("blur",validNoEmpty);
	//$("#inputphone").bind("blur",validNoEmpty);
	//$("#inputphone").bind("blur",validIsPhone);
	//$("#inputimgcode").bind("blur",validNoEmpty);
	//$("#inputimgcode").bind("blur",validIsNumber);

	//$("#validcode").bind("blur",validNoEmpty);
	//$("#validcode").bind("blur",validIsNumber);


	/* $("#imgcodebtn").bind("click",sendGetImgCodeHttp); */
	$("#getcodebtn").bind("click",getValidCode);
	$("#bankCode").bind("change",bank_func);
	$("#bindcardbtn").bind("click",bindUserCardBtnUp);

	//$("#gobtn").bind("click",gotoUserCenter);

	//获取个人资料
	function getUserInfo(){
		var info = Utils.offLineStore.get("userinfo",false) || "";
		console.log("getUserInfo",info);
		if(info !== ""){
			var obj = JSON.parse(info) || {};
			g.customerId = obj.customerId || "";
			g.userPhone = obj.phoneNumber || "";
		}
	}


	function validNoEmpty(evt){
		var t = $(this).val() || "";
		var id = this.id || "";
		var next = $(this).next();
		if(t !== ""){
			$(next).html('<i class="common-ico validate-ico"></i>填写正确');
			$(next).removeClass("validate-error");
			$(next).addClass("validate-success");
			$(next).show();
		}
		else{
			$(next).html('<i class="common-ico validate-ico"></i>不能为空');
			$(next).removeClass("validate-success");
			$(next).addClass("validate-error");
			$(next).show();
		}
	}

	function validIsNumber(evt){
		var t = $(this).val() || "";
		var reg = /^\d+$/g;
		var next = $(this).next();
		if(reg.test(t)){
			$(next).html('<i class="common-ico validate-ico"></i>填写正确');
			$(next).removeClass("validate-error");
			$(next).addClass("validate-success");
			$(next).show();
		}
		else{
			$(next).html('<i class="common-ico validate-ico"></i>只能填写数字');
			$(next).removeClass("validate-success");
			$(next).addClass("validate-error");
			$(next).show();
		}
	}

	function validIsPhone(evt){
		var t = $(this).val() || "";
		var reg = /^1[3,5,7,8]\d{9}$/;
		var next = $(this).next();
		if(t !== ""){
			if(reg.test(t)){
				$(next).html('<i class="common-ico validate-ico"></i>填写正确');
				$(next).removeClass("validate-error");
				$(next).addClass("validate-success");
				$(next).show();
			}
			else{
				$(next).html('<i class="common-ico validate-ico"></i>手机号码输入错误');
				$(next).removeClass("validate-success");
				$(next).addClass("validate-error");
				$(next).show();
			}
		}
		else{
			$(next).html('<i class="common-ico validate-ico"></i>不能为空');
			$(next).removeClass("validate-success");
			$(next).addClass("validate-error");
			$(next).show();
		}
	}

	function validIsIdentity(evt){
		var txt = $(this).val() || "";
		var valid = new ValidCard({txt:txt});
		var b = valid.valid();
		var next = $(this).next();
		if(b){
			$(next).html('<i class="common-ico validate-ico"></i>填写正确');
			$(next).removeClass("validate-error");
			$(next).addClass("validate-success");
			$(next).show();
		}
		else{
			$(next).html('<i class="common-ico validate-ico"></i>身份证号码输入错误');
			$(next).removeClass("validate-success");
			$(next).addClass("validate-error");
			$(next).show();
		}
	}

	function sendValidNoEmpty(txt,dom){
		var b = false;
		var next = dom.next();
		if(txt !== ""){
			b = true;
			/* $(next).html('<i class="common-ico validate-ico"></i>填写正确');
			$(next).removeClass("validate-error");
			$(next).addClass("validate-success");
			$(next).show(); */
		}
		else{
			
			/* $(next).html('<i class="common-ico validate-ico"></i>不能为空');
			$(next).removeClass("validate-success");
			$(next).addClass("validate-error");
			$(next).show(); */
		}
		return b;
	}
	function sendValidIsNumber(txt,dom){
		var b = false;
		var reg = /^\d+$/g;
		var next = dom.next();
		if(reg.test(txt)){
			b = true;
			$(next).html('<i class="common-ico validate-ico"></i>填写正确');
			$(next).removeClass("validate-error");
			$(next).addClass("validate-success");
			$(next).show();
		}
		else{
			$(next).html('<i class="common-ico validate-ico"></i>只能填写数字');
			$(next).removeClass("validate-success");
			$(next).addClass("validate-error");
			$(next).show();
		}
		return b;
	}
	function sendValidIsPhone(txt,dom){
		var b = false;
		var reg = /^1[3,5,7,8]\d{9}$/;
		var next = dom.next();
		if(reg.test(txt)){
			b = true;
			$(next).html('<i class="common-ico validate-ico"></i>填写正确');
			$(next).removeClass("validate-error");
			$(next).addClass("validate-success");
			$(next).show();
		}
		else{
			$(next).html('<i class="common-ico validate-ico"></i>手机号码输入错误');
			$(next).removeClass("validate-success");
			$(next).addClass("validate-error");
			$(next).show();
		}
		return b;
	}
	function sendValidIsIdentity(txt,dom){
		var valid = new ValidCard({txt:txt});
		var b = valid.valid();
		var next = dom.next();
		if(b){
			$(next).html('<i class="common-ico validate-ico"></i>填写正确');
			$(next).removeClass("validate-error");
			$(next).addClass("validate-success");
			$(next).show();
		}
		else{
			$(next).html('<i class="common-ico validate-ico"></i>身份证号码输入错误');
			$(next).removeClass("validate-success");
			$(next).addClass("validate-error");
			$(next).show();
		}
		return b;
	}

	//获取银行限额信息
	function sendGetBankXianeListHttp(){
		g.httpTip.show();
		var url = Base.serverUrl + "bank/getBanks";
		var condi = {};
		$.ajax({
			url:url,
			data:condi,
			type:"POST",
			dataType:"json",
			context:this,
			success: function(data){
				var status = data.success || false;
				if(status){
					var list = data.list || {};
					var option = [];
					for(var i = 0; i < list.length ; i++ ){
						var d = list[i] || [];						
						var code = d.code || "";//银行编码
						var name = d.name || "";
						var per_time_num = d.per_time_num || "";//单笔限额
						var per_day_num = d.per_day_num || "";//单日限额
						var per_month_num = d.per_month_num || "";//单月限额
						var per_day_times = d.per_day_times || "";//单日限次
						var per_month_times = d.per_month_times || "";//单月限次
						var a = [];
						a = [name,per_time_num,per_day_num,per_month_num,per_day_times,per_month_times];
						g.codelist[code] = a;
					}
					//获取银行列表
					sendGetBankListHttp();			
				}
				else{
					var msg = data.message || "获取银行限额失败";
					Utils.alert(msg);
				}
				g.httpTip.hide();
			},
			error:function(data){
				g.httpTip.hide();
			}
		});
	}
	function bank_func(){
		var code = $("#bankCode").val() || "";
		var codexiane = g.codelist[code] || "";
		if(codexiane != ""){
			$("#bank_tips_id").html("&nbsp;"+codexiane[0]+":&nbsp;单笔限额"+codexiane[1]+"万元"+"&nbsp;单日限额"+codexiane[2]+"万元"+"&nbsp;单月限额"+codexiane[3]+"万元"+"&nbsp;单日限次"+codexiane[4]+"次"+"&nbsp;单月限次"+codexiane[5]+"次");
		}else{
			$("#bank_tips_id").html("");
		}
	}

	//获取银行信息
	function sendGetBankListHttp(){
		g.httpTip.show();
		var url = Base.serverUrl + "baseCodeController/getBankCode";
		var condi = {};
		$.ajax({
			url:url,
			data:condi,
			type:"POST",
			dataType:"json",
			context:this,
			success: function(data){
				console.log("sendGetBankListHttp",data);
				var status = data.success || false;
				if(status){
					changeBankSelectHtml(data);
				}
				else{
					var msg = data.message || "获取银行代码失败";
					alert(msg);
				}
				g.httpTip.hide();
			},
			error:function(data){
				g.httpTip.hide();
			}
		});
	}

	function changeBankSelectHtml(obj){
		var data = obj.obj || {};
		var option = [];
		option.push('<option>请选择发卡银行</option>');
		for(var k in data){
			var code = k;
			var name = data[k];
			option.push('<option value="' + code + '">' + name + '</option>');
		}
		$("#bankCode").html(option.join(''));
	}

	function sendGetBindBankCardId(){
		var url = Base.serverUrl + "payPc/getBindBankCardId";
		var condi = {};
		g.httpTip.show();
		$.ajax({
			url:url,
			type:"POST",
			data:condi,
			dataType:"json",
			context:this,
			success: function(data){
				console.log("sendGetBindBankCardId",data);
				var status = data.success || false;
				if(status){
					var id = data.obj || "";
					g.bindBankCardId = id;
				}
				else{
					var msg = data.message || "获取银行卡绑定编码失败";
					alert(msg);
				}
				g.httpTip.hide();
			},
			error:function(data){
				g.httpTip.hide();
			}
		});
	}



	//获取绑定验证码
	function getValidCode(){
		var p = $("#inputphone").val() || "";
		var imgCode = $("#inputimgcode").val() || "";

		var bankCode = $("#bankCode").val() || "";
		var username = $("#username").val() || "";
		var idcardno = $("#idcardno").val() || "";
		var cardno = $("#cardno").val() || "";
		var phone = $("#inputphone").val() || "";
		var img_validate_code = $("#inputimgcode").val() || "";

		if(bankCode == ""){
			alert("请选择发卡银行");
			return;
		}
		if(!sendValidNoEmpty(username,$("#username"))){
			$("#username").focus();return;
		}
		if(!sendValidNoEmpty(idcardno,$("#idcardno"))){
			$("#idcardno").focus();return;
		}
		/* if(!sendValidIsIdentity(idcardno,$("#idcardno"))){
			return;
		} */
		if(!sendValidNoEmpty(cardno,$("#cardno"))){
			$("#cardno").focus();return;
		}
		if(!sendValidNoEmpty(phone,$("#phone"))){
			$("#phone").focus();return;
		}
		/* if(!sendValidIsPhone(phone,$("#phone"))){
			return;
		} */
		/* if(!sendValidNoEmpty(img_validate_code,$("#inputimgcode"))){
			return;
		} 11-16*/
		if(g.sendCode){
			return;
		}

		var condi = {};
		condi.login_token = g.login_token;
		condi.img_validate_key = g.guid;
		condi.customerId = g.customerId;
		condi.bindBankCardId = g.bindBankCardId;

		condi.bankCode = bankCode
		condi.username = username;
		condi.cardno = cardno;
		condi.idcardno = idcardno;
		condi.phone = phone;
		condi.img_validate_code = img_validate_code;

		g.bindCondi = condi;

		sendInvokeBindBanCardHttp(condi);
	}

	function sendInvokeBindBanCardHttp(condi){
		var url = Base.serverUrl + "payPc/invokeBindBanCard";
		g.httpTip.show();
		$.ajax({
			url:url,
			type:"POST",
			data:condi,
			dataType:"json",
			context:this,
			success: function(data){
				console.log("sendInvokeBindBanCardHttp",data);
				var status = data.success || false;
				if(status){
					alert("验证码已发送,请注意查收");
					g.sendCode = true;
					$("#getcodebtn").val("60秒后重新发送");
					setTimeout(function(){
						resetGetValidCode();
					},1000);
				}
				else{
					var msg = data.message || "获取验证码失败";
					alert(msg);

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


	function bindUserCardBtnUp(evt){
		var validate_code = $("#validcode").val() || "";
		if(validate_code == ""){
			alert("请输入短信验证码");
			return;
		}
		var condi = g.bindCondi;
		condi.validate_code = validate_code;
		sendConfirmBindBankHttp(condi);
	}

	//确认绑定银行卡
	function sendConfirmBindBankHttp(condi){
		var url = Base.serverUrl + "payPc/confirmBindBankcard";
		g.httpTip.show();
		$.ajax({
			url:url,
			type:"POST",
			data:condi,
			dataType:"json",
			context:this,
			success: function(data){
				console.log("sendConfirmBindBankHttp",data);
				var status = data.success || false;
				if(status){
					if(g.repaymentRecordId == ""){
						//没有订单id,因该是从银行卡中心跳转到绑定页面,回退到银行卡中心
						history.go(-1);
					}
					else{
						//绑定成功跳转到支付页面
						location.href = "../card-pay/card-pay2.html?recordId=" + g.repaymentRecordId + "&p=" + g.price+"&id="+g.couponId;
					}
				}
				else{
					var msg = data.message || "银行卡绑定失败";
					alert(msg);
					$("#validcode").val("");
				}
				g.httpTip.hide();
			},
			error:function(data){
				g.httpTip.hide();
			}
		});
	}















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
				alert("手机号输入错误");
				$("#inputphone").focus();
			}
		}
	}

	//验证密码6-16
	function validPwd(){
		var pwd = $("#inputpwd").val() || "";
		if((pwd.length < 6 || pwd.length > 16) && pwd !== ""){
			alert("密码输入错误:请输入字符6-16位");
			$("#inputpwd").focus();
		}
	}

	function validCPwd(){
		var pwd = $("#inputcpwd").val() || "";
		if((pwd.length < 6 || pwd.length > 16) && pwd !== ""){
			alert("确认密码输入错误:请输入字符6-16位");
			$("#inputcpwd").focus();
		}
		else{
			var pwd1 = $("#inputpwd").val() || "";
			if(pwd !== pwd1){
				alert("两次密码输入不一致.");
				//$("#inputcpwd").focus();
			}
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
					/* sendGetImgCodeHttp(); 11-16*/
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
		location.href = "/webapp/personal-center/index.html";
	}
















});