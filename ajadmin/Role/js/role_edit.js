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
	g.roleId = Utils.getQueryString("roleId") || "";
	g.httpTip = new Utils.httpTip({});


	//验证登录状态
	var loginStatus = Utils.getUserInfo();
	if(!loginStatus){
		//未登录
		//location.replace("/login.html");
		//window.parent.location.href = "../Public/login.html";
	}
	else{
		//获取详情
		sendGetInfoById();

		//获取页面分类信息
		//sendGetNavigationKeyHttp();

		//$("#roleId").val(g.roleId);
		//$("#login_token").val(g.login_token);
		//$("#createBy").val(g.usersId);
		//$("#createByName").val(g.usersName);
	}

	//获取图形验证码
	//sendGetImgCodeHttp();

	//g.httpTip.show();

	$("#editbtn").bind("click",validForm);


	$('#backid').click(function(){
		window.location.href="role_list.html";
	});

	function validForm(){
		if(!validNoEmpty("roleName")){
			layer.msg('角色名称不能为空');
			return false;
		}

		sendEditRoleHttp();
	}

	function validNoEmpty(id){
		var b = false;
		var txt = $("#" + id).val() || "";
		if(txt !== ""){
			b = true;
		}
		return b;
	}


	function sendGetNavigationKeyHttp(){
		g.httpTip.show();
		var url = Base.serverUrl + "bannerImage/getNavigationKey";
		var condi = {};
		$.ajax({
			url:url,
			data:condi,
			type:"POST",
			dataType:"json",
			context:this,
			success: function(data){
				console.log("sendGetNavigationKeyHttp",data);
				var status = data.success || false;
				if(status){
					changeSelectHtml(data);


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
		var data = obj.obj || {};
		var option = [];
		for(var k in data){
			var name = data[k];
			option.push('<option value="' + k + '">' + name + '</option>');
		}
		$("#navigationKey").html(option.join(''));
	}

	function sendGetInfoById(){
		var roleId = g.roleId;
		g.httpTip.show();
		var url = Base.serverUrl + "role/queryRoleById";
		var condi = {};
		condi.login_token = g.login_token;
		condi.roleId = roleId;
		$.ajax({
			url:url,
			data:condi,
			type:"POST",
			dataType:"json",
			context:this,
			success: function(data){
				console.log("sendGetInfoById",data);
				var status = data.success || false;
				if(status){
					changeInfoHtml(data);
				}
				else{
					var msg = data.message || "获取轮播图数据失败";
					Utils.alert(msg);
				}
				g.httpTip.hide();
			},
			error:function(data){
				g.httpTip.hide();
			}
		});
	}

	function changeInfoHtml(data){
		var obj = data.obj || "";
		var roleId = obj.roleId || "";
		var roleName = obj.roleName || "";
		var description = obj.description || "";
		var createTime = obj.createTime || "";

		$("#roleName").val(roleName);
		$("#description").val(description);
	}

	function sendEditRoleHttp(){
		var condi = {};
		condi.login_token = g.login_token;
		condi.roleId = g.roleId;
		condi.roleName = $("#roleName").val();
		condi.description = $("#description").val();

		g.httpTip.show();
		var url = Base.serverUrl + "role/updateRole";
		$.ajax({
			url:url,
			data:condi,
			type:"POST",
			dataType:"json",
			context:this,
			success: function(data){
				console.log("sendEditRoleHttp",data);
				var status = data.success || false;
				if(status){
					Utils.alert("角色修改成功");
					setTimeout(function(){
						window.location.href="role_list.html";
					},1000);
				}
				else{
					var msg = data.message || "修改角色失败";
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