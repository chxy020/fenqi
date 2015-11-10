/**
 * file:登录
 * author:chenxy
*/

//页面初始化
$(function(){
	var g = {};
	g.codeId = "";
	g.tout = null;
	g.httpTip = new Utils.httpTip({});

	//var userPhone = Utils.offLineStore.get("userphone_login",true) || "";
	//$("#inputphone").val(userPhone);

	//$("#inputphone").bind("blur",validPhone);
	//$("#inputpwd").bind("keyword",validPwd);
	$("#inputpwd").bind("keydown",keyWordUp);
	$("#loginbtn").bind("click",loginBtnUp);
	//找回密码
	//$("#findpwd").bind("click",findPwdPage);


	//验证手机号
	function validPhone(){
		var phone = $("#inputphone").val() || "";
		var reg = /^1[3,5,7,8]\d{9}$/g;
		if(phone !== ""){
			if(!reg.test(phone)){
				Utils.alert("用户名/手机号输入错误");
				$("#inputphone").focus();
			}
		}
	}

	//验证密码6-16
	function validPwd(){
		var pwd = $("#inputpwd").val() || "";
		if((pwd.length < 6 || pwd.length > 16) && pwd !== ""){
			Utils.alert("密码输入错误");
			$("#inputpwd").focus();
		}
	}

	function keyWordUp(evt){
		if(evt.keyCode == 13){
			loginBtnUp();
		}
	}

	function loginBtnUp(evt){
		var phone = $("#inputphone").val() || "";
		var pwd = $("#inputpwd").val() || "";
		//var code = $("#inputCode3").val() || "";
		if(phone !== ""){
			if(pwd !== ""){
				var condi = {};
				condi.usersPhone = phone;
				condi.password = pwd;
				sendLoginHttp(condi);
			}
			else{
				Utils.alert("请输入密码");
				$("#inputpwd").focus();
			}
		}
		else{
			Utils.alert("请输入手机号");
			$("#inputphone").focus();
		}
	}

	function sendLoginHttp(condi){
		var url = Base.serverUrl + "user/UsersLoginController";
		g.httpTip.show();
		$.ajax({
			url:url,
			data:condi,
			type:"POST",
			dataType:"json",
			context:this,
			success: function(data){
				console.log("sendLoginHttp",data);
				var status = data.success || false;
				if(status){
					var userInfo = data.obj || "";
					if(userInfo !== ""){
						Utils.offLineStore.set("user_phoneNumber",userInfo.usersPhone,false);
						Utils.offLineStore.set("user_usersName",userInfo.usersName,false);
						Utils.offLineStore.set("user_usersId",userInfo.usersId,false);
						Utils.offLineStore.set("user_roleId",userInfo.roleId,false);

						userInfo = JSON.stringify(userInfo);
						//保存用户数据
						Utils.offLineStore.set("userinfo_admin",userInfo,false);
						var token = data.token || "";

						Utils.offLineStore.set("token",token,false);
						location.href = "../index.html";
					}
				}
				else{
					//var msg = data.error || "";
					var msg = data.message || "登录失败";
					alert(msg);
					//getImgCode();
				}
				g.httpTip.hide();
			},
			error:function(data){
				g.httpTip.hide();
			}
		});
	}







});