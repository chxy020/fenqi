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
	g.login_token = Utils.offLineStore.get("token",false) || "";
	g.httpTip = new Utils.httpTip({});

	g.authorityId = "";

	g.totalPage = 1;
	g.currentPage = 1;
	g.pageSize = 5;

	g.navigationKeyObj = {};



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
		sendQueryListHttp();
	}

	$("#addbtn").bind("click",addMenu);
	$("#deletebtn").bind("click",deleteMenuById);
	$("#editbtn").bind("click",editMenuById);



	//var data ={"success":true,"obj":{"authorityId":"20151103000001","parentId":null,"authorityName":"燕子安家后台管理系统菜单","description":null,"authorityType":"102201","authorityTypeDesc":"菜单","authorityUrl":null,"authoritySystem":"102301","authoritySystemDesc":"系统管理","createTime":"2015-11-03","deleted":0,"childrenAuthority":[{"authorityId":"20151103000002","parentId":"20151103000001","authorityName":"订单管理","description":null,"authorityType":"102201","authorityTypeDesc":"菜单","authorityUrl":null,"authoritySystem":"102301","authoritySystemDesc":"系统管理","createTime":"2015-11-08","deleted":0,"childrenAuthority":[{"authorityId":"20151103000003","parentId":"20151103000002","authorityName":"订单查询","description":null,"authorityType":"102201","authorityTypeDesc":"菜单","authorityUrl":"http://123.57.95.154/ajadmin/Order/orderquery.html","authoritySystem":"102301","authoritySystemDesc":"系统管理","createTime":"2015-11-08","deleted":0,"childrenAuthority":[]},{"authorityId":"20151103000004","parentId":"20151103000002","authorityName":"订单新增","description":null,"authorityType":"102201","authorityTypeDesc":"菜单","authorityUrl":"http://123.57.95.154/ajadmin/Order/orderquery.html","authoritySystem":"102301","authoritySystemDesc":"系统管理","createTime":"2015-11-08","deleted":0,"childrenAuthority":[]}]}]},"list":[],"message":null,"code":null,"token":null};

	/**
		Tree 设置必备(单选)
	**/
	var setting = {
		view: {
			selectedMulti: false
		},
		check: {
			enable: true,
			chkStyle: "radio",
			radioType: "all"
		},
		data: {
			simpleData: {
				enable: true
			}
		},
		callback: {
			beforeCheck: beforeCheck,
			onCheck: onCheck
		}
	};

	/**
		解析数据
	**/
	var format = {
		format_children:function(__data){
			var arr = new Array();
			for (var i = 0; i<__data.length ; i++) {
				var obj ={id:null,name:null,children:[]};
				obj["id"]=__data[i].authorityId;
				obj["name"]=__data[i].authorityName;
				obj["authorityId"]=__data[i].authorityId;
				obj["parentId"]=__data[i].parentId;
				obj["description"]=__data[i].description;
				obj["authorityUrl"] = __data[i].authorityUrl;
				obj["authorityType"] = __data[i].authorityType;
				obj["authoritySystem"] = __data[i].authoritySystem;
				obj["children"]=this.format_children(__data[i].childrenAuthority);
				obj["open"]=true;
				arr.push(obj);
			};
			return arr;
		},
		init:function(data){
			if (data.success) {
				var _data = [{open:true,id:data.obj["authorityId"],name:data.obj["authorityName"],parentId:data.obj["authorityName"],authorityUrl:data.obj["authorityUrl"]}];
				_data[0].children = this.format_children(data.obj.childrenAuthority);
				return _data;
			}else{
				alert("菜单数据错误!");
				return null;
			};
		}
	}

	function beforeCheck(treeId, treeNode) {
		return (treeNode.doCheck !== false);
	}
	function onCheck(e, treeId, treeNode) {
		console.log("treeNode",treeNode);
		var parentTId = treeNode.id || "";
		var name = treeNode.name || "";
		if(parentTId !== ""){
			$("#parentTId").val(parentTId);
			$("#parentname").val(name);
		}
		g.authorityId = treeNode.authorityId || "";
		var name = treeNode.name || "";
		var description = treeNode.description || "";
		var authorityUrl = treeNode.authorityUrl || "";
		$("#authorityName2").val(name);
		$("#description2").val(description);
		$("#authorityUrl2").val(authorityUrl);
	}


	function addMenu(){
		var parentId = $("#parentTId").val() || "";
		var authorityName = $("#authorityName").val() || "";
		var description = $("#description").val() || "";
		var authorityUrl = $("#authorityUrl").val() || "";
		var condi = {};
		condi.parentId = parentId == "" ? null : parentId;
		condi.authorityName = authorityName;
		condi.description = description;
		condi.authorityUrl = authorityUrl;
		condi.authorityType = "102201";
		condi.authoritySystem = "102301";
		sendAddMenuHttp(condi);
	}



	function sendAddMenuHttp(condi){
		g.httpTip.show();
		var url = Base.serverUrl + "authority/insertAuthority";
		$.ajax({
			url:url,
			data:condi,
			type:"POST",
			dataType:"json",
			context:this,
			success: function(data){
				console.log("sendAddMenuHttp",data);
				var status = data.success || false;
				if(status){
					sendQueryListHttp();

					$("#parentTId").val("");
					$("#authorityName").val("");
					$("#description").val("");
					$("#authorityUrl").val("");
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


	function deleteMenuById(){
		var msg = "你确认删除该菜单吗?";
		if(confirm(msg)){
			g.httpTip.show();
			var condi = {};
			condi.authorityId = g.authorityId;
			condi.login_token = g.login_token;

			var url = Base.serverUrl + "authority/deleteAuthority";
			$.ajax({
				url:url,
				data:condi,
				type:"POST",
				dataType:"json",
				context:this,
				success: function(data){
					console.log("deleteMenuById",data);
					var status = data.success || false;
					if(status){
						Utils.alert("删除菜单成功");
						sendQueryListHttp();
					}
					else{
						var msg = data.message || "删除菜单资源失败";
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



	function editMenuById(){
		var authorityName = $("#authorityName2").val() || "";
		var description = $("#description2").val() || "";
		var authorityUrl = $("#authorityUrl2").val() || "";
		var condi = {};
		condi.authorityId = g.authorityId
		condi.authorityName = authorityName;
		condi.description = description;
		condi.authorityUrl = authorityUrl;
		sendEditMenuHttp(condi);
	}


	function sendEditMenuHttp(condi){
		g.httpTip.show();
		var url = Base.serverUrl + "authority/updateAuthority";
		$.ajax({
			url:url,
			data:condi,
			type:"POST",
			dataType:"json",
			context:this,
			success: function(data){
				console.log("sendEditMenuHttp",data);
				var status = data.success || false;
				if(status){
					Utils.alert("修改菜单成功");
					sendQueryListHttp();

					$("#authorityName2").val("");
					$("#description2").val("");
					$("#authorityUrl2").val("");
				}
				else{
					var msg = data.message || "修改菜单失败";
					Utils.alert(msg);
				}
				g.httpTip.hide();
			},
			error:function(data){
				g.httpTip.hide();
			}
		});
	}






	function queryList(){
		g.currentPage = 1;
		sendQueryListHttp();
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
		g.navigationKeyObj = data;
		var option = [];
		option.push('<option value="">全部</option>');
		for(var k in data){
			var name = data[k];
			option.push('<option value="' + k + '">' + name + '</option>');
		}
		$("#navigationKey").html(option.join(''));
	}


	function sendQueryListHttp(){
		g.httpTip.show();
		var url = Base.serverUrl + "authority/queryAdminMenuTree";
		var condi = {};
		condi.login_token = g.login_token;
		//~ condi.pageSize = g.pageSize;
		//~ condi.currentPageNum = g.currentPage;
		//~ condi.bmTitle = $("#bmTitle").val() || "";
		//~ condi.navigationKey = $("#navigationKey").val() || "";
		//~ condi.usedFlag = $("#usedFlag").val() || "";
		$.ajax({
			url:url,
			data:condi,
			type:"POST",
			dataType:"json",
			context:this,
			success: function(data){
				console.log("sendQueryListHttp",data);
				var status = data.success || false;
				if(status){
					var _data = format.init(data);
					$.fn.zTree.init($("#treeDemo"), setting, _data);
				}
				else{
					var msg = data.message || "获取轮播图列表数据失败";
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
		html.push('<th>角色ID</th>');
		html.push('<th>角色名称</th>');
		html.push('<th>角色描述</th>');
		html.push('<th>添加时间</th>');
		html.push('<th>操作</th>');
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
			html.push('<td>' + roleId + '</td>');
			html.push('<td>' + roleName + '</td>');
			html.push('<td>' + description + '</td>');
			html.push('<td>' + createTime + '</td>');

			html.push('<td><a href="javascript:editItem(\'' + roleId + '\');">编辑</a>&nbsp&nbsp<a href="javascript:deleteItem(\'' + roleId + '\')">删除</a></td>');

			html.push('</tr>');
		}
		html.push('</table>');

		var pobj = data.obj || {};

		if(obj.length > 0){
			//var page = countListPage(pobj);
			//html.push(page);
		}
		else{
			Utils.alert("没有角色数据");
		}

		$("#list").html(html.join(''));

		$("#listpage a").bind("click",pageClick);
	}

	function countListPage(data){
		var html = [];
		g.totalPage = Math.ceil(data.totalRowNum / data.pageSize);
		//g.totalPage = 1;
		//g.currentPage = 1;
		html.push('<div id="listpage" class="inline pull-right page">');
		html.push(data.totalRowNum + ' 条记录' + g.currentPage + '/' + g.totalPage + ' 页');
		html.push('<a href="javascript:void(0);" class="page-next">下一页</a>');

		if(g.totalPage > 10){
			if(g.currentPage >= 10){
				var css = "color: #ff0000;";

				if((g.totalPage - g.currentPage) >= 5){
					html.push('<a href="javascript:void(0)" >' + (g.currentPage - 4) + '</a>');
					html.push('<a href="javascript:void(0)" >' + (g.currentPage - 3) + '</a>');
					html.push('<a href="javascript:void(0)" >' + (g.currentPage - 2) + '</a>');
					html.push('<a href="javascript:void(0)" >' + (g.currentPage - 1) + '</a>');
					html.push('<a href="javascript:void(0)" style="' + css + '">' + (g.currentPage) + '</a>');
				}
				else{
					//末尾少于5页
					var len = 9 - (g.totalPage - g.currentPage);
					for(var j = len; j >= 0; j--){
						if(j == 0){
							html.push('<a href="javascript:void(0)" style="' + css + '">' + (g.currentPage) + '</a>');
						}
						else{
							html.push('<a href="javascript:void(0)" >' + (g.currentPage - j) + '</a>');
						}
					}
				}
				for(var i = 1; i < 6; i++){
					var np = g.currentPage + i;
					if(np <= g.totalPage){
						html.push('<a href="javascript:void(0)" >' + np + '</a>');
					}
					else{
						break;
					}
				}

			}
			else{
				for(var i = 0; i < 10; i++){
					var css = (i + 1) == g.currentPage ? "color: #ff0000;" : "";
					html.push('<a href="javascript:void(0)" style="' + css + '">' + (i + 1) + '</a>');
				}
			}
		}
		else{
			for(var i = 0; i < g.totalPage; i++){
				var css = (i + 1) == g.currentPage ? "color: #ff0000;" : "";
				html.push('<a href="javascript:void(0)" style="' + css + '">' + (i + 1) + '</a>');
			}
		}
		html.push('</div>');

		return html.join('');
	}

	function pageClick(evt){
		var index = $(this).index();
		var text = $(this).text() - 0 || "";
		if(text !== ""){
			if(g.currentPage === text){
				Utils.alert("当前是第" + text + "页");
				return;
			}
			else{
				g.currentPage = text;
			}
		}
		else{
			var cn = $(this)[0].className;
			switch(cn){
				case "page-pre-end":
					//第一页
					if(g.currentPage == 1){
						Utils.alert("当前是第一页");
						return;
					}
					else{
						g.currentPage = 1;
					}
				break;
				case "page-pre":
					//前一页
					if(g.currentPage > 1){
						g.currentPage--;
					}
					else{
						Utils.alert("当前是第一页");
						return;
					}
				break;
				case "page-next":
					//后一页
					g.currentPage++;
				break;
				case "page-next-end":
					//最后一页
					g.currentPage = g.totalPage;
				break;
			}
		}

		if(g.currentPage <= g.totalPage){
			sendQueryListHttp();
		}
		else{
			Utils.alert("当前是最后一页");
		}
	}

	function showImgTip(src){
		layer.open({
			type: 1,
			title: false,
			area:"85%",
			closeBtn: 1,
			shadeClose: true,
			content: '<img src="' + src + '" />'
		});
	}

	function changeBannerUsedFlag(status,bmId){
		var msg = status == 0 ? "你确认停用该轮播图吗?" : "你确认启动该轮播图吗?";
		if(confirm(msg)){
			g.httpTip.show();
			var condi = {};
			condi.bmId = bmId;
			condi.login_token = g.login_token;

			if(status == 1){
				var url = Base.serverUrl + "bannerImage/usedBannerImage";
			}
			else{
				var url = Base.serverUrl + "bannerImage/stopBannerImage";
			}
			$.ajax({
				url:url,
				data:condi,
				type:"POST",
				dataType:"json",
				context:this,
				success: function(data){
					console.log("changeBannerUsedFlag",data);
					var status = data.success || false;
					if(status){
						sendQueryListHttp();
					}
					else{
						var msg = data.message || "启用/停用轮播图失败";
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

	function editItem(roleId){
		location.href = "role_edit.html?roleId=" + roleId;
	}

	function deleteItem(roleId){
		if(confirm("你确认删除该角色吗?")){
			g.httpTip.show();
			var condi = {};
			condi.roleId = roleId;
			condi.login_token = g.login_token;

			var url = Base.serverUrl + "role/deleteRoleById";
			$.ajax({
				url:url,
				data:condi,
				type:"POST",
				dataType:"json",
				context:this,
				success: function(data){
					console.log("deleteItem",data);
					var status = data.success || false;
					if(status){
						sendQueryListHttp();
					}
					else{
						var msg = data.message || "删除角色失败";
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
















	window.showImgTip = showImgTip;
	window.changeBannerUsedFlag = changeBannerUsedFlag;
	window.editItem = editItem;
	window.deleteItem = deleteItem;

});