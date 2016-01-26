/**
 * author:chenxy
*/

//页面初始化
$(function(){
/* 	if(typeof eui !== "undefined"){
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
	} 定义选择时间input*/

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
		//未登录
		//location.replace("/login.html");
		//window.parent.location.href = "../Public/login.html";
	}
	else{
		queryList();
	}	
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
	
	$("#addCoopusbtn").bind("click",addNewPage);
	$("#searchCoopusbtn").bind("click",search_func);
	/* 查询 */
	function search_func(){
		g.user_phone = $("#phone").val() || '';
		g.createTimeBegin = $("#createTimeBegin").val() || '';
		g.createTimeEnd = $("#createTimeEnd").val() || '';
		var condi={};
		//condi.customerPhone = g.user_phone;
		condi.beginDate = g.createTimeBegin;
		condi.endDate = g.createTimeEnd;
		g.currentPage = 1;
		sendQueryListHttp(condi);
	}
	
	
	function addNewPage(){
		location.href = "add.html";
	}

	function queryList(){
		var condi = {};
		g.currentPage = 1;
		sendQueryListHttp(condi);
	}

	function sendQueryListHttp(condi){
		g.httpTip.show();
		var url = Base.serverUrl + "coupon/getAllCoupons";
		condi.login_token = g.login_token;
		condi.pageSize = g.pageSize;
		condi.currentPageNum = g.currentPage;
		/* condi.companyId = $("#companyId").val() || "";
		condi.usersPhone = $("#usersPhone").val() || "";
		condi.usersName = $("#usersName").val() || "";
		condi.createTimeBegin = $("#createTimeBegin").val() || "";
		condi.createTimeEnd = $("#createTimeEnd").val() || ""; */

		$.ajax({
			url:url,//"data.json",
			data:condi,
			type:"POST",
			dataType:"json",
			context:this,
			success: function(data){
				//console.log("sendQueryListHttp",data);
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
		html.push('<th>活动ID</th>');
		html.push('<th>活动名称</th>');
		html.push('<th>活动内容</th>');
		html.push('<th>有效期</th>');
		html.push('<th>开始时间</th>');
		html.push('<th>结束时间</th>');
		html.push('<th>状态</th>');
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
			var id = d.id || "";
			var title = d.title || "";
			var summary = d.summary || "";
			var phoneNumber=d.phoneNumber || "";
			var status = d.status || 0;
			var beginDate = d.beginDate || "";
			var endDate = d.endDate || "";
			var expiryDate = d.expiryDate || "";

			html.push('<tr>');
			html.push('<td>' + id + '</td>');
			html.push('<td>' + title + '</td>');
			html.push('<td>' + summary + '</td>');
			html.push('<td>' + expiryDate + '</td>');
			html.push('<td>' + beginDate + '</td>');
			html.push('<td>' + endDate + '</td>');
			if(status=="102501"){html.push('<td>已上架</td><td><a href="javascript:up_down_state('+id+',102502);">下架</a></td>');}
			else if(status=="102502"){html.push('<td>已下架</td><td><a href="javascript:up_down_state('+id+',102501);">上架</a></td>');}
			else{html.push('<td></td><td></td>');}
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

		$("#companylist").html(html.join(''));

		$("#listpage a").bind("click",pageClick);
	}
	
	function up_down_state(id,status){
		var url = Base.serverUrl + "coupon/shelveOrUnShelveCoupon";
		var condi = {};
		condi.login_token = g.login_token;
		condi.pageSize = g.pageSize;
		condi.currentPageNum = g.currentPage;
		condi.id = id;
		condi.status = status;
		$.ajax({
			url:url,
			data:condi,
			type:"POST",
			dataType:"json",
			context:this,
			success: function(data){
				var status = data.success || false;
				if(status){
					sendQueryListHttp(1);
					Utils.alert("操作成功");					
				}
				else{
					var msg = data.message || "操作失败";
					Utils.alert(msg);
				}
			},
			error:function(data){
			}
		});
		
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

	window.up_down_state = up_down_state;
});