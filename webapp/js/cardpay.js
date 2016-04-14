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
	g.codelist = [];
	g.nowPayMoney = "";
	//获取图形验证码
	sendGetImgCodeHttp();

	//验证登录状态
	var loginStatus = Utils.getUserInfo();
	if(!loginStatus){
		//未登录
		location.replace("/webapp/login/login.html");
	}
	else{setTimeout(function(){$("#myModal1").click()},500);//显示弹窗
		sendGetBankXianeListHttp();//获取银行限额信息
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
	function serchRepaymentRecordByRepaymentRecordId(bankType,bankCardTop,bankCardLast){
		var url = Base.serverUrl + "order/getRepaymentRecordByRepaymentRecordId";
		var condi = {};
		condi.login_token = g.login_token;
		condi.repaymentRecordId = g.repaymentRecordId;
		condi.bankCardTop = bankCardTop;
		condi.bankCardLast = bankCardLast;
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
					g.paidMoney = obj.paidMoney || 0;
					g.historyTimes = obj.historyTimes || 0;
					g.historyMoney = obj.historyMoney || 0;
					g.todayMoney = obj.todayMoney || 0;
					g.todayTimes = obj.todayTimes || 0;
					//g.price2 = g.price - paidMoney || 0 ;
					breakUp(bankType);
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
		var html = '<label>应付金额：<em class="highlight-red">' + p + '</em> 元</label><div>分期订单编号：<em class="highlight">' + id + '</em></div>';
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
				//if(i == 0){bankType = "icbc";}//测试工商银行
				bankType = bankType.toLowerCase();				
				var bankCard = d.bankCardLast || "";
				var bankCardTop = d.bankCardTop || "";
				var bankCardLast = d.bankCardLast || "";
				bankCard = "****" + bankCard.substring(bankCard.length - 4);

				var logo = "../res/images/bank-logo/" + bankType + ".gif";
				if(i == 0){
					html.push('<li style="height: 30px;">');
					html.push('<label style="width:310px;  text-align: left;">');
					html.push('<div class="bank-card-inf selected" style="margin:0px 15px;">');
					html.push('<span class="bank-card-inf-num">' + bankCard + '</span>');
					html.push('<img src="' + logo + '" class="bank-card-inf-logo" />');
					html.push('</div>');
					html.push('<input type="radio" bankCardTop="'+bankCardTop+'" bankCardLast="'+bankCardLast+'" bankType="'+bankType+'" name="bindcardradio" class="common-radio" checked="checked" />');	
					html.push('</label>');
					html.push('</li>');
					g.bankType = bankType;
					g.bankCardTop = bankCardTop;
					g.bankCardLast = bankCardLast;
					serchRepaymentRecordByRepaymentRecordId(g.bankType,g.bankCardTop,g.bankCardLast);
				}
				else{
					html.push('<li style="height: 30px;">');
					html.push('<label style="width:310px;  text-align: left;">');
					html.push('<div class="bank-card-inf" style="margin:0px 15px;">');
					html.push('<span class="bank-card-inf-num">' + bankCard + '</span>');
					html.push('<img src="' + logo + '" class="bank-card-inf-logo" />');
					html.push('</div>');
					html.push('<input type="radio" bankCardTop="'+bankCardTop+'" bankCardLast="'+bankCardLast+'" bankType="'+bankType+'"  name="bindcardradio" class="common-radio" />');
					html.push('</label>');
					html.push('</li>');
				}
			}

			$("#mycardlist").html(html.join(''));
			$('.common-radio').yyptRadio();

			addClick_div();	
		}
	}

	//判断选中的支付方式银行
	function addClick_div(){
		$(".radio-bg").click(function(){
			g.bankType = $(this).children("input.common-radio").attr("bankType") || "";
			g.bankCardTop = $(this).children("input.common-radio").attr("bankCardTop") || "";
			g.bankCardLast = $(this).children("input.common-radio").attr("bankCardLast") || "";
			serchRepaymentRecordByRepaymentRecordId(g.bankType,g.bankCardTop,g.bankCardLast);
			 return false;//防止冒泡
		})
	}
	
	/* 分析处理银行卡限额问题 及分笔支付总逻辑 */
	function breakUp(bankType){
		bankType = bankType.toUpperCase();
		var codexiane = g.codelist[bankType] || "";
		if(codexiane == ""){
			alert('燕子安家不支持此银行卡，请更换银行卡');
			return false;
		}
		/* 银行限制信息 */
		var bankName = codexiane[0] || "";//银行名称
		var per_time_num = codexiane[1]*10000 || "";//单笔限额
		var per_day_num = codexiane[2]*10000 || "";//单日限额
		var per_month_num = codexiane[3]*10000 || "";//单月限额
		var per_day_times = Number(codexiane[4]) || "";//单日限次
		var per_month_times = Number(codexiane[5]) || "";//单月限次				
		var historyMoney = g.historyMoney || 0;//之前已经支付的金额总和
		var historyTimes = g.historyTimes || 0;//之前已经完成的支付次数总和
		var todayMoney = g.todayMoney || 0;//今天已经支付的金额
		var todayTimes = g.todayTimes || 0;//今天已经支付的次数		
		/* 计算相应字段 */
		var money2 = g.price || 0;//总共需要支付的金额
		var D = per_day_times*per_time_num <= per_day_num ? true : false;//判断单日限额 与 单笔限额*单日次数 哪个小
		var C = per_day_times*per_time_num >= per_day_num ? per_day_num : per_day_times*per_time_num;//判断单日限额 与 单笔限额*单日次数 哪个小		
		var needTims = Math.ceil(money2/per_time_num) || 0;//总共需要支付的笔数
		var todayPayTimes = D ? per_day_times : Math.ceil(per_day_num/per_time_num);//当天可以进行支付的最大次数
		var canPayTimes = needTims >= todayPayTimes ? todayPayTimes : needTims;//判断一天能否付款完成 得到第一天需要支付的次数
		var todayPayMoney = (todayPayTimes*per_time_num).toFixed(2);//一天可以进行支付的最大金额
		var needDays = Math.ceil(money2/todayPayMoney) || 0;//总共需要支付的天数
		var nowNeedDays = Math.ceil((money2 - historyMoney + todayMoney)/todayPayMoney) || 0;//总共需要支付的天数
		var lastPayTimes = needTims - (historyTimes - todayTimes);//最后一天可以支付的最大次数等于 总共需要支付的次数减 今天之前支付的次数
		var nowPayTimes = (money2 - (historyMoney - todayMoney) - todayPayMoney <= 0) ? needTims - historyTimes : todayPayTimes - todayTimes;
		var string_HTML = [];
			string_HTML.push( bankName+": 单笔限额:"+per_time_num+"元；单日限额："+per_day_num+"元；单月限额："+per_month_num+"元；单日限次："+per_day_times+"次；单月限次: "+per_month_times+"次；<br>");
			string_HTML.push( "注：由于"+bankName+"限额问题，系统为您自动转为分笔支付。您要缴纳的费用为"+money2+"元，今天剩余支付"+nowPayTimes+"次，可以"+nowNeedDays+"天内完成支付。已经支付"+historyTimes+"次总计"+historyMoney+"元。");			
			string_HTML.push("您还可以选择在合作商家处线下缴费或直接把费用打至燕子安家公司账户，账户号请拨打客服电话4006-616-896。");
		$("#bank_tips").html(string_HTML.join(''));
		//待付款金额小于单笔限额
		var con1 = money2 <= per_time_num;
		//支付金额大于月限额 或者 总需要支付的次数大于月限次数
		var con2 = money2 > per_time_num && (money2 > per_month_num || needTims > per_month_times);
		//满足限额需求可以进行分笔支付
		var con3 = money2 > per_time_num && money2 <= per_month_num && needTims <= per_month_times;
		if(con1){//正常支付
			$(".sign-item.fenbi,.sign-item.tip,.sign-item.tip2").fadeOut(0);
			g.breakUp = false;
			sendGetBindBankCardByCustomerId2();
		}
		else if(con2){//提示无法支付
			$(".sign-item.tip2").fadeIn(0);
			g.breakUp = false;
			var msg = "银行限额，无法完成支付！";
				alert(msg);
		}
		else if(con3){//可以分笔支付
			var money = (money2 - historyMoney).toFixed(2) || 0;
			var can = money2 - (historyMoney - todayMoney) - todayPayMoney || 0;//判断今天是不是最后一天			
			g.canPayTimes = canPayTimes - todayTimes || "";//今天还需要支付的次数 = 今天总共需要支付的次数 - 今天已经支付的次数 
			if(can <= 0){//如果是最后一天 不管是由于支付拖拉 导致的多天 还是系统自动计算的多天
				g.canPayTimes = needTims - historyTimes || 0;//最后一天还需要支付的次数 = 今天总共需要支付的次数 - 今天已经支付的次数 
			}
			if(g.canPayTimes == 1){//最后一笔
				$(".sign-item.fenbi,.sign-item.tip").fadeIn(0);$(".sign-item.tip2").fadeOut(0);
				if(money >= per_time_num){//多天支付的最后一笔
					$(".form_input .form_input1").attr("value",per_time_num).fadeIn(0);				
					money -= per_time_num;
					$(".form_input .form_input2").attr("value",money.toFixed(2)).fadeIn(0);	
					sendGetBindBankCardByCustomerId2(per_time_num);//支付请求
				}else{//一天支付的最后一笔
					$(".form_input .form_input1").attr("value",money).fadeIn(0);
					var pay2 = (money - per_time_num < 0) ? 0 : money - per_time_num;
					$(".form_input .form_input2").attr("value",pay2.toFixed(2)).fadeIn(0);
					sendGetBindBankCardByCustomerId2(money);//支付请求
				}					
				g.breakUp = false;//最后一笔完成后 终止分笔支付
			}else if(g.canPayTimes > 1){//正常支付
				$(".sign-item.fenbi,.sign-item.tip").fadeIn(0);$(".sign-item.tip2").fadeOut(0);
				$(".form_input .form_input1").attr("value",per_time_num).fadeIn(0);
				money -= per_time_num;
				$(".form_input .form_input2").attr("value",money.toFixed(2)).fadeIn(0);		
				sendGetBindBankCardByCustomerId2(per_time_num);//支付请求
				g.breakUp = true;
			}else{
				g.breakUp = false;//今天支付完成或者所有支付完成 终止分笔支付
				var M = money2 <= historyMoney ? true : false;
				if(M){
					alert("已经支付完成");
				}else{
					alert("今天已经支付完成，请明天继续支付剩余款项");
				}
			}
		}
	
	}
	
	//获取银行限额信息
	function sendGetBankXianeListHttp(){
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
				}
				else{
					var msg = data.message || "获取银行限额失败";
					Utils.alert(msg);
				}
			},
			error:function(data){
			}
		});
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
					g.nowPayMoney = xiane || "";
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
			g.time = setTimeout(function(){
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
			if(g.breakUp){//分笔支付方式
				serchRepaymentRecordByRepaymentRecordId(g.bankType,g.bankCardTop,g.bankCardLast);
			}else{
				g.breakUp = false;
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
						
						if(g.breakUp){//分笔支付
							g.sendTime = 1;clearTimeout(g.time);resetGetValidCode();$("#validcode").val("");
							$(".layui-layer-content").html('<i class="layui-layer-ico layui-layer-ico1"></i>支付成功,请继续支付剩余金额！');		
						}else {
							if((g.price > (g.historyMoney + g.nowPayMoney)) && g.nowPayMoney != ""){
								$(".layui-layer-content").html('<i class="layui-layer-ico layui-layer-ico1"></i>支付成功,今天已经达到支付限额，请明天继续支付剩余金额！');
							}else{
								$(".layui-layer-content").html('<i class="layui-layer-ico layui-layer-ico1"></i>支付成功');
							}
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