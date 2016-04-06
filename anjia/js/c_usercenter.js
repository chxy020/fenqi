/**
 * file:个人资料
 * author:chenxy
*/
//页面初始化
$(function(){
	var g = {};
	g.customerId = "";
	g.login_token = Utils.offLineStore.get("token",false) || "";
	g.weiyue_message = Utils.offLineStore.get("weiyue_message",false) || "";
	g.yuqi_weiyue = false;//判断用户是否有逾期或者违约的单子
	//g.page = Utils.getQueryString("p") - 0;
	g.httpTip = new Utils.httpTip({});
	g.totalPage = 1;
	g.currentPage = 1;
	g.pageSize = 10;
	g.orderDetailInfo = {};
	g.orderInfo = {};
	g.orderStatus = Utils.getQueryString("ostatus") || "";
	g.get_coupons_money = 0;
	g.useLeastMoney = 0;//优惠券限制使用最低金额
	g.coupons = [];
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

		//获取订单状态 select框
		sendGetUserInfoDicHttp();
		//get_coupons_money();//获取优惠券
		if(g.weiyue_message != "1"){yuqi_message_fuc();}
	}


	//头像
	$("html,body").click(function(){
		if($(".yuqi_box1").css("display") != "none" || $(".yuqi_box2").css("display") != "none"){
			$(".yuqi_box").slideUp(300);
			Utils.offLineStore.set("weiyue_message",1,false);
		}
	});
	$(".yuqi_box").click(function(event){
		event.stopPropagation(); 
	});
	$(document).on("change","#avatar",avatarBtnUp);
	$("#orderstatus").bind("change",changeOrderStatus);
	$(".yuqi_box a.close_btn,.yuqi_box.yuqi_box2 .btn a.a_btn2").bind("click",close_box);
	$(".yuqi_box span.color").bind("click",show_toggle);
	
	/* 逾期 */
	function yuqi_message_fuc(){
		//order/selectCustomerOrderNextRepaymentRecords
		var condi = {};
		condi.login_token = g.login_token;
		var url = Base.serverUrl + "order/selectCustomerOrderNextRepaymentRecords";//修改之前queryOrdersController
		$.ajax({
			url:url,
			data:condi,
			type:"POST",
			dataType:"json",
			context:this,
			success: function(data){
				var success = data.success || false;
				if(success){
					var obj = data.list || [];
					var yuqi = "",weiyue = "",j_yuqi = "";
					for(var i = 0,len = obj.length; i < len; i++){
						var d = obj[i];
						var repaymentStatus =d.repaymentStatus || "";
						var orderStatus = d.orderStatus || "";
						var orderId = d.orderId || "";
						var repaymentTimes = d.repaymentTimes || "";
						var newRepaymentTimes = d.newRepaymentTimes || "";//最新一笔逾期的
						var repayResidueDay = d.repayResidueDay || 0;
						
						if(repaymentStatus == "101901"){
							j_yuqi +='您的订单'+orderId+'的第'+repaymentTimes+'笔分期距离付款截止日期仅有'+repayResidueDay+'天；';
						}
						else if(orderStatus == "100510"){
							yuqi +='您的订单'+orderId+'的第'+newRepaymentTimes+'笔分期已逾期；';
						}
						else if(orderStatus == "100511"){
							weiyue += '您的订单'+orderId+'已违约；';
						}							
					}
					if(j_yuqi != ""){
						$(".yuqi_box.yuqi_box1 p.text .text_list").html(j_yuqi);
						setTimeout(function(){$(".yuqi_box.yuqi_box1").slideDown(300);},500);
					}
					if(yuqi != ""){
						$(".yuqi_box.yuqi_box2 p.text1 .text_list").html(yuqi);
						$(".yuqi_box.yuqi_box2").addClass("yuqi");
						if($(".yuqi_box.yuqi_box2").css("display") == "none"){
							setTimeout(function(){$(".yuqi_box.yuqi_box2").fadeIn(500);},500);																
						}
					}
					if(weiyue != ""){
						$(".yuqi_box.yuqi_box2 p.text2 .text_list").html(weiyue);
						$(".yuqi_box.yuqi_box2").addClass("weiyue");
						if($(".yuqi_box.yuqi_box2").css("display") == "none"){
							setTimeout(function(){$(".yuqi_box.yuqi_box2").fadeIn(500);},500);	
						}
					}
					
				}
				else{
					var msg = data.message || "获取逾期信息失败";
					Utils.alert(msg);
				}
			},
			error:function(data){
			}
		});
		
		
	}

		/* 关闭窗口 */
	function close_box(event){
		$(this).parents(".yuqi_box").slideUp(300);
		Utils.offLineStore.set("weiyue_message",1,false);
		event.stopPropagation(); 
	}
	$(".yuqi_box.yuqi_box2 .btn a.a_btn1").click(function(event){
		$(this).parents(".yuqi_box").slideUp(300);
		Utils.offLineStore.set("weiyue_message",1,false);
		location.href="/anjia/usercenter.html?item=1&ostatus=100510";
		event.stopPropagation();
	})
	$(".yuqi_box.yuqi_box2 .btn a.a_btn3").click(function(event){
		$(this).parents(".yuqi_box").slideUp(300);
		Utils.offLineStore.set("weiyue_message",1,false);
		location.href="/anjia/usercenter.html?item=1&ostatus=100511";
		event.stopPropagation();
	})
		/* 显示详情 */
	function show_toggle(){
		
		$(this).toggleClass("active").parents(".yuqi_box").find("p.text_message").slideToggle(300);
		if($(this).html() == "查看详情"){$(this).parents(".yuqi_box").find("span.color").html("隐藏详情");}else{$(this).parents(".yuqi_box").find("span.color").html("查看详情");}
		$(this).parents(".yuqi_box").css("z-index","999").siblings(".yuqi_box").css("z-index","998");
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

		var phoneNumber = obj.phoneNumber || "";
		$("#userphone").html(phoneNumber);

		var avatar = obj.icon || "";
		if(avatar !== ""){
			avatar = avatar + "?t=" + (new Date() - 0);
			$("#avatarimg").attr("src",avatar);
		}
	}
	//左侧点击判断进入哪个菜单
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
		if(condi.Status == "100"){//
			//待放款新逻辑
			//sendGetRepayOrderListHttp(condi);
		}else if(condi.status == "100505"){//待缴费
		
			sendGetPayOrderListHttp(condi);	
		}else if(condi.status == "100501"){//未完成
		
			sendGetPayOrderListHttp1(condi);	
/* 		}else if(condi.status == "100503"){//风控审核中
		
			sendGetPayOrderListHttp2(condi);	
		}else if(condi.status == "100502"){//商家审核中
		
			sendGetPayOrderListHttp3(condi);	 */
		}else if(condi.status == "100500"){//我的额度
		
			sendGetRepayOrderListHttp(condi);	
		}else if(condi.status == "100502100503"){//审核中
		
			sendGetPayOrderListHttp3(condi);	
		}else if(condi.status == "100506"){//待放款
		
			sendGetPayOrderListHttp4(condi);			
		}else if(condi.status == "100507"){//还款中
		
			sendGetPayOrderListHttp5(condi);			
		}else if(condi.status == "100508"){//已还清
		
			sendGetPayOrderListHttp6(condi);
		}else if(condi.status == "100509"){//拒绝
		
			sendGetPayOrderListHttp7(condi);	
		}else if(condi.status == "100504"){//回收站
		
			sendGetPayOrderListHttp8(condi);			
		}else if(condi.status == "100510"){//已逾期
		
			sendGetPayOrderListHttp9(condi);			
		}else if(condi.status == "100511"){//已违约
		
			sendGetPayOrderListHttp10(condi);	
		}else if(condi.status == "100512"){//逾期已还清
		
			sendGetPayOrderListHttp11(condi);
		}else if(condi.status == "100513"){//违约已还清
		
			sendGetPayOrderListHttp12(condi);				
			
		}else{
			
			sendGetUserOrderListHttp(condi);
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
			var option = [],idad="",score=0;
			option.push('<option value="">全部订单</option>');
			for(var k in data){
				var id = k || "";
				var name = data[k] || "";
				if(id=="100502"||id=="100503"){
					idad+=id;score++;
					if(score==2){option.push('<option value="' + idad + '">审核中</option>');}
				}else{
					option.push('<option value="' + id + '">' + name + '</option>');
				}	
			}
			$("#" + ids[i]).html(option.join(''));
		}
		if(g.orderStatus !== ""){
			$("#orderstatus").val(g.orderStatus);
		}
	}

	function changeOrderStatus(){
		g.currentPage = 1;
		var state = $("#orderstatus").val() || "";
		location.href="/anjia/usercenter.html?item=1&ostatus="+state;
		//getUserOrderList();
	}



	function sendGetUserOrderListHttp(condi){
		g.httpTip.show();
		var url = Base.serverUrl + "order/queryOrderList";//修改之前queryOrdersController
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

	//获取放款列表 查询我的支付 我的额度
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
		condi.loanStatus = "102401102402102403";
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

//默认加载时执行
	function changeOrderListHtml(data){
		var html = [];

		html.push('<table class="order-table" cellpadding="0" cellspacing="0">');
		html.push('<tr>');
		html.push('<th width="160">订单编号</th>');
		html.push('<th width="130">合同编号</th>');
		html.push('<th width="110">合作商家</th>');
		html.push('<th width="110">申请分期金额</th>');
		html.push('<th width="100">订单状态</th>');
		/* html.push('<th width="80">最近待还</th>'); */
		html.push('<th width="110">申请分期期数</th>');
		html.push('<th>操作</th>');
		html.push('</tr>');
		var obj = data.list || [];
		for(var i = 0,len = obj.length; i < len; i++){
			var d = obj[i];
			var poundageRecordId =d.poundageRecordId || "";			
			var orderId = d.orderId || "";
			var contractNo = d.contractNo || "";
			var packageName = d.packageName || "";
			var subsidiary = d.subsidiary || "";
			var applyPackageMoney = d.applyPackageMoney || 0;
			var statusDes = d.statusDes || "";
			var status = d.status || "";
			var applyFenQiTimes = d.applyFenQiTimes || 0;
			var noRepaymentTimes = d.noRepaymentTimes || 0;
			var currentBalance = d.currentBalance || 0;//待还金额
			
		    if(status == "100510" || status == "100511"){html.push('<tr class="yuqi1">');}
			else{html.push('<tr>');}
			
			html.push('<td>' + orderId + '</td>');
			html.push('<td>' + contractNo + '</td>');
			html.push('<td>' + subsidiary + '</td>');
			html.push('<td>' + applyPackageMoney + '元</td>');
			if(status == "100510" || status == "100511"){html.push('<td class="yuqi_color">' + statusDes + '</td>');}
			else{html.push('<td>' + statusDes + '</td>');}				
			/* html.push('<td>' + noRepaymentTimes + '期</td>'); */
			html.push('<td>' + applyFenQiTimes + '期</td>');

			g.orderInfo[orderId] = d;
			g.orderDetailInfo[poundageRecordId] = d;
			if(status == "100501"){
				html.push('<td><a class="a3" href="/anjia/mystaging.html?orderid=' + orderId + '">编辑</a><a class="a2" href="javascript:deleteOrderById(\'' + orderId + '\')">删除</a></td>');
			}
			else if(status == "100502"){
				//100502: "商家审核中"
				html.push('<td><a class="a1" href="javascript:showOrderDetail(\'' + orderId + '\',1)">查看</a><a class="a2" href="javascript:deleteOrderById(\'' + orderId + '\')">删除</a></td>');
			}
			else if(status == "100503"){
				//100503: "风控审核中
				html.push('<td><a class="a1" href="javascript:showOrderDetail(\'' + orderId + '\',1)">查看</a></td>');
			}
			else if(status == "100504" || status == "100509"){
				html.push('<td><a class="a2" href="javascript:deleteOrderById(\'' + orderId + '\')">删除</a></td>');
			}
			else if(status == "100505"){
				//100505: "待缴手续费"showOrderDetail
				//html.push('<td><a href="/anjia/orderdetail.html?orderId=' + orderId + '">查看</a></td>');
				html.push('<td><a class="a4" href="javascript:repayment(\'' + poundageRecordId + '\',\'' + orderId + '\')">支付</a></td>');
			}
			else if(status == "100506"){
				//100506: "待放款"
				html.push('<td><a class="a1" href="javascript:showOrderDetail(\'' + orderId + '\',0)">查看</a></td>');
			}
			else if(status == "100507"){
				//100506: "待放款"
				html.push('<td><a class="a1" href="javascript:showOrderDetail(\'' + orderId + '\',0)">查看</a></td>');
			}
			else if(status == "100508"){
				html.push('<td><a class="a1" href="javascript:showOrderDetail(\'' + orderId + '\',0)">查看</a><a class="a2" href="javascript:deleteOrderById(\'' + orderId + '\')">删除</a></td>');
			}
			else if(status == "100510"){
				//已逾期
				html.push('<td><a class="a1" href="javascript:showOrderDetail(\'' + orderId + '\',0)">查看</a></td>');
			}
			else if(status == "100511"){
				//已违约
				html.push('<td><a class="a1" href="javascript:showOrderDetail(\'' + orderId + '\',0)">查看</a></td>');
			}
			else if(status == "100512"){
				//逾期已还清
				html.push('<td><a class="a1" href="javascript:showOrderDetail(\'' + orderId + '\',0)">查看</a></td>');
			}
			else if(status == "100513"){
				//违约已还清
				html.push('<td><a class="a1" href="javascript:showOrderDetail(\'' + orderId + '\',0)">查看</a></td>');
			}
			else if(status == "100514"){
				//已还清
				html.push('<td></td>');
			}
			else if(status == "100515"){
				//待确认
				html.push('<td><a class="a1" href="javascript:showOrderDetail(\'' + orderId + '\',-1)">查看</a><a class="a3" href="javascript:confirmOrder_fun(\'' + orderId + '\')">接受</a></td>');
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
	function confirmOrder_fun(orderId){
		if(confirm("确认接受订单审批款项")){
		var condi = {};
		condi.login_token = g.login_token;
		condi.customerId = g.customerId;
		condi.orderId = orderId;
		g.httpTip.show();
		var url = Base.serverUrl + "order/confirmOrder";//修改之前queryOrdersController
		$.ajax({
			url:url,
			data:condi,
			type:"POST",
			dataType:"json",
			context:this,
			success: function(data){
				//console.log("sendGetUserOrderListHttp",data);
				var status = data.success || false;
				if(status){
					location.href = "/anjia/usercenter.html?item=1";
				}
				else{
					var msg = data.message || "确认失败";
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
		//待缴费
function sendGetPayOrderListHttp(condi){
		g.httpTip.show();
		var url = Base.serverUrl + "order/queryOrderList";//修改之前queryOrdersController
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
					changePayOrderListHtml(data);
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
	//待缴费
	function changePayOrderListHtml(data){
		var html = [];

		html.push('<table class="order-table" cellpadding="0" cellspacing="0">');
		html.push('<tr>');
		html.push('<th width="160">订单编号</th>');
		html.push('<th width="130">合同编号</th>');
		html.push('<th width="110">合作商家</th>');
		html.push('<th width="110">审批分期金额</th>');
		html.push('<th width="90">审批分期期数</th>');
		html.push('<th width="100">应缴服务费</th>');
		/* html.push('<th width="80">最近待还</th>'); */
		html.push('<th width="100">订单状态</th>');
		html.push('<th>操作</th>');
		html.push('</tr>');
		var obj = data.list || [];
		for(var i = 0,len = obj.length; i < len; i++){
			var d = obj[i];
			var poundageRecordId =d.poundageRecordId || "";			
			var orderId = d.orderId || "";
			var contractNo = d.contractNo || "";
			var subsidiary = d.subsidiary || "";
			var packageMoney = d.packageMoney || 0;
			var statusDes = d.statusDes || "";
			var status = d.status || "";
			var fenQiTimes = d.fenQiTimes || 0;
			var noRepaymentTimes = d.noRepaymentTimes || 0;
			var poundage=d.poundage || 0;
			html.push('<tr>');
			html.push('<td>' + orderId + '</td>');
			html.push('<td>' + contractNo + '</td>');
			html.push('<td>' + subsidiary + '</td>');
			html.push('<td>' + packageMoney + '元</td>');
			html.push('<td>' + fenQiTimes + '期</td>');
			html.push('<td>' + poundage + '元</td>');
			/* html.push('<td>' + noRepaymentTimes + '期</td>'); */
			html.push('<td>' + statusDes + '</td>');

			g.orderInfo[orderId] = d;
			g.orderDetailInfo[poundageRecordId] = d;
			if(status == "100501"){
				html.push('<td><a class="a3" href="/anjia/mystaging.html?orderid=' + orderId + '">编辑</a><a class="a2" href="javascript:deleteOrderById(\'' + orderId + '\')">删除</a></td>');
			}
			else if(status == "100502"){
				//100502: "商家审核中"
				html.push('<td><a class="a1" href="javascript:showOrderDetail(\'' + orderId + '\',1)">查看</a><a class="a2" href="javascript:deleteOrderById(\'' + orderId + '\')">删除</a></td>');
			}
			else if(status == "100503"){
				//100503: "风控审核中
				html.push('<td><a class="a1" href="javascript:showOrderDetail(\'' + orderId + '\',1)">查看</a><a class="a2" href="javascript:deleteOrderById(\'' + orderId + '\')">删除</a></td>');
			}
			else if(status == "100504" || status == "100509"){
				html.push('<td><a class="a2" href="javascript:deleteOrderById(\'' + orderId + '\')">删除</a></td>');
			}
			else if(status == "100505"){
				//100505: "待缴手续费"showOrderDetail
				//html.push('<td><a href="/anjia/orderdetail.html?orderId=' + orderId + '">查看</a></td>');
				html.push('<td><a class="a4" href="javascript:repayment(\'' + poundageRecordId + '\',\'' + orderId + '\')">支付</a></td>');
			}
			else if(status == "100506"){
				//100506: "待放款"
				html.push('<td><a class="a1" href="javascript:showOrderDetail(\'' + orderId + '\',0)">查看</a></td>');
			}
			else if(status == "100507"){
				//100506: "待放款"
				html.push('<td><a class="a1" href="javascript:showOrderDetail(\'' + orderId + '\',0)">查看</a></td>');
			}
			else if(status == "100508"){
				html.push('<td><a class="a1" href="javascript:showOrderDetail(\'' + orderId + '\',0)">查看</a><a class="a2" href="javascript:deleteOrderById(\'' + orderId + '\')">删除</a></td>');
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
	//未完成
function sendGetPayOrderListHttp1(condi){
		g.httpTip.show();
		var url = Base.serverUrl + "order/queryOrderList";//修改之前queryOrdersController
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
					changePayOrderListHtml1(data);
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
	//未完成
	function changePayOrderListHtml1(data){
		var html = [];

		html.push('<table class="order-table" cellpadding="0" cellspacing="0">');
		html.push('<tr>');
		html.push('<th width="160">订单编号</th>');
		html.push('<th width="130">合同编号</th>');
		html.push('<th width="110">合作商家</th>');
		html.push('<th width="110">申请分期金额</th>');
		html.push('<th width="110">申请分期期数</th>');
		/* html.push('<th width="100">应缴服务费</th>'); */
		/* html.push('<th width="80">最近待还</th>'); */
		html.push('<th width="100">订单状态</th>');
		html.push('<th>操作</th>');
		html.push('</tr>');
		var obj = data.list || [];
		for(var i = 0,len = obj.length; i < len; i++){
			var d = obj[i];
			var poundageRecordId =d.poundageRecordId || "";			
			var orderId = d.orderId || "";
			var contractNo = d.contractNo || "";
			var subsidiary = d.subsidiary || "";
			var applyPackageMoney = d.applyPackageMoney || 0;
			var statusDes = d.statusDes || "";
			var status = d.status || "";
			var applyFenQiTimes = d.applyFenQiTimes || 0;
			var noRepaymentTimes = d.noRepaymentTimes || 0;
			
			html.push('<tr>');
			html.push('<td>' + orderId + '</td>');
			html.push('<td>' + contractNo + '</td>');
			html.push('<td>' + subsidiary + '</td>');
			html.push('<td>' + applyPackageMoney + '元</td>');
			html.push('<td>' + applyFenQiTimes + '期</td>');
			/* html.push('<td>' + noRepaymentTimes + '元</td>'); */
			/* html.push('<td>' + noRepaymentTimes + '期</td>'); */
			html.push('<td>' + statusDes + '</td>');

			g.orderInfo[orderId] = d;
			g.orderDetailInfo[poundageRecordId] = d;
			if(status == "100501"){
				html.push('<td><a class="a3" href="/anjia/mystaging.html?orderid=' + orderId + '">编辑</a><a class="a2" href="javascript:deleteOrderById(\'' + orderId + '\')">删除</a></td>');
			}
			else if(status == "100502"){
				//100502: "商家审核中"
				html.push('<td><a class="a1" href="javascript:showOrderDetail(\'' + orderId + '\',1)">查看</a><a class="a2" href="javascript:deleteOrderById(\'' + orderId + '\')">删除</a></td>');
			}
			else if(status == "100503"){
				//100503: "风控审核中
				html.push('<td><a class="a1" href="javascript:showOrderDetail(\'' + orderId + '\',1)">查看</a><a class="a2" href="javascript:deleteOrderById(\'' + orderId + '\')">删除</a></td>');
			}
			else if(status == "100504" || status == "100509"){
				html.push('<td><a class="a2" href="javascript:deleteOrderById(\'' + orderId + '\')">删除</a></td>');
			}
			else if(status == "100505"){
				//100505: "待缴手续费"showOrderDetail
				//html.push('<td><a href="/anjia/orderdetail.html?orderId=' + orderId + '">查看</a></td>');
				html.push('<td><a class="a4" href="javascript:repayment(\'' + poundageRecordId + '\')">支付</a><a class="a2" href="javascript:deleteOrderById(\'' + orderId + '\')">取消订单</a></td>');
			}
			else if(status == "100506"){
				//100506: "待放款"
				html.push('<td><a class="a1" href="javascript:showOrderDetail(\'' + orderId + '\',0)">查看</a></td>');
			}
			else if(status == "100507"){
				//100506: "待放款"
				html.push('<td><a class="a1" href="javascript:showOrderDetail(\'' + orderId + '\',0)">查看</a></td>');
			}
			else if(status == "100508"){
				html.push('<td><a class="a1" href="javascript:showOrderDetail(\'' + orderId + '\',0)">查看</a><a class="a2" href="javascript:deleteOrderById(\'' + orderId + '\')">删除</a></td>');
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
/* //风控审核中
function sendGetPayOrderListHttp2(condi){
		g.httpTip.show();
		var url = Base.serverUrl + "order/queryOrderList";//修改之前queryOrdersController
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
					changePayOrderListHtml2(data);
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
	//风控审核中
	function changePayOrderListHtml2(data){
		var html = [];

		html.push('<table class="order-table" cellpadding="0" cellspacing="0">');
		html.push('<tr>');
		html.push('<th width="160">订单编号</th>');
		html.push('<th width="130">合同编号</th>');
		html.push('<th width="110">合作商家</th>');
		html.push('<th width="110">申请分期金额</th>');
		html.push('<th width="100">订单状态</th>');
		//html.push('<th width="100">应缴服务费</th>');
		//html.push('<th width="80">最近待还</th>');
		html.push('<th width="80">申请分期期数</th>');
		html.push('<th>操作</th>');
		html.push('</tr>');
		var obj = data.list || [];
		for(var i = 0,len = obj.length; i < len; i++){
			var d = obj[i];
			var poundageRecordId =d.poundageRecordId || "";			
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
			//html.push('<td>' + noRepaymentTimes + '元</td>');
			//html.push('<td>' + noRepaymentTimes + '期</td>');
			html.push('<td>' + fenQiTimes + '期</td>');

			g.orderInfo[orderId] = d;
			g.orderDetailInfo[poundageRecordId] = d;
			if(status == "100501"){
				html.push('<td><a href="/anjia/mystaging.html?orderid=' + orderId + '">编辑</a></td>');
			}
			else if(status == "100502"){
				//100502: "商家审核中"
				html.push('<td><a href="javascript:showOrderDetail(\'' + orderId + '\',1)">查看</a></td>');
			}
			else if(status == "100503"){
				//100503: "风控审核中
				html.push('<td><a href="javascript:showOrderDetail(\'' + orderId + '\',1)">查看</a></td>');
			}
			else if(status == "100504" || status == "100509"){
				html.push('<td><a href="javascript:deleteOrderById(\'' + orderId + '\')">删除</a></td>');
			}
			else if(status == "100505"){
				//100505: "待缴手续费"showOrderDetail
				//html.push('<td><a href="/anjia/orderdetail.html?orderId=' + orderId + '">查看</a></td>');
				html.push('<td><a href="javascript:repayment(\'' + poundageRecordId + '\')">支付</a><a href="javascript:deleteOrderById(\'' + orderId + '\')">取消订单</a></td>');
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
				html.push('<td><a href="javascript:showOrderDetail(\'' + orderId + '\',0)">查看</a></td>');
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
	}*/
	//审核中
function sendGetPayOrderListHttp3(condi){
		g.httpTip.show();
		var url = Base.serverUrl + "order/queryOrderList";//修改之前queryOrdersController
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
					changePayOrderListHtml3(data);
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
	//审核中
	function changePayOrderListHtml3(data){
		var html = [];

		html.push('<table class="order-table" cellpadding="0" cellspacing="0">');
		html.push('<tr>');
		html.push('<th width="160">订单编号</th>');
		html.push('<th width="130">合同编号</th>');
		html.push('<th width="110">合作商家</th>');
		html.push('<th width="110">申请分期金额</th>');
		html.push('<th width="110">申请分期期数</th>');
		//html.push('<th width="100">应缴服务费</th>');
		//html.push('<th width="80">最近待还</th>'); 
		html.push('<th width="100">订单状态</th>');
		html.push('<th>操作</th>');
		html.push('</tr>');
		var obj = data.list || [];
		for(var i = 0,len = obj.length; i < len; i++){
			var d = obj[i];
			var poundageRecordId =d.poundageRecordId || "";			
			var orderId = d.orderId || "";
			var contractNo = d.contractNo || "";
			var subsidiary = d.subsidiary || "";
			var applyPackageMoney = d.applyPackageMoney || 0;
			var statusDes = d.statusDes || "";
			var status = d.status || "";
			var applyFenQiTimes = d.applyFenQiTimes || 0;
			var noRepaymentTimes = d.noRepaymentTimes || 0;
			
			html.push('<tr>');
			html.push('<td>' + orderId + '</td>');
			html.push('<td>' + contractNo + '</td>');
			html.push('<td>' + subsidiary + '</td>');
			html.push('<td>' + applyPackageMoney + '元</td>');
			html.push('<td>' + applyFenQiTimes + '期</td>');
			//html.push('<td>' + noRepaymentTimes + '元</td>');
			// html.push('<td>' + noRepaymentTimes + '期</td>');
			html.push('<td>' + statusDes + '</td>');

			g.orderInfo[orderId] = d;
			g.orderDetailInfo[poundageRecordId] = d;
			if(status == "100501"){
				html.push('<td><a class="a3" href="/anjia/mystaging.html?orderid=' + orderId + '">编辑</a></td>');
			}
			else if(status == "100502"){
				//100502: "商家审核中"
				html.push('<td><a class="a1" href="javascript:showOrderDetail(\'' + orderId + '\',1)">查看</a></td>');
			}
			else if(status == "100503"){
				//100503: "风控审核中
				html.push('<td><a class="a1" href="javascript:showOrderDetail(\'' + orderId + '\',1)">查看</a></td>');
			}
			else if(status == "100504" || status == "100509"){
				html.push('<td><a class="a2" href="javascript:deleteOrderById(\'' + orderId + '\')">删除</a></td>');
			}
			else if(status == "100505"){
				//100505: "待缴手续费"showOrderDetail
				//html.push('<td><a href="/anjia/orderdetail.html?orderId=' + orderId + '">查看</a></td>');
				html.push('<td><a class="a4" href="javascript:repayment(\'' + poundageRecordId + '\')">支付</a><a class="a2" href="javascript:deleteOrderById(\'' + orderId + '\')">取消订单</a></td>');
			}
			else if(status == "100506"){
				//100506: "待放款"
				html.push('<td><a class="a1" href="javascript:showOrderDetail(\'' + orderId + '\',0)">查看</a></td>');
			}
			else if(status == "100507"){
				//100506: "待放款"
				html.push('<td><a class="a1" href="javascript:showOrderDetail(\'' + orderId + '\',0)">查看</a></td>');
			}
			else if(status == "100508"){
				html.push('<td><a class="a1" href="javascript:showOrderDetail(\'' + orderId + '\',0)">查看</a></td>');
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
	//待放款
function sendGetPayOrderListHttp4(condi){
		g.httpTip.show();
		var url = Base.serverUrl + "order/queryOrderList";//修改之前queryOrdersController
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
					changePayOrderListHtml4(data);
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
	//待放款
	function changePayOrderListHtml4(data){
		var html = [];

		html.push('<table class="order-table" cellpadding="0" cellspacing="0">');
		html.push('<tr>');
		html.push('<th width="160">订单编号</th>');
		html.push('<th width="130">合同编号</th>');
		html.push('<th width="110">合作商家</th>');
		html.push('<th width="110">审批分期金额</th>');
		html.push('<th width="90">审批分期期数</th>');
		/* html.push('<th width="100">应缴服务费</th>'); */
		/* html.push('<th width="80">最近待还</th>'); */
		html.push('<th width="100">订单状态</th>');
		html.push('<th>操作</th>');
		html.push('</tr>');
		var obj = data.list || [];
		for(var i = 0,len = obj.length; i < len; i++){
			var d = obj[i];
			var poundageRecordId =d.poundageRecordId || "";			
			var orderId = d.orderId || "";
			var contractNo = d.contractNo || "";
			var subsidiary = d.subsidiary || "";
			var packageMoney = d.packageMoney || 0;
			var statusDes = d.statusDes || "";
			var status = d.status || "";
			var fenQiTimes = d.fenQiTimes || 0;
			var noRepaymentTimes = d.noRepaymentTimes || 0;
			
			html.push('<tr>');
			html.push('<td>' + orderId + '</td>');
			html.push('<td>' + contractNo + '</td>');
			html.push('<td>' + subsidiary + '</td>');
			html.push('<td>' + packageMoney + '元</td>');
			html.push('<td>' + fenQiTimes + '期</td>');
			/* html.push('<td>' + noRepaymentTimes + '元</td>'); */
			/* html.push('<td>' + noRepaymentTimes + '期</td>'); */
			html.push('<td>' + statusDes + '</td>');

			g.orderInfo[orderId] = d;
			g.orderDetailInfo[poundageRecordId] = d;
			if(status == "100501"){
				html.push('<td><a class="a3" href="/anjia/mystaging.html?orderid=' + orderId + '">编辑</a></td>');
			}
			else if(status == "100502"){
				//100502: "商家审核中"
				html.push('<td><a class="a1" href="javascript:showOrderDetail(\'' + orderId + '\',1)">查看</a></td>');
			}
			else if(status == "100503"){
				//100503: "风控审核中
				html.push('<td><a class="a1" href="javascript:showOrderDetail(\'' + orderId + '\',1)">查看</a></td>');
			}
			else if(status == "100504" || status == "100509"){
				html.push('<td><a class="a2" href="javascript:deleteOrderById(\'' + orderId + '\')">删除</a></td>');
			}
			else if(status == "100505"){
				//100505: "待缴手续费"showOrderDetail
				//html.push('<td><a href="/anjia/orderdetail.html?orderId=' + orderId + '">查看</a></td>');
				html.push('<td><a class="a4" href="javascript:repayment(\'' + poundageRecordId + '\')">支付</a><a class="a2" href="javascript:deleteOrderById(\'' + orderId + '\')">取消订单</a></td>');
			}
			else if(status == "100506"){
				//100506: "待放款"
				html.push('<td><a class="a1" href="javascript:showOrderDetail(\'' + orderId + '\',0)">查看</a></td>');
			}
			else if(status == "100507"){
				//100506: "待放款"
				html.push('<td><a class="a1" href="javascript:showOrderDetail(\'' + orderId + '\',0)">查看</a></td>');
			}
			else if(status == "100508"){
				html.push('<td><a class="a1" href="javascript:showOrderDetail(\'' + orderId + '\',0)">查看</a></td>');
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
	//还款中
function sendGetPayOrderListHttp5(condi){
		g.httpTip.show();
		var url = Base.serverUrl + "order/queryOrderList";//修改之前queryOrdersController
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
					changePayOrderListHtml5(data);
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
	//还款中
	function changePayOrderListHtml5(data){
		var html = [];

		html.push('<table class="order-table" cellpadding="0" cellspacing="0">');
		html.push('<tr>');
		html.push('<th width="140">订单编号</th>');
		html.push('<th width="120">合同编号</th>');
		html.push('<th width="105">合作商家</th>');
		html.push('<th width="110">审批分期金额</th>');
		html.push('<th width="90">订单状态</th>');
		/* html.push('<th width="100">应缴服务费</th>'); */
		html.push('<th width="80">待还金额</th>');
		html.push('<th width="80">待还期数</th>');
		html.push('<th width="90">审批分期期数</th>');
		html.push('<th>操作</th>');
		html.push('</tr>');
		var obj = data.list || [];
		for(var i = 0,len = obj.length; i < len; i++){
			var d = obj[i];
			var poundageRecordId =d.poundageRecordId || "";			
			var orderId = d.orderId || "";
			var contractNo = d.contractNo || "";
			var subsidiary = d.subsidiary || "";
			var packageMoney = d.packageMoney || 0;
			var statusDes = d.statusDes || "";
			var status = d.status || "";
			var fenQiTimes = d.fenQiTimes || 0;
			var noRepaymentTimes = d.noRepaymentTimes || 0;
			var nextRepaymentMoney= d.nextRepaymentMoney || 0;
			var daihuan= d.currentBalance || 0;
			
			html.push('<tr>');
			html.push('<td>' + orderId + '</td>');
			html.push('<td>' + contractNo + '</td>');
			html.push('<td>' + subsidiary + '</td>');
			html.push('<td>' + packageMoney + '元</td>');
			html.push('<td>' + statusDes + '</td>');
			html.push('<td>' + daihuan + '元</td>');			
			html.push('<td>' + noRepaymentTimes + '期</td>');
			html.push('<td>' + fenQiTimes + '期</td>');

			g.orderInfo[orderId] = d;
			g.orderDetailInfo[poundageRecordId] = d;
			if(status == "100501"){
				html.push('<td><a class="a3" href="/anjia/mystaging.html?orderid=' + orderId + '">编辑</a><a class="a2" href="javascript:deleteOrderById(\'' + orderId + '\')">删除</a></td>');
			}
			else if(status == "100502"){
				//100502: "商家审核中"
				html.push('<td><a class="a1" href="javascript:showOrderDetail(\'' + orderId + '\',1)">查看</a><a class="a2" href="javascript:deleteOrderById(\'' + orderId + '\')">删除</a></td>');
			}
			else if(status == "100503"){
				//100503: "风控审核中
				html.push('<td><a class="a1" href="javascript:showOrderDetail(\'' + orderId + '\',1)">查看</a><a class="a2" href="javascript:deleteOrderById(\'' + orderId + '\')">删除</a></td>');
			}
			else if(status == "100504" || status == "100509"){
				html.push('<td><a class="a2" href="javascript:deleteOrderById(\'' + orderId + '\')">删除</a></td>');
			}
			else if(status == "100505"){
				//100505: "待缴手续费"showOrderDetail
				//html.push('<td><a href="/anjia/orderdetail.html?orderId=' + orderId + '">查看</a></td>');
				html.push('<td><a class="a4" href="javascript:repayment(\'' + poundageRecordId + '\')">支付</a><a class="a2" href="javascript:deleteOrderById(\'' + orderId + '\')">取消订单</a></td>');
			}
			else if(status == "100506"){
				//100506: "待放款"
				html.push('<td><a class="a1" href="javascript:showOrderDetail(\'' + orderId + '\',0)">查看</a></td>');
			}
			else if(status == "100507"){
				//100506: "待放款"
				html.push('<td><a class="a1" href="javascript:showOrderDetail(\'' + orderId + '\',0)">查看</a></td>');
			}
			else if(status == "100508"){
				html.push('<td><a class="a1" href="javascript:showOrderDetail(\'' + orderId + '\',0)">查看</a><a class="a2" href="javascript:deleteOrderById(\'' + orderId + '\')">删除</a></td>');
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
	//已还清
function sendGetPayOrderListHttp6(condi){
		g.httpTip.show();
		var url = Base.serverUrl + "order/queryOrderList";//修改之前queryOrdersController
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
					changePayOrderListHtml6(data);
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
	//已还清
	function changePayOrderListHtml6(data){
		var html = [];

		html.push('<table class="order-table" cellpadding="0" cellspacing="0">');
		html.push('<tr>');
		html.push('<th width="160">订单编号</th>');
		html.push('<th width="130">合同编号</th>');
		html.push('<th width="110">合作商家</th>');
		html.push('<th width="110">审批分期金额</th>');
		html.push('<th width="110">审批分期期数</th>');
		html.push('<th width="100">订单状态</th>');
		html.push('<th width="80">还清日期</th>');
		/* html.push('<th width="100">应缴服务费</th>'); */
		/* html.push('<th width="80">最近待还</th>'); */
		
		/* html.push('<th>操作</th>'); */
		html.push('</tr>');
		var obj = data.list || [];
		for(var i = 0,len = obj.length; i < len; i++){
			var d = obj[i];
			var poundageRecordId =d.poundageRecordId || "";			
			var orderId = d.orderId || "";
			var contractNo = d.contractNo || "";
			var subsidiary = d.subsidiary || "";
			var packageMoney = d.packageMoney || 0;
			var statusDes = d.statusDes || "";
			var status = d.status || "";
			var fenQiTimes = d.fenQiTimes || 0;
			var noRepaymentTimes = d.noRepaymentTimes || 0;
			var repaymentFinishTime = d.repaymentFinishTime || "";
			
			html.push('<tr>');
			html.push('<td>' + orderId + '</td>');
			html.push('<td>' + contractNo + '</td>');
			html.push('<td>' + subsidiary + '</td>');
			html.push('<td>' + packageMoney + '元</td>');
			html.push('<td>' + fenQiTimes + '期</td>');
			html.push('<td>' + statusDes + '</td>');
			html.push('<td>' + repaymentFinishTime + '</td>');
			/* html.push('<td>' + noRepaymentTimes + '元</td>'); */
			/* html.push('<td>' + noRepaymentTimes + '期</td>'); */
			

			g.orderInfo[orderId] = d;
			/* g.orderDetailInfo[poundageRecordId] = d; */
		/* 	if(status == "100501"){
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
				html.push('<td><a href="javascript:repayment(\'' + poundageRecordId + '\')">支付</a><a href="javascript:deleteOrderById(\'' + orderId + '\')">取消订单</a></td>');
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
			} */
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
	//拒绝
function sendGetPayOrderListHttp7(condi){
		g.httpTip.show();
		var url = Base.serverUrl + "order/queryOrderList";//修改之前queryOrdersController
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
					changePayOrderListHtml7(data);
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
	//拒绝
	function changePayOrderListHtml7(data){
		var html = [];

		html.push('<table class="order-table" cellpadding="0" cellspacing="0">');
		html.push('<tr>');
		html.push('<th width="160">订单编号</th>');
		html.push('<th width="130">合同编号</th>');
		html.push('<th width="110">合作商家</th>');
		html.push('<th width="110">申请分期金额</th>');
		html.push('<th width="90">申请分期期数</th>');
		/* html.push('<th width="100">应缴服务费</th>'); */
		/* html.push('<th width="80">最近待还</th>'); */
		html.push('<th width="100">订单状态</th>');
		html.push('<th>操作</th>');
		html.push('</tr>');
		var obj = data.list || [];
		for(var i = 0,len = obj.length; i < len; i++){
			var d = obj[i];
			var poundageRecordId =d.poundageRecordId || "";			
			var orderId = d.orderId || "";
			var contractNo = d.contractNo || "";
			var subsidiary = d.subsidiary || "";
			var applyPackageMoney = d.applyPackageMoney || 0;
			var statusDes = d.statusDes || "";
			var status = d.status || "";
			var fenQiTimes = d.fenQiTimes || 0;
			var noRepaymentTimes = d.noRepaymentTimes || 0;
			
			html.push('<tr>');
			html.push('<td>' + orderId + '</td>');
			html.push('<td>' + contractNo + '</td>');
			html.push('<td>' + subsidiary + '</td>');
			html.push('<td>' + applyPackageMoney + '元</td>');
			html.push('<td>' + fenQiTimes + '期</td>');
			/* html.push('<td>' + noRepaymentTimes + '元</td>'); */
			/* html.push('<td>' + noRepaymentTimes + '期</td>'); */
			html.push('<td>' + statusDes + '</td>');

			g.orderInfo[orderId] = d;
			g.orderDetailInfo[poundageRecordId] = d;
			if(status == "100501"){
				html.push('<td><a class="a3" href="/anjia/mystaging.html?orderid=' + orderId + '">编辑</a><a class="a2" href="javascript:deleteOrderById(\'' + orderId + '\')">删除</a></td>');
			}
			else if(status == "100502"){
				//100502: "商家审核中"
				html.push('<td><a class="a1" href="javascript:showOrderDetail(\'' + orderId + '\',1)">查看</a><a class="a2" href="javascript:deleteOrderById(\'' + orderId + '\')">删除</a></td>');
			}
			else if(status == "100503"){
				//100503: "风控审核中
				html.push('<td><a class="a1" href="javascript:showOrderDetail(\'' + orderId + '\',1)">查看</a><a class="a2" href="javascript:deleteOrderById(\'' + orderId + '\')">删除</a></td>');
			}
			else if(status == "100504"){
				html.push('<td><a class="a3" href="/anjia/mystaging.html?orderid=' + orderId + '">编辑</a><a class="a2" href="javascript:deleteOrderById(\'' + orderId + '\')">删除</a></td>');
			}
			else if(status == "100505"){
				//100505: "待缴手续费"showOrderDetail
				//html.push('<td><a href="/anjia/orderdetail.html?orderId=' + orderId + '">查看</a></td>');
				html.push('<td><a class="a4" href="javascript:repayment(\'' + poundageRecordId + '\')">支付</a><a class="a2" href="javascript:deleteOrderById(\'' + orderId + '\')">取消订单</a></td>');
			}
			else if(status == "100506"){
				//100506: "待放款"
				html.push('<td><a class="a1" href="javascript:showOrderDetail(\'' + orderId + '\',0)">查看</a></td>');
			}
			else if(status == "100507"){
				//100506: "待放款"
				html.push('<td><a class="a1" href="javascript:showOrderDetail(\'' + orderId + '\',0)">查看</a></td>');
			}
			else if(status == "100508"){
				html.push('<td><a class="a1" href="javascript:showOrderDetail(\'' + orderId + '\',0)">查看</a><a class="a2" href="javascript:deleteOrderById(\'' + orderId + '\')">删除</a></td>');
			}
			else if(status == "100509"){
				//审核不通过
				html.push('<td><a class="a3" href="/anjia/mystaging.html?orderid=' + orderId + '">编辑</a><a class="a2" href="javascript:deleteOrderById(\'' + orderId + '\')">删除</a></td>');
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
		//回收站 已删除
function sendGetPayOrderListHttp8(condi){
		g.httpTip.show();
		var url = Base.serverUrl + "order/queryOrderList";//修改之前queryOrdersController
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
					changePayOrderListHtml8(data);
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
	//回收站 已删除
	function changePayOrderListHtml8(data){
		var html = [];

		html.push('<table class="order-table" cellpadding="0" cellspacing="0">');
		html.push('<tr>');
		html.push('<th width="160">订单编号</th>');
		html.push('<th width="130">合同编号</th>');
		html.push('<th width="110">合作商家</th>');
		html.push('<th width="110">申请分期金额</th>');
		html.push('<th width="100">订单状态</th>');
		/* html.push('<th width="100">应缴服务费</th>'); */
		/* html.push('<th width="80">最近待还</th>'); */
		html.push('<th width="90">申请分期期数</th>');
		html.push('<th>操作</th>');
		html.push('</tr>');

		var obj = data.list || [];
		for(var i = 0,len = obj.length; i < len; i++){
			var d = obj[i];
			var poundageRecordId =d.poundageRecordId || "";			
			var orderId = d.orderId || "";
			var contractNo = d.contractNo || "";
			var subsidiary = d.subsidiary || "";
			var applyPackageMoney = d.applyPackageMoney || 0;
			var statusDes = d.statusDes || "";
			var status = d.status || "";
			var fenQiTimes = d.fenQiTimes || 0;
			var noRepaymentTimes = d.noRepaymentTimes || 0;
			
			html.push('<tr>');
			html.push('<td>' + orderId + '</td>');
			html.push('<td>' + contractNo + '</td>');
			html.push('<td>' + subsidiary + '</td>');
			html.push('<td>' + applyPackageMoney + '元</td>');
			html.push('<td>' + statusDes + '</td>');
			/* html.push('<td>' + noRepaymentTimes + '元</td>'); */
			/* html.push('<td>' + noRepaymentTimes + '期</td>'); */
			html.push('<td>' + fenQiTimes + '期</td>');

			g.orderInfo[orderId] = d;
			g.orderDetailInfo[poundageRecordId] = d;
			if(status == "100501"){
				html.push('<td><a class="a3" href="/anjia/mystaging.html?orderid=' + orderId + '">编辑</a><a class="a2" href="javascript:deleteOrderById(\'' + orderId + '\')">删除</a></td>');
			}
			else if(status == "100502"){
				//100502: "商家审核中"
				html.push('<td><a class="a1" href="javascript:showOrderDetail(\'' + orderId + '\',1)">查看</a><a class="a2" href="javascript:deleteOrderById(\'' + orderId + '\')">删除</a></td>');
			}
			else if(status == "100503"){
				//100503: "风控审核中
				html.push('<td><a class="a1" href="javascript:showOrderDetail(\'' + orderId + '\',1)">查看</a><a class="a2" href="javascript:deleteOrderById(\'' + orderId + '\')">删除</a></td>');
			}
			else if(status == "100504"){
				html.push('<td><a class="a3" href="/anjia/mystaging.html?orderid=' + orderId + '">编辑</a><a class="a1" href="javascript:showOrderDetail(\'' + orderId + '\',0)">查看</a></td>');
			}
			else if(status == "100505"){
				//100505: "待缴手续费"showOrderDetail
				//html.push('<td><a href="/anjia/orderdetail.html?orderId=' + orderId + '">查看</a></td>');
				html.push('<td><a class="a4" href="javascript:repayment(\'' + poundageRecordId + '\')">支付</a><a class="a2" href="javascript:deleteOrderById(\'' + orderId + '\')">取消订单</a></td>');
			}
			else if(status == "100506"){
				//100506: "待放款"
				html.push('<td><a class="a1" href="javascript:showOrderDetail(\'' + orderId + '\',0)">查看</a></td>');
			}
			else if(status == "100507"){
				//100506: "待放款"
				html.push('<td><a class="a1" href="javascript:showOrderDetail(\'' + orderId + '\',0)">查看</a></td>');
			}
			else if(status == "100508"){
				html.push('<td><a class="a1" href="javascript:showOrderDetail(\'' + orderId + '\',0)">查看</a><a class="a2" href="javascript:deleteOrderById(\'' + orderId + '\')">删除</a></td>');
			}
			else if(status == "100509"){
				//审核不通过
				html.push('<td><a class="a3" href="/anjia/mystaging.html?orderid=' + orderId + '">编辑</a><a class="a2" href="javascript:deleteOrderById(\'' + orderId + '\')">删除</a></td>');
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
	
	//已逾期
function sendGetPayOrderListHttp9(condi){
		g.httpTip.show();
		var url = Base.serverUrl + "order/queryOrderList";//修改之前queryOrdersController
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
					changePayOrderListHtml9(data);
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
	//已逾期
	function changePayOrderListHtml9(data){
		var html = [];

		html.push('<table class="order-table" cellpadding="0" cellspacing="0">');
		html.push('<tr>');
		html.push('<th width="160">订单编号</th>');
		html.push('<th width="130">合同编号</th>');
		html.push('<th width="110">合作商家</th>');
		html.push('<th width="110">审批分期金额</th>');
		html.push('<th width="110">审批分期期数</th>');
		html.push('<th width="90">待还金额</th>');
		html.push('<th width="80">待还期数</th>');
		html.push('<th width="90">实还金额</th>');
		html.push('<th width="80">逾期天数</th>');
		html.push('<th width="100">订单状态</th>');
		html.push('<th>操作</th>');
		html.push('</tr>');

		var obj = data.list || [];
		for(var i = 0,len = obj.length; i < len; i++){
			var d = obj[i];
			var poundageRecordId =d.poundageRecordId || "";			
			var orderId = d.orderId || "";
			var contractNo = d.contractNo || "";
			var subsidiary = d.subsidiary || "";
			var packageMoney = d.packageMoney || 0;
			var statusDes = d.statusDes || "";
			var status = d.status || "";
			var fenQiTimes = d.fenQiTimes || 0;
			var noRepaymentTimes = d.noRepaymentTimes || 0;
			var currentBalance = d.currentBalance || 0;//待还金额
			var realRepaymentMoney = d.realRepaymentMoney || 0;//实还金额
			var overdueTime = d.overdueTime || 0;
			
			if(status == "100510" || status == "100511"){html.push('<tr class="yuqi1">');}
			else{html.push('<tr>');}
			html.push('<td>' + orderId + '</td>');
			html.push('<td>' + contractNo + '</td>');
			html.push('<td>' + subsidiary + '</td>');
			html.push('<td>' + packageMoney + '元</td>');
			html.push('<td>' + fenQiTimes + '期</td>');
			html.push('<td>' + currentBalance + '元</td>');
			html.push('<td>' + noRepaymentTimes + '期</td>');
			html.push('<td>' + realRepaymentMoney + '元</td>');
			html.push('<td>' + overdueTime + '天</td>');
			if(status == "100510" || status == "100511"){html.push('<td class="yuqi_color">' + statusDes + '</td>');}
			else{html.push('<td>' + statusDes + '</td>');}			
			g.orderInfo[orderId] = d;
			g.orderDetailInfo[poundageRecordId] = d;
			if(status == "100510"){
				html.push('<td><a class="a1" href="javascript:showOrderDetail(\'' + orderId + '\',0)">查看</a></td>');
			}else{
				html.push('<td></td>');
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
		//已违约
function sendGetPayOrderListHttp10(condi){
		g.httpTip.show();
		var url = Base.serverUrl + "order/queryOrderList";//修改之前queryOrdersController
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
					changePayOrderListHtml10(data);
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
	//已违约
	function changePayOrderListHtml10(data){
		var html = [];

		html.push('<table class="order-table" cellpadding="0" cellspacing="0">');
		html.push('<tr>');
		html.push('<th width="160">订单编号</th>');
		html.push('<th width="130">合同编号</th>');
		html.push('<th width="110">合作商家</th>');
		html.push('<th width="110">审批分期金额</th>');
		html.push('<th width="110">审批分期期数</th>');
		html.push('<th width="90">待还金额</th>');
		html.push('<th width="80">实还金额</th>');
		html.push('<th width="80">逾期天数</th>');
		html.push('<th width="100">违约时间</th>');
		html.push('<th width="100">订单状态</th>');
		html.push('<th>操作</th>');
		html.push('</tr>');

		var obj = data.list || [];
		for(var i = 0,len = obj.length; i < len; i++){
			var d = obj[i];
			var poundageRecordId =d.poundageRecordId || "";			
			var orderId = d.orderId || "";
			var contractNo = d.contractNo || "";
			var subsidiary = d.subsidiary || "";
			var packageMoney = d.packageMoney || 0;
			var statusDes = d.statusDes || "";
			var status = d.status || "";
			var fenQiTimes = d.fenQiTimes || 0;
			var noRepaymentTimes = d.noRepaymentTimes || 0;
			var currentBalance = d.currentBalance || 0;//待还金额
			var realRepaymentMoney = d.realRepaymentMoney || 0;//实还金额
			var overdueTime = d.overdueTime || 0;
			var finishContractTime = d.finishContractTime || "";
			
			if(status == "100510" || status == "100511"){html.push('<tr class="yuqi1">');}
			else{html.push('<tr>');}
			html.push('<td>' + orderId + '</td>');
			html.push('<td>' + contractNo + '</td>');
			html.push('<td>' + subsidiary + '</td>');
			html.push('<td>' + packageMoney + '元</td>');
			html.push('<td>' + fenQiTimes + '期</td>');
			html.push('<td>' + currentBalance + '元</td>');
			html.push('<td>' + realRepaymentMoney + '元</td>');
			html.push('<td>' + overdueTime + '天</td>');
			html.push('<td>' + finishContractTime + '</td>');
			if(status == "100510" || status == "100511"){html.push('<td class="yuqi_color">' + statusDes + '</td>');}
			else{html.push('<td>' + statusDes + '</td>');}	
			g.orderInfo[orderId] = d;
			g.orderDetailInfo[poundageRecordId] = d;
			if(status == "100511"){
				html.push('<td><a class="a1" href="javascript:showOrderDetail(\'' + orderId + '\',0)">查看</a></td>');
			}else{
				html.push('<td></td>');
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
		//逾期已还清
function sendGetPayOrderListHttp11(condi){
		g.httpTip.show();
		var url = Base.serverUrl + "order/queryOrderList";//修改之前queryOrdersController
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
					changePayOrderListHtml11(data);
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
	//逾期已还清
	function changePayOrderListHtml11(data){
		var html = [];

		html.push('<table class="order-table" cellpadding="0" cellspacing="0">');
		html.push('<tr>');
		html.push('<th width="160">订单编号</th>');
		html.push('<th width="130">合同编号</th>');
		html.push('<th width="110">合作商家</th>');
		html.push('<th width="110">审批分期金额</th>');
		html.push('<th width="110">审批分期期数</th>');
		html.push('<th width="90">实还金额</th>');
		html.push('<th width="80">逾期天数</th>');
		html.push('<th width="100">还清日期</th>');
		html.push('<th width="100">订单状态</th>');
		html.push('<th>操作</th>');
		html.push('</tr>');

		var obj = data.list || [];
		for(var i = 0,len = obj.length; i < len; i++){
			var d = obj[i];
			var poundageRecordId =d.poundageRecordId || "";			
			var orderId = d.orderId || "";
			var contractNo = d.contractNo || "";
			var subsidiary = d.subsidiary || "";
			var packageMoney = d.packageMoney || 0;
			var statusDes = d.statusDes || "";
			var status = d.status || "";
			var fenQiTimes = d.fenQiTimes || 0;
			var noRepaymentTimes = d.noRepaymentTimes || 0;
			var repaymentFinishTime = d.repaymentFinishTime || "";
			var realRepaymentMoney = d.realRepaymentMoney || 0;//实还金额
			var overdueTime = d.overdueTime || 0;
			
			html.push('<tr>');
			html.push('<td>' + orderId + '</td>');
			html.push('<td>' + contractNo + '</td>');
			html.push('<td>' + subsidiary + '</td>');
			html.push('<td>' + packageMoney + '元</td>');
			html.push('<td>' + fenQiTimes + '期</td>');
			html.push('<td>' + realRepaymentMoney + '元</td>');
			html.push('<td>' + overdueTime + '天</td>');
			html.push('<td>' + repaymentFinishTime + '</td>');
			html.push('<td>' + statusDes + '</td>');
			g.orderInfo[orderId] = d;
			g.orderDetailInfo[poundageRecordId] = d;
			if(status == "100512"){
				html.push('<td><a class="a1" href="javascript:showOrderDetail(\'' + orderId + '\',0)">查看</a></td>');
			}else{
				html.push('<td></td>');
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
		//违约已还清
function sendGetPayOrderListHttp12(condi){
		g.httpTip.show();
		var url = Base.serverUrl + "order/queryOrderList";//修改之前queryOrdersController
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
					changePayOrderListHtml12(data);
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
	//违约已还清
	function changePayOrderListHtml12(data){
		var html = [];

		html.push('<table class="order-table" cellpadding="0" cellspacing="0">');
		html.push('<tr>');
		html.push('<th width="160">订单编号</th>');
		html.push('<th width="130">合同编号</th>');
		html.push('<th width="110">合作商家</th>');
		html.push('<th width="110">审批分期金额</th>');
		html.push('<th width="110">审批分期期数</th>');
		html.push('<th width="90">实还金额</th>');
		html.push('<th width="80">逾期天数</th>');
		html.push('<th width="100">还清日期</th>');
		html.push('<th width="100">订单状态</th>');
		html.push('<th>操作</th>');
		html.push('</tr>');

		var obj = data.list || [];
		for(var i = 0,len = obj.length; i < len; i++){
			var d = obj[i];
			var poundageRecordId =d.poundageRecordId || "";			
			var orderId = d.orderId || "";
			var contractNo = d.contractNo || "";
			var subsidiary = d.subsidiary || "";
			var packageMoney = d.packageMoney || 0;
			var statusDes = d.statusDes || "";
			var status = d.status || "";
			var fenQiTimes = d.fenQiTimes || 0;
			var noRepaymentTimes = d.noRepaymentTimes || 0;
			var repaymentFinishTime = d.repaymentFinishTime || "";//还清日期
			var realRepaymentMoney = d.realRepaymentMoney || 0;//实还金额
			var overdueTime = d.overdueTime || 0;//逾期天数
			
			html.push('<tr>');
			html.push('<td>' + orderId + '</td>');
			html.push('<td>' + contractNo + '</td>');
			html.push('<td>' + subsidiary + '</td>');
			html.push('<td>' + packageMoney + '元</td>');
			html.push('<td>' + fenQiTimes + '期</td>');
			html.push('<td>' + realRepaymentMoney + '元</td>');
			html.push('<td>' + overdueTime + '天</td>');
			html.push('<td>' + repaymentFinishTime + '</td>');
			html.push('<td>' + statusDes + '</td>');
			g.orderInfo[orderId] = d;
			g.orderDetailInfo[poundageRecordId] = d;
			if(status == "100513"){
				html.push('<td><a class="a1" href="javascript:showOrderDetail(\'' + orderId + '\',0)">查看</a></td>');
			}else{
				html.push('<td></td>');
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
	
	//我的支付
	function changeRepayOrderListHtml(data){
		var html = [];

		html.push("<table class='order-table' onclick='$(\"#orderlist .updown,#orderlist .updown2\").fadeToggle(300)' cellpadding='0' cellspacing='0'>");
		html.push('<tr>');
		html.push('<th width="160">订单编号</th>');
		html.push('<th width="100">合作商家</th>');
		html.push('<th width="110">合同总金额</th>');
		html.push('<th width="110">审批分期金额</th>');
		html.push('<th width="100">订单状况</th>');
		html.push('<th width="100">可用额度</th>');
		//html.push('<th width="100">总期数</th>');
		html.push('<th>操作</th>');
		html.push('</tr>');
		html.push('</table>');
		var obj = data.list || [];
		for(var i = 0,len = obj.length; i < len; i++){
			var d = obj[i];
			var orderId = d.orderId || "";
			var poundageRecordId =d.poundageRecordId || "";	
			var contractNo = d.contractNo || "";
			var packageName = d.packageName || "";
			var company = d.company || "";
			var contractMoney = d.contractMoney || 0;
			var packageMoney = d.packageMoney || 0;
			var loanResidueMoney = d.loanResidueMoney || 0;
			var loanStatusDesc = d.loanStatusDesc || "";
			var status = d.status || "";
			var fenQiTimes = d.fenQiTimes || 0;
			var noRepaymentTimes = d.noRepaymentTimes || 0;
			var currentBalance = d.currentBalance || 0;
			html.push('<table class="order-table " cellpadding="0" cellspacing="0">');
			html.push('<tr>');
			html.push('<td width="170" >' + orderId + '</td>');
			html.push('<td width="110">' + company + '</td>');
			html.push('<td width="125">' + contractMoney + '元</td>');
			html.push('<td width="115">' + packageMoney + '元</td>');
			html.push('<td width="110">' + loanStatusDesc + '</td>');
			html.push('<td width="110">' + loanResidueMoney + '元</td>');
			//html.push('<td>' + fenQiTimes + '期</td>');

			g.orderInfo[orderId] = d;
			g.orderDetailInfo[poundageRecordId] = d;
			if(status == "100501"){
				html.push('<td><a class="a3" href="/anjia/mystaging.html?orderid=' + orderId + '">编辑</a><a class="a2" href="javascript:deleteOrderById(\'' + orderId + '\')">删除</a></td>');
			}
			else if(status == "100502"){
				//100502: "商家审核中"
				html.push('<td><a class="a1" href="javascript:showOrderDetail(\'' + orderId + '\',1)">查看</a><a class="a2" href="javascript:deleteOrderById(\'' + orderId + '\')">删除</a></td>');
			}
			else if(status == "100503"){
				//100503: "风控审核中
				html.push('<td><a class="a1" href="javascript:showOrderDetail(\'' + orderId + '\',1)">查看</a><a class="a2" href="javascript:deleteOrderById(\'' + orderId + '\')">删除</a></td>');
			}
			else if(status == "100504" || status == "100509"){
				html.push('<td><a class="a2" href="javascript:deleteOrderById(\'' + orderId + '\')">删除</a></td>');
			}
			else if(status == "100505"){
				//100505: "待缴手续费"showOrderDetail
				//html.push('<td><a href="/anjia/orderdetail.html?orderId=' + orderId + '">查看</a></td>');
				html.push('<td><a class="a4" href="javascript:repayment(\'' + poundageRecordId + '\')">支付</a><a class="a2" href="javascript:deleteOrderById(\'' + orderId + '\')">取消订单</a></td>');
			}
			else if(status == "100506"){
				//100506: "待放款"
				html.push('<td class="order_position"><a href="javascript:sendGetRepayOrderInfoListHttp(\'' + orderId + '\')" class="order_a"></a><a class="a1" href="javascript:sendGetRepayOrderInfoListHttp(\'' + orderId + '\')">申请放款</a></td>');
			}
			else if(status == "100507"){
				//100506: "待放款"
				html.push('<td class="order_position"><a href="javascript:sendGetRepayOrderInfoListHttp(\'' + orderId + '\')" class="order_a"></a><a class="a1" href="javascript:sendGetRepayOrderInfoListHttp(\'' + orderId + '\')">申请支付</a></td>');
				//html.push('<td><a href="javascript:showOrderDetail(\'' + orderId + '\',0)">查看</a></td>');
			}
			else if(status == "100508"){
				html.push('<td class="order_position"><a href="javascript:sendGetRepayOrderInfoListHttp(\'' + orderId + '\')" class="order_a"></a><a class="a1" href="javascript:sendGetRepayOrderInfoListHttp(\'' + orderId + '\')">申请支付</a></td>');
			}
			else if(status == "100510"){
				//已逾期
				html.push('<td>已逾期</td>');
			}
			else if(status == "100511"){
				//已违约
				html.push('<td>已违约</td>');
			}
			else if(status == "100512"){
				//逾期已还清
				html.push('<td class="order_position"><a href="javascript:sendGetRepayOrderInfoListHttp(\'' + orderId + '\')" class="order_a"></a><a class="a1" href="javascript:sendGetRepayOrderInfoListHttp(\'' + orderId + '\')">申请支付</a></td>');
			}
			else if(status == "100513"){
				//违约已还清
				html.push('<td class="order_position"><a href="javascript:sendGetRepayOrderInfoListHttp(\'' + orderId + '\')" class="order_a"></a><a class="a1" href="javascript:sendGetRepayOrderInfoListHttp(\'' + orderId + '\')">申请支付</a></td>');
			}
			html.push('</tr>');
			html.push('</table>');
			html.push('<table class="order-table td_height order'+orderId+'" cellpadding="0" cellspacing="0"></table>');

		}
		//html.push('</table>');
				
		/*
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
		html.push('<th width="160">2</th>');
		html.push('<th width="160">50000</th>');
		html.push("<th width='160'><input id='input_id' type='text' onclick='laydate({elem: \"#input_id\"});' placeholder='请选择付款日期' onfocus='placeholder=\"\"' onblur='placeholder=\"请选择付款日期\"'  class='up_input'/></th>");
		html.push("<th width='200'><input type='text' class='up_input' /></th>");
		html.push('<th ><a>已付款</a></th>');
		html.push('</tr>');
		html.push('</table>');
		*/
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
		/* 隐藏或显示待付款下拉框 */
		$(".order_position a").click(function(){
			$(this).parents(".order_position").find(".order_a").toggleClass("up");
			$(this).parents(".order-table").next(".td_height").slideToggle(400);
		})
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

/* 取消订单 */
	function cancelOrderById(id){
		if(confirm("你确认要取消订单吗?")){
			g.httpTip.show();
			var condi = {};
			condi.orderId = id;
			condi.login_token = g.login_token;

			var url = Base.serverUrl + "order/cancelOrderController";
			$.ajax({
				url:url,
				data:condi,
				type:"POST",
				dataType:"json",
				context:this,
				success: function(data){
					//console.log("deleteOrderById",data);
					var status = data.success || false;
					if(status){
						getUserOrderList();
					}
					else{
						var msg = data.message || "取消订单数据失败";
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
		//console.lof(g.orderInfoer);
		info = JSON.stringify(info);
		Utils.offLineStore.set("userorderinfo_list",info,false);
		
		if(t == 0){
			location.href = "/anjia/orderdetail.html?orderId=" + orderId ;
		}
		else if(t == -1){
			location.href = "/anjia/orderaudit.html?orderId=" + orderId + "&C=1";
		}
		else{
			location.href = "/anjia/orderaudit.html?orderId=" + orderId ;
		}		
	}


	//获取放款列表
	function sendGetRepayOrderInfoListHttp(orderId){
		var condi = {};
		condi.login_token = g.login_token;
		condi.customerId = g.customerId;
		condi.orderId = orderId;
		condi.currentPageNum = 1;
		condi.pageSize = 10;

		g.httpTip.show();
		var url = Base.serverUrl + "order/queryLoanRecordByQuery";
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
					repayListHtml(data,orderId);
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

	function repayListHtml(data,orderId){
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
		//html.push('<table class="order-table" cellpadding="0" cellspacing="0" style="margin-top:25px;">');
		html.push('<tr>');
		html.push('<th width=160 >待付笔数</th>');
		html.push('<th width=160>可用额度</th>');
		html.push('<th width=160>付款日期</th>');
		html.push('<th width=160>付款金额</th>');
		html.push('<th width=160>操作</th>');
		html.push('</tr>');
		var obj = data.list || [];

		var one = false;
		var two = false;
		var three = false;
		var four = false;
		var max = 0;

		for(var i = 0,len = obj.length; i < len; i++){
			var d = obj[i] || {};
			var loanRecordId = d.loanRecordId || "";
			var loanTimes = d.loanTimes - 0;
			var packageMoney = d.packageMoney - 0 || 0;
			var loanMoney = d.loanMoney - 0 || 0;
			var realLoanTime = d.realLoanTime || "";
			var loanResidueMoney = d.loanResidueMoney || 0;
			var loanMaxMoney = d.loanMaxMoney - 0 || 0;
			var expectLoanTime = d.expectLoanTime || "";
			//var now = new Date().format("yyyy-MM-dd");
			//var now = new Date($.ajax({async: false}).getResponseHeader("Date")).format("yyyy-MM-dd");
			var now  =  data.other || "";
			var status = d.status;

			var days = 100000;
			if(expectLoanTime !== ""){
				days = getDays(now,expectLoanTime);
			}
			max = max + loanMoney;
			//(102401 待放款,102402以放款)

			html.push('<tr>');
			html.push('<td>' + loanTimes + '</td>');
			html.push('<td>' +loanResidueMoney + '元</td>');
			html.push('<td>' + realLoanTime + '</td>');
			if(status == "102401"){
				//待放款
				if(loanTimes == 1){
					html.push('<td><input id="' + loanRecordId + '" type="text" placeholder="最大付款金额' +loanMaxMoney + '元" class="common-input-text" style="width:150px;vertical-align:middle;" /></td>');
					html.push('<td><a class="a4" href="javascript:loanByLoanRecord(\'' + loanRecordId + '\',\'' + loanMaxMoney + '\',\'' + loanResidueMoney + '\')">我要付款</a></td>');
				}
				else if(loanTimes == 2){
					if(one == true){
						html.push('<td><input id="' + loanRecordId + '" type="text" placeholder="最大付款金额' +loanMaxMoney + '元" class="common-input-text" style="width:150px;vertical-align:middle;" /></td>');
						html.push('<td><a class="a4" href="javascript:loanByLoanRecord(\'' + loanRecordId + '\',\'' + loanMaxMoney + '\',\'' + loanResidueMoney + '\')">我要付款</a></td>');
					}
					else{
						html.push('<td><input id="' + loanRecordId + '" type="text" placeholder="最大付款金额' +loanMaxMoney + '元" class="common-input-text" style="width:150px;vertical-align:middle;" /></td>');
						html.push('<td><a class="a4" href="javascript:Utils.alert(\'请先申请第一期\')">我要付款</a></td>');
					}
				}
				else if(loanTimes == 3){
					if(two == true && days >= 0){
						html.push('<td><input id="' + loanRecordId + '" type="text" placeholder="最大付款金额' +loanMaxMoney + '元" class="common-input-text" style="width:150px;vertical-align:middle;" /></td>');
						html.push('<td><a class="a4" href="javascript:loanByLoanRecord(\'' + loanRecordId + '\',\'' + loanMaxMoney  + '\',\'' + loanResidueMoney + '\')">我要付款</a></td>');
					}
					else{
						var days2=Math.abs(days);
						if(days === 100000){
							html.push('<td>不能超过合同金额35%</td>');
						}
						else{
							html.push('<td>还剩' + days2 + '天再付款,不能超过合同金额35%</td>');
						}
						html.push('<td><span style="color:#C8C8C8;">我要付款</span></td>');
					}
				}
				else if(loanTimes == 4){
					if(two == true && days >= 0){
						html.push('<td><input id="' + loanRecordId + '" type="text" placeholder="最大付款金额' +loanMaxMoney + '" class="common-input-text" style="width:150px;vertical-align:middle;" /></td>');
						html.push('<td><a class="a4" href="javascript:loanByLoanRecord(\'' + loanRecordId + '\',\'' + loanMaxMoney + '\',\'' + loanResidueMoney + '\',4)">我要付款</a></td>');
					}
					else{
						var days2=Math.abs(days);
						if(days === 100000){
							html.push('<td>不能超过合同金额5%</td>');
						}
						else{
							html.push('<td>还剩' + days2 + '天再付款,不能超过合同金额5%</td>');
						}
						html.push('<td><span style="color:#C8C8C8;">我要付款</span></td>');
					}
				}
			}
			else if(status == "102402"){
				if(loanTimes === 1){
					one = true;
				}
				if(loanTimes === 2){
					two = true;
				}
				if(loanTimes === 3){
					three = true;
				}
				
				html.push('<td>' + loanMoney + '元</td>');
				html.push('<td><span href="javascript:;">已付款</span></td>');
			}

			html.push('</tr>');
		}
		//html.push('</table>');
		
		$(".order"+orderId+"").html(html.join(''));
		//showOrderPop('#repayBackPop');
	}
	function getDays(strDateStart,strDateEnd){
		var strSeparator = "-"; //日期分隔符
		var oDate1;
		var oDate2;
		var iDays;
		oDate1= strDateStart.split(strSeparator);
		oDate2= strDateEnd.split(strSeparator);
		var strDateS = new Date(oDate1[0], oDate1[1]-1, oDate1[2]);
		var strDateE = new Date(oDate2[0], oDate2[1]-1, oDate2[2]);
		iDays = parseInt((strDateS - strDateE ) / 1000 / 60 / 60 /24)//把相差的毫秒数转换为天数
		return iDays ;
	}

	function loanByLoanRecord(loanRecordId,loanMaxMoney, loanResidueMoney,loanTimes){
		var condi = {};
		condi.login_token = g.login_token;
		condi.loanRecordId = loanRecordId;
		condi.loanMoney = $("#" +loanRecordId).val() - 0 || 0;
		if(loanResidueMoney < condi.loanMoney){
			Utils.alert("申请不能大于" +loanResidueMoney + "元");
			return;
		}
		if(loanMaxMoney < condi.loanMoney){
			Utils.alert("最多只能申请" +loanMaxMoney + "元");
			return;
		}
		if(condi.loanMoney == 0){
			Utils.alert("申请额度必须大于0元");
			return;
		}
		if(loanTimes == "4" && loanMaxMoney > condi.loanMoney){
			Utils.alert("为了避免支付结余，请填写"+loanMaxMoney+"元");
			return;
		}
		g.httpTip.show();
		var url = Base.serverUrl + "order/loanByLoanRecord";
		$.ajax({
			url:url,
			data:condi,
			type:"POST",
			dataType:"json",
			context:this,
			success: function(data){
				console.log("loanByLoanRecord",data);
				var status = data.success || false;
				if(status){
					Utils.alert("申请付款成功");
					//repayListHtml(data);
					 location.reload();
				}
				else{
					var msg = data.message || "申请付款失败";
					Utils.alert(msg);
				}
				g.httpTip.hide();
			},
			error:function(data){
				g.httpTip.hide();
			}
		});
	}

	function repayment(id,orderId,weiyue){
		var dd = g.orderInfo[orderId] || {};
		var poundage = dd.poundage - 0 || 0;
		get_coupons_money(poundage,orderId);
		setTimeout(function(){
		Utils.offLineStore.remove("userorderinfo_detail",false);//清除协议缓存数据
		sendGetOrderInfoHttp(orderId);
		var d = g.orderDetailInfo[id] || "";
		var orderId = d.orderId || "";
		var poundageRecordId = d.poundageRecordId || "主键";
		var repaymentTypeDesc = d.repaymentTypeDesc || "";
		var repaymentPrincipal = d.repaymentPrincipal || 0;
		var expectRepaymentTime = d.expectRepaymentTime || "";
		var overdueTime = d.overdueTime || 0;
		var overdueInterest = d.overdueInterest || 0;
		var yinghuanjine = repaymentPrincipal  + overdueInterest ;
		var realRepaymentTime = d.realRepaymentTime || "无";
		var finishContractTime = d.finishContractTime || "";//违约时间
		var currentBalance = d.currentBalance || 0;//应还金额
		var firstExpectRepaymentTime = d.firstExpectRepaymentTime || "";//最近一期应还时间
		//var dd = g.orderInfo[orderId] || {};
		//var orderId = dd.orderId || "";
		var contractNo = dd.contractNo || "";
		var subsidiary = dd.subsidiary || "";
		var packageMoney = dd.packageMoney - 0 || 0;
		var applyPackageMoney = dd.applyPackageMoney - 0 || 0;
		var statusDes = dd.statusDes || "";
		var status = dd.status || "";
		var fenQiTimes = dd.fenQiTimes || 0;
		var applyFenQiTimes = dd.applyFenQiTimes || 0;
		//var poundage = dd.poundage - 0 || 0;
		var moneyMonth = dd.moneyMonth - 0 || 0;
		var poundageExpectRepaymentTime = dd.poundageExpectRepaymentTime || "";
		var noRepaymentTimes = dd.noRepaymentTimes || 0;
		//sendGetOrderInfoHttp(orderId);
		var weiyue2 = weiyue || 0;
		var html = [];
		html.push('<h1 class="pop-title">');
		if(weiyue2 != 0){html.push('<i class="common-ico ico-pay"></i>我要付款');}
		else{html.push('<i class="common-ico ico-pay"></i>缴纳服务费');}
		html.push('</h1>');
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
		html.push('<td class="odd">合作商家</td>');
		html.push('<td class="even">' + subsidiary + '</td>');
		html.push('</tr>');
		html.push('<tr>');
		html.push('<td class="odd">申请分期金额</td>');
		html.push('<td class="even">' + applyPackageMoney + '元</td>');
		html.push('</tr>');
		html.push('<tr>');
		html.push('<td class="odd">申请分期期数</td>');
		html.push('<td class="even">' + applyFenQiTimes + '个月</td>');
		html.push('</tr>');
		html.push('<tr>');
		html.push('<td class="odd">审批分期金额</td>');
		html.push('<td class="even">' + packageMoney + '元</td>');
		html.push('</tr>');
		html.push('<tr>');
		html.push('<td class="odd">审批分期期数</td>');
		html.push('<td class="even">' + fenQiTimes + '个月</td>');
		html.push('</tr>');
		html.push('<tr>');
		html.push('<td class="odd">服务费</td>');
		html.push('<td class="even">' + poundage + '元</td>');
		html.push('</tr>');
		/* html.push('<tr>');
		html.push('<td class="odd">最迟缴纳时间</td>');
		html.push('<td class="even">' + poundageExpectRepaymentTime + '</td>');
		html.push('</tr>'); */
		if(weiyue2 != 0){
		html.push('<tr>');
		html.push('<td class="odd">最近一期应还时间</td>');
		html.push('<td class="even">' + firstExpectRepaymentTime + '</td>');
		html.push('</tr>');
		html.push('<tr>');
		html.push('<td class="odd">违约时间</td>');
		html.push('<td class="even">' + finishContractTime + '</td>');
		html.push('</tr>');
		html.push('<tr>');
		html.push('<td class="odd">逾期天数</td>');
		html.push('<td class="even">' + overdueTime + '</td>');
		html.push('</tr>');
		html.push('<tr>');
		html.push('<td class="odd">应还金额</td>');
		html.push('<td class="even">' + currentBalance + '</td>');
		html.push('</tr>');
		}
		html.push('<tr>');
		html.push('<td class="odd">每月还款本金</td>');
		html.push('<td class="even">' + moneyMonth + '元</td>');
		html.push('</tr>');
		html.push('<tr>');
		html.push('<td class="odd">分期付款协议</td>');
		html.push('<td class="even"><a class="orderleftbtn_a" id="xieYi_1">分期付款协议</a></td>');
		html.push('</tr>');
		html.push('<tr>');
		html.push('<td class="odd">征信授权</td>');
		html.push('<td class="even"><a class="orderleftbtn_a" id="xieYi_2">个人征信等信息查询及使用授权书</a></td>');
		html.push('</tr>');
		html.push('<tr>');
		html.push('<td class="odd">客户承诺</td>');
		html.push('<td class="even"><a class="orderleftbtn_a" id="xieYi_3">客户承诺函</a></td>');
		html.push('</tr>');
		html.push('<tr>');
		html.push('<td class="odd">咨询协议</td>');
		html.push('<td class="even"><a class="orderleftbtn_a" id="xieYi_4">信用咨询及居间服务协议</a></td>');
		html.push('</tr>');
		html.push('<tr>');
		html.push('<td class="odd">转让协议</td>');
		html.push('<td class="even"><a class="orderleftbtn_a" id="xieYi_5">债权转让协议</a></td>');
		html.push('</tr>');
		if(weiyue2 == 0){
			//缴纳违约金
			for(var i = 0; i < g.coupons.length; i++){
				var coupons_money_span = g.coupons[i][0] || "";
				html.push('<tr>');
				html.push('<td class="odd">优惠券</td>');
				if(g.coupons[i][3] != 0){
					html.push('<td class="even"><div class="chk-bg cklikeCheckboxn" ><input type="checkbox" name="coupons_value" id="coupons_value'+i+'"  class="common-checkbox" style="display: none;"></div><label style="float:none;" for="coupons_value">使用优惠券&nbsp;&nbsp;&nbsp;优惠折扣<span id="coupons_money_span">'+g.coupons[i][3]+'折</span></label></td>');
				}else{
					html.push('<td class="even"><div class="chk-bg cklikeCheckboxn" ><input type="checkbox" name="coupons_value" id="coupons_value'+i+'"  class="common-checkbox" style="display: none;"></div><label style="float:none;" for="coupons_value">使用优惠券&nbsp;&nbsp;&nbsp;当前余额<span id="coupons_money_span">'+coupons_money_span+'元</span></label></td>');
				}				
				html.push('</tr>');	
			}
		}
		html.push('</table>');

		html.push('<div class="btn-box">');
		if(weiyue2 != 0){
			//缴纳违约金
			html.push('<input type="button" class="common-btn btn-light-green" value="确认支付" onclick="confirmRepayment(\'' + poundageRecordId + '\',' + weiyue + ')" />');
		}else{			
			html.push('<input type="button" class="common-btn btn-light-green" value="确认支付" onclick="confirmRepayment(\'' + poundageRecordId + '\',' + poundage + ')" />');
		}		
		html.push('<input type="button" class="common-btn btn-grey" value="取消" onclick="hidePop()" />');
		html.push('</div>');

		$("#detailinfodiv1").html(html.join(''));
		n_click();
		showOrderPop('#payBackPop');
		OrderLeftProtocolClick();
		},500);
	}
	
	
	function n_click(){
		$(".cklikeCheckboxn").click(function(){
			if($(this).find(".common-checkbox").attr("checked")=="checked"){				
				$(this).removeClass("chk-bg-checked");
				$(this).find(".common-checkbox").attr("checked",false);				
			}else{
				$(".cklikeCheckboxn").removeClass("chk-bg-checked").find(".common-checkbox").attr("checked",false);			
				$(this).addClass("chk-bg-checked").find(".common-checkbox").attr("checked","checked");		
			}					
		})
	}
	
	function get_coupons_money(poundage,orderId){
		g.coupons = [];
		var condi = {};
			condi.login_token = g.login_token;
			condi.orderId = orderId;
			condi.customerId = g.customerId;
			condi.useMoney = poundage || "";
		var url = Base.serverUrl + "coupon/getAvailableCouponsByCustomerId";
		$.ajax({
			url:url,
			data:condi,
			type:"POST",
			dataType:"json",
			context:this,
			success: function(data){
				var status = data.success || false;
				if(status && data.list != ""){
					var dd = data.list || [];					
					/* var coupons_money_span = dd[0].money || 0;
					var get_coupons_couponId = dd[0].couponId || "";
					var useLeastMoney = dd[0].useLeastMoney || 0;
					//$("#coupons_money_span").html(coupons_money_span+"元");
					g.get_coupons_money = coupons_money_span;
					g.get_coupons_couponId = get_coupons_couponId;
					g.useLeastMoney = useLeastMoney; */
					for(var i = 0; i < dd.length; i++){
						var coupons_money_span = dd[i].money || 0;
						var get_coupons_couponId = dd[i].couponId || "";
						var useLeastMoney = dd[i].useLeastMoney || 0;
						var couponType = dd[i].couponType || "";
						var discount = dd[i].discount || 0;//折扣
						if(couponType == "1" && discount != 0){
							var coupon_money = poundage*(10-discount)/10 || 0;
							coupons_money_span = coupon_money.toFixed(2) || 0;
						}
						if(poundage >= useLeastMoney && coupons_money_span > 0){
							g.coupons[i] = [coupons_money_span,get_coupons_couponId,useLeastMoney,discount];
						}
					}
				}
				else{
					var msg = data.message || "获取优惠券失败";
					
				}
				g.httpTip.hide();
			},
			error:function(data){
				g.httpTip.hide();
			}
		});
	}
	
	
	function confirmRepayment(poundageRecordId,yinghuanjine){
		var get_coupons_couponId = "";
		var get_coupons_money = "";
		var useLeastMoney = "";
		$(".cklikeCheckboxn").each(function(n){
			if($(this).find(".common-checkbox").attr("checked")=="checked"){
				get_coupons_couponId = g.coupons[n][1] || "";
				get_coupons_money = g.coupons[n][0] || "";
				useLeastMoney = g.coupons[n][2] || "";
			}
		})
		yinghuanjine = yinghuanjine - get_coupons_money; 
		//先判断用户有没有判定银行卡
		sendIsExistBindBankCardHttp(poundageRecordId,yinghuanjine,get_coupons_couponId);

	}
	function sendIsExistBindBankCardHttp(poundageRecordId,yinghuanjine,get_coupons_couponId){
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
					location.href = "/anjia/card-pay2.html?recordId=" + poundageRecordId + "&p=" + yinghuanjine+"&id=" + get_coupons_couponId;
				}
				else{
					//用户没有绑定银行卡
					location.href = "/anjia/bind-card.html?recordId=" + poundageRecordId + "&p=" + yinghuanjine+"&id=" + get_coupons_couponId;
				}
				g.httpTip.hide();
			},
			error:function(data){
				g.httpTip.hide();
			}
		});
	}
	//显示协议
function OrderLeftProtocolClick(){
	$(".orderleftbtn_a").bind("click",function(evt){
		var id = this.id || "";
		var t = id.split("_")[1] || "";		
		var pages = ["","../anjia/protocol/protocol-fenqi.html","../anjia/protocol/protocol-authorization.html","../anjia/protocol/protocol-customer-commitment.html","../anjia/protocol/protocol-credit-counseling.html","../anjia/protocol/protocol-transfer.html"];
		var titles = ["","分期付款协议","个人征信等信息查询及使用授权书","客户承诺函","信用咨询及居间服务协议","债权转让协议"];
		var url = pages[t] || "";
		if(url !== ""){
			$(".selected").removeClass("selected");
			$(this).addClass("selected");
			$("#protocoldiv").addClass("selected");

			var title = titles[t] || "";
			//订单数据,在协议页面可以同意引入utils.js,调用此方法获取数据
			//var orderInfo = Utils.offLineStore.get("userorderinfo_list",false) || "";
			//console.log("orderInfo",orderInfo);
			$.fn.showProtocolPop(url,title);
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
				//console.log("sendGetOrderInfoHttp",data);
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
	window.confirmOrder_fun = confirmOrder_fun ;
	window.cancelOrderById = cancelOrderById;
	window.confirmRepayment = confirmRepayment;
	window.loanByLoanRecord = loanByLoanRecord;
	window.hidePop = hidePop;
	window.sendGetRepayOrderInfoListHttp = sendGetRepayOrderInfoListHttp;
	window.showOrderDetail = showOrderDetail;
	window.deleteOrderById = deleteOrderById;
	window.repayment = repayment;	
	window.OrderLeftProtocolClick=OrderLeftProtocolClick;
	window.sendGetOrderInfoHttp=sendGetOrderInfoHttp;
	window.n_click = n_click;
	window.get_coupons_money = get_coupons_money;
});

