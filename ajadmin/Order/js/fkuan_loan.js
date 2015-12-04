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
	}

	$("#loanbtn").bind("click",loanBtnUp);

	$('#backid').click(function(){
		window.location.href="fk_index.html";
	});

	function loanBtnUp(id){
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

		var url = Base.serverUrl + "order/loanByOrderId";
		$.ajax({
			url:url,
			data:condi,
			type:"POST",
			dataType:"json",
			context:this,
			success: function(data){
				console.log("loanBtnUp",data);
				var status = data.success || false;
				if(status){
					//sendGetOrderInfoHttp(g.orderId);
					alert("放款完成");
					window.location.href="fkuan_index.html";
				}
				else{
					var msg = data.message || "放款失败";
					Utils.alert(msg);
				}
				g.httpTip.hide();
			},
			error:function(data){
				g.httpTip.hide();
			}
		});
	}
function sendGetOrderInfoHttp(orderId){
		var url = Base.serverUrl + "order/queryOrdersByOrderIdController";
		var condi = {};
		condi.login_token = g.login_token;
		condi.orderId = orderId;

		g.httpTip.show();
		$.ajax({
			url:url,
			data:condi,
			type:"POST",
			dataType:"json",
			context:this,
			success: function(data){
				console.log("sendGetOrderInfoHttp",data);
				var status = data.success || false;
				if(status){
					var info = JSON.stringify(data);
					Utils.offLineStore.set("userorderinfo_detail",info,false);
					//changeOrderInfoHtml(data);
				}
				else{
					//var msg = data.error || "";
					var msg = data.message || "获取订单信息失败";
					//alert(msg);
				}
				g.httpTip.hide();
			},
			error:function(data){
				g.httpTip.hide();
			}
		});
	}
	

});