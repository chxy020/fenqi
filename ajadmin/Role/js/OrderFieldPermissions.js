/**
 * author:hmgx
 * data:2016-1-6
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

	g.checkedRoleId = ""; //保存选择的角色编号

	g.totalPage = 1;
	g.currentPage = 1;
	g.pageSize = 5;

	//验证登录状态
	var loginStatus = Utils.getUserInfo();
	if(!loginStatus){
		alert("未登陆");
	}else{
		sendQueryRoleListHttp();//获取角色列表
		$("#savebtn").bind("click",saveBtnUp); //保存按钮事件
	}

	//*************************************获取角色列表
	function sendQueryRoleListHttp(){
		g.httpTip.show();
		var url = Base.serverUrl + "role/queryAllRole";
		var condi = {};
		condi.login_token = g.login_token;
		$.ajax({
			url:url,data:condi,type:"POST",dataType:"json",context:this,
			success: function(data){
				var status = data.success || false;
				if(status){
					changeListHtml(data);
				}else{
					var msg = data.message || "获取角色数据失败！";
					Utils.alert(msg);
				}
				g.httpTip.hide();
			},
			error:function(data){
				g.httpTip.hide();
			}
		});
	}
	function changeListHtml(data){
		var html = [];
		html.push('<table class="table table-bordered table-hover definewidth m10" ><thead>');
		html.push('<tr>');
		html.push('<th>选择</th>');
		html.push('<th>角色名称</th>');
		html.push('<th>角色描述</th>');
		html.push('</tr>');

		var obj = data.list || [];
		for(var i = 0,len = obj.length; i < len; i++){
			var d = obj[i];
			var deleted = d.deleted || 0;
			if(deleted === 1){
				continue;
			}
			var roleId = d.roleId || "";
			var roleName = d.roleName || "";
			var description = d.description || "";
			var createTime = d.createTime || "";

			html.push('<tr>');
			html.push('<td><input id="'+ roleId + '" type="radio" name="role" /></td>');
			html.push('<td>' + roleName + '</td>');
			html.push('<td>' + description + '</td>');
			html.push('</tr>');
		}
		html.push('</table>');
		var pobj = data.obj || {};
		if(obj.length > 0){
			//var page = countListPage(pobj);
			//html.push(page);
		}else{
			Utils.alert("没有角色数据");
		}
		$("#list").html(html.join(''));
		$("input[name='role']").bind("change",roleClick);
	}

	//*************************************获取角色字段权限
	function roleClick(evt){
		var id = this.id;
		g.checkedRoleId = id;
		ReadRoleFild(id);
	}
	function ReadRoleFild(id){
		g.httpTip.show();
		var url = Base.serverUrl + "orderRole/queryOrderRolesByRoleId";
		var condi = {};
		condi.login_token = g.login_token;
		condi.roleId = id;
		$.ajax({
			url:url,data:condi,type:"POST",dataType:"json",context:this,
			success: function(data){
				var status = data.success || false;
				if(status){
					var fieldArr = data.list;
					var html = [];
					html.push('<table class="table table-bordered table-hover definewidth m10" ><thead>');
					html.push('<tr>');
					html.push('<th>字段名称</th>');
					html.push('<th>权限</th>');
					html.push('</tr>');
					for(var i= 0 ; i < fieldArr.length ; i++ ){
						html.push('<tr>');
						html.push('<td>' + fieldArr[i].orderColumnName + '</td>');
						html.push('<td><input type="checkbox" id="' +  fieldArr[i].orderColumn + '" ' + (fieldArr[i].permission =="1"?"checked":"") + '></td>');
						html.push('</tr>');
					}
					html.push('</table>');
					$(".NullClass").height($(document).height() - 40);
					$("#FieldDiv").html(html.join(''));
				}else{
					var msg = data.message || "获取角色权限字段明细错误！";
					Utils.alert(msg);
				}
				g.httpTip.hide();
			},
			error:function(data){
				g.httpTip.hide();
			}
		});
	}

	//*************************************保存数据
	function saveBtnUp(){
		if(g.checkedRoleId == ""){
			Utils.alert("请选择选择需要设置的角色!");
			return false;
		}
		var fieldNames = "";
		$('input[type="checkbox"]:checked').each(function(){
			if(fieldNames == ""){
				fieldNames = $(this).attr("id");
			}else {
				fieldNames += ',' + $(this).attr("id");
			}
		});
		g.httpTip.show();
		var url = Base.serverUrl + "orderRole/insertOrderRolesByRoleId";
		var condi = {};
		condi.login_token = g.login_token;
		condi.roleId = g.checkedRoleId;
		condi.orderColumns = fieldNames;
		$.ajax({
			url:url,data:condi,type:"POST",dataType:"json",context:this,
			success: function(data){
				var status = data.success || false;
				if(status){
					Utils.alert(data.message);
				}else{
					var msg = data.message || "保存字段权限数据失败！";
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