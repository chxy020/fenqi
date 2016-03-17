/**
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

	//验证登录状态
	g.loginStatus = Utils.getUserInfo();
	if(!g.loginStatus){
		//未登录
	}
	else{
		getUserInfo();
		sendGetRepayOrderListHttp();
		
	}

	
	/* $("#bottom-ul > li").bind("click",bottomBtnUp); */

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

		//var phoneNumber = obj.phoneNumber || "";
		//$("#userphone").html(phoneNumber);
		/* var avatar = obj.icon || "";
		if(avatar !== ""){
			avatar = avatar + "?t=" + (new Date() - 0);
			$("#avatarimg").attr("src",avatar);
		} */
	}


	function sendGetRepayOrderListHttp(){
		//g.httpTip.show();
		var condi = {};
		condi.loanStatus = "102401102402102403";
		condi.login_token = g.login_token;
		condi.customerId = g.customerId;
		condi.currentPageNum = "1";
		condi.pageSize = "10";
		condi.status = null;
		var url = Base.serverUrl + "order/queryOrdersController";
		$.ajax({
			url:url,
			data:condi,
			type:"POST",
			dataType:"json",
			context:this,
			success: function(data){
				//console.log("sendGetBannerImageByNavigationKey",data);
				var status = data.success || false;
				if(status){
					var obj = data.list || [];
					var d = obj[0];							
					var orderId = d.orderId || "";
					var contractNo = d.contractNo || "";					
					var packageMoney = d.packageMoney || 0;
					var fenQiTimes = d.fenQiTimes || 0;
					var packageName = d.packageName || "";
					$(".my_edu_list .h4").html(packageName);
					$(".my_edu_list .dingdan_bianhao").html(orderId);
					$(".my_edu_list .hetong_bianhao").html(contractNo);
					$(".my_edu_list .fenqi_jine").html(packageMoney);
					$(".my_edu_list .zongqishu").html(fenQiTimes);
					$("#pay_btn_pay").bind("click",function(){sendGetRepayOrderInfoListHttp(orderId)});
					g.orderId = orderId || "";
				}
				else{
					var msg = data.message || "获取首页轮播图数据失败";
					alert(msg);
				}
				//g.httpTip.hide();
			},
			error:function(data){
				//g.httpTip.hide();
			}
		});
	}
	
	
	
		//获取放款列表
	function sendGetRepayOrderInfoListHttp(orderId){
		var condi = {};
		condi.login_token = g.login_token;
		condi.customerId = g.customerId;
		condi.orderId = orderId;
		condi.currentPageNum = 1;
		condi.pageSize = 10;
		var url = Base.serverUrl + "order/queryLoanRecordByQuery";
		$.ajax({
			url:url,
			data:condi,
			type:"POST",
			dataType:"json",
			context:this,
			success: function(data){
			
				var status = data.success || false;
				if(status){
					repayListHtml(data,orderId);
				}
				else{
					var msg = data.message || "获取用户放款订单失败";
					alert(msg);
				}
			},
			error:function(data){
			}
		});
	}

	function repayListHtml(data,orderId){

		var html = [];
		var obj = data.list || [];

		var one = false;
		var two = false;
		var three = false;
		var four = false;
		var max = 0;

		for(var i = 0,len = obj.length; i < len; i++){
			var d = obj[i] || {};
			var loanRecordId = d.loanRecordId || "";
			var loanTimes = d.loanTimes - 0;
			var packageMoney = d.packageMoney - 0 || 0;
			var loanMoney = d.loanMoney - 0 || 0;
			var realLoanTime = d.realLoanTime || "";
			var loanResidueMoney = d.loanResidueMoney || 0;
			var loanMaxMoney = d.loanMaxMoney - 0 || 0;
			var expectLoanTime = d.expectLoanTime || "";
			//var now = new Date().format("yyyy-MM-dd");
			var status = d.status;
			var now  =  data.other || "";
			var days = 100000;
			if(expectLoanTime !== ""){
				days = getDays(now,expectLoanTime);
			}
			max = max + loanMoney;
			//(102401 待放款,102402以放款)

			if(status == "102401"){
				//待放款
				if(loanTimes == 1){
					html.push('<li class="li1 pay1">'+loanTimes+'');
					html.push('<input id="' + loanRecordId + '" type="text" placeholder="最大付款金额' +loanMaxMoney + '元" class="edu_pay_input" />');
					html.push('<a class="pay_btn" href="javascript:loanByLoanRecord(\'' + loanRecordId + '\',\'' + loanMaxMoney + '\',\'' + loanResidueMoney + '\')">支付</a>');
				}
				else if(loanTimes == 2){
					if(one == true){
						html.push('<li class="li1 pay1">'+loanTimes+'');
						html.push('<input id="' + loanRecordId + '" type="text" placeholder="最大付款金额' +loanMaxMoney + '元" class="edu_pay_input" />');
						html.push('<a class="pay_btn" href="javascript:loanByLoanRecord(\'' + loanRecordId + '\',\'' + loanMaxMoney + '\',\'' + loanResidueMoney + '\')">支付</a>');
					}
					else{
						html.push('<li class="li1 pay1">'+loanTimes+'');
						html.push('<input id="' + loanRecordId + '" type="text" placeholder="最大付款金额' +loanMaxMoney + '元" class="edu_pay_input"/>');
						html.push('<a class="pay_btn" href="javascript:alert(\'请先申请第一期\')">支付</a></td>');
					}
				}
				else if(loanTimes == 3){
					if(two == true && days >= 0){
						html.push('<li class="li1 pay1">'+loanTimes+'');
						html.push('<input id="' + loanRecordId + '" type="text" placeholder="最大付款金额' +loanMaxMoney + '元" class="edu_pay_input" />');
						html.push('<a class="pay_btn" href="javascript:loanByLoanRecord(\'' + loanRecordId + '\',\'' + loanMaxMoney  + '\',\'' + loanResidueMoney + '\')">支付</a>');
					}
					else{
						var days2=Math.abs(days);
						if(days === 100000){
							/* html.push('<td>不能超过合同金额35%</td>'); */
							html.push('<li class="li1 pay2">'+loanTimes+'');
							html.push('<input type="text" placeholder="不能超过合同金额35%" class="edu_pay_input" />');
							
						}
						else{
							/* html.push('<td>还剩' + days2 + '天再付款,不能超过合同金额35%</td>'); */
							html.push('<li class="li1 pay2">'+loanTimes+'');
							html.push('<input type="text" placeholder="还剩' + days2 + '天再付款,不能超过合同金额35%" class="edu_pay_input" />');
						}
						html.push('<a class="pay_btn" >支付</a>');
					}
				}
				else if(loanTimes == 4){
					if(two == true && days >= 0){
						html.push('<li class="li1 pay1">'+loanTimes+'');
						html.push('<input id="' + loanRecordId + '" type="text" placeholder="最大付款金额' +loanMaxMoney + '" class="edu_pay_input" />');
						html.push('<a class="pay_btn" href="javascript:loanByLoanRecord(\'' + loanRecordId + '\',\'' + loanMaxMoney + '\',\'' + loanResidueMoney + '\',4)">支付</a>');
					}
					else{
						var days2=Math.abs(days);
						if(days === 100000){
							/* html.push('<td>不能超过合同金额5%</td>'); */
							html.push('<li class="li1 pay2">'+loanTimes+'');
							html.push('<input type="text" placeholder="不能超过合同金额5%" class="edu_pay_input" />');
						}
						else{
							/* html.push('<td>还剩' + days2 + '天再付款,不能超过合同金额5%</td>'); */
							html.push('<li class="li1 pay2">'+loanTimes+'');
							html.push('<input type="text" placeholder="还剩' + days2 + '天再付款,不能超过合同金额5%" class="edu_pay_input" />');
						}
						html.push('<a class="pay_btn" >支付</a>');
					}
				}
			}
			else if(status == "102402"){
				if(loanTimes === 1){
					one = true;
				}
				if(loanTimes === 2){
					two = true;
				}
				if(loanTimes === 3){
					three = true;
				}
				html.push('<li class="li1 pay2">'+loanTimes+'');
				html.push('<input type="text" placeholder="' + loanMoney + '元" class="edu_pay_input" />');
				html.push('<a class="pay_btn" href="javascript:;">已付款</a>');
			}

			html.push('</li>');
		}
		
		$("#pay_list_box").html(html.join(''));

	}
	function getDays(strDateStart,strDateEnd){
		var strSeparator = "-"; //日期分隔符
		var oDate1;
		var oDate2;
		var iDays;
		oDate1= strDateStart.split(strSeparator);
		oDate2= strDateEnd.split(strSeparator);
		var strDateS = new Date(oDate1[0], oDate1[1]-1, oDate1[2]);
		var strDateE = new Date(oDate2[0], oDate2[1]-1, oDate2[2]);
		iDays = parseInt((strDateS - strDateE ) / 1000 / 60 / 60 /24)//把相差的毫秒数转换为天数
		return iDays ;
	}

	function loanByLoanRecord(loanRecordId,loanMaxMoney, loanResidueMoney,loanTimes){
		var condi = {};
		condi.login_token = g.login_token;
		condi.loanRecordId = loanRecordId;
		condi.loanMoney = $("#" +loanRecordId).val() - 0 || 0;
		if(loanResidueMoney < condi.loanMoney){
			alert("申请不能大于" +loanResidueMoney + "元");
			return;
		}
		if(loanMaxMoney < condi.loanMoney){
			alert("最多只能申请" +loanMaxMoney + "元");
			return;
		}
		if(condi.loanMoney == 0){
			alert("申请额度必须大于0元");
			return;
		}
		if(loanTimes == "4" && loanMaxMoney > condi.loanMoney){
			alert("为了避免支付结余，请填写"+loanMaxMoney+"元");
			return;
		}
		var url = Base.serverUrl + "order/loanByLoanRecord";
		$.ajax({
			url:url,
			data:condi,
			type:"POST",
			dataType:"json",
			context:this,
			success: function(data){
				
				var status = data.success || false;
				if(status){
					alert("申请付款成功");
					sendGetRepayOrderInfoListHttp(g.orderId);
				}
				else{
					var msg = data.message || "申请付款失败";
					alert(msg);
				}
			},
			error:function(data){

			}
		});
	}

	
	
	window.loanByLoanRecord = loanByLoanRecord;
	window.repayListHtml = repayListHtml;
});












