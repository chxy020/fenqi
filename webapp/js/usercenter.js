/**
 * file:个人中心
 * author:chenxy
*/
//页面初始化
$(function(){
	var g = {};
	//g.userInfoDic = {};
	g.customerId = "";
	g.login_token = Utils.offLineStore.get("token",false) || "";
	//g.page = Utils.getQueryString("p") - 0;
	g.httpTip = new Utils.httpTip({});
	g.weiyue_message = Utils.offLineStore.get("weiyue_message",false) || "";
	g.yuqi_weiyue = false;//判断用户是否有逾期或者违约的单子
	//验证登录状态
	var loginStatus = Utils.getUserInfo();
	if(!loginStatus){
		//未登录
		location.replace("../login/login.html");
	}
	else{
		yuqi_message_fuc2();
		getUserInfo();
		sendGetRepayOrderListHttp();
		//sendGetUserInfoDicHttp();
		if(g.weiyue_message != "1"){yuqi_message_fuc();}
		//yuqi_message_fuc();
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
	})
	$(document).on("change","#avatar",avatarBtnUp);
	//保存个人资料
	//$("#savebtn").bind("click",saveBtnUp);
	$(".yuqi_box a.close_btn,.yuqi_box.yuqi_box2 .btn a.a_btn2").bind("click",close_box);	
	$(".yuqi_box span.color").bind("click",show_toggle);
	$("#loginoutbtn").bind("click",loginOutBtn);

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
						var orderId = d.orderId || "";
						var orderStatus = d.orderStatus || "";
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
	/* 每次进个人中心实时监测是否有逾期 违约订单 然后控制我的额度 是否可用 */
	function yuqi_message_fuc2(){
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
					g.yuqi_weiyue = false;
					for(var i = 0,len = obj.length; i < len; i++){
						var d = obj[i];
						var repaymentStatus =d.repaymentStatus || "";
						var orderId = d.orderId || "";
						var orderStatus =d.orderStatus || "";
						var repaymentTimes = d.repaymentTimes || "";
						var repayResidueDay = d.repayResidueDay || 0;
						
						if(orderStatus == "100510"){
							yuqi +='1';
						}
						else if(orderStatus == "100511"){
							weiyue += '1';
						}							
					}
					if(yuqi != "" || weiyue != ""){
						g.yuqi_weiyue = true;
					}
					if(g.yuqi_weiyue){
						$("#userleft_abtn").removeAttr("href").addClass("usercenter_a");
					}else{
						$("#userleft_abtn").attr("href","../edu/index.html").removeClass("usercenter_a");
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
		location.href="../order/index.html?orderType=100510";
		event.stopPropagation();
	})
	$(".yuqi_box.yuqi_box2 .btn a.a_btn3").click(function(event){
		$(this).parents(".yuqi_box").slideUp(300);
		Utils.offLineStore.set("weiyue_message",1,false);
		location.href="../order/index.html?orderType=100511";
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
		if(info !== ""){
			var obj = JSON.parse(info) || {};
			console.log("getUserInfo",obj);
			setUserInfoHtml(obj);
		}
	}
	//修改个人资料
	function setUserInfoHtml(data){
		var obj = data || {};
		//用户登录ID
		g.customerId = obj.customerId || "";

		var phoneNumber = obj.phoneNumber || "";
		var sex = obj.sex || "100101";
		sex = sex == "100102" ? "ico-sex-women" : "ico-sex-man";
		var html = phoneNumber + '<i class="common-ico ' + sex + '"></i>';
		$("#userphone").html(html);
		var avatar = obj.icon || "";
		if(avatar !== ""){
			avatar = avatar + "?t=" + (new Date() - 0);
			$("#avatarimg").attr("src",avatar);
		}
	}

	//查询额度
	function sendGetRepayOrderListHttp(){
		//g.httpTip.show();
		var condi = {};
		condi.loanStatus = "102401102402102403";
		condi.login_token = g.login_token;
		condi.customerId = g.customerId;
		condi.currentPageNum = "1";
		condi.pageSize = "10";
		condi.status = null;
		var url = Base.serverUrl + "order/queryOrdersController";
		$.ajax({
			url:url,
			data:condi,
			type:"POST",
			dataType:"json",
			context:this,
			success: function(data){
				//console.log("sendGetBannerImageByNavigationKey",data);
				var status = data.success || false;
				if(status){
					var obj = data.list || [];
					var d = obj[0];							
					var loanResidueMoney = d.loanResidueMoney || 0;
					$(".my_edu .edu").html(loanResidueMoney);
					
				}
				else{
					var msg = data.message || "获取首页轮播图数据失败";
					Utils.alert(msg);
				}
				//g.httpTip.hide();
			},
			error:function(data){
				//g.httpTip.hide();
			}
		});
	}
	//退出
	function loginOutBtn(evt){
		COMMON_PLUGIN.COMMON.ALERT_DIALOG_TWO('确定要退出吗？',function(){
			Utils.loginOut();
		},function(){})
		
	}









	//获取用户信息字典信息
	function sendGetUserInfoDicHttp(){
		g.httpTip.show();
		var url = Base.serverUrl + "baseCodeController/getBaseCodeByParents";
		/*
		性别：1001
		身份：1002
		婚姻状况：1003
		爱好：1004
		*/
		var condi = {};
		condi.parents = "1001,1002,1003,1004";
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
					//g.userInfoDic = obj;
					changeUserInfoDefaultHtml(obj);
					//获取用户数据
					sendGetUserInfoHttp();
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

	//获取用户信息
	function sendGetUserInfoHttp(){
		g.httpTip.show();
		var url = Base.serverUrl + "user/getCustomerByCustomerIdController";
		//参数: {customerId:string用户编号}
		var condi = {};
		condi.customerId = g.customerId;
		$.ajax({
			url:url,
			data:condi,
			type:"POST",
			dataType:"json",
			context:this,
			success: function(data){
				console.log("sendGetUserInfoHttp",data);
				var status = data.success || false;
				if(status){
					var obj = data.obj || {};
					changeUserInfoHtml(obj);

					var userInfo = JSON.stringify(obj);
					//保存用户数据
					Utils.offLineStore.set("userinfo",userInfo,false);
				}
				else{
					var msg = data.message || "获取用户信息失败";
					Utils.alert(msg);
				}
				g.httpTip.hide();
			},
			error:function(data){
				g.httpTip.hide();
			}
		});
	}

	//更新用户信息模板
	function changeUserInfoDefaultHtml(obj){
		var sex = obj["1001"] || [];
		var identification = obj["1002"] || [];
		var maritalStatus = obj["1003"] || [];
		var interesting = obj["1004"] || [];

		var sexHtml = [];
		for(var k in sex){
			sexHtml.push('<input type="radio" name="sexradio" class="common-radio" id="' + k + '" value="' + k + '"><label for="' + k + '" style="float:none;">' + sex[k] + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</label>');
		}
		var identificationHtml = [];
		for(var k in identification){
			identificationHtml.push('<input type="radio" class="common-radio" name="idrodio" id="' + k + '" value="' + k + '"><label for="' + k + '" style="float:none;">' + identification[k] + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</label>');
		}
		var maritalStatusHtml = [];
		for(var k in maritalStatus){
			maritalStatusHtml.push('<input type="radio" class="common-radio" name="userstatus" id="' + k + '" value="' + k + '"><label for="' + k + '" style="float:none;">' + maritalStatus[k] + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</label>');
		}
		var interestingHtml = [];
		for(var k in interesting){
			interestingHtml.push('<input type="checkbox" class="common-checkbox" name="cklike" id="' + k + '" value="' + k + '"><label for="' + k + '" style="float:none;">' + interesting[k] + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</label>');
		}

		$("#sexdiv").html(sexHtml.join(''));
		$("#identificationdiv").html(identificationHtml.join(''));
		$("#maritalStatusdiv").html(maritalStatusHtml.join(''));
		$("#interestingdiv").html(interestingHtml.join(''));
		$("#edit-inf-box").css("visibility","visible");
		$('.common-radio').yyptRadio();
		$('.common-checkbox').yyptCheckbox();
	}
	//更新用户信息html
	function changeUserInfoHtml(obj){
		var sex = obj.sex || "";
		var birthday = obj.birthday || "";
		var identification = obj.identification || "";
		var maritalStatus = obj.maritalStatus || "";
		var interesting = obj.interesting || "";

		var avatar = obj.icon || "";
		if(avatar !== ""){
			avatar = avatar + "?t=" + (new Date() - 0);
			$("#avatarimg").attr("src",avatar);
		}

		if(sex !== ""){
			$("#" + sex)[0].checked = true;
			$($("#" + sex).parent()).removeClass("radio-bg-checked");
			$($("#" + sex).parent()).addClass("radio-bg-checked");
		}
		if(identification !== ""){
			$("#" + identification)[0].checked = true;
			$($("#" + identification).parent()).removeClass("radio-bg-checked");
			$($("#" + identification).parent()).addClass("radio-bg-checked");
		}
		if(maritalStatus !== ""){
			$("#" + maritalStatus)[0].checked = true;
			$($("#" + maritalStatus).parent()).removeClass("radio-bg-checked");
			$($("#" + maritalStatus).parent()).addClass("radio-bg-checked");
		}
		if(interesting !== ""){
			var inter = interesting.split(",") || [];
			for(var i = 0, len = inter.length; i < len; i++){
				$("#" + inter[i])[0].checked = true;
				$($("#" + inter[i]).parent()).addClass("chk-bg-checked");
			}
		}
		if(birthday !== ""){
			$("#birthday").val(birthday);
		}
	}


	//保存用户信息
	//更新个人资料
	function saveBtnUp(){
		//debugger
		var sex = $("input[name='sexradio']:checked") || [];
		var ids = $("input[name='idrodio']:checked") || [];
		var status = $("input[name='userstatus']:checked") || [];
		var likes = $("input[name='cklike']:checked") || [];

		var birthday = $("#birthday").val() || "";

		var cksex = "";
		var ckid = "";
		var ckstatus = "";
		var cklikes = "";

		if(sex.length > 0){
			cksex = sex[0].value || "";
		}
		if(ids.length > 0){
			ckid = ids[0].value || "";
		}
		if(status.length > 0){
			ckstatus = status[0].value || "";
		}
		if(likes.length > 0){
			var like = [];
			for(var i = 0, len = likes.length; i < len; i++){
				var v = likes[i].value || "";
				if(v !== ""){
					like.push(v);
				}
			}
			cklikes = like.join(',');
		}

		if(g.login_token !== "" && g.customerId !== ""){
			var condi = {};
			condi.login_token = g.login_token;
			condi.customerId = g.customerId;
			if(cksex !== ""){
				condi.sex = cksex;
			}
			if(ckid !== ""){
				condi.identification = ckid;
			}
			if(ckstatus !== ""){
				condi.maritalStatus = ckstatus;
			}
			if(cklikes !== ""){
				condi.interesting = cklikes;
			}
			if(birthday !== ""){
				condi.birthday = birthday;
			}

			sendSetUserInfoHttp(condi);
		}
		else{
			Utils.alert("登录超时,请重新登录");
		}
	}

	//更新
	function sendSetUserInfoHttp(condi){
		g.httpTip.show();
		/*
		{"login_token":string登录标识,customerId:string用户编号,
		sex用户性别:string,
		identification:string用户身份,
		maritalStatus:string用户婚姻状况,
		interesting:string用户喜好,
		birthday:string用户生日}
		*/
		var url = Base.serverUrl + "user/updateCustomerInfoController";
		$.ajax({
			url:url,
			data:condi,
			type:"POST",
			dataType:"json",
			context:this,
			success: function(data){
				console.log("sendSetUserInfoHttp",data);
				var status = data.success || false;
				if(status){
					Utils.alert("用户信息更新成功");
				}
				else{
					var msg = data.message || "获取用户信息失败";
					Utils.alert(msg);
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
		var tp ="jpg,gif,bmp,JPG,GIF,BMP,png,jpeg";
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
});