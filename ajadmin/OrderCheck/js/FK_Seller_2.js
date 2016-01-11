/**
 * function:二审
 * author:hmgx
 * data:2015-12-18
*/

//页面初始化
$(function(){
	var g = {};
	g.orderId = Utils.getQueryString("orderId") || "";
	g.login_token = Utils.offLineStore.get("token",false) || "";
	g.phoneNumber = Utils.offLineStore.get("user_phoneNumber",false) || "";
	g.usersId = Utils.offLineStore.get("user_usersId",false) || "";
	g.usersName = Utils.offLineStore.get("user_usersName",false) || "";
	g.httpTip = new Utils.httpTip({});

	g.totalPage = 1;
	g.currentPage = 1;
	g.pageSize = 10;

	//验证登录状态
	var loginStatus = Utils.getUserInfo();
	if(!loginStatus){
		alert("未登陆!");
	}else{
		g.httpTip.show();
		$("#orderId").val(g.orderId);
		$("#usersId").val(g.usersId);
		$("#usersName").val(g.usersName);
		$.ajax({
			url:Base.serverUrl + "order/selectFKApproveRecordByOrderId",
			data:{login_token: g.login_token,orderId: g.orderId},	type:"POST",dataType:"json",context:this,
			success: function(data){
				if(data.obj == null){
					Utils.alert("订单号[" + g.orderId + "]非法！");
					g.httpTip.hide();
					return false;
				}
				var RowData = data.obj;
				g.packageMoney = RowData.packageMoney;
				$("#applicantName").val(RowData.applicantName);
				$("#applicantPhone").val(RowData.applicantPhone);

				$("#contractMoney").val(RowData.contractMoney);
				$("#applyPackageMoney").val(RowData.applyPackageMoney);
				$("#applyFenQiTimes").val(RowData.applyFenQiTimes);
				$("#packageMoney").val(RowData.packageMoney);
				var fenarr = {"3":0,"6":1,"9":2,"12":3,"18":4,"24":5,"36":6};
				var fenQiTimes = fenarr[(RowData.fenQiTimes + "")];
				$("#fenQiTimes").val(fenQiTimes);
				$("#fk1_approve_report").val(RowData.fk1_approve_report);
				$("#fk1_approve_remarks").val(RowData.fk1_approve_remarks);
				var obj = countFee(RowData.packageMoney,fenQiTimes);
				$("#poundage").html(obj.rate > 0 ? (obj.rate + "元") : "免费");
				$("#moneyMonth").html(obj.mouth + "元");
				g.httpTip.hide();
			},
			error:function(data){
				g.httpTip.hide();
			}
		});
		var phtml = [];
		phtml.push('<a href="../protocol/protocol-fenqi.html?orderId=' + g.orderId + '" target="_blank">借款协议</a>&nbsp;&nbsp;');
		phtml.push('<a href="../protocol/protocol-authorization.html?orderId=' + g.orderId + '" target="_blank">征信授权</a>&nbsp;&nbsp;');
		phtml.push('<a href="../protocol/protocol-customer-commitment.html?orderId=' + g.orderId + '" target="_blank">客户承诺</a>&nbsp;&nbsp;');
		phtml.push('<a href="../protocol/protocol-credit-counseling.html?orderId=' + g.orderId + '" target="_blank">咨询协议</a>&nbsp;&nbsp;');
		phtml.push('<a href="../protocol/protocol-transfer.html?orderId=' + g.orderId + '" target="_blank">债权转让协议</a>');
		$("#protocol").html(phtml.join(''));
	}

	$("#but_tg").bind("click",{approveResult:0},fkSellerBtnUp);
	$("#but_jj").bind("click",{approveResult:1},fkSellerBtnUp);
	$("#but_th").bind("click",{approveResult:2},fkSellerBtnUp);
	$('#backid').click(function(){
		window.location.href="Fk_OrderList_2.html";
	});
	$("#packageMoney").bind("blur",fenQiTimesChange);
	$("#fenQiTimes").bind("change",fenQiTimesChange);


	function fkSellerBtnUp(e){
		if($("#fk2_approve_report").val() ==""){
			alert("复审报告不能为空，请检查！");
			return false;
		}
		g.httpTip.show();
		var condi = {};
		condi.orderId = g.orderId;
		condi.login_token = g.login_token;
		condi.approvePerson = g.usersId;
		condi.approveName = g.usersName;
		condi.approveResult = e.data.approveResult;
		condi.approveReport = $("#fk2_approve_report").val() || "";
		condi.packageMoney = $("#packageMoney").val() - 0 || 0;
		if(condi.packageMoney > 0){
			condi.poundage = g.poundage;
			condi.fenQiTimes = g.stagnum;
			condi.moneyMonth = g.moneyMonth;
			var url = Base.serverUrl + "order/riskManagementSecondApproveOrderController";
			$.ajax({
				url:url,data:condi,type:"POST",dataType:"json",context:this,
				success: function(data){
					var status = data.success || false;
					if(status){
						alert("处理成功！");
						window.location.href="Fk_OrderList_2.html";
					}else{
						var msg = data.message || "处理失败！";
						Utils.alert(msg);
					}
					g.httpTip.hide();
				},
				error:function(data){
					g.httpTip.hide();
				}
			});
		}
	}

	//计算费率
	function countFee(allprice,time){
		var numarr = [3,6,9,12,18,24,36];
		var ratearr = [0,0.04,0.04,0.07,0.1,0.13,0.16];
		var rate = ratearr[time] * allprice;
		var all = allprice + rate;
		var mouthprice = allprice / numarr[time];
		var obj = {};
		obj.all = all;
		obj.mouth = mouthprice.toFixed(2);
		obj.rate = rate.toFixed(2);
		obj.stagnum = numarr[time];

		g.poundage = obj.rate + "";
		g.moneyMonth = obj.mouth + "";
		g.stagnum = obj.stagnum;
		return obj;
	}

	function fenQiTimesChange(){
		var packageMoney = $("#packageMoney").val() - 0 || 0;
		if(packageMoney > 500000){
			Utils.alert("最大审批额度不能大于50万");
			return false;
		}
		if(packageMoney > 0){
			if(g.packageMoney >= packageMoney){
				var time = $("#fenQiTimes").val() - 0 || 0;
				var obj = countFee(packageMoney,time);
				$("#poundage").html(obj.rate > 0 ? (obj.rate + "元") : "免费");
				$("#moneyMonth").html(obj.mouth + "元");
			}else{
				Utils.alert("初审最大审批额度为" + packageMoney + "元");
			}
		}else{
			Utils.alert("最大审批额度必须大于0元");
		}
	}
});