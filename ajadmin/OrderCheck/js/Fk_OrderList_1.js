/**
 * function:风控初审列表
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

	g.totalPage = 1;
	g.currentPage = 1;
	g.pageSize = 10;

	//window.DataList = []; //存放可以申请的订单列表数据

	//加载订单方法
	$.getScript("js/OrderFunction.js").done(function() {}).fail(function() {Utils.alert("@_@加载订单状态方法失败<br>请检查！");});

	//验证登录状态
	var loginStatus = Utils.getUserInfo();
	if(!loginStatus){
		//未登录
		//location.replace("/login.html");
		//window.parent.location.href = "../Public/login.html";
	}else{
		//获取数据列表
		setTimeout(sendQueryRiskOrderListHttp(),500);
	}

	$("#querybtn").bind("click",queryOrderList);

	function queryOrderList(){
		g.currentPage = 1;
		sendQueryRiskOrderListHttp();
	}

	//获取订单数据
	function sendQueryRiskOrderListHttp(){
		g.httpTip.show();
		var url = Base.serverUrl + "order/queryOrdersMapController";
		var condi = {};
		condi.login_token = g.login_token;
		condi.currentPageNum = g.currentPage;
		condi.status = "10050301";
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
					var msg = data.message || "获取订单列表数据失败";
					Utils.alert(msg);
				}
				g.httpTip.hide();
			},
			error:function(data){
				g.httpTip.hide();
			}
		});
	}

	//创建订单列表内容
	function changeOrderListHtml(data){
		var html = [];

		html.push('<table class="table table-bordered table-hover definewidth m10" ><thead>');
		html.push('<tr>');
		html.push('<th>订单编号</th>');
		html.push('<th>真实姓名</th>');
		//html.push('<th>联系电话</th>');
		html.push('<th>合同编号</th>');
		html.push('<th>产品名称</th>');
		html.push('<th>申请分期金额</th>');
		html.push('<th>申请分期期数</th>');
		html.push('<th>订单状态</th>');
		html.push('<th>操作</th>');
		html.push('</tr>');

		var obj = data.list || [];
		var cc = {"aa":1,"bb":2};
		for(var i = 0,len = obj.length; i < len; i++){
			var d = obj[i];
			html.push('<tr>');
			html.push('<td>' + d.orderId + '</td>');
			html.push('<td>' + d.applicantName + '</td>');
			//html.push('<td>' + d.applicantPhone + '</td>');
			html.push('<td>' + d.contractNo + '</td>');
			html.push('<td>' + d.packageName + '</td>');
			html.push('<td>' + d.applyPackageMoney + '元</td>');
			html.push('<td>' + d.applyFenQiTimes  + '</td>');
			html.push('<td>' + getOrderStatus(d.status)  + '</td>');
			//根据订单状态 判断 初审
			var credit = '&nbsp&nbsp<a href="javascript:void(0)" onclick="OpenCredit(' + d.orderId + ',this)">91征信</a>';
			if(d.status == "10050301"){
				html.push('<td><a href="javascript:Hmgx.openWin(\'ModifyOrder.html?orderid=' + d.orderId + '\')">编辑</a>&nbsp&nbsp<a href="javascript:Hmgx.openWin(\'FK_Seller_1.html?orderid=' + d.orderId + '\')">初审</a>' + credit + '</td>');

				//html.push('<td><a href="fkuan_detail.html?orderid=' + d.orderId + '">编辑</a>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp<a class="btn btn-warning" href="javascript:ShowWin(\'' + d.orderId +  '\')">初审</a></td>');
				//DataList.push(d);
			}else{
				html.push('<td><a href=""javascript:Hmgx.openWin(\'ViewOrder.html?orderid=' + d.orderId + '\')">查看订单</a>' + credit + '</td>');
			}
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

	window.OpenCredit = function(OrderId,e){
		Hmgx.openWin("CreditReport.html?orderid=" + OrderId );
		//$(e).attr("onclick","alert('征信报告不能重复获取！')");
	};

	//显示审核窗口
	//window.ShowWin = function (OrderID){
	//	var RowData = null;
	//	for(var i = 0 ; i < DataList.length ; i++){
	//		if(DataList[i].orderId == OrderID){
	//			RowData = DataList[i];
	//			break;
	//		}
	//	}
	//	if(RowData == null){
	//		alert("数据错误!");
	//		return false;
	//	}
	//	$("#s_orderId").val(RowData.orderId);
	//	$('#pass').modal('show').css({
	//		width: '1000',
	//		'margin-left': function () {
	//			return -($(this).width() / 2);
	//			//return 20;
	//		}
	//	});
	//}
});
