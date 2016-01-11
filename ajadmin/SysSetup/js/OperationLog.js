/**
 * author:hmgx
 * date:2015-12-15
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
	g.functionArr = {};

	g.totalPage = 1;
	g.currentPage = 1;
	g.pageSize = 15;

	//加载订单方法
	//$.getScript("js/OrderFunction.js").done(function() {}).fail(function() {Utils.alert("@_@加载订单状态方法失败<br>请检查！");});

	//验证登录状态
	var loginStatus = Utils.getUserInfo();
	if(!loginStatus){
		//未登录
		//location.replace("/login.html");
		//window.parent.location.href = "../Public/login.html";
	}else{
		sendGetUserInfoDicHttp();
		//获取数据列表
		setTimeout(sendQueryRiskOrderListHttp(),500);
	}

	$("#querybtn").bind("click",queryOrderList);

	function queryOrderList(){
		g.currentPage = 1;
		sendQueryRiskOrderListHttp();
	}


	//获取用户信息字典信息
	function sendGetUserInfoDicHttp(){
		g.httpTip.show();
		var url = Base.serverUrl + "baseCodeController/getBaseCodeByParents";
		var condi = {parents:1027};//只获取模块地址
		$.ajax({
			url:url,data:condi,type:"POST",dataType:"json",context:this,
			success: function(data){
				//console.log("sendGetUserInfoDicHttp",data);
				var status = data.success || false;
				if(status){
					var obj = data.obj || {};
					changeSelectHtml(obj);
				}else{
					var msg = data.message || "获取用户信息字典数据失败";
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
		//console.log(obj);
		var parents = ["1027"];
		var ids = ["function"];
		for(var i = 0,len = parents.length; i < len; i++){
			var data = obj[parents[i]] || {};
			var option = [];
			option.push('<option value="">全部</option>');
			for(var k in data){
				var id = k || "";
				var name = data[k] || "";
				g.functionArr[id] = name;
				//g.functionArr[1] = 2;
				option.push('<option value="' + id + '">' + name + '</option>');
			}
			$("#" + ids[i]).html(option.join(''));
		}
	}

	//获取订单数据
	function sendQueryRiskOrderListHttp(){
		g.httpTip.show();
		//var url = Base.serverUrl + "/order/queryOrdersMapController";
		var url = Base.serverUrl + "oplog/getOplog";
		var condi = {};
		condi.login_token = g.login_token;
		condi.currentPageNum = g.currentPage;
		condi.pageSize = g.pageSize ;
		condi = getQueryParameters1(condi,"CX");

		//console.log(condi);
		$.ajax({
			url:url, data:condi,type:"POST",	dataType:"json",context:this,
			success: function(data){
				//console.log("sendQueryRiskOrderListHttp",data);
				var status = data.success || false;
				if(status){
					changeOrderListHtml(data);
				}else{
					var msg = data.message || "获取操作日志数据失败";
					Utils.alert(msg);
				}
				g.httpTip.hide();
			},
			error:function(data){
				g.httpTip.hide();
			}
		});
	}

	function getQueryParameters1(Obj,FormId){
		$.each($("#" + FormId).serializeArray(),function(index,param) {
			Obj[param.name] = param.value;
		});
		return Obj;
	}

	//创建订单列表内容
	function changeOrderListHtml(data){
		var html = [];

		html.push('<table class="table table-bordered table-hover definewidth m10" ><thead>');
		html.push('<tr>');
		html.push('<th>用户ID</th>');
		html.push('<th>用户姓名</th>');
		html.push('<th>模块</th>');
		html.push('<th>请求路径</th>');
		html.push('<th>操作描述</th>');
		html.push('<th>订单编号</th>');
		html.push('<th>操作IP</th>');
		html.push('<th>操作类型</th>');
		html.push('<th>记录时间</th>');
		html.push('</tr>');
		var obj = data.list || [];
		for(var i = 0,len = obj.length; i < len; i++){
			var d = obj[i];
			html.push('<tr>');
			html.push('<td>' + d.user_id + '</td>');
			html.push('<td>' + d.user_name + '</td>');
			html.push('<td>' + g.functionArr[d.function] + '</td>');
			html.push('<td>' + d.query_uri + '</td>');
			html.push('<td><div style="width: 300px; overflow: auto;">' + d.description + '</div></td>');
			html.push('<td>' + d.order_id + '</td>');
			html.push('<td>' + d.client_ip + '</td>');
			html.push('<td>' + (d.status==0?"后台":"网站 WAP") + '</td>');
			html.push('<td>' + d.create_time +  '</td>');
			html.push('</tr>');
		}
		html.push('</table>');

		var pobj = data.obj || {};
		if(obj.length > 0){
			var page = countListPage(pobj);
			html.push(page);
		}else{
			Utils.alert("没有订单数据");
		}

		$("#orderlist").html(html.join(''));

		$("#orderlistpage a").bind("click",pageClick);
	}

	function countListPage(data){
		var html = [];
		g.totalPage = Math.ceil(data.totalRowNum / data.pageSize);
		html.push('<div id="orderlistpage" class="inline pull-right page">');
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
				}else{
					//末尾少于5页
					var len = 9 - (g.totalPage - g.currentPage);
					for(var j = len; j >= 0; j--){
						if(j == 0){
							html.push('<a href="javascript:void(0)" style="' + css + '">' + (g.currentPage) + '</a>');
						}else{
							html.push('<a href="javascript:void(0)" >' + (g.currentPage - j) + '</a>');
						}
					}
				}
				for(var i = 1; i < 6; i++){
					var np = g.currentPage + i;
					if(np <= g.totalPage){
						html.push('<a href="javascript:void(0)" >' + np + '</a>');
					}else{
						break;
					}
				}
			}else{
				for(var i = 0; i < 10; i++){
					var css = (i + 1) == g.currentPage ? "color: #ff0000;" : "";
					html.push('<a href="javascript:void(0)" style="' + css + '">' + (i + 1) + '</a>');
				}
			}
		}else{
			for(var i = 0; i < g.totalPage; i++){
				var css = (i + 1) == g.currentPage ? "color: #ff0000;" : "";
				html.push('<a href="javascript:void(0)" style="' + css + '">' + (i + 1) + '</a>');
			}
		}
		html.push('</div>');

		return html.join('');
	}

	function pageClick(evt){;
		var index = $(this).index();
		var text = $(this).text() - 0 || "";
		if(text !== ""){
			if(g.currentPage === text){
				Utils.alert("当前是第" + text + "页");
				return;
			}else{
				g.currentPage = text;
			}
		}else{
			var cn = $(this)[0].className;
			switch(cn){
				case "page-pre-end":
					//第一页
					if(g.currentPage == 1){
						Utils.alert("当前是第一页");
						return;
					}else{
						g.currentPage = 1;
					}
				break;
				case "page-pre":
					//前一页
					if(g.currentPage > 1){
						g.currentPage--;
					}else{
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
			sendQueryRiskOrderListHttp();
		}else{
			Utils.alert("当前是最后一页");
		}
	}

});