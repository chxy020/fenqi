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
	g.subsidiaryId = Utils.offLineStore.get("subsidiaryId",false) || "";
	g.companyId = Utils.offLineStore.get("companyId",false) || "";
	g.totalPage = 1;
	g.currentPage = 1;
	g.pageSize = 10;


	//验证登录状态
	var loginStatus = Utils.getUserInfo();
	if(!loginStatus){
		//未登录
		//location.replace("/login.html");
		//window.parent.location.href = "../Public/login.html";
	}
	else{
		//获取公司信息
		//sendGetCompanyInfoHttp();
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
					changeSelectHtml(obj);

					sendQueryOrderListHttp();
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
		}
		$("#company").html(option.join(''));
	}


	function sendQueryOrderListHttp(){
		g.httpTip.show();
		var url = Base.serverUrl + "order/querySellerApproveOrdersController";
		var condi = {};
		condi.login_token = g.login_token;
		condi.status = "";
		condi.currentPageNum = g.currentPage;
		condi.companyId = g.companyId;
		condi.subsidiaryId = g.subsidiaryId;
		$.ajax({
			url:url,data:condi,type:"POST",dataType:"json",context:this,
			success: function(data){
				console.log("sendQueryOrderListHttp",data);
				var status = data.success || false;
				if(status){
					changeOrderListHtml(data);
				}
				else{
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

	function changeOrderListHtml(data){

		var html = [];

		html.push('<table class="table table-bordered table-hover definewidth m10" ><thead>');
		html.push('<tr>');
		html.push('<th>订单编号</th>');
		html.push('<th>合同编号</th>');
		html.push('<th>产品名称</th>');
		html.push('<th>审批金额</th>');
		html.push('<th>订单状态</th>');

		html.push('<th>真实姓名</th>');
		//html.push('<th>联系电话</th>');

		html.push('<th>最近待还</th>');
		html.push('<th>总期数</th>');
		html.push('<th>操作</th>');
		html.push('</tr>');
		var obj = data.list || [];
		for(var i = 0,len = obj.length; i < len; i++){
			var d = obj[i];
			var orderId = d.orderId || "";
			var contractNo = d.contractNo || "";
			var packageName = d.packageName || "";
			var packageMoney = d.packageMoney || 0;
			var statusDes = d.statusDes || "";
			var status = d.status || "";

			var applicantName = d.applicantName || "";
			var applicantPhone = d.applicantPhone || "";

			var fenQiTimes = d.fenQiTimes || 0;
			var noRepaymentTimes = d.noRepaymentTimes || 0;

			html.push('<tr>');
			html.push('<td>' + orderId + '</td>');
			html.push('<td>' + contractNo + '</td>');
			html.push('<td>' + packageName + '</td>');
			html.push('<td>' + packageMoney + '元</td>');
			html.push('<td>' + statusDes + '</td>');

			html.push('<td>' + applicantName + '</td>');
			//html.push('<td>' + applicantPhone + '</td>');

			html.push('<td>' + fenQiTimes + '期</td>');
			html.push('<td>' + noRepaymentTimes + '期</td>');
			if(status == "100501"){
				//html.push('<td><a href="/anjia/mystaging.html?orderid=' + orderId + '">编辑</a><a href="javascript:deleteOrderById(\'' + orderId + '\')">删除</a></td>');
			}
			else if(status == "100502"){
				//100502: "商家审核中"
				html.push('<td><a href="detail.html?orderid=' + orderId + '">查看</a>&nbsp&nbsp<a href="seller.html?orderid=' + orderId + '">审批</a></td>');
			}
			else if(status == "100503"){
				//100503: "风控审核中
			}
			else if(status == "100504" || status == "100508" || status == "100509"){
				//html.push('<td><a href="javascript:deleteOrderById(\'' + orderId + '\')">删除</a></td>');
			}
			else if(status == "100505"){
				//100505: "待缴手续费"
				//html.push('<td><a href="/anjia/orderdetail.html">查看</a></td>');
			}
			else if(status == "100506"){
				//100506: "待放款"
				//html.push('<td><a href="/anjia/orderdetail.html">查看</a></td>');
			}
			else if(status == "100507"){
				//100506: "待放款"
				//html.push('<td><a href="/anjia/orderdetail.html">查看</a></td>');
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
			Utils.alert("没有订单数据");
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



	function sellerOrderById(id){
		if(confirm("你确认要审批通过该订单吗?")){
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


	window.sellerOrderById = sellerOrderById;

});