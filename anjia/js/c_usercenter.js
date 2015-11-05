/**
 * file:个人资料
 * author:chenxy
*/
//页面初始化
$(function(){
	var g = {};
	g.customerId = "";
	g.login_token = Utils.offLineStore.get("token",false) || "";
	//g.page = Utils.getQueryString("p") - 0;
	g.httpTip = new Utils.httpTip({});

	g.totalPage = 1;
	g.currentPage = 1;
	g.pageSize = 10;

	g.orderInfo = {};

	g.orderStatus = Utils.getQueryString("ostatus") || "";

	//验证登录状态
	var loginStatus = Utils.getUserInfo();
	if(!loginStatus){
		//未登录
		location.replace("/anjia/login.html");
	}
	else{
		getUserInfo();
		//获取订单列表
		getUserOrderList(true);

		//获取订单状态
		sendGetUserInfoDicHttp();
	}


	//头像
	$(document).on("change","#avatar",avatarBtnUp);
	$("#orderstatus").bind("change",changeOrderStatus);


	//获取个人资料
	function getUserInfo(){
		var info = Utils.offLineStore.get("userinfo",false) || "";
		console.log("getUserInfo",info);
		if(info !== ""){
			var obj = JSON.parse(info) || {};
			setUserInfoHtml(obj);
		}
	}
	//修改个人资料
	function setUserInfoHtml(data){
		var obj = data || {};
		//用户登录ID
		g.customerId = obj.customerId || "";

		var phoneNumber = obj.phoneNumber || "";
		$("#userphone").html(phoneNumber);

		var avatar = obj.icon || "";
		if(avatar !== ""){
			avatar = avatar + "?t=" + (new Date() - 0);
			$("#avatarimg").attr("src",avatar);
		}
	}


	function avatarBtnUp(){
		var avatar = $("#avatar").val() || "";
		if(avatar !== ""){
			uploadBtnUp();
		}
		/*
		var popbox = $("#popbox");
		if(popbox.length == 0){
			var url = Base.serverUrl + "/api/user/changeAvatar";
			//var url = "http://192.168.10.209:8080/fenghuangzhujia-eshop-web/";
			var token = g.token;
			var html = [];
			html.push('<div id="popbox" class="prompt_mask transparentbg" style="display: block;">');
			html.push('<div class="p_load" style="width:600px;height:200px;background:#fff;margin-left:-300px;">');
			//html.push('<form id="avatarform" submit="return false;" action="' + url + '" method="post" enctype="multipart/form-data">');
			html.push('<p>');
			html.push('<input id="avatar" type="file" name="avatar" multiple="multiple" min="1" max="99" value="选择头像" accept="image/*" />');
			//html.push('<input id="uploadbtn" type="submit" value="upload" />');
			html.push('<input id="uploadbtn" type="button" value="upload" />');
			html.push('<input id="token" type="hidden" name="token" value="' + token + '" />');
			html.push('</p>');
			//html.push('</form>');
			html.push('</div>');
			html.push('</div>');

			$("body").append(html.join(''));

			$("#uploadbtn").bind("click",uploadBtnUp);
		}
		else{
			popbox.show();
		}
		*/
	}

	function uploadBtnUp(){
		if(lastname()){
			g.httpTip.show();
			var url = Base.serverUrl + "user/uploadIcon";
			var condi = {};
			condi.login_token = g.login_token;
			condi.customer_id = g.customerId;

			//document.domain = "partywo.com";
			$.ajaxFileUpload({
				url: url, //用于文件上传的服务器端请求地址
				data:condi,
				secureuri: false, //一般设置为false
				fileElementId: 'avatar', //文件上传空间的id属性  <input type="file" id="file" name="file" />
				dataType: 'jsonp', //返回值类型 一般设置为json
				success: function (data, status)  //服务器成功响应处理函数
				{
					//{"success":true,"obj":"http://123.57.5.50:8888/anjia/201508240001/201508240001.jpg","list":null,"message":null,"code":null,"token":null}
					console.log("ajaxFileUpload",data);
					g.httpTip.hide();
					if(data != null && data != ""){
						try{
							var obj = JSON.parse(data);
							var src = obj.obj + "?t=" + (new Date() - 0);
							$("#avatarimg").attr("src",src);
						}
						catch(e){
							Utils.alert("头像上传失败");
						}
					}
					//Utils.alert("头像上传成功");
					//console.log("ajaxFileUpload",data,status);
					//location.reload();
				},
				error: function (data, status, e)//服务器响应失败处理函数
				{
					Utils.alert("头像上传失败");
					g.httpTip.hide();
				}
			});
			return false;
		}
	}

	function lastname(){
		//获取欲上传的文件路径
		var filepath = document.getElementById("avatar").value;
		//为了避免转义反斜杠出问题，这里将对其进行转换
		var re = /(\\+)/g;
		var filename=filepath.replace(re,"#");
		//对路径字符串进行剪切截取
		var one=filename.split("#");
		//获取数组中最后一个，即文件名
		var two=one[one.length-1];
		//再对文件名进行截取，以取得后缀名
		var three=two.split(".");
		//获取截取的最后一个字符串，即为后缀名
		var last=three[three.length-1];
		//添加需要判断的后缀名类型
		var tp ="jpg,gif,bmp,JPG,GIF,BMP,png";
		//返回符合条件的后缀名在字符串中的位置
		var rs=tp.indexOf(last);
		//如果返回的结果大于或等于0，说明包含允许上传的文件类型
		if(rs>=0){
			return true;
		}else{
			Utils.alert("您选择的上传文件不是有效的图片文件！");
			return false;
		}
	}


	//获取用户信息字典信息
	function sendGetUserInfoDicHttp(){
		g.httpTip.show();
		var url = Base.serverUrl + "baseCodeController/getBaseCodeByParents";
		var condi = {};
		condi.parents = "1005";
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
		var parents = ["1005"];
		var ids = ["orderstatus"];
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
		if(g.orderStatus !== ""){
			$("#orderstatus").val(g.orderStatus);
		}
	}

	function changeOrderStatus(){
		g.currentPage = 1;
		getUserOrderList();
	}

	function getUserOrderList(b){
		var condi = {};
		condi.login_token = g.login_token;
		condi.customerId = g.customerId;
		condi.status = $("#orderstatus").val() || "";
		if(b){
			if(g.orderStatus !== ""){
				condi.status = g.orderStatus;
			}
		}
		condi.currentPageNum = g.currentPage;
		condi.pageSize = g.pageSize;

		if(condi.status == "100506"){
			//待放款新逻辑
			sendGetRepayOrderListHttp(condi);
		}
		else{
			sendGetUserOrderListHttp(condi);
		}
	}

	function sendGetUserOrderListHttp(condi){
		g.httpTip.show();
		var url = Base.serverUrl + "order/queryOrdersController";
		$.ajax({
			url:url,
			data:condi,
			type:"POST",
			dataType:"json",
			context:this,
			success: function(data){
				console.log("sendGetUserOrderListHttp",data);
				var status = data.success || false;
				if(status){
					changeOrderListHtml(data);
				}
				else{
					var msg = data.message || "获取用户订单失败";
					Utils.alert(msg);
				}
				g.httpTip.hide();
			},
			error:function(data){
				g.httpTip.hide();
			}
		});
	}

	//获取放款列表
	function sendGetRepayOrderListHttp(condi){
		g.httpTip.show();
		//~ login_token：string,
		//~ customerId:string
		//~ status:string
		//~ currentPageNum:int,
		//~ applicantName:string申请人姓名,
		//~ applicantPhone:string申请人电话,
		//~ createTimeBegin:string开始时间精确到天,
		//~ createTimeEnd:string精确到天，
		//~ orderId:订单编号,
		//:还款状态(102401 待放款)
		condi.loanStatus = 102401;
		condi.status = null;

		var url = Base.serverUrl + "order/queryOrdersController";
		$.ajax({
			url:url,
			data:condi,
			type:"POST",
			dataType:"json",
			context:this,
			success: function(data){
				/* var data={"success":true,"obj":{"currentPageNum":1,"pageSize":10,"totalRowNum":2,"startRow":0},"list":[],"message":null,"code":null,"token":null}; */
				console.log("sendGetRepayOrderListHttp",data);
				var status = data.success || false;
				if(status){
					changeRepayOrderListHtml(data);
				}
				else{
					var msg = data.message || "获取用户放款订单失败";
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

		html.push('<table class="order-table" cellpadding="0" cellspacing="0">');
		html.push('<tr>');
		html.push('<th width="160">订单编号</th>');
		html.push('<th width="130">合同编号</th>');
		html.push('<th width="110">产品类型</th>');
		html.push('<th width="110">分期金额</th>');
		html.push('<th width="100">订单状态</th>');
		html.push('<th width="80">最近待还</th>');
		html.push('<th width="80">总期数</th>');
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
			var fenQiTimes = d.fenQiTimes || 0;
			var noRepaymentTimes = d.noRepaymentTimes || 0;

			html.push('<tr>');
			html.push('<td>' + orderId + '</td>');
			html.push('<td>' + contractNo + '</td>');
			html.push('<td>' + packageName + '</td>');
			html.push('<td>' + packageMoney + '元</td>');
			html.push('<td>' + statusDes + '</td>');
			html.push('<td>' + noRepaymentTimes + '期</td>');
			html.push('<td>' + fenQiTimes + '期</td>');

			g.orderInfo[orderId] = d;

			if(status == "100501"){
				html.push('<td><a href="/anjia/mystaging.html?orderid=' + orderId + '">编辑</a><a href="javascript:deleteOrderById(\'' + orderId + '\')">删除</a></td>');
			}
			else if(status == "100502"){
				//100502: "商家审核中"
				html.push('<td><a href="javascript:showOrderDetail(\'' + orderId + '\',1)">查看</a><a href="javascript:deleteOrderById(\'' + orderId + '\')">删除</a></td>');
			}
			else if(status == "100503"){
				//100503: "风控审核中
				html.push('<td><a href="javascript:showOrderDetail(\'' + orderId + '\',1)">查看</a><a href="javascript:deleteOrderById(\'' + orderId + '\')">删除</a></td>');
			}
			else if(status == "100504" || status == "100509"){
				html.push('<td><a href="javascript:deleteOrderById(\'' + orderId + '\')">删除</a></td>');
			}
			else if(status == "100505"){
				//100505: "待缴手续费"showOrderDetail
				//html.push('<td><a href="/anjia/orderdetail.html?orderId=' + orderId + '">查看</a></td>');
				html.push('<td><a href="javascript:showOrderDetail(\'' + orderId + '\',0)">查看</a></td>');
			}
			else if(status == "100506"){
				//100506: "待放款"
				html.push('<td><a href="javascript:showOrderDetail(\'' + orderId + '\',0)">查看</a></td>');
			}
			else if(status == "100507"){
				//100506: "待放款"
				html.push('<td><a href="javascript:showOrderDetail(\'' + orderId + '\',0)">查看</a></td>');
			}
			else if(status == "100508"){
				html.push('<td><a href="javascript:showOrderDetail(\'' + orderId + '\',0)">查看</a><a href="javascript:deleteOrderById(\'' + orderId + '\')">删除</a></td>');
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



	//放款订单列表
	function changeRepayOrderListHtml(data){

		var html = [];

		html.push("<table class='order-table' onclick='$(\"#orderlist .updown,#orderlist .updown2\").fadeToggle(300)' cellpadding='0' cellspacing='0'>");
		html.push('<tr>');
		html.push('<th width="160">订单编号</th>');
		html.push('<th width="100">合作商家</th>');
		html.push('<th width="110">合同总金额</th>');
		html.push('<th width="110">授信额度</th>');
		html.push('<th width="100">订单状况</th>');
		html.push('<th width="100">已付金额</th>');
		html.push('<th width="100">总期数</th>');
		html.push('<th>操作</th>');
		html.push('</tr>');
		var obj = data.list || [];
		for(var i = 0,len = obj.length; i < len; i++){
			var d = obj[i];
			var orderId = d.orderId || "";
			var contractNo = d.contractNo || "";
			var packageName = d.packageName || "";
			var contractMoney = d.contractMoney || 0;
			var packageMoney = d.packageMoney || 0;
			var loanResidueMoney = d.loanResidueMoney || 0;
			var statusDes = d.statusDes || "";
			var status = d.status || "";
			var fenQiTimes = d.fenQiTimes || 0;
			var noRepaymentTimes = d.noRepaymentTimes || 0;

			html.push('<tr>');
			html.push('<td>' + orderId + '</td>');
			html.push('<td>' + packageName + '</td>');
			html.push('<td>' + contractMoney + '元</td>');
			html.push('<td>' + packageMoney + '元</td>');
			html.push('<td>' + statusDes + '</td>');
			html.push('<td>' + loanResidueMoney + '元</td>');
			html.push('<td>' + fenQiTimes + '期</td>');

			g.orderInfo[orderId] = d;

			if(status == "100501"){
				html.push('<td><a href="/anjia/mystaging.html?orderid=' + orderId + '">编辑</a><a href="javascript:deleteOrderById(\'' + orderId + '\')">删除</a></td>');
			}
			else if(status == "100502"){
				//100502: "商家审核中"
				html.push('<td><a href="javascript:showOrderDetail(\'' + orderId + '\',1)">查看</a><a href="javascript:deleteOrderById(\'' + orderId + '\')">删除</a></td>');
			}
			else if(status == "100503"){
				//100503: "风控审核中
				html.push('<td><a href="javascript:showOrderDetail(\'' + orderId + '\',1)">查看</a><a href="javascript:deleteOrderById(\'' + orderId + '\')">删除</a></td>');
			}
			else if(status == "100504" || status == "100509"){
				html.push('<td><a href="javascript:deleteOrderById(\'' + orderId + '\')">删除</a></td>');
			}
			else if(status == "100505"){
				//100505: "待缴手续费"showOrderDetail
				//html.push('<td><a href="/anjia/orderdetail.html?orderId=' + orderId + '">查看</a></td>');
				html.push('<td><a href="javascript:showOrderDetail(\'' + orderId + '\',0)">查看</a></td>');
			}
			else if(status == "100506"){
				//100506: "待放款"
				html.push('<td><a href="javascript:sendGetRepayOrderInfoListHttp(\'' + orderId + '\')">我要付款</a></td>');
			}
			else if(status == "100507"){
				//100506: "待放款"
				html.push('<td><a href="javascript:showOrderDetail(\'' + orderId + '\',0)">查看</a></td>');
			}
			else if(status == "100508"){
				html.push('<td><a href="javascript:showOrderDetail(\'' + orderId + '\',0)">查看</a><a href="javascript:deleteOrderById(\'' + orderId + '\')">删除</a></td>');
			}
			html.push('</tr>');
		}
		html.push('</table>');
		html.push("<table class='updown'>");
		html.push('<tr>');
		html.push('<th width="160">付款期数</th>');
		html.push('<th width="160">剩余金额</th>');
		html.push('<th width="160">付款日期</th>');
		html.push('<th width="200">付款金额</th>');
		html.push('<th >操作</th>');
		html.push('</tr>');
		html.push('</table>');
			
		html.push("<table class='updown2'  cellpadding='0' cellspacing='0' >");
		html.push('<tr>');
		html.push('<th width="160">1</th>');
		html.push('<th width="160">50000</th>');
		html.push("<th width='160'><input id='input_id2' type='text' onclick='laydate({elem: \"#input_id2\"});' placeholder='请选择付款日期' onfocus='placeholder=\"\"' onblur='placeholder=\"请选择付款日期\"'  class='up_input'/></th>");
		html.push("<th width='200'><input type='text' class='up_input' /></th>");
		html.push('<th ><a>已付款</a></th>');
		html.push('</tr>');
		html.push('<tr>');
		html.push('<th width="160">1</th>');
		html.push('<th width="160">50000</th>');
		html.push("<th width='160'><input id='input_id' type='text' onclick='laydate({elem: \"#input_id\"});' placeholder='请选择付款日期' onfocus='placeholder=\"\"' onblur='placeholder=\"请选择付款日期\"'  class='up_input'/></th>");
		html.push("<th width='200'><input type='text' class='up_input' /></th>");
		html.push('<th ><a>已付款</a></th>');
		html.push('</tr>');
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
		g.totalPage = Math.ceil(data.totalRowNum / g.pageSize);
		//g.totalPage = 1;
		//g.currentPage = 1;
		html.push('<div id="orderlistpage" class="ui-pager">');
		html.push('<a href="javascript:void(0)" class="page-pre-end">&nbsp;</a>');
		html.push('<a href="javascript:void(0)" class="page-pre">&nbsp;</a>');

		if(g.totalPage > 10){
			if(g.currentPage >= 10){
				var css = "background: #89c997;color: #ffffff;border: 1px solid #89c997";

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
					var css = (i + 1) == g.currentPage ? "background: #89c997;color: #ffffff;border: 1px solid #89c997;" : "";
					html.push('<a href="javascript:void(0)" style="' + css + '">' + (i + 1) + '</a>');
				}
			}
		}
		else{
			for(var i = 0; i < g.totalPage; i++){
				var css = (i + 1) == g.currentPage ? "background: #89c997;color: #ffffff;border: 1px solid #89c997;" : "";
				html.push('<a href="javascript:void(0)" style="' + css + '">' + (i + 1) + '</a>');
			}
		}

		html.push('<a href="javascript:void(0)" class="page-next">&nbsp;</a>');
		html.push('<a href="javascript:void(0)" class="page-next-end">&nbsp;</a>');
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
			getUserOrderList();
		}
		else{
			Utils.alert("当前是最后一页");
		}
	}




	function deleteOrderById(id){
		if(confirm("你确认要删除订单吗?")){
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
						getUserOrderList();
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

	function showOrderDetail(orderId,t){
		var info = g.orderInfo[orderId] || "";
		info = JSON.stringify(info);
		Utils.offLineStore.set("userorderinfo_list",info,false);
		if(t == 0){
			location.href = "/anjia/orderdetail.html?orderId=" + orderId ;
		}
		else{
			location.href = "/anjia/orderaudit.html?orderId=" + orderId ;
		}
	}


	//获取放款列表
	function sendGetRepayOrderInfoListHttp(orderId){
		var condi = {};
		condi.login_token = g.login_token;
		condi.orderId = orderId;
		g.httpTip.show();
		var url = Base.serverUrl + "order/loanByOrderId";
		$.ajax({
			url:url,
			data:condi,
			type:"POST",
			dataType:"json",
			context:this,
			success: function(data){
				console.log("sendGetRepayOrderInfoListHttp",data);
				var status = data.success || false;
				if(status){
					repayListHtml(data);
				}
				else{
					var msg = data.message || "获取用户放款订单失败";
					Utils.alert(msg);
				}
				g.httpTip.hide();
			},
			error:function(data){
				g.httpTip.hide();
			}
		});
	}

	function repayListHtml(data){
		//~ var d =data
		//~ var orderId = d.orderId || "";
		//~ var repaymentRecordId = d.repaymentRecordId || "主键";
		//~ var repaymentTypeDesc = d.repaymentTypeDesc || "";
		//~ var repaymentPrincipal = d.repaymentPrincipal || 0;
		//~ var expectRepaymentTime = d.expectRepaymentTime || "";
		//~ var overdueTime = d.overdueTime || 0;
		//~ var overdueInterest = d.overdueInterest || 0;
		//~ var yinghuanjine = repaymentPrincipal  + overdueInterest ;
		//~ var realRepaymentTime = d.realRepaymentTime || "无";
//~
		//~ var dd = JSON.parse(g.orderInfo) || {};
		//~ var orderId = dd.orderId || "";
		//~ var contractNo = dd.contractNo || "";
		//~ var packageName = dd.packageName || "";
		//~ var packageMoney = dd.packageMoney - 0 || 0;
		//~ var statusDes = dd.statusDes || "";
		//~ var status = dd.status || "";
		//~ var fenQiTimes = dd.fenQiTimes || 0;
		//~ var poundage = dd.poundage - 0 || 0;
		//~ var moneyMonth = dd.moneyMonth - 0 || 0;
		//~ var noRepaymentTimes = dd.noRepaymentTimes || 0;
//~
		var html = [];
		html.push('<table class="common-table1" cellpadding="0" cellspacing="0" style="margin-top:25px;">');
		html.push('<tr>');
		html.push('<th>待付期数</th>');
		html.push('<th>剩余金额</th>');
		html.push('<th>付款日期</th>');
		html.push('<th>付款金额</th>');
		html.push('<th>操作</th>');
		html.push('</tr>');

		html.push('<tr>');
		html.push('<td>' + 1 + '</td>');
		html.push('<td>' + 22 + '元</td>');
		html.push('<td>' + 33 + '</td>');
		html.push('<td>' + 44 + '天</td>');
		html.push('<td><a href="javascript:deleteOrderById(\'' + 11 + '\')">删除</a></td>');
		html.push('</tr>');
		html.push('</table>');

		$("#detailinfodiv").html(html.join(''));
		showOrderPop('#repayBackPop');
	}


	//出现弹窗遮罩层
	function showPopFade(){
		var bodyHei = document.body.clientHeight;
		if($('.pop-fade').size()<=0){
			console.log('a');
			$('body').append('<div class="pop-fade" id="commonPopFade"></div>');
		}
		$('#commonPopFade').css('height',parseInt(bodyHei)+'px');
		$('#commonPopFade').fadeIn();
	}
	//还款弹窗出现方法
	function showOrderPop(objId){
		var $target = $(objId);
		var popBoxWid = $target.width();
		$target.css('left',($(window).width()-popBoxWid)/2);
		$(window).bind('resize',function(){
			var popBoxWid = $target.width();
			$target.css('left',($(window).width()-popBoxWid)/2);
		});
		window.scrollTo(0,0);
		showPopFade(100);
		$target.fadeIn(100);

	}
	function hidePop(){
		$('.pop-fade').fadeOut(100);
		$('.pop-main-box').fadeOut(100);
	}

	window.hidePop = hidePop;
	window.sendGetRepayOrderInfoListHttp = sendGetRepayOrderInfoListHttp;
	window.showOrderDetail = showOrderDetail;
	window.deleteOrderById = deleteOrderById;
});
   
    
