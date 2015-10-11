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
		//未登录
		//location.replace("/login.html");
		//window.parent.location.href = "../Public/login.html";
	}
	else{
		//获取公司信息
		sendGetCompanyInfoHttp();
		//获取订单状态
		sendGetUserInfoDicHttp();

		queryOrderList();
	}

	$("#querybtn").bind("click",queryOrderList);

	function queryOrderList(){
		g.currentPage = 1;
		sendQueryOrderListHttp();
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
				console.log("sendGetCompanyInfoHttp",data);
				var status = data.success || false;
				if(status){
					var obj = data.list || [];

					for(var i = 0,len = obj.length; i < len; i++){
						var d = obj[i];
						var id = d.companyId || "";
						//var cid = d.companyId || "";
						var name = d.companyName || "";
						g.companyObj[id] = name;
					}
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


	//获取用户信息字典信息
	function sendGetUserInfoDicHttp(){
		g.httpTip.show();
		var url = Base.serverUrl + "baseCodeController/getBaseCodeByParents";
		var condi = {};
		condi.parents = "1019";
		$.ajax({
			url:url,
			data:condi,
			type:"POST",
			dataType:"json",
			context:this,
			success: function(data){
				console.log("sendGetUserInfoDicHttp",data);
				var status = data.success || false;
				if(status){
					var obj = data.obj || {};
					changeSelectHtml(obj);
				}
				else{
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
		var parents = ["1019"];
		var ids = ["status"];
		for(var i = 0,len = parents.length; i < len; i++){
			var data = obj[parents[i]] || {};
			var option = [];
			option.push('<option value="">全部订单</option>');
			for(var k in data){
				var id = k || "";
				var name = data[k] || "";
				option.push('<option value="' + id + '">' + name + '</option>');
			}
			$("#" + ids[i]).html(option.join(''));
		}
	}




	function sendQueryOrderListHttp(){
		g.httpTip.show();
		var url = Base.serverUrl + "order/queryRepaymentRecordController";
		var condi = {};
		condi.login_token = g.login_token;
		condi.status = $("#status").val() || "";
		condi.currentPageNum = g.currentPage;
		condi.pageSize = g.pageSize;
		condi.customerName = $("#applicantName").val() || "";
		condi.customerPhone = $("#applicantPhone").val() || "";
		condi.expectRepaymentTimeBegin = $("#createTimeBegin").val() || "";
		condi.expectRepaymentTimeEnd = $("#createTimeEnd").val() || "";
		condi.orderId = $("#orderId").val() || ""
		//condi.companyId = $("#company").val() || "";

		$.ajax({
			url:url,
			data:condi,
			type:"POST",
			dataType:"json",
			context:this,
			success: function(data){
				console.log("sendQueryOrderListHttp",data);
				var status = data.success || false;
				if(status){
					changeOrderListHtml(data);
				}
				else{
					var msg = data.message || "获取还款订单列表数据失败";
					Utils.alert(msg);
				}
				g.httpTip.hide();
			},
			error:function(data){
				g.httpTip.hide();
			}
		});
	}

	function changeOrderListHtml(data){

		var html = [];

		html.push('<table class="table table-bordered table-hover definewidth m10" ><thead>');
		html.push('<tr>');
		html.push('<th>订单编号</th>');
		html.push('<th>公司名称</th>');
		html.push('<th>用户姓名</th>');
		html.push('<th>手机号码</th>');
		html.push('<th>还款类型</th>');

		html.push('<th>期望还款时间</th>');
		html.push('<th>实际还款时间</th>');
		html.push('<th>应还本金</th>');
		html.push('<th>逾期天数</th>');
		html.push('<th>逾期利息</th>');

		html.push('<th>还款状态</th>');
		html.push('<th>删除状态</th>');
		html.push('<th>操作</th>');
		html.push('</tr>');
		var obj = data.list || [];
		for(var i = 0,len = obj.length; i < len; i++){
			var d = obj[i];
			var deleted = d.deleted - 0 || 0;

			deletedText = deleted === 0 ? "正常" : "已删除";
			//if(deleted !== 0){continue;}

			var orderId = d.orderId || "";
			var companyId = d.companyId || "";
			var companyName = g.companyObj[companyId] || "";
			var customerName = d.customerName || "";
			var customerPhone = d.customerPhone || "";
			var repaymentTypeDesc = d.repaymentTypeDesc || "";

			var expectRepaymentTime = d.expectRepaymentTime || "";
			var realRepaymentTime = d.realRepaymentTime || "";
			var repaymentPrincipal = d.repaymentPrincipal || 0;
			var overdueTime = d.overdueTime || 0;
			var overdueInterest = d.overdueInterest || 0;

			var statusDesc = d.statusDesc || "";

			html.push('<tr>');
			html.push('<td>' + orderId + '</td>');
			html.push('<td>' + companyName + '</td>');
			html.push('<td>' + customerName + '</td>');
			html.push('<td>' + customerPhone + '</td>');
			html.push('<td>' + repaymentTypeDesc + '</td>');

			html.push('<td>' + expectRepaymentTime + '</td>');
			html.push('<td>' + realRepaymentTime + '</td>');
			html.push('<td>' + repaymentPrincipal + '元</td>');
			html.push('<td>' + overdueTime + '天</td>');
			html.push('<td>' + overdueInterest + '元</td>');

			html.push('<td>' + statusDesc + '</td>');
			html.push('<td>' + deletedText + '</td>');

			html.push('<td><a href="javascript:void(0)">提醒</a></td>');

			html.push('</tr>');
		}
		html.push('</table>');

		var pobj = data.obj || {};

		if(obj.length > 0){
			var page = countListPage(pobj);
			html.push(page);
		}
		else{
			Utils.alert("没有还款订单数据");
		}

		$("#orderlist").html(html.join(''));

		$("#orderlistpage a").bind("click",pageClick);
	}

	function countListPage(data){
		var html = [];
		g.totalPage = Math.ceil(data.totalRowNum / data.pageSize);
		//g.totalPage = 1;
		//g.currentPage = 1;
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
			sendQueryOrderListHttp();
		}
		else{
			Utils.alert("当前是最后一页");
		}
	}



	function deleteOrderById(id){
		if(confirm("你确认要删除该订单吗?")){
			g.httpTip.show();
			var condi = {};
			condi.orderId = id;
			condi.login_token = g.login_token;

			var url = Base.serverUrl + "order/deleteOrderByOrderIdController";
			$.ajax({
				url:url,
				data:condi,
				type:"POST",
				dataType:"json",
				context:this,
				success: function(data){
					console.log("deleteOrderById",data);
					var status = data.success || false;
					if(status){
						sendQueryOrderListHttp();
					}
					else{
						var msg = data.message || "删除订单数据失败";
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


	window.deleteOrderById = deleteOrderById;

});