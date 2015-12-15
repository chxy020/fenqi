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
	g.fenQiTimes = Utils.getQueryString("fenQiTimes") || "";
	g.packageMoney = Utils.getQueryString("packageMoney") || "";
	g.contractMoney = Utils.getQueryString("contractMoney") || "";
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
		//未登录
		//location.replace("/login.html");
		//window.parent.location.href = "../Public/login.html";
	}
	else{
		$("#usersId").val(g.usersId);
		$("#usersName").val(g.usersName);

		var fenarr = {"3":0,"6":1,"9":2,"12":3,"18":4,"24":5,"36":6};
		var fenQiTimes = fenarr[(g.fenQiTimes + "")];
		$("#fenQiTimes").val(fenQiTimes);
		$("#packageMoney").val(g.packageMoney);
		var obj = countFee(g.packageMoney,fenQiTimes);
		$("#poundage").html(obj.rate > 0 ? (obj.rate + "元") : "免费");
		$("#moneyMonth").html(obj.mouth + "元");

		var phtml = [];

		phtml.push('<a href="../protocol/protocol-fenqi.html?orderId=' + g.orderId + '" target="_blank">借款协议</a><br />');
		phtml.push('<a href="../protocol/protocol-authorization.html?orderId=' + g.orderId + '" target="_blank">征信授权</a><br />');
		phtml.push('<a href="../protocol/protocol-customer-commitment.html?orderId=' + g.orderId + '" target="_blank">客户承诺</a><br />');
		phtml.push('<a href="../protocol/protocol-credit-counseling.html?orderId=' + g.orderId + '" target="_blank">咨询协议</a>');
		$("#protocol").html(phtml.join(''));
	}

	$("#sellerbtn").bind("click",fkSellerBtnUp);
	$("#packageMoney").bind("blur",fenQiTimesChange);
	$("#fenQiTimes").bind("change",fenQiTimesChange);


	$('#backid').click(function(){
		window.location.href="fk_index.html";
	});


	function fkSellerBtnUp(id){
		g.httpTip.show();
		var condi = {};
		condi.orderId = g.orderId;
		condi.login_token = g.login_token;
		condi.approvePerson = g.usersId;
		condi.approveName = g.usersName;

		var result = $("#sellerradio")[0].checked;
		result = result == true ? result : false;
		condi.approveResult = result;
		condi.approveRemarks = $("#approveRemarks").val() || "";

		condi.packageMoney = $("#packageMoney").val() - 0 || 0;
		if(condi.packageMoney > 0){
			condi.poundage = g.poundage;
			condi.fenQiTimes = g.stagnum;
			condi.moneyMonth = g.moneyMonth;

			var url = Base.serverUrl + "order/riskManagementApproveOrderController";
			$.ajax({
				url:url,
				data:condi,
				type:"POST",
				dataType:"json",
				context:this,
				success: function(data){
					console.log("fkSellerBtnUp",data);
					var status = data.success || false;
					if(status){
						alert("风控审批完成");

						window.location.href="fk_index.html";
					}
					else{
						var msg = data.message || "审批失败";
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
		if(packageMoney > 0){
			if(g.contractMoney >= packageMoney){
				var time = $("#fenQiTimes").val() - 0 || 0;
				var obj = countFee(packageMoney,time);

				$("#poundage").html(obj.rate > 0 ? (obj.rate + "元") : "免费");
				$("#moneyMonth").html(obj.mouth + "元");
			}
			else{
				Utils.alert("最大审批额度为" + g.contractMoney + "元");
			}
		}
		else{
			Utils.alert("最大审批额度必须大于0元");
		}
	}
});