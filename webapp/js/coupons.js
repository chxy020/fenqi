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
	g.pageSize = 15;

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
		$("#orderstatus a").bind("click",changeOrderStatus);
		$("#allorderstatus dd").bind("click",changeOrderStatus);
			//获取全部订单列表
			getUserOrderList(true);
		
		

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
		var url = Base.serverUrl + "coupon/getCouponsByCustomerId";
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

	function changeOrderListHtml(data){

		var html = [];

		var obj = data.list || [];
		for(var i = 0,len = obj.length; i < len; i++){
			var d = obj[i];
			var orderId = d.orderId || "";
			var claimDate = d.claimDate || "";
			var d1 = claimDate.split("-") || [];
			var endDate = d.endDate || "";
			var expiryDate = d.expiryDate || "";
			var now = new Date().format("yyyy-MM-dd");
			var expiry = getDays(now,expiryDate)>0 || false;
			var d2 = expiryDate.split("-") || [];
			var money = d.money || 0;
			var discount = d.discount || 0;
			var useLeastMoney = d.useLeastMoney || 0;
			var status = d.status || "";
			var couponType = d.couponType || "";
			html.push('<li>');
			if( !expiry && status=="102601"){html.push('<img class="back" src="../res/images/coupons_img1.jpg"/>');}
			else if( !expiry && status=="102602"){html.push('<img class="back" src="../res/images/coupons_img2.jpg"/>');}
			else if(expiry){html.push('<img class="back" src="../res/images/coupons_img3.jpg"/>');}
			else{html.push('<img class="back" src="../res/images/coupons_img3.jpg"/>');}
			html.push('<div class="back2">');
			if(couponType == "1"){
				html.push('<span class="left"><i></i>'+discount+'折</span><span class="right"><i>抵用券</i><br>（满'+useLeastMoney+'可用）</span>');
			}else{
				html.push('<span class="left"><i>¥</i>'+money+'</span><span class="right"><i>抵用券</i><br>（满'+useLeastMoney+'可用）</span>');
			}
			if(expiryDate ==""){
				html.push('<p>使用期限：不限</p>');
			}else{
				html.push('<p>使用期限：'+d1[0]+'年'+d1[1]+'月'+d1[2]+'日-'+d2[0]+'年'+d2[1]+'月'+d2[2]+'日</p>');
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
			Utils.alert("没有订单数据");
		}

		$("#orderlist").html(html.join(''));
		
		setTimeout(function(){$("#orderlist li").css("height",$("#orderlist li img.back").css("height"));},1000);
		//$("#orderlistpage a").bind("click",pageClick);
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
			Utils.alert("当前是最后一页");
		}
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
						Utils.alert(msg);
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
		else{
			layer.msg("商家正在审核,暂无还款记录");
			//location.href = "/anjia/orderaudit.html?orderId=" + orderId ;
		}
	}

	window.showOrderDetail = showOrderDetail;
	window.deleteOrderById = deleteOrderById;
});





