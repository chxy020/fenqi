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

	var userPhone = Utils.offLineStore.get("userphone_login",true) || "";
	$("#inputphone").val(userPhone);

	$("#inputphone").bind("blur",validPhone);
	$("#inputpwd").bind("blur",validPwd);
	$("#loginbtn").bind("click",loginBtnUp);
	$(document).keydown(function(e){
		var keycode=e.keyCode || e.which || e.charCode;
		if(keycode == 13){
			loginBtnUp();
		}
	});	
	//找回密码
	//$("#findpwd").bind("click",findPwdPage);
	/* 接收页面参数 */
	function GetRequest() { 
		var url = location.search; //获取url中"?"符后的字串
	   var theRequest = [];
	   if (url.indexOf("?") != -1) {
		  var str = url.substr(1);
		  strs = str.split("&");
		  for(var i = 0; i < strs.length; i ++) {
			 theRequest[strs[i].split("=")[0]]=(strs[i].split("=")[1]);
		  }
	   }
	   return theRequest;
	}
	//验证手机号
	function validPhone(){
		var phone = $("#inputphone").val() || "";
		var reg = /^1[3,4,5,7,8]\d{9}$/g;
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
			//$("#inputpwd").focus();
		}
	}


	function loginBtnUp(evt){
		var phone = $("#inputphone").val() || "";
		var pwd = $("#inputpwd").val() || "";
		//var code = $("#inputCode3").val() || "";
		if(phone !== ""){
			if(pwd !== ""){
				var savePhone = $("#chkphone")[0].checked;
				if(savePhone){
					Utils.offLineStore.set("userphone_login",phone,true);
				}
				var condi = {};
				condi.phone_number = phone;
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
		var url = Base.serverUrl + "user/CustomerLoginController";
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
						userInfo = JSON.stringify(userInfo);
						//保存用户数据
						Utils.offLineStore.set("userinfo",userInfo,false);
						var token = data.token || "";
						Utils.offLineStore.remove("weiyue_message",false);
						Utils.offLineStore.set("token",token,false);
						var compare=GetRequest().p;						
						if(compare==1){location.href = "/anjia/mystaging.html"}
						else if(compare=="langrun"){location.href = "/anjia/langrun_1212.html";}
						else if(compare=="shenghuojia"){location.href = "/anjia/shenghuojia_1212.html";}
						else{location.href = "/anjia/usercenter.html";}
					}
					//location.href = "center.html";
					//var token = data.result.token || "";
					//Utils.offLineStore.set("token",token,false);
					//location.href = "center.html?token=" + token + "&p=0";
				}
				else{
					//var msg = data.error || "";
					var msg = data.message || "登录失败";
					Utils.alert(msg);
					//getImgCode();
				}
				g.httpTip.hide();
			},
			error:function(data){
				g.httpTip.hide();
			}
		});
	}















	function findPwdPage(){
		location.href = "/anjia/findpwd.html";
	}

	setTimeout(function(){
		getImgCode();
	},2000);
	//换一组图片
	function getImgCode(evt){
		var userName = $("#inputEmail3").val() || "";
		if(userName !== ""){
			g.codeId = userName;
			//console.log(g.codeId);
			$("#updatecodebtn").attr("src",Base.imgCodeUrl + "?id=" + g.codeId + "&t=" + (new Date() - 0));
			clearTimeout(g.tout);
			g.tout = setTimeout(function(){
				getImgCode();
			},60000);
		}
	}

	//重置信息
	function resetRegInfo(evt){
		$("#inputEmail3").val("");
		$("#inputPassword3").val("");
		$("#inputPhone3").val("");
		$("#inputImgCode3").val("");
		$("#inputCode3").val("");
		$("#password").val("");
	}

	function codeKeyDown(evt){
		evt = evt || event;
		if(evt.keyCode == 13){
			//
			$("#loginbtn").trigger("click");
		}
	}

	//打开注册用户页面
	function openRegPage(evt){
		window.open("/anjia/reg.html");
	}
});