/**
 * author:chenxy
*/

//页面初始化
$(function(){
	if(typeof eui !== "undefined"){
		eui.calendar({
			startYear: 1900,
			input: document.getElementById('createTimeBegin'),
			id:"createTimeBegin"
		});
		eui.calendar({
			startYear: 1900,
			input: document.getElementById('createTimeEnd'),
			id:"createTimeEnd"
		});
	}

	var g = {};
	g.phone = "";
	g.imgCodeId = "";
	g.sendCode = false;
	g.sendTime = 60;
	g.login_token = Utils.offLineStore.get("token",false) || "";
	g.httpTip = new Utils.httpTip({});

	g.totalPage = 1;
	g.currentPage = 1;
	g.pageSize = 10;

	g.companyObj = {};

	//验证登录状态
	var loginStatus = Utils.getUserInfo();
	if(!loginStatus){

	}else{
		sendGetCompanyInfoHttp();
	}

	$("#querybtn").bind("click",queryList);
	$("#addnew").bind("click",addNewPage);

	function addNewPage(){
		location.href = "add.html";
	}

	function queryList(){
		g.currentPage = 1;
		sendQueryListHttp();
	}

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
				//console.log("sendGetCompanyInfoHttp",data);
				var status = data.success || false;
				if(status){
					var obj = data.list || [];
					changeSelectHtml(obj);

					queryList();
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
		option.push('<option value="">全部</option>');
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

			g.companyObj[id] = name;
		}
		$("#companyId").html(option.join(''));
	}


	function sendQueryListHttp(){
		g.httpTip.show();
		var url = Base.serverUrl + "user/queryUsersController";
		var condi = {};
		condi.login_token = g.login_token;
		condi.pageSize = g.pageSize;
		condi.currentPageNum = g.currentPage;
		condi.companyId = $("#companyId").val() || "";
		condi.usersPhone = $("#usersPhone").val() || "";
		condi.usersName = $("#usersName").val() || "";
		condi.createTimeBegin = $("#createTimeBegin").val() || "";
		condi.createTimeEnd = $("#createTimeEnd").val() || "";
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
					changeListHtml(data);
				}
				else{
					var msg = data.message || "获取后台账户列表数据失败";
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
		html.push('<th>手机号码</th>');
		html.push('<th>真实名称</th>');
		html.push('<th>所属公司</th>');

		html.push('<th>状态</th>');
		html.push('<th>登录次数</th>');
		html.push('<th>最后登录日期</th>');
		html.push('<th>注册日期</th>');
		html.push('<th>操作</th>');
		html.push('</tr>');

		var obj = data.list || [];
		for(var i = 0,len = obj.length; i < len; i++){
			var d = obj[i];

			var deleted = d.deleted || 0;
			var deletedtext = deleted === 0 ? "正常" : "已删除";
			if(deleted === 1){
				//continue;
			}
			var usersId = d.usersId || "";
			var usersPhone = d.usersPhone || "";
			var usersName = d.usersName || "";
			var companyId = d.companyId || "";
			companyName = g.companyObj[companyId] || "";

			var loginTimes = d.loginTimes || 0;
			var lastLoginTime = d.lastLoginTime || "";
			var createTime = d.createTime || "";

			html.push('<tr>');
			html.push('<td>' + usersPhone + '</td>');
			html.push('<td>' + usersName + '</td>');
			html.push('<td>' + companyName + '</td>');

			html.push('<td>' + deletedtext + '</td>');
			html.push('<td>' + loginTimes + '</td>');
			html.push('<td>' + lastLoginTime + '</td>');
			html.push('<td>' + createTime + '</td>');

			if(deleted === 1){
				html.push('<td></td>');
			}
			else{
				html.push('<td><a href="javascript:deleteItem(\'' + usersId + '\')">删除</a>&nbsp;&nbsp;<a href="javascript:resetPassword(\'' + usersId + '\')">重置</a> &nbsp;&nbsp;<a href="edit.html?usersId=' + usersId + '">编辑</a></td>');
			}

			html.push('</tr>');
		}
		html.push('</table>');

		var pobj = data.obj || {};

		if(obj.length > 0){
			var page = countListPage(pobj);
			html.push(page);
		}
		else{
			layer.msg("没有后台账户数据");
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
					//console.log("changeBannerUsedFlag",data);
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

	function editItem(bmId){
		location.href = "edit.html?bmId=" + bmId;
	}

	function deleteItem(usersId){
		if(confirm("你确认删除该用户吗?")){
			g.httpTip.show();
			var condi = {};
			condi.usersId = usersId;
			condi.login_token = g.login_token;
			var url = Base.serverUrl + "user/deleteUsersByUsersIdController";
			$.ajax({
				url:url,data:condi,type:"POST",dataType:"json",context:this,
				success: function(data){
					//console.log("deleteItem",data);
					var status = data.success || false;
					if(status){
						sendQueryListHttp();
						Utils.alert("删除成功");
					}else{
						var msg = data.message || "删除账户数据失败";
						layer.msg(msg);
					}
					g.httpTip.hide();
				},
				error:function(data){
					g.httpTip.hide();
				}
			});
		}
	}
	window.resetPassword = function(usersId){
		if(confirm("你确认要重置该用户的密码?")){
			g.httpTip.show();
			var condi = {};
			condi.usersId = usersId;
			condi.login_token = g.login_token;
			var url = Base.serverUrl + "user/resetPassword";
			$.ajax({
				url:url,data:condi,type:"POST",dataType:"json",context:this,
				success: function(data){
					//console.log("|",data);
					var status = data.success || false;
					if(status){
						layer.msg( "密码重置成功，新密码为[123456]!");
					}else{
						layer.msg( data.message);
					}
					g.httpTip.hide();
				},
				error:function(data){
					g.httpTip.hide();
				}
			});
		}
	};

	window.showImgTip = showImgTip;
	window.changeBannerUsedFlag = changeBannerUsedFlag;
	window.editItem = editItem;
	window.deleteItem = deleteItem;

});