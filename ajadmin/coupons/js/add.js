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

	//g.orderId = Utils.getQueryString("orderId") || "";
	g.login_token = Utils.offLineStore.get("token",false) || "";
	g.phoneNumber = Utils.offLineStore.get("user_phoneNumber",false) || "";
	g.usersId = Utils.offLineStore.get("user_usersId",false) || "";
	g.usersName = Utils.offLineStore.get("user_usersName",false) || "";

	g.httpTip = new Utils.httpTip({});

	g.codeImg = $("#imgcodebtn")[0];
	g.guid = Utils.getGuid();

	//验证登录状态
	var loginStatus = Utils.getUserInfo();
	if(!loginStatus){
		//未登录
		//location.replace("/login.html");
		//window.parent.location.href = "../Public/login.html";
	}
	else{
		//获取页面分类信息

	}

	if(typeof eui !== "undefined"){
		eui.calendar({
			startYear: 1900,
			input: document.getElementById('beginDate'),
			id:"beginDate"
		});
		eui.calendar({
			startYear: 1900,
			input: document.getElementById('endDate'),
			id:"endDate"
		});
		eui.calendar({
			startYear: 1900,
			input: document.getElementById('expiryDate'),
			id:"expiryDate"
		});
	}
	//获取图形验证码
	//sendGetImgCodeHttp();

	//g.httpTip.show();

	//$("#addform").bind("submit",validForm);
	$("#regbtn").bind("click",regUser);	

	function regUser(evt){
		var title = $("#title").val() || "";
		var summary = $("#summary").val() || "";
		var money = $("#money").val() || "";
		var useLeastMoney = $("#useLeastMoney").val() || "";
		var beginDate = $("#beginDate").val() || "";
		var endDate = $("#endDate").val() || "";
		var expiryDate = $("#expiryDate").val() || "";
			if(title !== ""){
				if(money !== ""){
					if(useLeastMoney !== ""){
						var condi = {};
						condi.login_token = g.login_token;
						condi.title = title;
						condi.summary = summary;
						condi.money = money;
						condi.useLeastMoney = useLeastMoney;
						condi.beginDate = beginDate;
						condi.endDate = endDate;
						condi.expiryDate = expiryDate;
						sendRegHttp(condi);

					}
					else{
						Utils.alert("请输入最低消费金额");
						$("#useLeastMoney").focus();
					}
				}
				else{
					Utils.alert("请输入金额");
					$("#money").focus();
				}
			}
			else{
				Utils.alert("请输入活动名称");
				$("#title").focus();
			}
	}
	function sendRegHttp(condi){
		var url = Base.serverUrl + "coupon/addCoupon";
		g.httpTip.show();
		$.ajax({
			url:url,
			type:"POST",
			data:condi,
			dataType:"json",
			context:this,
			success: function(data){
				//console.log("sendRegHttp",data);
				var status = data.success || false;
				if(status){
					Utils.alert("优惠券添加成功");
				}
				else{
					var msg = data.message || "优惠券提交失败";
					alert(msg);

				}
				g.httpTip.hide();
			},
			error:function(data){
				g.httpTip.hide();
			}
		});
	}
	

	$('#backid').click(function(){
		window.location.href="index.html";
	});

/* 	function validForm(){
		var url = Base.serverUrl + "coupon/addCoupon";
		$("#addform").attr("action",url);
		return true;
	} */


});