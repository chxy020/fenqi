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
		$("#packageMoney").attr("value",g.packageMoney);		
		$("#fenQiTimes").find("option[value="+g.fenQiTimes+"]").attr("selected",true);
		
		var phtml = [];

		phtml.push('<a href="../protocol/protocol-fenqi.html?orderId=' + g.orderId + '" target="_blank">借款协议</a><br />');
		phtml.push('<a href="../protocol/protocol-authorization.html?orderId=' + g.orderId + '" target="_blank">征信授权</a><br />');
		phtml.push('<a href="../protocol/protocol-customer-commitment.html?orderId=' + g.orderId + '" target="_blank">客户承诺</a><br />');
		phtml.push('<a href="../protocol/protocol-credit-counseling.html?orderId=' + g.orderId + '" target="_blank">咨询协议</a>');
		$("#protocol").html(phtml.join(''));
	}

	$("#sellerbtn").bind("click",fkSellerBtnUp);

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
		condi.packageMoney=$("#packageMoney").val();//11-17
		condi.fenQiTimes=$("#fenQiTimes").val();//11-17
		
		var result = $("#sellerradio")[0].checked;
		result = result == true ? result : false;
		condi.approveResult = result;
		condi.approveRemarks = $("#approveRemarks").val() || "";

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


});