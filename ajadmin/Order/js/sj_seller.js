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
	g.orderId = Utils.getQueryString("orderId") || "";
	g.login_token = Utils.offLineStore.get("token",false) || "";
	g.phoneNumber = Utils.offLineStore.get("user_phoneNumber",false) || "";
	g.usersId = Utils.offLineStore.get("user_usersId",false) || "";
	g.usersName = Utils.offLineStore.get("user_usersName",false) || "";
	g.httpTip = new Utils.httpTip({});
	g.customerId = "";
	g.totalPage = 1;
	g.currentPage = 1;
	g.pageSize = 10;


	//验证登录状态
	var loginStatus = Utils.getUserInfo();
	if(!loginStatus){
		//未登录
		//location.replace("/login.html");
		//window.parent.location.href = "../Public/login.html";
	}
	else{
		$("#usersId").val(g.usersId);
		$("#usersName").val(g.usersName);
		 getUserInfo();
		sendGetRepayOrderInfoListHttp(g.orderId);
	}

	
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
	}
	//$("#sellerbtn").bind("click",sellerBtnUp);

	$('#backid').click(function(){
		window.location.href="sj_index.html";
	});

	//获取收款列表
	function sendGetRepayOrderInfoListHttp(orderId){
		var condi = {};
		condi.login_token = g.login_token;
		condi.customerId = g.customerId;
		condi.orderId = orderId;
		condi.currentPageNum = 1;
		condi.pageSize = 10;

		g.httpTip.show();
		var url = Base.serverUrl + "order/queryLoanRecordByQuery";
		$.ajax({
			url:url,
			data:condi,
			type:"POST",
			dataType:"json",
			context:this,
			success: function(data){
				//console.log("sendGetRepayOrderInfoListHttp",data);
				var status = data.success || false;
				if(status){
					repayListHtml(data,orderId);
				}
				else{
					var msg = data.message || "获取用户放款订单失败";
					Utils.alert(msg);
				}
				g.httpTip.hide();
			},
			error:function(data){
				g.httpTip.hide();
			}
		});
	}

	function repayListHtml(data,orderId){

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
			var now = new Date($.ajax({async: false}).getResponseHeader("Date")).format("yyyy-MM-dd");
			var status = d.status;

			var days = 100000;
			if(expectLoanTime !== ""){
				days = getDays(now,expectLoanTime);
			}
			max = max + loanMoney;
			if(status == "102401"){
				//待放款
				if(loanTimes == 1){
					$(".get_money1").attr("id",loanRecordId);
					$(".get_money1").attr("placeholder",'最大付款金额' +loanMaxMoney + '元');
					$("#get_money_btn1").attr("href",'javascript:loanByLoanRecord(\'' + loanRecordId + '\',\'' + loanMaxMoney + '\',\'' + loanResidueMoney + '\')');

				}
				else if(loanTimes == 2){
					if(one == true){
						$(".get_money2").attr("id",loanRecordId);
						$(".get_money2").attr("placeholder",'最大付款金额' +loanMaxMoney + '元');
						$("#get_money_btn2").attr("href",'javascript:loanByLoanRecord(\'' + loanRecordId + '\',\'' + loanMaxMoney + '\',\'' + loanResidueMoney + '\')');

					}
					else{
						$(".get_money2").attr("id",loanRecordId);
						$(".get_money2").attr("placeholder",'最大付款金额' +loanMaxMoney + '元');
						$("#get_money_btn2").bind("click",function(){Utils.alert('请先申请第一期')});

					}
				}
				else if(loanTimes == 3){
					if(two == true && days >= 0){
						$(".get_money3").attr("id",loanRecordId);
						$(".get_money3").attr("placeholder",'最大付款金额' +loanMaxMoney + '元');
						$("#get_money_btn3").attr("href",'javascript:loanByLoanRecord(\'' + loanRecordId + '\',\'' + loanMaxMoney + '\',\'' + loanResidueMoney + '\')');
					}
					else{
						var days2=Math.abs(days);
						if(days === 100000){
							$(".get_money3").attr("placeholder",'不能超过合同金额35%');
							$(".get_money3,#get_money_btn3").attr("disabled","disabled");
						}
						else{
							$(".get_money3").attr("placeholder",'还剩' + days2 + '天再付款,不能超过合同金额35%');
							$("#get_money_btn3").bind("click",function(){Utils.alert('还剩' + days2 + '天再付款,不能超过合同金额35%')});
						}				
					}
				}
				else if(loanTimes == 4){
					if(two == true && days >= 0){
						$(".get_money4").attr("id",loanRecordId);
						$(".get_money4").attr("placeholder",'最大付款金额' +loanMaxMoney + '元');
						$("#get_money_btn4").attr("href",'javascript:loanByLoanRecord(\'' + loanRecordId + '\',\'' + loanMaxMoney + '\',\'' + loanResidueMoney + '\',4)');

					}
					else{
						var days2=Math.abs(days);
						if(days === 100000){
							$(".get_money4").attr("placeholder",'不能超过合同金额5%');
							$(".get_money4,#get_money_btn4").attr("disabled","disabled");
						}
						else{
							$(".get_money4").attr("placeholder",'还剩' + days2 + '天再付款,不能超过合同金额5%');
							$("#get_money_btn4").bind("click",function(){Utils.alert('还剩' + days2 + '天再付款,不能超过合同金额5%')});
						}
						
					}
				}
			}
			else if(status == "102402"){
				if(loanTimes === 1){
					one = true;
					$(".get_money1").attr("placeholder",loanMoney + '元');
					$(".get_money1,#get_money_btn1").attr("disabled","disabled");
					$("#get_money_btn1").html("已收款");
					$("#get_money_btn1").bind("click",function(){Utils.alert('已收款')});
				}
				if(loanTimes === 2){
					two = true;
					$(".get_money2").attr("placeholder",loanMoney + '元');
					$(".get_money2,#get_money_btn2").attr("disabled","disabled");
					$("#get_money_btn2").html("已收款");
					$("#get_money_btn2").bind("click",function(){Utils.alert('已收款')});
				}
				if(loanTimes === 3){
					three = true;
					$(".get_money3").attr("placeholder",loanMoney + '元');
					$(".get_money3,#get_money_btn3").attr("disabled","disabled");
					$("#get_money_btn3").html("已收款");
					$("#get_money_btn3").bind("click",function(){Utils.alert('已收款')});
				}
				if(loanTimes === 4){
					$(".get_money4").attr("placeholder",loanMoney + '元');
					$(".get_money4,#get_money_btn4").attr("disabled","disabled");
					$("#get_money_btn4").html("已收款");
					$("#get_money_btn4").bind("click",function(){Utils.alert('已收款')});					
				}

			}

		}
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
		condi.loanMoney = $("#" +loanRecordId).val() - 0 || 0;console.log(loanRecordId);
		if(loanResidueMoney < condi.loanMoney){
			Utils.alert("申请不能大于" +loanResidueMoney + "元");
			return;
		}
		if(loanMaxMoney < condi.loanMoney){
			Utils.alert("最多只能申请" +loanMaxMoney + "元");
			return;
		}
		if(condi.loanMoney == 0){
			Utils.alert("申请额度必须大于0元");
			return;
		}
		if(loanTimes == "4" && loanMaxMoney > condi.loanMoney){
			Utils.alert("为了避免支付结余，请填写"+loanMaxMoney+"元");
			return;
		}
		g.httpTip.show();
		var url = Base.serverUrl + "order/loanByLoanRecord";
		$.ajax({
			url:url,
			data:condi,
			type:"POST",
			dataType:"json",
			context:this,
			success: function(data){
				console.log("loanByLoanRecord",data);
				var status = data.success || false;
				if(status){
					Utils.alert("申请付款成功");
					//repayListHtml(data);
					 location.reload();
				}
				else{
					var msg = data.message || "申请付款失败";
					Utils.alert(msg);
				}
				g.httpTip.hide();
			},
			error:function(data){
				g.httpTip.hide();
			}
		});
	}
	window.loanByLoanRecord = loanByLoanRecord;
});