/**
 * file:登录
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
	var loginStatus = Utils.getUserInfo();
	if(!loginStatus){
		//未登录
		//location.replace("/login.html");
		//window.parent.location.href = "../Public/login.html";
	}
	else{
		//获取公司信息
		sendGetCompanyInfoHttp();
	}

	//获取图形验证码
	//sendGetImgCodeHttp();

	//g.httpTip.show();

	$("#inputphone").bind("blur",validPhone);
	$("#inputpwd").bind("blur",validPwd);
	$("#inputcpwd").bind("blur",validCPwd);

	$("#regbtn").bind("click",regUser);

	$('#backid').click(function(){
		window.location.href="index.html";
	});

	function sendGetCompanyInfoHttp(){
		g.httpTip.show();
		var url = Base.serverUrl + "order/queryCompanyController";
		var condi = {};
		$.ajax({
			url:url,
			data:condi,
			type:"POST",
			dataType:"json",
			context:this,
			success: function(data){
				console.log("sendGetCompanyInfoHttp",data);
				var status = data.success || false;
				if(status){
					var obj = data.list || [];
					changeSelectHtml(obj);
				}
				else{
					var msg = data.message || "获取公司信息字典数据失败";
					Utils.alert(msg);
				}
				g.httpTip.hide();
			},
			error:function(data){
				g.httpTip.hide();
			}
		});
	}

	function changeSelectHtml(obj){
		var data = obj || {};
		var option = [];
		for(var i = 0,len = data.length; i < len; i++){
			var d = data[i];
			var id = d.companyId || "";
			//var cid = d.companyId || "";
			var name = d.companyName || "";
			var deleted = d.deleted;
			if(deleted == 0){
				//id = id + "_" + cid;
				option.push('<option value="' + id + '">' + name + '</option>');
			}
		}
		$("#company").html(option.join(''));
	}


	//验证手机号
	function validPhone(){
		var phone = $("#inputphone").val() || "";
		var reg = /^1[3,5,7,8]\d{9}$/g;
		if(phone !== ""){
			if(!reg.test(phone)){
				Utils.alert("手机号输入错误");
				$("#inputphone").focus();
			}
		}
	}

	//验证密码6-16
	function validPwd(){
		var pwd = $("#inputpwd").val() || "";
		if((pwd.length < 6 || pwd.length > 16) && pwd !== ""){
			Utils.alert("密码输入错误:请输入字符6-16位");
			$("#inputpwd").focus();
		}
	}

	function validCPwd(){
		var pwd = $("#inputcpwd").val() || "";
		if((pwd.length < 6 || pwd.length > 16) && pwd !== ""){
			Utils.alert("确认密码输入错误:请输入字符6-16位");
			$("#inputcpwd").focus();
		}
		else{
			var pwd1 = $("#inputpwd").val() || "";
			if(pwd !== pwd1){
				Utils.alert("两次密码输入不一致.");
				//$("#inputcpwd").focus();
			}
		}
	}



	//注册
	function regUser(evt){
		var phone = $("#inputphone").val() || "";
		var reg = /^1[3,5,7,8]\d{9}$/g;
		if(phone !== ""){
			if(reg.test(phone)){
				var pwd1 = $("#inputpwd").val() || "";
				var pwd2 = $("#inputcpwd").val() || "";
				if(pwd1 !== ""){
					if(pwd2 !== ""){
						if(pwd1 === pwd2){
							var usersName = $("#usersName").val() || "";
							if(usersName !== ""){
								var companyId = $("#company").val() || "";
								var condi = {};
								condi.login_token = g.login_token;
								condi.usersPhone = phone;
								condi.password = pwd2;
								condi.usersName = usersName;
								condi.companyId = companyId;
								condi.sex = "100101";
								sendRegHttp(condi);

							}
							else{
								Utils.alert("请输入真实姓名");
								$("#usersName").focus();
							}
						}
						else{
							Utils.alert("两次密码输入不一致");
							$("#inputcpwd").val("");
							$("#inputcpwd").focus();
						}
					}
					else{
						Utils.alert("请输入确认密码");
						$("#inputcpwd").focus();
					}
				}
				else{
					Utils.alert("请输入密码");
					$("#inputpwd").focus();
				}
			}
			else{
				Utils.alert("手机号输入错误");
				$("#inputphone").focus();
			}
		}
		else{
			Utils.alert("请输入手机号");
			$("#inputphone").focus();
		}
	}

	//注册
	function sendRegHttp(condi){
		var url = Base.serverUrl + "user/registerUsersController";
		g.httpTip.show();
		$.ajax({
			url:url,
			type:"POST",
			data:condi,
			dataType:"json",
			context:this,
			success: function(data){
				console.log("sendRegHttp",data);
				var status = data.success || false;
				if(status){
					Utils.alert("账户添加成功");
				}
				else{
					var msg = data.message || "手机号注册失败";
					alert(msg);

				}
				g.httpTip.hide();
			},
			error:function(data){
				g.httpTip.hide();
			}
		});
	}

	//进入个人中心
	function gotoUserCenter(){
		location.href = "/anjia/usercenter.html";
	}








});