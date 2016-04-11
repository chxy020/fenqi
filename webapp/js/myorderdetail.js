/**
 * file:个人资料
 * author:chenxy
*/
//页面初始化
$(function(){
	var g = {};
	g.customerId = "";
	g.login_token = Utils.offLineStore.get("token",false) || "";
	g.orderId = Utils.getQueryString("orderId");
	g.httpTip = new Utils.httpTip({});
	g.pa = Utils.getQueryString("pa");
	g.orderDetailInfo = {};
	g.month_Poundage = false;//判断是否是分期服务费还款
	g.couponId = "";//判断是否有减免服务费
	g.orderInfo = Utils.offLineStore.get("userorderinfo_list",false) || "";
	if(g.orderInfo != ""){
		//changeOrderInfoHtml(g.orderInfo);
	}
	else{
		Utils.alert("数据错误");
		history.go(-1);
	}

	g.totalPage = 1;
	g.currentPage = 1;
	g.pageSize = 10;

	//验证登录状态
	var loginStatus = Utils.getUserInfo();
	if(!loginStatus){
		//未登录
		location.replace("../login/login.html");
	}
	else{
		show_pro();//判断是否显示协议
		getUserInfo();
		//获取订单列表
		getUserOrderStagingList();
		OrderLeftProtocolClick();
		//获取订单状态
		//sendGetUserInfoDicHttp();
	}


	//头像
	//$(document).on("change","#avatar",avatarBtnUp);
	//$("#orderstatus").bind("change",changeOrderStatus);


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

		//var phoneNumber = obj.phoneNumber || "";
		//$("#userphone").html(phoneNumber);

		/*
		var avatar = obj.icon || "";
		if(avatar !== ""){
			avatar = avatar + "?t=" + (new Date() - 0);
			$("#avatarimg").attr("src",avatar);
		}
		*/
	}
	
	/* 根据版本获取协议信息 */
	function showOrderDetailByHistory2(orderId){
		var condi = {};
		condi.login_token = g.login_token;
		condi.orderId = orderId || "";
		var url = Base.serverUrl + "order/getProtocolInfoByOrderId";
		$.ajax({
			url:url,
			data:condi,
			type:"POST",
			dataType:"json",
			context:this,
			success: function(data){
				var status = data.success || false;
				if(status){
					var obj = data.obj || [];
					g.H = obj.version || "";
				}
				else{
					var msg = data.message || "获取用户订单失败";
				}
			},
			error:function(data){
			}
		});
	}

function OrderLeftProtocolClick(){
	showOrderDetailByHistory2(g.orderId);
	$("#staging_Protocol  a").bind("click",function(evt){
		var id = this.id || "";
		var t = id.split("_")[1] || "";
		var H = g.H || "";//判断是否有版本
		if(H != ""){
			var pages = ["","../protocol_"+H+"/protocol-fenqi.html","../protocol_"+H+"/protocol-authorization.html","../protocol_"+H+"/protocol-customer-commitment.html","../protocol_"+H+"/protocol-credit-counseling.html","../protocol_"+H+"/protocol-transfer.html"];
		}else{
			var pages = ["","../protocol/protocol-fenqi.html","../protocol/protocol-authorization.html","../protocol/protocol-customer-commitment.html","../protocol/protocol-credit-counseling.html","../protocol/protocol-transfer.html"];
		}
		var titles = ["","分期付款协议","个人征信等信息查询及使用授权书","客户承诺函","信用咨询及居间服务协议","债权转让协议"];
		var url = pages[t] || "";
		if(url !== ""){
			/* $(".selected").removeClass("selected");
			$(this).addClass("selected");
			$("#protocoldiv").addClass("selected"); */

			var title = titles[t] || "";
			//订单数据,在协议页面可以同意引入utils.js,调用此方法获取数据
			//var orderInfo = Utils.offLineStore.get("userorderinfo_list",false) || "";
			//console.log("orderInfo",orderInfo);
			$.fn.showProtocolPop(url,title);
		}
	});
}
	
//判断是否为还款中  显示协议
	function show_pro(){
		var pa = g.pa || "";
		if(pa=="2"){
			showOrderDetailByHistory(g.orderId);
			$("#staging_Protocol").fadeIn(0);
		}else{
			$("#staging_Protocol").fadeOut(0);
		}
	}

	/* 根据版本获取协议信息 */
	function showOrderDetailByHistory(orderId){
		var condi = {};
		condi.login_token = g.login_token;
		condi.orderId = orderId || "";
		var url = Base.serverUrl + "order/getProtocolInfoByOrderId";
		$.ajax({
			url:url,
			data:condi,
			type:"POST",
			dataType:"json",
			context:this,
			success: function(data){
				var status = data.success || false;
				if(status){
					var info = JSON.stringify(data);
					Utils.offLineStore.set("userorderinfo_detail",info,false);
				}
				else{
					var msg = data.message || "获取用户订单失败";
					sendGetOrderInfoHttp(g.orderId);
				}
			},
			error:function(data){
				sendGetOrderInfoHttp(g.orderId);
			}
		});
	}
	
	
	
	//显示协议
				
	function sendGetOrderInfoHttp(orderId){
		var url = Base.serverUrl + "order/queryOrdersByOrderIdController";
		var condi = {};
		condi.login_token = g.login_token;
		condi.orderId = orderId;

		g.httpTip.show();
		$.ajax({
			url:url,
			data:condi,
			type:"POST",
			dataType:"json",
			context:this,
			success: function(data){
				console.log("sendGetOrderInfoHttp",data);
				var status = data.success || false;
				if(status){					
					var info = JSON.stringify(data);
					Utils.offLineStore.set("userorderinfo_detail",info,false);
					//changeOrderInfoHtml(data);
				}
				else{
					//var msg = data.error || "";
					var msg = data.message || "获取订单信息失败";
					//alert(msg);
				}
				g.httpTip.hide();
			},
			error:function(data){
				g.httpTip.hide();
			}
		});
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
	}

	function changeOrderStatus(){
		g.currentPage = 1;
		getUserOrderList();
	}

	//--------------------------------------------------







	function changeOrderInfoHtml(data){
		var d = JSON.parse(data) || {};
		var orderId = d.orderId || "";
		var contractNo = d.contractNo || "";
		var packageName = d.packageName || "";
		var packageMoney = d.packageMoney - 0 || 0;
		var statusDes = d.statusDes || "";
		var status = d.status || "";
		var fenQiTimes = d.fenQiTimes || 0;
		var poundage = d.poundage - 0 || 0;
		var moneyMonth = d.moneyMonth - 0 || 0;
		var noRepaymentTimes = d.noRepaymentTimes || 0;

		var html = [];

		html.push('<tr><td width="150" class="odd">订单编号</td>');
		html.push('<td class="even">' + orderId + '</td></tr>');
		html.push('<tr><td class="odd">合同编号</td>');
		html.push('<td class="even">' + contractNo + '</td></tr>');
		html.push('<tr><td class="odd">产品类型</td>');
		html.push('<td class="even">' + packageName + '</td></tr>');
		html.push('<tr><td class="odd">分期金额</td>');
		html.push('<td class="even">' + packageMoney + '元</td></tr>');
		html.push('<tr><td class="odd">分期月数</td>');
		html.push('<td class="even">' + fenQiTimes + '个月</td></tr>');
		html.push('<tr><td class="odd">服务费</td>');
		html.push('<td class="even">' + poundage + '元</td></tr>');
		html.push('<tr><td class="odd">每月还款本金</td>');
		html.push('<td class="even">' + moneyMonth + '元</td></tr>');
		html.push('<tr><td class="odd">当前状态</td>');
		html.push('<td class="even">' + statusDes + '</td></tr>');
		html.push('<tr><td class="odd">待还期数</td>');
		html.push('<td class="even">' + noRepaymentTimes + '期</td></tr>');
		html.push('<tr><td class="odd">总还款金额</td>');
		html.push('<td class="even">' + (packageMoney + poundage) + '元</td></tr>');
		html.push('<tr><td class="odd">待还金额</td>');
		html.push('<td class="even">' + moneyMonth + '元</td></tr>');

		$("#orderinfodiv").html(html.join(''));
	}



	function getUserOrderStagingList(){
		var condi = {};
		condi.login_token = g.login_token;
		condi.orderId = g.orderId;

		sendGetUserOrderStagingListHttp(condi);
	}

	function sendGetUserOrderStagingListHttp(condi){
		var url = Base.serverUrl + "order/getAllRepaymentRecordByOrderId";
		$.ajax({
			url:url,
			data:condi,
			type:"POST",
			dataType:"json",
			context:this,
			success: function(data){
				var status = data.success || false;
				if(status){
					changeOrderStagingListHtml(data);
				}
				else{
					var msg = data.message || "获取用户还款订单失败";
					Utils.alert(msg);
				}
			},
			error:function(data){
			}
		});
	}

	function changeOrderStagingListHtml(data){

		var html = [];
		var obj = data.list || [];
		var dd = "";
		if(g.pa != 1){
			dd = obj[1].monthPoundage || "";
		}
		var other = data.other || [];
		g.couponId = other.couponId || "";
		g.month_Poundage = dd == "" ?  false : true ;
		var showRepay = true;
		var yuqi_number = 0;//统计已逾期个数
		for(var i = 0,len = obj.length; i < len; i++){
			var d = obj[i];
			var orderId = d.orderId || "";
			var repaymentRecordId = d.repaymentRecordId || "主键";
			var repaymentTypeDesc = d.repaymentTypeDesc || "";
			var residuePrincipal = d.residuePrincipal || 0;
			var expectRepaymentTime = d.expectRepaymentTime || "";
			var overdueTime = d.overdueTime || 0;
			var overdueFee = d.overdueFee || 0;
			var realRepaymentTime = d.realRepaymentTime || "无";
			var monthPoundage = d.monthPoundage || "";
			var status = d.status || "";
			var repaymentType = d.repaymentType || "";
			var overdueCount = d.overdueCount || "";

			html.push('<li>');
			html.push('<div class="order-item-top">');
			if(status == "101903"){
				html.push('<div class="order-state state-grey yuqi_color">已逾期</div>');
			}
			else if(status == "101904"){				
				html.push('<div class="order-state state-grey yuqi_color">已违约</div>');
			}
			else if(status == "101901"){
				if(g.pa == "1"){html.push('<div class="order-state state-grey">待缴服务费</div>');}
				else {html.push('<div class="order-state state-grey">还款中</div>');}
			}
			else if(status == "101902"){
				html.push('<div class="order-state state-grey">已还款</div>');
			}
			html.push('<div class="order-type-name">');
			html.push('<i class="common-ico product-ico"></i>还款详情');
			html.push('</div>');
			html.push('</div>');
			if(status == "101903" || status == "101904"){
			html.push('<div class="order-item-box yuqi1">');
			}else {
			html.push('<div class="order-item-box">');	
			}
			html.push('<div class="box-item">');
			html.push('<div class="box-item-text">');
			html.push('<p><i class="common-ico product-tip3"></i>还款类型：<span class="color-green">' + repaymentTypeDesc + '</span></p>');
			html.push('</div>');
			html.push('</div>');
			html.push('<div class="box-item">');
			html.push('<div class="box-item-text">');
			html.push('<p><i class="common-ico product-tip2"></i>还款本金：<span class="color-green">' + residuePrincipal + '</span>元</p>');
			html.push('</div>');
			html.push('</div>');
			if(g.month_Poundage && i == 0 && g.couponId == "8"){
				html.push('<div class="box-item">');
				html.push('<div class="box-item-text">');
				html.push('<p><i class="common-ico product-tip2"></i>还款服务费：<span style="color:#ff5f00;" class="color-green">享贴息活动已减免</span></p>');
				html.push('</div>');
				html.push('</div>');								
			}else if(g.month_Poundage){
				html.push('<div class="box-item">');
				html.push('<div class="box-item-text">');
				html.push('<p><i class="common-ico product-tip2"></i>还款服务费：<span class="color-green">' + monthPoundage + '</span>元</p>');
				html.push('</div>');
				html.push('</div>');
			}
			html.push('<div class="box-item">');
			html.push('<div class="box-item-text">');
			html.push('<p><i class="common-ico product-tip3"></i>应还时间：<span class="color-green">' + expectRepaymentTime + '</span></p>');
			html.push('</div>');
			html.push('</div>');
			html.push('<div class="box-item">');
			html.push('<div class="box-item-text">');
			html.push('<p><i class="common-ico product-tip3"></i>逾期天数：<span class="color-green">' + overdueTime + '</span>天</p>');
			html.push('</div>');
			html.push('</div>');
			html.push('<div class="box-item">');
			html.push('<div class="box-item-text">');
			html.push('<p><i class="common-ico product-tip2"></i>逾期费用：<span class="color-green">' + overdueFee + '</span>元</p>');
			html.push('</div>');
			html.push('</div>');
			html.push('</div>');
			if(status == "101904"){
				yuqi_number++;
				g.orderDetailInfo[repaymentRecordId] = d;
				if(showRepay && yuqi_number == overdueCount){
					showRepay = false;
					html.push('<div class="order-item-btn-box">');
					html.push('<a href="javascript:repayment(\'' + repaymentRecordId + '\')" class="item-btn item-btn-green">支付</a>');
					html.push('</div>');
				}
			}
			else if(status == "101903"){
				yuqi_number++;
				g.orderDetailInfo[repaymentRecordId] = d;
				if(showRepay && yuqi_number == overdueCount){
					showRepay = false;
					html.push('<div class="order-item-btn-box">');
					html.push('<a href="javascript:repayment(\'' + repaymentRecordId + '\')" class="item-btn item-btn-green">支付</a>');
					html.push('</div>');
				}
			}
			else if(status == "101901"){
				g.orderDetailInfo[repaymentRecordId] = d;
				if(showRepay){
					showRepay = false;
					html.push('<div class="order-item-btn-box">');
					html.push('<a href="javascript:repayment(\'' + repaymentRecordId + '\')" class="item-btn item-btn-green">支付</a>');
					html.push('</div>');
				}
			}
			html.push('</li>');

			//~ if(status == "101901"){
				//~ g.orderDetailInfo[repaymentRecordId] = d;
				//~ html.push('<td>还款中</td>');
				//~ if(showRepay){
					//~ showRepay = false;
					//~ html.push('<td><a href="javascript:repayment(\'' + repaymentRecordId + '\')">还款</a></td>');
				//~ }
				//~ else{
					//~ html.push('<td><a href="javascript:void(0)"></a></td>');
				//~ }
			//~ }
		}

		var pobj = data.obj || {};

		if(obj.length > 0){
			//var page = countListPage(pobj);
			//html.push(page);
		}
		else{
			Utils.alert("没有订单数据");
		}

		$("#orderstaginglist").html(html.join(''));

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
			getUserOrderStagingList();
		}
		else{
			Utils.alert("当前是最后一页");
		}
	}


	function repayment(id){
		var d = g.orderDetailInfo[id];
		var info = JSON.stringify(d);
		Utils.offLineStore.set("repay_userorderinfo_list",info,false);
		if(g.pa==1){location.href = "repayment-list-detail.html?pa=1&co="+g.couponId}
		else{location.href = "repayment-list-detail.html?co="+g.couponId}
		return;

		/*以下不用*/
		var orderId = d.orderId || "";
		var repaymentRecordId = d.repaymentRecordId || "主键";
		var repaymentTypeDesc = d.repaymentTypeDesc || "";
		var totalResiduePrincipal = d.totalResiduePrincipal || 0;
		var firstExpectRepaymentTime = d.firstExpectRepaymentTime || "";
		var firstOverdueTime = d.firstOverdueTime || 0;
		var totalOverdueFee = d.totalOverdueFee || 0;
		var totalCurrentBalance = d.totalCurrentBalance || 0 ;
		var realRepaymentTime = d.realRepaymentTime || "无";

		var dd = JSON.parse(g.orderInfo) || {};
		var orderId = dd.orderId || "";
		var contractNo = dd.contractNo || "";
		var packageName = dd.packageName || "";
		var packageMoney = dd.packageMoney - 0 || 0;
		var statusDes = dd.statusDes || "";
		var status = dd.status || "";
		var fenQiTimes = dd.fenQiTimes || 0;
		var poundage = dd.poundage - 0 || 0;
		var moneyMonth = dd.moneyMonth - 0 || 0;
		var noRepaymentTimes = dd.noRepaymentTimes || 0;

		var html = [];
		html.push('<table class="common-table" cellpadding="0" cellspacing="0">');
		html.push('<tr>');
		html.push('<td width="150" class="odd">订单编号</td>');
		html.push('<td class="even">' + orderId + '</td>');
		html.push('</tr>');
		html.push('<tr>');
		html.push('<td class="odd">合同编号</td>');
		html.push('<td class="even">' + contractNo + '</td>');
		html.push('</tr>');
		html.push('<tr>');
		html.push('<td class="odd">产品类型</td>');
		html.push('<td class="even">' + packageName + '</td>');
		html.push('</tr>');
		html.push('<tr>');
		html.push('<td class="odd">贷款金额</td>');
		html.push('<td class="even">' + packageMoney + '元</td>');
		html.push('</tr>');
		html.push('<tr>');
		html.push('<td class="odd">分期月数</td>');
		html.push('<td class="even">' + fenQiTimes + '个月</td>');
		html.push('</tr>');
		html.push('<tr>');
		html.push('<td class="odd">服务费</td>');
		html.push('<td class="even">' + poundage + '元</td>');
		html.push('</tr>');
		html.push('<tr>');
		html.push('<td class="odd">每月还款本金</td>');
		html.push('<td class="even">' + moneyMonth + '元</td>');
		html.push('</tr>');
		html.push('<tr>');
		html.push('<td class="odd">当前状态</td>');
		html.push('<td class="even">' + statusDes + '</td>');
		html.push('</tr>');
		html.push('<tr>');
		html.push('<td class="odd">待还期数</td>');
		html.push('<td class="even">' + noRepaymentTimes + '期</td>');
		html.push('</tr>');
		html.push('<tr>');
		html.push('<td class="odd">总还款金额</td>');
		html.push('<td class="even">' + (packageMoney + poundage) + '元</td>');
		html.push('</tr>');
		html.push('<tr>');
		html.push('<td class="odd">待还金额</td>');
		html.push('<td class="even">' + moneyMonth + '元</td>');
		html.push('</tr>');
		html.push('</table>');
		html.push('<table class="common-table1" cellpadding="0" cellspacing="0" style="margin-top:25px;">');
		html.push('<tr>');
		html.push('<th>还款类型</th>');
		html.push('<th>还款本金</th>');
		html.push('<th>应还时间</th>');
		html.push('<th>逾期天数</th>');
		html.push('<th>逾期费用</th>');
		html.push('<th>应还金额</th>');
		html.push('</tr>');
		html.push('<tr>');
		html.push('<td>' +repaymentTypeDesc + '</td>');
		html.push('<td>' + totalResiduePrincipal + '元</td>');
		html.push('<td>' + firstExpectRepaymentTime + '</td>');
		html.push('<td>' + firstOverdueTime + '天</td>');
		html.push('<td>' + totalOverdueFee + '元</td>');
		html.push('<td>' + totalCurrentBalance + '元</td>');
		html.push('</tr>');
		html.push('</table>');
		html.push('<div class="btn-box">');
		html.push('<input type="button" class="common-btn btn-light-green" value="确认还款" onclick="confirmRepayment(\'' + repaymentRecordId + '\',' + totalCurrentBalance + ')" />');
		html.push('<input type="button" class="common-btn btn-grey" value="取消" onclick="hidePop()" />');
		html.push('</div>');

		$("#detailinfodiv").html(html.join(''));
		showOrderPop('#payBackPop');
	}

	function confirmRepayment(repaymentRecordId,yinghuanjine){
		//先判断用户有没有判定银行卡
		sendIsExistBindBankCardHttp(repaymentRecordId,yinghuanjine);

		//~ g.httpTip.show();
		//~ var url = Base.serverUrl + "order/repaymentDoneByRepaymentRecordId";
		//~ var condi = {};
		//~ condi.repaymentRecordId = repaymentRecordId;
		//~ condi.login_token = g.login_token;
		//~ $.ajax({
			//~ url:url,
			//~ data:condi,
			//~ type:"POST",
			//~ dataType:"json",
			//~ context:this,
			//~ success: function(data){
				//~ console.log("confirmRepayment",data);
				//~ var status = data.success || false;
				//~ if(status){
					//~ hidePop();
					//~ Utils.alert("还款成功");
					//~ getUserOrderStagingList();
					//~ //changeOrderStagingListHtml(data);
				//~ }
				//~ else{
					//~ var msg = data.message || "还款失败";
					//~ Utils.alert(msg);
				//~ }
				//~ g.httpTip.hide();
			//~ },
			//~ error:function(data){
				//~ g.httpTip.hide();
			//~ }
		//~ });
	}


	function sendIsExistBindBankCardHttp(repaymentRecordId,yinghuanjine){
		g.httpTip.show();
		var url = Base.serverUrl + "payPc/isExistBindBankCard";
		var condi = {};
		condi.customerId = g.customerId;
		condi.login_token = g.login_token;

		$.ajax({
			url:url,
			data:condi,
			type:"POST",
			dataType:"json",
			context:this,
			success: function(data){
				console.log("sendIsExistBindBankCardHttp",data);
				var status = data.success || false;
				if(status){
					//用户绑定银行卡
					location.href = "/anjia/card-pay2.html?recordId=" + repaymentRecordId + "&p=" + yinghuanjine;
				}
				else{
					//用户没有绑定银行卡
					location.href = "/anjia/bind-card.html?recordId=" + repaymentRecordId + "&p=" + yinghuanjine;
				}
				g.httpTip.hide();
			},
			error:function(data){
				g.httpTip.hide();
			}
		});
	}

	window.OrderLeftProtocolClick = OrderLeftProtocolClick;
	window.confirmRepayment = confirmRepayment;
	window.repayment = repayment;
});





