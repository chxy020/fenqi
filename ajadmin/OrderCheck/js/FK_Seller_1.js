/**
 * function:初审
 * author:hmgx
 * daa
*/

//页面初始化
$(function(){
	var g = {};
	g.phone = "";
	g.imgCodeId = "";
	g.sendCode = false;
	g.sendTime = 60;
	g.login_token = Utils.offLineStore.get("token",false) || "";
	g.orderId = Utils.getQueryString("orderId") || "";
	g.usersId = Utils.offLineStore.get("user_usersId",false) || "";
	g.usersName = Utils.offLineStore.get("user_usersName",false) || "";
	g.httpTip = new Utils.httpTip({});

	g.totalPage = 1;
	g.currentPage = 1;
	g.pageSize = 10;

	//验证登录状态
	var loginStatus = Utils.getUserInfo();
	if(!loginStatus){
		//未登录
		//location.replace("/login.html");
		//window.parent.location.href = "../Public/login.html";
	}else{
		g.httpTip.show();
		$("#orderId").val(g.orderId);
		$("#usersId").val(g.usersId);
		$("#usersName").val(g.usersName);
		$.ajax({
			url: Base.serverUrl + "order/selectFKApproveRecordByOrderId",
			data: {login_token: g.login_token, orderId: g.orderId}, type: "POST", dataType: "json", context: this,
			success: function (data) {
				if (data.obj == null) {
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

				$("#packageMoney").val(RowData.applyPackageMoney);
				var fenarr = {"3": 0, "6": 1, "9": 2, "12": 3, "18": 4, "24": 5, "36": 6};
				var fenQiTimes = fenarr[(RowData.applyFenQiTimes + "")];
				$("#fenQiTimes").val(fenQiTimes);

				$("#fk1_approve_report").val(RowData.fk1_approve_report);
				$("#fk1_approve_remarks").val(RowData.fk1_approve_remarks);
				var obj = countFee(RowData.applyPackageMoney, fenQiTimes);
				$("#poundage").html(obj.rate > 0 ? (obj.rate + "元") : "免费");
				$("#moneyMonth").html(obj.mouth + "元");
				g.httpTip.hide();
			},
			error: function (data) {
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
	$("#packageMoney").bind("blur",fenQiTimesChange);
	$("#fenQiTimes").bind("change",fenQiTimesChange);

	$('#backid').click(function(){
		window.location.href="Fk_OrderList_1.html";
	});

	function fkSellerBtnUp(e){
		if($("#approveReport").val() ==""){
			alert("初审报告不能为空，请检查！");
			return false;
		}
		if($("#approveRemarks").val() ==""){
			alert("初审批意见不能为空，请检查！");
			return false;
		}

		g.httpTip.show();
		var condi = {};
		condi.orderId = g.orderId;
		condi.login_token = g.login_token;
		condi.approvePerson = g.usersId;
		condi.approveName = g.usersName;
		condi.approveResult = e.data.approveResult;
		condi.approveRemarks = $("#approveRemarks").val() || "";
		condi.approveReport = $("#approveReport").val() || "";
		condi.packageMoney = $("#packageMoney").val() - 0 || 0;
		if(condi.packageMoney > 0){
			condi.poundage = g.poundage;
			condi.fenQiTimes = g.stagnum;
			condi.moneyMonth = g.moneyMonth;
			var url = Base.serverUrl + "order/riskManagementFirstApproveOrderController";
			$.ajax({
				url:url,data:condi,type:"POST",dataType:"json",context:this,
				success: function(data){
					var status = data.success || false;
					if(status){
						alert("处理成功！");
						window.location.href="Fk_OrderList_1.html";
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

	//计算手续费和还款金额[allprice=金额][time=期数, 前台选择下拉控件对应的索引值]
	function countFee(allprice,time){
		//console.log("金额:" + allprice);
		//console.log("期数:" + time);
		var numarr =  [3,6,9,12,18,24,36]; //前台选择下拉控件 值 对应的 期数
		var ratearr = [0,0.04,0.04,0.07, 0.1, 0.13, 0.16];//期数对应的费率
		var rate = ratearr[time] * allprice; //手续费 = 对应的期数的对应的费率 * 金额
		//console.log("手续费:" + rate);
		var all = allprice + rate; //全部费用
		var mouthprice = allprice / numarr[time]; //月还款
		var obj = {};
		obj.all = all;
		obj.mouth = mouthprice.toFixed(2);
		obj.rate = rate.toFixed(2);
		obj.stagnum = numarr[time]; //获取期数

		g.poundage = obj.rate + "";
		g.moneyMonth = obj.mouth + "";
		g.stagnum = obj.stagnum;
		//console.log(obj);
		return obj;
	}

	function fenQiTimesChange(){
		var packageMoney = $("#packageMoney").val() - 0 || 0;
		if(packageMoney > 500000){
			Utils.alert("最大审批额度不能大于50万");
			return false;
		}
		if(packageMoney > 0){
			//不能提高
			//if(g.packageMoney >= packageMoney){
				var time = $("#fenQiTimes").val() - 0 || 0;
				var obj = countFee(packageMoney,time);
				$("#poundage").html(obj.rate > 0 ? (obj.rate + "元") : "免费");
				$("#moneyMonth").html(obj.mouth + "元");
			//}else{
			//	Utils.alert("最大审批额度为" + packageMoney + "元");
			//}
		}else{
			Utils.alert("最大审批额度必须大于0元");
		}
	}
});