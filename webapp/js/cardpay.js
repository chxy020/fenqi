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
	g.breakUp = false;
	g.codeImg = $("#imgcodebtn")[0];
	g.guid = Utils.getGuid();
	g.customerId = "";
	g.bindBankCardId = "";
	g.playCondi = {};
	g.payId = "";
	g.paidMoney = 0;

	//获取图形验证码
	sendGetImgCodeHttp();

	//验证登录状态
	var loginStatus = Utils.getUserInfo();
	if(!loginStatus){
		//未登录
		location.replace("/webapp/login/login.html");
	}
	else{
		serchRepaymentRecordByRepaymentRecordId();
		getUserInfo();
		//
		changeOrderInfoHtml();

		sendGetBindBankCardByCustomerId();
	}

	$("#imgcodebtn").bind("click",sendGetImgCodeHttp);
	$("#getcodebtn").bind("click",getValidCode);

	$("#enterbtn").bind("click",enterPlayBtnUp);
	$("#change_pay").bind("click",change_pay_fuc);
	//$("#gobtn").bind("click",gotoUserCenter);

	function change_pay_fuc(){
		location.href = "../bind-card/add-bind-card.html?recordId=" + g.repaymentRecordId+"&id="+g.couponId;
	}
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
		//console.log("getUserInfo",info);
		if(info !== ""){
			var obj = JSON.parse(info) || {};
			g.customerId = obj.customerId || "";
			g.userPhone = obj.phoneNumber || "";
		}
	}

		//查询已支付金额
	function serchRepaymentRecordByRepaymentRecordId(){
		var url = Base.serverUrl + "order/getRepaymentRecordByRepaymentRecordId";
		var condi = {};
		condi.login_token = g.login_token;
		condi.repaymentRecordId = g.repaymentRecordId;
		$.ajax({
			url:url,
			type:"POST",
			data:condi,
			dataType:"json",
			context:this,
			success: function(data){				
				var status = data.success || false;
				if(status){
					//请求成功
					var obj = data.obj || [];
					var paidMoney = obj.paidMoney || 0;
					g.paidMoney = paidMoney;
					g.price2 = g.price - paidMoney || 0 ;
					
				}
				else{
					var msg = data.message || "查询已支付金额失败";					
					Utils.alert(msg);
				}
			},
			error:function(data){
			}
		});
	}
	
	function changeOrderInfoHtml(){
		var p = g.price.toFixed(2);
		var id = g.repaymentRecordId;
		var html = '<label>服务费金额：<em class="highlight-red">' + p + '</em> 元</label><div>分期订单编号：<em class="highlight">' + id + '</em></div>';
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
				//console.log("sendGetBindBankCardByCustomerId",data);
				var status = data.success || false;
				if(status){
					changeBankCardHtml(data);
				}
				else{
					var msg = data.message || "获取绑定银行卡失败";
					alert(msg);
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

			var bankCardTop = obj.bankCardTop || "";
			var bankCardLast = obj.bankCardLast || "";
			//触发支付请求
			

			var html = [];
			for(var i = 0,len = list.length; i < len; i++){
				var d = list[i] || {};
				var bankType = d.bankType || "";
				bankType = bankType.toLowerCase();
				//if(i == 0){bankType = "icbc";}//测试工商银行
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
					if(bankType == "icbc"){
						html.push('<input type="radio" name="bindcardradio" class="common-radio common-radio_ccb" checked="checked" />');
					}else{
						html.push('<input type="radio" name="bindcardradio" class="common-radio" checked="checked" />');
					}	
					html.push('</label>');
					html.push('</li>');
					/* 判断银行卡是不是工商银行 */
					if(bankType == "icbc"){breakUp();}else{sendPlayBindRequest(bankCardTop,bankCardLast);}
				}
				else{
					html.push('<li style="height: 30px;">');
					html.push('<label style="width:310px;  text-align: left;">');
					html.push('<div class="bank-card-inf" style="margin:0px 15px;">');
					html.push('<span class="bank-card-inf-num">' + bankCard + '</span>');
					html.push('<img src="' + logo + '" class="bank-card-inf-logo" />');
					html.push('</div>');
					if(bankType == "icbc"){
						html.push('<input type="radio" name="bindcardradio" class="common-radio common-radio_ccb" />');
					}else{
						html.push('<input type="radio" name="bindcardradio" class="common-radio" />');
					}		
					html.push('</label>');
					html.push('</li>');
				}
			}

			$("#mycardlist").html(html.join(''));
			$('.common-radio').yyptRadio();

			addClick_div();	
		}
	}

	//判断选中的支付方式是不是工商银行
	function addClick_div(){
		$(".radio-bg").click(function(){
			if($(".common-radio_ccb").attr("checked") == "checked"){g.breakUp = true;breakUp();}
			else{g.breakUp = false;$(".sign-item.fenbi,.sign-item.tip,.sign-item.tip2").fadeOut(0);sendGetBindBankCardByCustomerId2();}
		return false;
		})
	}
	
	/* 12-25 */
	//单独发送支付请求
	function sendGetBindBankCardByCustomerId2(xiane){
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
				//console.log("sendGetBindBankCardByCustomerId",data);
				var status = data.success || false;
				if(status){
					var list = data.list || [];
					var obj = list[0] || {};
					var bankCardTop = obj.bankCardTop || "";
					var bankCardLast = obj.bankCardLast || "";
				//触发支付请求
					sendPlayBindRequest(bankCardTop,bankCardLast,xiane);
				}
				else{
					var msg = data.message || "获取绑定银行卡失败";
					alert(msg);
				}
				g.httpTip.hide();
			},
			error:function(data){
				g.httpTip.hide();
			}
		});
	}
	/* 12-25 */
	
	//请求支付
	function sendPlayBindRequest(bankCardTop,bankCardLast,xiane){
		var xiane = xiane || true;
		var url = Base.serverUrl + "payPc/sendBindRequest";
		g.httpTip.show();
		var condi = {};
		condi.login_token = g.login_token;
		condi.customerId = g.customerId;
		condi.repaymentRecordId = g.repaymentRecordId;
		condi.bankCardTop = bankCardTop;
		condi.bankCardLast = bankCardLast;
		condi.couponId = g.couponId;
		condi.isFullPay = xiane;//传送支付金额
		$.ajax({
			url:url,
			type:"POST",
			data:condi,
			dataType:"json",
			context:this,
			success: function(data){
				//console.log("sendPlayBindRequest",data);
				var status = data.success || false;
				if(status){
					//请求成功
					g.payId = data.obj || "";
				}
				else{
					var msg = data.message || "支付请求失败";
					if(msg == "单卡超过单笔支付限额"){msg = "所选银行卡余额不足"}
					alert(msg);
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
			alert("正在创建支付订单ID...");
			return;
		}
		if(img_validate_code == ""){
			alert("请输入图形验证码");
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
				//console.log("sendSmsByRepaymentRecordIdHttp",data);
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
			alert("请输入短信验证码");
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
				//console.log("sendConfirmPlayHttp",data);
				var status = data.success || false;
				if(status){
					showPayTip();
					//支付成功
					//location.href = "/anjia/result-page.html";
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

	function showPayTip(){
		layer.alert('支付中...', {icon: 4,closeBtn: 0}, function(index){
			layer.close(index);
			if(g.price2 > 10000 && g.price2 <= 20000 && g.breakUp){//分笔支付方式
				g.price2 -= 10000;
				$(".form_input .form_input1,.form_input .fenbi_step2").fadeOut(0);
				sendGetBindBankCardByCustomerId2(g.price2);
			}else{
				location.href = "/webapp/personal-center/index.html";
			}
		});
		$(".layui-layer-btn").hide();

		sendGetPayStatus();
	}

	function sendGetPayStatus(){
		var url = Base.serverUrl + "payPc/getPayRecordById";
		g.httpTip.show();
		var condi = {};
		condi.orderid = g.payId;
		$.ajax({
			url:url,
			type:"POST",
			data:condi,
			dataType:"json",
			context:this,
			success: function(data){
				//console.log("sendGetPayStatus",data);
				var status = data.success || false;
				if(status){
					//{"success":true,"obj":{支付对象,status:0失败 1成功 2未处理 3处理中 ,errorcode:错误代码,errormsg:错误信息},"list":[],"message":"","code":null,"token":“”}
					var status = data.obj.status - 0;
					if(status == 1){
						$(".layui-layer-btn").show();
						
						if(g.price2 > 10000 && g.price2 <= 20000 && g.breakUp){//分笔支付
							$(".layui-layer-content").html('<i class="layui-layer-ico layui-layer-ico1"></i>支付成功,请继续支付剩余金额！');		
						}else {
							$(".layui-layer-content").html('<i class="layui-layer-ico layui-layer-ico1"></i>支付成功');
						}
					}	
					else if(status == 0){
						var errorcode = data.obj.errorcode || "";
						var errormsg = data.obj.errormsg || "";

						$(".layui-layer-btn").show();
						$(".layui-layer-content").html('<i class="layui-layer-ico layui-layer-ico2"></i>' + errormsg + ':' + errorcode);
					}
					else{
						setTimeout(function(){
							sendGetPayStatus();
						},300);
					}
				}
				else{
					var msg = data.message || "支付失败";
					alert(msg);
				}
				g.httpTip.hide();
			},
			error:function(data){
				g.httpTip.hide();
			}
		});
	}

/* 拆分金额计算器 */
	function breakUp(){		
		var money = g.price || 0;
		var money2 = g.price || 0;
		var xiane = 10000;		
		var i = 1;
		if(money2 > xiane && money2 <= xiane*2){
			while(money2 > xiane){
				$(".form_input .form_input"+i+"").attr("value",xiane).fadeIn(0);
				money2 -= xiane;i++;
				if(money2 > xiane ){continue;}else{$(".form_input .form_input"+i+"").attr("value",money2).fadeIn(0);break;}
			}
		}
		if(money > xiane && money <= xiane*2){
			$(".sign-item.fenbi,.sign-item.tip").fadeIn(0);$(".sign-item.tip2").fadeOut(0);
			g.breakUp = true;
			if(g.paidMoney > 0){
				xiane = g.price - g.paidMoney;g.breakUp = false;			
				$(".form_input .form_input1,.form_input .fenbi_step2").fadeOut(0);
				$(".form_input .form_input2").attr("value",xiane).fadeIn(0);
			}//判断如果已经支付过一部分 则不分笔支付		
			sendGetBindBankCardByCustomerId2(xiane);//支付请求
			
		}else if(money > xiane*2){
			$(".sign-item.tip2").fadeIn(0);g.breakUp = false;sendGetBindBankCardByCustomerId2();
		}else{
			$(".sign-item.fenbi,.sign-item.tip,.sign-item.tip2").fadeOut(0);g.breakUp = false;sendGetBindBankCardByCustomerId2();
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
				//console.log("sendGetBankListHttp",data);
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
		for(var k in data){
			var code = k;
			var name = data[k];
			option.push('<option value="' + code + '">' + name + '</option>');
		}
		$("#bankCode").html(option.join(''));
	}

	window.addClick_div = addClick_div;
	window.breakUp = breakUp;
	window.sendGetBindBankCardByCustomerId2 = sendGetBindBankCardByCustomerId2;
});