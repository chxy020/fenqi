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


	//验证登录状态
	var loginStatus = Utils.getUserInfo();
	if(!loginStatus){
		//未登录
		//location.replace("/login.html");
		//window.parent.location.href = "../Public/login.html";
	}
	else{
		//获取页面分类信息
		//sendGetNavigationKeyHttp();

		$("#login_token").val(g.login_token);
		//$("#createBy").val(g.usersId);
		//$("#createByName").val(g.usersName);
	}

	//获取图形验证码
	//sendGetImgCodeHttp();

	//g.httpTip.show();

	$("#addbtn").bind("click",validForm);



	$('#backid').click(function(){
		window.location.href="index.html";
	});

	function validForm(){
		if(!validNoEmpty("roleName")){
			layer.msg('角色名称不能为空');
			return false;
		}

		sendAddRoleHttp();
	}

	function validNoEmpty(id){
		var b = false;
		var txt = $("#" + id).val() || "";
		if(txt !== ""){
			b = true;
		}
		return b;
	}


	function sendAddRoleHttp(){
		var condi = {};
		condi.login_token = g.login_token;
		condi.roleName = $("#roleName").val();
		condi.description = $("#description").val();

		g.httpTip.show();
		var url = Base.serverUrl + "role/addRole";
		$.ajax({
			url:url,
			data:condi,
			type:"POST",
			dataType:"json",
			context:this,
			success: function(data){
				console.log("sendAddRoleHttp",data);
				var status = data.success || false;
				if(status){
					Utils.alert("角色添加成功");
					$("#roleName").val("");
					$("#description").val("");
				}
				else{
					var msg = data.message || "添加角色失败";
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