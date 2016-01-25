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
	g.pageSize = 5;

	g.qorderstatus = "";
	g.orderInfo = {};

	g.orderStatus = Utils.getQueryString("ostatus") || "";

	//验证登录状态
	var loginStatus = Utils.getUserInfo();
	if(!loginStatus){
		//未登录
		location.replace("../login/login.html");
	}
	else{
		getUserInfo();
		//获取我要还款参数id模拟点击
		$("#nextpagebtn").bind("click",nextPageBtnUp);
		$("#orderstatus div a").bind("click",changeOrderStatus);
		$("#allorderstatus dd").bind("click",changeOrderStatus);
		if(Utils.getQueryString('orderType') && Utils.getQueryString('orderType') == '100507'){
			$("#100507").parents('.staging-tab-item').trigger('click');
			$("#100507").trigger('click');
		}else{
			//获取全部订单列表
			getUserOrderList(true);
		}
		
		

		//获取订单状态
		//sendGetUserInfoDicHttp();
	}


	
	
	

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

		//~ var phoneNumber = obj.phoneNumber || "";
		//~ $("#userphone").html(phoneNumber);
//~
		//~ var avatar = obj.icon || "";
		//~ if(avatar !== ""){
			//~ avatar = avatar + "?t=" + (new Date() - 0);
			//~ $("#avatarimg").attr("src",avatar);
		//~ }
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
							alert("头像上传失败");
						}
					}
					//alert("头像上传成功");
					//console.log("ajaxFileUpload",data,status);
					//location.reload();
				},
				error: function (data, status, e)//服务器响应失败处理函数
				{
					alert("头像上传失败");
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
			alert("您选择的上传文件不是有效的图片文件！");
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
					alert(msg);
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

	function changeOrderStatus(evt){
		g.currentPage = 1;
		var id = this.id || "";
		g.qorderstatus = id;

		$(".staging-tab-item").removeClass("selected");
		$($(this).parent()).addClass("selected");
		getUserOrderList();
	}

	function getUserOrderList(b){
		var condi = {};
		condi.login_token = g.login_token;
		condi.customerId = g.customerId;
		condi.status = g.qorderstatus || "";
		if(b){
			if(g.orderStatus !== ""){
				condi.status = g.orderStatus;
			}
		}
		condi.currentPageNum = g.currentPage;
		condi.pageSize = g.pageSize;

		sendGetUserOrderListHttp(condi);
	}

	function sendGetUserOrderListHttp(condi){
		g.httpTip.show();
		var url = Base.serverUrl + "order/queryOrderList";//之前是queryOrdersController
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
					alert(msg);
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

			html.push('<li>');
			html.push('<div class="order-item-top">');
			html.push('<div class="order-state state-grey">' + statusDes + '</div>');
			html.push('<div class="order-type-name">');
			html.push('<i class="common-ico product-ico"></i>' + packageName);
			html.push('</div>');
			html.push('</div>');
			html.push('<div class="order-item-box">');
			html.push('<div class="box-item">');
			html.push('<div class="box-item-text">');
			html.push('<p><i class="common-ico product-tip1"></i>订单编号：<span class="color-green">' + orderId + '</span></p>');
			html.push('</div>');
			html.push('</div>');
			html.push('<div class="box-item">');
			html.push('<div class="box-item-text">');
			html.push('<p><i class="common-ico product-tip1"></i>合同编号：<span class="color-green">' + contractNo + '</span></p>');
			html.push('</div>');
			html.push('</div>');
			html.push('<div class="box-item">');
			html.push('<div class="box-item-text">');
			html.push('<p><i class="common-ico product-tip2"></i>分期金额：<span class="color-green">' + packageMoney + '</span>元</p>');
			html.push('</div>');
			html.push('</div>');
			html.push('<div class="box-item">');
			html.push('<div class="box-item-text">');
			html.push('<p><i class="common-ico product-tip3"></i>最近待还：<span class="color-green">' + noRepaymentTimes + '</span>期</p>');
			html.push('</div>');
			html.push('<div class="box-item-text">');
			html.push('<p><i class="common-ico product-tip3"></i>总期数：<span class="color-green">' + fenQiTimes + '</span>期</p>');
			html.push('</div>');
			html.push('</div>');
			html.push('</div>');
			html.push('<div class="order-item-btn-box">');


			g.orderInfo[orderId] = d;

			if(status == "100501"){
				html.push('<a href="../mystaging/mystaging.html?orderid=' + orderId + '" class="item-btn item-btn-green">编辑</a>');
				html.push('<a href="javascript:deleteOrderById(\'' + orderId + '\')" class="item-btn item-btn-red">删除</a>');
				//html.push('<td><a href="/anjia/mystaging.html?orderid=' + orderId + '">编辑</a><a href="javascript:deleteOrderById(\'' + orderId + '\')">删除</a></td>');
			}
			else if(status == "100502"){
				//100502: "商家审核中"
				html.push('<a href="javascript:showOrderDetail(\'' + orderId + '\',3)" class="item-btn item-btn-green">查看</a>');
				html.push('<a href="javascript:deleteOrderById(\'' + orderId + '\')" class="item-btn item-btn-red">删除</a>');
				//html.push('<td><a href="javascript:showOrderDetail(\'' + orderId + '\',1)">查看</a><a href="javascript:deleteOrderById(\'' + orderId + '\')">删除</a></td>');
			}
			else if(status == "100503"){
				//100503: "风控审核中
				html.push('<a href="javascript:showOrderDetail(\'' + orderId + '\',3)" class="item-btn item-btn-green">查看</a>');
				/* html.push('<a href="javascript:deleteOrderById(\'' + orderId + '\')" class="item-btn item-btn-red">删除</a>'); */
				//html.push('<td><a href="javascript:showOrderDetail(\'' + orderId + '\',1)">查看</a><a href="javascript:deleteOrderById(\'' + orderId + '\')">删除</a></td>');
			}
			else if(status == "100504" || status == "100509"){
				//html.push('<a href="javascript:deleteOrderById(\'' + orderId + '\')" class="item-btn item-btn-red">删除</a>');
				//html.push('<td><a href="javascript:deleteOrderById(\'' + orderId + '\')">删除</a></td>');
			}
			else if(status == "100505"){
				//100505: "待缴手续费"showOrderDetail
				html.push('<a href="javascript:showOrderDetail(\'' + orderId + '\',1)" class="item-btn item-btn-green">查看</a>');
				//html.push('<td><a href="javascript:showOrderDetail(\'' + orderId + '\',0)">查看</a></td>');
			}
			else if(status == "100506"){
				//100506: "待放款"
				html.push('<a href="javascript:showOrderDetail(\'' + orderId + '\',3)" class="item-btn item-btn-green">查看</a>');
				//html.push('<td><a href="javascript:showOrderDetail(\'' + orderId + '\',0)">查看</a></td>');
			}
			else if(status == "100507"){//还款中
				//100506: "待放款"
				html.push('<a href="javascript:showOrderDetail(\'' + orderId + '\',2)" class="item-btn item-btn-green">查看</a>');
				//html.push('<td><a href="javascript:showOrderDetail(\'' + orderId + '\',0)">查看</a></td>');
			}
			else if(status == "100508"){
				html.push('<a href="javascript:showOrderDetail(\'' + orderId + '\',0)" class="item-btn item-btn-green">查看</a>');
				html.push('<a href="javascript:deleteOrderById(\'' + orderId + '\')" class="item-btn item-btn-red">删除</a>');
				//html.push('<td><a href="javascript:showOrderDetail(\'' + orderId + '\',0)">查看</a><a href="javascript:deleteOrderById(\'' + orderId + '\')">删除</a></td>');
			}

			html.push('</div>');
			html.push('</li>');
		}

		var pobj = data.obj || {};

		if(obj.length > 0){
			var pageSize = pobj.pageSize - 0;
			var totalRowNum = pobj.totalRowNum - 0;
			var currentPageNum = pobj.currentPageNum - 0;
			g.totalPage = Math.ceil(totalRowNum / g.pageSize);
			if(currentPageNum * pageSize < totalRowNum){
				$("#nextpagebtn").show();
			}
			else{
				$("#nextpagebtn").hide();
			}
			//var page = countListPage(pobj);
			//html.push(page);
		}
		else{
			alert("没有订单数据");
		}

		$("#orderlist").html(html.join(''));

		//$("#orderlistpage a").bind("click",pageClick);
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

	function nextPageBtnUp(){
		//后一页
		g.currentPage++;
		if(g.currentPage <= g.totalPage){
			getUserOrderList();
		}
		else{
			alert("当前是最后一页");
		}
	}

	function pageClick(evt){
		var index = $(this).index();
		var text = $(this).text() - 0 || "";
		if(text !== ""){
			if(g.currentPage === text){
				alert("当前是第" + text + "页");
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
						alert("当前是第一页");
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
						alert("当前是第一页");
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
			alert("当前是最后一页");
		}
	}

	function deleteOrderById(id){
		layer.confirm('你确认要删除订单吗', {icon: 3}, function(index){
			layer.close(index);
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
						//window.scrollTo(0,0);
					}
					else{
						var msg = data.message || "删除订单数据失败";
						alert(msg);
					}
					g.httpTip.hide();
				},
				error:function(data){
					g.httpTip.hide();
				}
			});
		});
		//~ if(confirm("你确认要删除订单吗?")){
			//~
		//~ }
	}

	function showOrderDetail(orderId,t){
		var info = g.orderInfo[orderId] || "";
		info = JSON.stringify(info);
		Utils.offLineStore.set("userorderinfo_list",info,false);
		if(t == 0){
			location.href = "repayment-list-item.html?orderId=" + orderId ;
		}
		else if(t == 1){			
			location.href = "repayment-list-item.html?orderId=" + orderId+"&pa=1";
		}
		else if(t == 2){//还款中
			location.href = "repayment-list-item.html?orderId=" + orderId+"&pa=2";			
		}
		else{
			layer.msg("订单正在审核,请耐心等待！");
			//location.href = "/anjia/orderaudit.html?orderId=" + orderId ;
		}
	}

	
	//window.sendGetOrderInfoHttp = sendGetOrderInfoHttp;
	window.showOrderDetail = showOrderDetail;
	window.deleteOrderById = deleteOrderById;
});





