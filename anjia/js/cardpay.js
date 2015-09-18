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

	g.repaymentRecordId = Utils.getQueryString("recordId") || "";
	g.price = Utils.getQueryString("p") - 0 || 0;

	g.codeImg = $("#imgcodebtn")[0];
	g.guid = Utils.getGuid();
	g.customerId = "";
	g.bindBankCardId = "";
	g.playCondi = {};
	g.payId = "";

	//获取图形验证码
	sendGetImgCodeHttp();

	//验证登录状态
	var loginStatus = Utils.getUserInfo();
	if(!loginStatus){
		//未登录
		location.replace("/anjia/login.html");
	}
	else{
		getUserInfo();
		//
		changeOrderInfoHtml();

		sendGetBindBankCardByCustomerId();
	}



	$("#imgcodebtn").bind("click",sendGetImgCodeHttp);
	$("#getcodebtn").bind("click",getValidCode);

	$("#enterbtn").bind("click",enterPlayBtnUp);

	//$("#gobtn").bind("click",gotoUserCenter);

	function sendGetImgCodeHttp(){
		//URL:  http://www.partywo.com/imageValidate/getImageValidate
		//参数: {image_key:string}
		var url = Base.serverUrl + "imageValidate/getImageValidate";
		url = url + "?image_key=" + g.guid + "&t=" + (new Date() - 0);
		g.codeImg.src = url;

		$("#inputimgcode").val("");
	}

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

	function changeOrderInfoHtml(){
		var p = g.price.toFixed(2);
		var id = g.repaymentRecordId;
		var html = '<label style="margin-right:100px;">本金偿还金额：<em class="highlight-red">' + p + '</em> 元</label>分期订单编号：<em class="highlight">' + id + '</em>';
		$("#orderinfo").html(html);
	}


	function sendGetBindBankCardByCustomerId(){
		g.httpTip.show();
		var url = Base.serverUrl + "payPc/getBindBankCardByCustomerId";
		var condi = {};
		condi.login_token = g.login_token;
		condi.customerId = g.customerId;
		$.ajax({
			url:url,
			data:condi,
			type:"POST",
			dataType:"json",
			context:this,
			success: function(data){
				console.log("sendGetBindBankCardByCustomerId",data);
				var status = data.success || false;
				if(status){
					changeBankCardHtml(data);
				}
				else{
					var msg = data.message || "获取绑定银行卡失败";
					Utils.alert(msg);
				}
				g.httpTip.hide();
			},
			error:function(data){
				g.httpTip.hide();
			}
		});
	}


	function changeBankCardHtml(data){
		var list = data.list || [];
		if(list.length > 0){
			var obj = list[0] || {};
			var bbcId = obj.bbcId || "";

			var html = [];
			for(var i = 0,len = list.length; i < len; i++){
				var d = list[i] || {};
				var bankType = d.bankType || "";
				bankType = bankType.toLowerCase();
				var bankCard = d.bankCard || "";
				bankCard = "****" + bankCard.substring(bankCard.length - 4);

				var logo = "../res/images/bank-logo/" + bankType + ".gif";
				if(i == 0){
					html.push('<li style="height: 30px;">');
					html.push('<label style="width:310px;  text-align: left;">');
					html.push('<div class="bank-card-inf selected" style="margin:0px 15px;">');
					html.push('<span class="bank-card-inf-num">' + bankCard + '</span>');
					html.push('<img src="' + logo + '" class="bank-card-inf-logo" />');
					html.push('</div>');
					html.push('<input type="radio" name="bindcardradio" class="common-radio" checked="checked" />');
					html.push('</label>');
					html.push('</li>');
				}
				else{
					html.push('<li style="height: 30px;">');
					html.push('<label style="width:310px;  text-align: left;">');
					html.push('<div class="bank-card-inf" style="margin:0px 15px;">');
					html.push('<span class="bank-card-inf-num">' + bankCard + '</span>');
					html.push('<img src="../res/images/bank-logo.jpg" class="bank-card-inf-logo" />');
					html.push('</div>');
					html.push('<input type="radio" name="bindcardradio" class="common-radio" />');
					html.push('</label>');
					html.push('</li>');
				}
			}

			$("#mycardlist").html(html.join(''));
			$('.common-radio').yyptRadio();

			//触发支付请求
			sendPlayBindRequest(bbcId);
		}
	}

	//请求支付
	function sendPlayBindRequest(bbcId){
		var url = Base.serverUrl + "payPc/sendBindRequest";
		g.httpTip.show();
		var condi = {};
		condi.login_token = g.login_token;
		condi.customerId = g.customerId;
		condi.repaymentRecordId = g.repaymentRecordId;
		condi.bindBankCardId = bbcId;
		$.ajax({
			url:url,
			type:"POST",
			data:condi,
			dataType:"json",
			context:this,
			success: function(data){
				console.log("sendPlayBindRequest",data);
				var status = data.success || false;
				if(status){
					//请求成功
					g.payId = data.obj || "";
				}
				else{
					var msg = data.message || "支付请求失败";
					Utils.alert(msg);
				}
				g.httpTip.hide();
			},
			error:function(data){
				g.httpTip.hide();
			}
		});
	}

	//获取支付验证码
	function getValidCode(){
		var img_validate_code = $("#inputimgcode").val() || "";

		if(g.payId == ""){
			Utils.alert("正在创建支付订单ID...");
			return;
		}
		if(img_validate_code == ""){
			Utils.alert("请输入图形验证码");
			return;
		}
		if(g.sendCode){
			return;
		}

		var condi = {};
		condi.login_token = g.login_token;
		condi.img_validate_key = g.guid;
		//condi.customerId = g.customerId;
		//condi.bindBankCardId = g.bindBankCardId;
		condi.img_validate_code = img_validate_code;
		//condi.repaymentRecordId = g.repaymentRecordId;
		condi.orderid = g.payId;
		g.playCondi = condi;

		sendSmsByRepaymentRecordIdHttp(condi);
	}

	function sendSmsByRepaymentRecordIdHttp(condi){
		var url = Base.serverUrl + "payPc/sendSmsByRepaymentRecordId";
		g.httpTip.show();
		$.ajax({
			url:url,
			type:"POST",
			data:condi,
			dataType:"json",
			context:this,
			success: function(data){
				console.log("sendSmsByRepaymentRecordIdHttp",data);
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
					var msg = data.message || "获取验证码失败";
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

	function enterPlayBtnUp(evt){
		var validate_code = $("#validcode").val() || "";
		if(validate_code == ""){
			Utils.alert("请输入短信验证码");
			return;
		}
		var condi = g.playCondi;
		condi.validate_code = validate_code;
		sendConfirmPlayHttp(condi);
	}

	//确认支付
	function sendConfirmPlayHttp(condi){
		var url = Base.serverUrl + "payPc/smsConfirm";
		g.httpTip.show();
		$.ajax({
			url:url,
			type:"POST",
			data:condi,
			dataType:"json",
			context:this,
			success: function(data){
				console.log("sendConfirmPlayHttp",data);
				var status = data.success || false;
				if(status){
					alert("支付成功");
					//支付成功
					location.href = "/anjia/result-page.html";
				}
				else{
					var msg = data.message || "支付失败";
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
					Utils.alert(msg);
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
		for(var k in data){
			var code = k;
			var name = data[k];
			option.push('<option value="' + code + '">' + name + '</option>');
		}
		$("#bankCode").html(option.join(''));
	}


});