/**
 * file:我要分期
 * author:chenxy
*/

//页面初始化
$(function(){
	var g = {};
	g.phone = "";
	g.imgCodeId = "";
	g.sendCode = false;
	g.login_token = Utils.offLineStore.get("token",false) || "";
	g.sendTime = 60;
	g.customerId = "";
	g.userPhone = "";

	g.orderId = Utils.getQueryString("orderid") || "";
	g.poundage = 0;
	g.moneyMonth = 0;
	g.stagnum = 0;
	g.repaymentType = "";
	g.orderUserInfo = {};

	g.uploadImgType = ["100701","100702","100703","100704","100705","100706","100707","100708","100709","100710","100711"];
	g.uploadIndex = 0;
	g.uploadMark = [0,0,0,0,0,0];

	//编辑订单
	//g.editOrderId = Utils.getQueryString("orderid") || "";

	g.httpTip = new Utils.httpTip({});

	//验证登录状态
	g.loginStatus = Utils.getUserInfo();
	if(!g.loginStatus){
		//未登录
	}
	else{
		getUserInfo();
		sendGetProductHttp();
		sendGetDicHttp();
	}

	//获取图形验证码
	//sendGetImgCodeHttp();

	//g.httpTip.show();
	$("#countbtn").bind("click",countBtnUp);
	$("#nextbtn2").bind("click",nextBtnUp2);

	$("#packageMoney").bind("blur",fenQiTimesChange);
	$("#fenQiTimes").bind("change",fenQiTimesChange);
	$("#nextbtn3").bind("click",nextBtnUp3);

	$("#contractNo").bind("blur",validNoEmpty);

	$("#userinfotab li").bind("click",userInfoTabChange);
	$("#prebtn2").bind("click",preBtnUp2);
	$("#nextbtn32").bind("click",nextBtnUp32);

	$("#prebtn31").bind("click",preBtnUp31);
	$("#nextbtn33").bind("click",nextBtnUp33);

	$("#prebtn32").bind("click",preBtnUp32);
	$("#nextbtn4").bind("click",nextBtnUp4);

	$("#prebtn3").bind("click",preBtnUp3);
	$("#nextbtn5").bind("click",nextBtnUp5);

	//头像
	$(document).on("change","#orderMaterialFile",orderMaterialFileBtnUp);
	$(".upload-btn").bind("click",function(){
		g.uploadIndex = this.id.split("_")[1] - 0;
		document.getElementById('orderMaterialFile').click();
	});


	$("#contractNo").bind("blur",validNoEmpty);
	$("#packageMoney").bind("blur",validNoEmpty);
	$("#packageMoney").bind("blur",validIsNumber);

	$("#applicantName").bind("blur",validNoEmpty);
	$("#applicantAge").bind("blur",validNoEmpty);
	$("#applicantAge").bind("blur",validIsNumber);
	$("#applicantIdentity").bind("blur",validNoEmpty);
	$("#applicantIdentity").bind("blur",validIsIdentity);
	$("#applicantAddress").bind("blur",validNoEmpty);
	$("#applicantSchool").bind("blur",validNoEmpty);
	$("#applicantMajor").bind("blur",validNoEmpty);
	$("#applicantCompany").bind("blur",validNoEmpty);
	$("#applicantCompanyAddress").bind("blur",validNoEmpty);
	$("#applicantCompanyPhone").bind("blur",validNoEmpty);
	$("#applicantWages").bind("blur",validNoEmpty);
	$("#applicantWages").bind("blur",validIsNumber);

	$("#familyName").bind("blur",validNoEmpty);
	$("#familyPhone").bind("blur",validNoEmpty);
	$("#familyPhone").bind("blur",validIsPhone);
	$("#friendName").bind("blur",validNoEmpty);
	$("#friendPhone").bind("blur",validNoEmpty);
	$("#friendPhone").bind("blur",validIsPhone);

	$("#liableName").bind("blur",validNoEmpty);
	$("#liablePhone").bind("blur",validNoEmpty);
	$("#liablePhone").bind("blur",validIsPhone);
	$("#liableIdentity").bind("blur",validNoEmpty);
	$("#liableIdentity").bind("blur",validIsIdentity);
	$("#liableAddress").bind("blur",validNoEmpty);


	function validNoEmpty(evt){
		var t = $(this).val() || "";
		var id = this.id || "";
		var next = $(this).next();
		if(t !== ""){
			$(next).html('<i class="common-ico validate-ico"></i>填写正确');
			$(next).removeClass("validate-error");
			$(next).addClass("validate-success");
			$(next).show();
		}
		else{
			$(next).html('<i class="common-ico validate-ico"></i>不能为空');
			$(next).removeClass("validate-success");
			$(next).addClass("validate-error");
			$(next).show();
		}
	}

	function validIsNumber(evt){
		var t = $(this).val() || "";
		var reg = /^\d+$/g;
		var next = $(this).next();
		if(reg.test(t)){
			$(next).html('<i class="common-ico validate-ico"></i>填写正确');
			$(next).removeClass("validate-error");
			$(next).addClass("validate-success");
			$(next).show();
		}
		else{
			$(next).html('<i class="common-ico validate-ico"></i>只能填写数字');
			$(next).removeClass("validate-success");
			$(next).addClass("validate-error");
			$(next).show();
		}
	}

	function validIsPhone(evt){
		var t = $(this).val() || "";
		var reg = /^1[3,5,7,8]\d{9}$/;
		var next = $(this).next();
		if(reg.test(t)){
			$(next).html('<i class="common-ico validate-ico"></i>填写正确');
			$(next).removeClass("validate-error");
			$(next).addClass("validate-success");
			$(next).show();
		}
		else{
			$(next).html('<i class="common-ico validate-ico"></i>手机号码输入错误');
			$(next).removeClass("validate-success");
			$(next).addClass("validate-error");
			$(next).show();
		}
	}

	function validIsIdentity(evt){
		var txt = $(this).val() || "";
		var valid = new ValidCard({txt:txt});
		var b = valid.valid();
		var next = $(this).next();
		if(b){
			$(next).html('<i class="common-ico validate-ico"></i>填写正确');
			$(next).removeClass("validate-error");
			$(next).addClass("validate-success");
			$(next).show();
		}
		else{
			$(next).html('<i class="common-ico validate-ico"></i>身份证号码输入错误');
			$(next).removeClass("validate-success");
			$(next).addClass("validate-error");
			$(next).show();
		}
	}

	function sendValidNoEmpty(txt,dom){
		var b = false;
		var next = dom.next();
		if(txt !== ""){
			b = true;
			$(next).html('<i class="common-ico validate-ico"></i>填写正确');
			$(next).removeClass("validate-error");
			$(next).addClass("validate-success");
			$(next).show();
		}
		else{
			$(next).html('<i class="common-ico validate-ico"></i>不能为空');
			$(next).removeClass("validate-success");
			$(next).addClass("validate-error");
			$(next).show();
		}
		return b;
	}
	function sendValidIsNumber(txt,dom){
		var b = false;
		var reg = /^\d+$/g;
		var next = dom.next();
		if(reg.test(txt)){
			b = true;
			$(next).html('<i class="common-ico validate-ico"></i>填写正确');
			$(next).removeClass("validate-error");
			$(next).addClass("validate-success");
			$(next).show();
		}
		else{
			$(next).html('<i class="common-ico validate-ico"></i>只能填写数字');
			$(next).removeClass("validate-success");
			$(next).addClass("validate-error");
			$(next).show();
		}
		return b;
	}
	function sendValidIsPhone(txt,dom){
		var b = false;
		var reg = /^1[3,5,7,8]\d{9}$/;
		var next = dom.next();
		if(reg.test(txt)){
			b = true;
			$(next).html('<i class="common-ico validate-ico"></i>填写正确');
			$(next).removeClass("validate-error");
			$(next).addClass("validate-success");
			$(next).show();
		}
		else{
			$(next).html('<i class="common-ico validate-ico"></i>手机号码输入错误');
			$(next).removeClass("validate-success");
			$(next).addClass("validate-error");
			$(next).show();
		}
		return b;
	}
	function sendValidIsIdentity(txt,dom){
		var valid = new ValidCard({txt:txt});
		var b = valid.valid();
		var next = dom.next();
		if(b){
			$(next).html('<i class="common-ico validate-ico"></i>填写正确');
			$(next).removeClass("validate-error");
			$(next).addClass("validate-success");
			$(next).show();
		}
		else{
			$(next).html('<i class="common-ico validate-ico"></i>身份证号码输入错误');
			$(next).removeClass("validate-success");
			$(next).addClass("validate-error");
			$(next).show();
		}
		return b;
	}

	//获取产品信息
	function sendGetProductHttp(){
		g.httpTip.show();
		var url = Base.serverUrl + "order/queryProductController";
		var condi = {};
		$.ajax({
			url:url,
			data:condi,
			type:"POST",
			dataType:"json",
			context:this,
			async: false,
			success: function(data){
				console.log("sendGetProductHttp",data);
				var status = data.success || false;
				if(status){
					changeProductSelectHtml(data);
				}
				else{
					var msg = data.message || "获取产品数据失败";
					Utils.alert(msg);
				}
				g.httpTip.hide();
			},
			error:function(data){
				g.httpTip.hide();
			}
		});
	}

	//获取字典信息
	function sendGetDicHttp(){
		g.httpTip.show();
		var url = Base.serverUrl + "baseCodeController/getBaseCodeByParents";
		var condi = {};
		condi.parents = "1003,1008,1009,1012,1013,1014,1015,1016";
		$.ajax({
			url:url,
			data:condi,
			type:"POST",
			dataType:"json",
			context:this,
			success: function(data){
				console.log("sendGetDicHttp",data);
				var status = data.success || false;
				if(status){
					var obj = data.obj || {};
					changeSelectHtml(obj);

					//判断是否是编辑状态
					if(g.orderId !== ""){
						$("#step1").hide();
						$("#step2").show();
						//获取订单信息

						sendGetOrderInfoHttp();
					}
				}
				else{
					var msg = data.message || "获取字典数据失败";
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
		var repaymentType = obj["1008"] || {};
		for(var k in repaymentType){
			g.repaymentType = k;
		}

		var parents = ["1003","1009","1012","1013","1014","1015","1016","1016"];
		var ids = ["applicantMarital","applicantStudyStatus","applicantCompanyNature","applicantCompanyIndustry",
			"applicantDuties","applicantWorkYears","familyRelation","liableRelation"];

		for(var i = 0,len = parents.length; i < len; i++){
			var data = obj[parents[i]] || {};
			var option = [];
			for(var k in data){
				var id = k || "";
				var name = data[k] || "";
				option.push('<option value="' + id + '">' + name + '</option>');
			}
			$("#" + ids[i]).html(option.join(''));
		}
	}

	function changeProductSelectHtml(obj){
		var data = obj.list || [];
		var option = [];
		for(var i = 0,len = data.length; i < len; i++){
			var d = data[i];
			var id = d.productId || "";
			var cid = d.companyId || "";
			var name = d.productName || "";
			id = id + "_" + cid;
			option.push('<option value="' + id + '">' + name + '</option>');
		}
		$("#packageType").html(option.join(''));
	}


	//获取个人资料
	function getUserInfo(){
		var info = Utils.offLineStore.get("userinfo",false) || "";
		console.log("getUserInfo",info);
		if(info !== ""){
			var obj = JSON.parse(info) || {};
			g.customerId = obj.customerId || "";
			g.userPhone = obj.phoneNumber || "";
		}
	}


	function countFee(allprice,time){
		var numarr = [3,6,9,12,18,24,36];
		var ratearr = [0,0.01,0.04,0.07,0.1,0.13,0.16];

		var rate = ratearr[time] * allprice;
		var all = allprice + rate;
		var mouthprice = allprice / numarr[time];
		var obj = {};
		obj.all = all;
		obj.mouth = mouthprice.toFixed(2);
		obj.rate = rate.toFixed(2);
		obj.stagnum = numarr[time];
		return obj;
	}

	function countBtnUp(){
		var allprice = $("#allprice").val() - 0 || 0;
		var time = $("#stagingtime").val() - 0 || 0;

		if(allprice > 0){
			var obj = countFee(allprice,time);

			$("#alltext").html(obj.all);
			$("#feetext").html(obj.rate);
			$("#mouthtext").html(obj.mouth);
		}
	}

	function nextBtnUp2(){
		if(g.loginStatus){
			$("#step1").hide();
			$("#step2").show();

			//获取订单编号
			sendGetOrderIdHttp();
		}
		else{
			location.href = "/anjia/login.html";
		}
	}

	//获取订单编号
	function sendGetOrderIdHttp(condi){
		var url = Base.serverUrl + "order/getOrderIdController";
		g.httpTip.show();
		$.ajax({
			url:url,
			data:condi,
			type:"POST",
			dataType:"json",
			context:this,
			success: function(data){
				console.log("sendGetOrderIdHttp",data);
				var status = data.success || false;
				if(status){
					g.orderId = data.obj || "";
				}
				else{
					//var msg = data.error || "";
					var msg = data.message || "获取订单编号失败";
					alert(msg);
				}
				g.httpTip.hide();
			},
			error:function(data){
				g.httpTip.hide();
			}
		});
	}

	function fenQiTimesChange(){
		var packageMoney = $("#packageMoney").val() - 0 || 0;
		if(packageMoney > 0){
			var time = $("#fenQiTimes").val() - 0 || 0;
			var obj = countFee(packageMoney,time);

			$("#poundage").html(obj.rate > 0 ? (obj.rate + "元") : "免费");
			$("#moneyMonth").html(obj.mouth + "元");

			g.poundage = obj.rate + "";
			g.moneyMonth = obj.mouth + "";
			g.stagnum = obj.stagnum;
		}
	}

	function nextBtnUp3(){
		var contractNo = $("#contractNo").val() || "";
		var packageName = $("#packageType")[0].options[$("#packageType")[0].selectedIndex].text;
		var packageType = $("#packageType").val() || "";
		var packageMoney = $("#packageMoney").val() || "";
		var fenQiTimes = $("#fenQiTimes").val() || "";
		var agreeck = $("#agreeck")[0].checked || false;
		ptype = packageType.split("_");
		packageType = ptype[0] || "";
		var companyId = ptype[1] || "";

		if(sendValidNoEmpty(contractNo,$("#contractNo"))){
			if(sendValidNoEmpty(packageMoney,$("#packageMoney"))){
				if(sendValidIsNumber(packageMoney,$("#packageMoney"))){
					if(agreeck){
						var condi = {};
						condi.login_token = g.login_token;
						condi.customerId = g.customerId;
						condi.orderId = g.orderId;
						condi.contractNo = contractNo;
						condi.packageName = packageName;
						condi.packageType = packageType;
						condi.companyId = companyId;
						condi.packageMoney = packageMoney;
						condi.fenQiTimes = g.stagnum;
						condi.poundage =  g.poundage;
						condi.repaymentType = g.repaymentType;
						condi.moneyMonth = g.moneyMonth;
						sendSetOrderPackageHttp(condi);
					}
					else{
						Utils.alert("请勾选同意借款服务协议");
					}
				}
			}
		}
	}

	function sendSetOrderPackageHttp(condi){
		var url = Base.serverUrl + "order/editOrderPackageController";
		g.httpTip.show();
		$.ajax({
			url:url,
			data:condi,
			type:"POST",
			dataType:"json",
			context:this,
			success: function(data){
				console.log("sendSetOrderPackageHttp",data);
				var status = data.success || false;
				if(status){
					//显示第二步
					$("#step2").hide();
					$("#step3").show();
				}
				else{
					//var msg = data.error || "";
					var msg = data.message || "获取订单编号失败";
					alert(msg);
				}
				g.httpTip.hide();
			},
			error:function(data){
				g.httpTip.hide();
			}
		});
	}


	function userInfoTabChange(evt){
		var id = this.id;
		$("#userinfotab li").removeClass("selected");
		$(this).addClass("selected");
		switch(id){
			case "tab0":
				$("#step31").show();
				$("#step32").hide();
				$("#step33").hide();
			break;
			case "tab1":
				$("#step31").hide();
				$("#step32").show();
				$("#step33").hide();
			break;
			case "tab2":
				$("#step31").hide();
				$("#step32").hide();
				$("#step33").show();
			break;
		}
	}

	function preBtnUp2(){
		//显示第二步
		$("#step2").show();
		$("#step3").hide();
	}

	function nextBtnUp32(){
		var applicantName = $("#applicantName").val() || "";
		var applicantAge = $("#applicantAge").val() || "";
		var applicantSex = $("[name='rsex']:checked").val() || "";
		var applicantIdentity = $("#applicantIdentity").val() || "";
		var applicantMarital = $("#applicantMarital").val() || "";
		var applicantAddress = $("#applicantAddress").val() || "";
		var applicantStudyStatus = $("#applicantStudyStatus").val() || "";
		var applicantSchool = $("#applicantSchool").val() || "";
		var applicantMajor = $("#applicantMajor").val() || "";
		var applicantAsset = $("[name='zcradio']:checked").val() || "";

		var applicantJobNature = $("[name='gzxzradio']:checked").val() || "";
		var applicantCompany = $("#applicantCompany").val() || "";
		var applicantCompanyNature = $("#applicantCompanyNature").val() || "";
		var applicantCompanyIndustry = $("#applicantCompanyIndustry").val() || "";
		var applicantDuties = $("#applicantDuties").val() || "";
		var applicantWorkYears = $("#applicantWorkYears").val() || "";
		var applicantCompanyAddress = $("#applicantCompanyAddress").val() || "";
		var applicantCompanyPhone = $("#applicantCompanyPhone").val() || "";
		var applicantWages = $("#applicantWages").val() || "";

		if(!sendValidNoEmpty(applicantName,$("#applicantName"))){
			return;
		}
		if(!sendValidNoEmpty(applicantAge,$("#applicantAge"))){
			return;
		}
		if(!sendValidIsNumber(applicantAge,$("#applicantAge"))){
			return;
		}
		if(!sendValidNoEmpty(applicantIdentity,$("#applicantIdentity"))){
			return;
		}
		if(!sendValidIsIdentity(applicantIdentity,$("#applicantIdentity"))){
			return;
		}
		if(!sendValidNoEmpty(applicantAddress,$("#applicantAddress"))){
			return;
		}
		if(!sendValidNoEmpty(applicantSchool,$("#applicantSchool"))){
			return;
		}
		if(!sendValidNoEmpty(applicantMajor,$("#applicantMajor"))){
			return;
		}
		if(!sendValidNoEmpty(applicantCompany,$("#applicantCompany"))){
			return;
		}
		if(!sendValidNoEmpty(applicantCompanyAddress,$("#applicantCompanyAddress"))){
			return;
		}
		if(!sendValidNoEmpty(applicantCompanyPhone,$("#applicantCompanyPhone"))){
			return;
		}
		if(!sendValidNoEmpty(applicantWages,$("#applicantWages"))){
			return;
		}
		if(!sendValidIsNumber(applicantWages,$("#applicantWages"))){
			return;
		}
		var condi = {};
		condi.applicantIdentity = applicantIdentity;
		condi.applicantName = applicantName;
		condi.applicantPhone = g.userPhone;
		condi.applicantAge = applicantAge;
		condi.applicantSex = applicantSex;
		condi.applicantMarital = applicantMarital;
		condi.applicantAddress = applicantAddress;
		condi.applicantStudyStatus = applicantStudyStatus;
		condi.applicantSchool = applicantSchool;
		condi.applicantMajor = applicantMajor;
		condi.applicantAsset = applicantAsset;

		condi.applicantHouseNumber = 0;
		condi.applicantHouseWorth = 0;
		condi.applicantCarNumber = 0;
		condi.applicantCarWorth = 0;

		condi.applicantJobNature = applicantJobNature;
		condi.applicantCompany = applicantCompany;
		condi.applicantCompanyNature = applicantCompanyNature;
		condi.applicantCompanyIndustry = applicantCompanyIndustry;
		condi.applicantWorkYears = applicantWorkYears;
		condi.applicantDuties = applicantDuties;
		condi.applicantCompanyAddress = applicantCompanyAddress;
		condi.applicantCompanyPhone = applicantCompanyPhone;
		condi.applicantWages = applicantWages;

		g.orderUserInfo = condi;

		//显示三步,里面的第二步
		$("#userinfotab li").removeClass("selected");
		$("#tab1").addClass("selected");
		$("#step31").hide();
		$("#step32").show();
		$("#step33").hide();

		window.scrollTo(0,950);
	}


	function preBtnUp31(){
		$("#userinfotab li").removeClass("selected");
		$("#tab0").addClass("selected");
		$("#step32").hide();
		$("#step31").show();
		$("#step33").hide();
	}

	function nextBtnUp33(){
		var familyName = $("#familyName").val() || "";
		var familyPhone = $("#familyPhone").val() || "";
		var familyRelation = $("#familyRelation").val() || "";
		var friendName = $("#friendName").val() || "";
		var friendPhone = $("#friendPhone").val() || "";

		if(!sendValidNoEmpty(familyName,$("#familyName"))){
			return;
		}
		if(!sendValidNoEmpty(familyPhone,$("#familyPhone"))){
			return;
		}
		if(!sendValidIsPhone(familyPhone,$("#familyPhone"))){
			return;
		}
		if(!sendValidNoEmpty(friendName,$("#friendName"))){
			return;
		}
		if(!sendValidNoEmpty(friendPhone,$("#friendPhone"))){
			return;
		}
		if(!sendValidIsPhone(friendPhone,$("#friendPhone"))){
			return;
		}

		g.orderUserInfo.familyName = familyName;
		g.orderUserInfo.familyPhone = familyPhone;
		g.orderUserInfo.familyRelation = familyRelation;
		g.orderUserInfo.friendName = friendName;
		g.orderUserInfo.friendPhone = friendPhone;

		//显示三步,里面的第三步
		$("#userinfotab li").removeClass("selected");
		$("#tab2").addClass("selected");
		$("#step31").hide();
		$("#step32").hide();
		$("#step33").show();

		window.scrollTo(0,950);
	}


	function preBtnUp32(){
		$("#userinfotab li").removeClass("selected");
		$("#tab1").addClass("selected");
		$("#step31").hide();
		$("#step33").hide();
		$("#step32").show();
	}

	function nextBtnUp4(){
		var liableName = $("#liableName").val() || "";
		var liablePhone = $("#liablePhone").val() || "";
		var liableIdentity = $("#liableIdentity").val() || "";
		var liableRelation = $("#liableRelation").val() || "";
		var liableAddress = $("#liableAddress").val() || "";

		if(!sendValidNoEmpty(liableName,$("#liableName"))){
			return;
		}
		if(!sendValidNoEmpty(liablePhone,$("#liablePhone"))){
			return;
		}
		if(!sendValidIsPhone(liablePhone,$("#liablePhone"))){
			return;
		}
		if(!sendValidNoEmpty(liableIdentity,$("#liableIdentity"))){
			return;
		}
		if(!sendValidIsIdentity(liableIdentity,$("#liableIdentity"))){
			return;
		}
		if(!sendValidNoEmpty(liableAddress,$("#liableAddress"))){
			return;
		}

		g.orderUserInfo.liableName = liableName;
		g.orderUserInfo.liablePhone = liablePhone;
		g.orderUserInfo.liableIdentity = liableIdentity;
		g.orderUserInfo.liableRelation = liableRelation;
		g.orderUserInfo.liableAddress = liableAddress;

		g.orderUserInfo.login_token = g.login_token;
		g.orderUserInfo.orderId = g.orderId;

		sendSetCustomerInfoHttp(g.orderUserInfo);
	}

	function sendSetCustomerInfoHttp(condi){
		var url = Base.serverUrl + "order/editOrderCustomerInfoController";
		g.httpTip.show();
		$.ajax({
			url:url,
			data:condi,
			type:"POST",
			dataType:"json",
			context:this,
			success: function(data){
				console.log("sendSetCustomerInfoHttp",data);
				var status = data.success || false;
				if(status){
					//显示第4步
					$("#step3").hide();
					$("#step4").show();
				}
				else{
					//var msg = data.error || "";
					var msg = data.message || "提交订单用户信息失败";
					alert(msg);
				}
				g.httpTip.hide();
			},
			error:function(data){
				g.httpTip.hide();
			}
		});
	}

	function preBtnUp3(){
		//显示第三步
		$("#step3").show();
		$("#step4").hide();
	}

	function orderMaterialFileBtnUp(){
		var orderMaterialFile = $("#orderMaterialFile").val() || "";
		if(orderMaterialFile !== ""){
			uploadBtnUp();
		}
	}


	function uploadBtnUp(){
		if(lastname()){
			g.httpTip.show();
			var url = Base.serverUrl + "order/uploadOrderMaterial";
			var condi = {};
			condi.login_token = g.login_token;
			condi.customerId = g.customerId;
			condi.orderId = g.orderId;
			condi.orderMaterialType  = g.uploadImgType[g.uploadIndex];
			console.log("uploadBtnUp",condi);

			//document.domain = "partywo.com";
			$.ajaxFileUpload({
				url: url, //用于文件上传的服务器端请求地址
				data:condi,
				secureuri: false, //一般设置为false
				fileElementId: 'orderMaterialFile', //文件上传空间的id属性  <input type="file" id="file" name="file" />
				dataType: 'jsonp', //返回值类型 一般设置为json
				success: function (data, status)  //服务器成功响应处理函数
				{
					//data = '{"success":true,"message":1111,"obj":"http://123.57.5.50:8888/anjia/201508240001/201508300051/100701.jpg","list":null,"code":null,"token":null}';
					console.log("ajaxFileUpload",data);
					g.httpTip.hide();
					if(data != null && data != ""){
						try{
							var obj = JSON.parse(data);
							imgUploadCallBack(obj);
							//var src = obj.obj + "?t=" + (new Date() - 0);
							//$("#avatarimg").attr("src",src);
						}
						catch(e){
							Utils.alert("图片上传失败");
						}
					}
					//Utils.alert("头像上传成功");
					//console.log("ajaxFileUpload",data,status);
					//location.reload();
				},
				error: function (data, status, e)//服务器响应失败处理函数
				{
					Utils.alert("图片上传失败");
					g.httpTip.hide();
				}
			});
			return false;
		}
	}

	function imgUploadCallBack(data){
		var src = data.obj + "?t=" + (new Date() - 0);
		var id = data.message || "";
		var html = [];
		html.push('<div id="img_' + id + '" class="upload-img-item">');
		html.push('<div class="upload-inf-img">');
		html.push('<img src="' + src + '" width=230 height=130 />');
		html.push('</div>');
		html.push('<div class="upload-img-edit">');
		//html.push('<a href="javascript:void(0)" onclick="" class="common-ico ico-edit"></a>
		html.push('<a href="javascript:deleteUploadImg(\'' + id + '\',\'' + g.uploadIndex + '\')" class="common-ico ico-rubbish"></a>');
		html.push('</div>');
		html.push('</div>');

		$("#imgdiv_" + g.uploadIndex).append(html.join(''));

		if(g.uploadIndex == 0){
			var fm = g.uploadMark[0];
			if(fm === 1){
				g.uploadMark[g.uploadIndex + 1] = 1;
			}
			else{
				g.uploadMark[g.uploadIndex] = 1;
			}
		}
		else{
			g.uploadMark[g.uploadIndex + 1] = 1;
		}
	}

	function deleteUploadImg(id,index){
		var url = Base.serverUrl + "order/deleteOrderMaterial";
		var condi = {};
		condi.login_token = g.login_token;
		condi.orderMaterialId = id;

		g.httpTip.show();
		$.ajax({
			url:url,
			data:condi,
			type:"POST",
			dataType:"json",
			context:this,
			success: function(data){
				console.log("deleteUploadImg",data);
				var status = data.success || false;
				if(status){
					$("#img_" + id).hide();
					index = index - 0;
					if(index == 0){
						var fm = g.uploadMark[1];
						if(fm === 1){
							g.uploadMark[1] = 0;
						}
						else{
							g.uploadMark[0] = 0;
						}
					}
					else{
						g.uploadMark[index + 1] = 0;
					}
				}
				else{
					//var msg = data.error || "";
					var msg = data.message || "删除上传图片失败";
					alert(msg);
				}
				g.httpTip.hide();
			},
			error:function(data){
				g.httpTip.hide();
			}
		});
	}

	function nextBtnUp5(){
		var condi = {};
		condi.login_token = g.login_token;
		condi.orderId = g.orderId;
		if(g.uploadMark.indexOf(0) == -1){
			sendSetOrderCompleteHttp(condi);
		}
		else{
			var msg = ["身份证未上传","身份证需要上传正反面","个人征兴报告未上传","户口本未上传","流水证明未上传","在职证明未上传"];
			for(var i = 0,len = g.uploadMark.length; i < len; i++){
				var m = g.uploadMark[i];
				if(m === 0){
					Utils.alert(msg[i]);
					break;
				}
			}
		}
	}
	function sendSetOrderCompleteHttp(condi){
		var url = Base.serverUrl + "order/editOrderCompleteController";
		g.httpTip.show();
		$.ajax({
			url:url,
			data:condi,
			type:"POST",
			dataType:"json",
			context:this,
			success: function(data){
				console.log("sendSetOrderCompleteHttp",data);
				var status = data.success || false;
				if(status){
					//显示第5步
					$("#step4").hide();
					$("#step5").show();
					setTimeout(function(){
						location.href = "/anjia/usercenter.html";
					},5000);
				}
				else{
					//var msg = data.error || "";
					var msg = data.message || "提交订单用户信息失败";
					alert(msg);
				}
				g.httpTip.hide();
			},
			error:function(data){
				g.httpTip.hide();
			}
		});
	}



	function lastname(){
		//获取欲上传的文件路径
		var filepath = document.getElementById("orderMaterialFile").value;
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



	//以下为订单编辑
	function sendGetOrderInfoHttp(){
		var url = Base.serverUrl + "order/queryOrdersByOrderIdController";
		var condi = {};
		condi.login_token = g.login_token;
		condi.orderId = g.orderId;

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
					changeOrderInfoHtml(data);
				}
				else{
					//var msg = data.error || "";
					var msg = data.message || "获取订单信息失败";
					alert(msg);
				}
				g.httpTip.hide();
			},
			error:function(data){
				g.httpTip.hide();
			}
		});
	}


	function changeOrderInfoHtml(data){
		var obj = data.obj || {};
		//第二步数据,套餐信息
		var contractNo = obj.contractNo || "";
		var packageType = obj.packageType || "";
		var companyId = obj.companyId || "";
		var packageMoney = obj.packageMoney || "";
		var fenQiTimes = obj.fenQiTimes || "";
		var poundage = obj.poundage || "0";
		var moneyMonth = obj.moneyMonth || "0";

		g.stagnum = fenQiTimes;
		g.poundage = poundage;
		g.moneyMonth = moneyMonth;

		var fenarr = {"3":0,"6":1,"9":2,"12":3,"18":4,"24":5,"36":6};
		fenQiTimes = fenarr[(fenQiTimes + "")];

		$("#contractNo").val(contractNo);
		$("#packageType").val((packageType + "_" + companyId));
		$("#packageMoney").val(packageMoney);
		$("#fenQiTimes").val(fenQiTimes);
		$("#poundage").html((poundage == "0" ? "免费" : (poundage + "元")));
		$("#moneyMonth").html((moneyMonth + "元"));
		$("#agreeck").attr("checked",true);
		$($("#agreeck").parent()).addClass("chk-bg-checked");

		//第三步数据,个人信息
		//3.1
		var applicantName = obj.applicantName || "";
		var applicantAge = obj.applicantAge || "";
		var applicantSex = obj.applicantSex || "";
		var applicantIdentity = obj.applicantIdentity || "";
		var applicantMarital = obj.applicantMarital || "";
		var applicantAddress = obj.applicantAddress || "";
		var applicantStudyStatus = obj.applicantStudyStatus || "";
		var applicantSchool = obj.applicantSchool || "";
		var applicantMajor = obj.applicantMajor || "";
		var applicantAsset = obj.applicantAsset || "";

		var applicantJobNature = obj.applicantJobNature || "";
		var applicantCompany = obj.applicantCompany || "";
		var applicantCompanyNature = obj.applicantCompanyNature || "";
		var applicantCompanyIndustry = obj.applicantCompanyIndustry || "";
		var applicantDuties = obj.applicantDuties || "";
		var applicantWorkYears = obj.applicantWorkYears || "";
		var applicantCompanyAddress = obj.applicantCompanyAddress || "";
		var applicantCompanyPhone = obj.applicantCompanyPhone || "";
		var applicantWages = obj.applicantWages || "";

		$("#applicantName").val(applicantName);
		$("#applicantAge").val(applicantAge);
		if(applicantSex == "100102"){
			$("#applicantSex").attr("checked",true);
			$($("#r_100101").parent()).removeClass("radio-bg-checked");
			$($("#applicantSex").parent()).addClass("radio-bg-checked");
		}
		$("#applicantIdentity").val(applicantIdentity);
		$("#applicantMarital").val(applicantMarital);
		$("#applicantAddress").val(applicantAddress);
		$("#applicantStudyStatus").val(applicantStudyStatus);
		$("#applicantSchool").val(applicantSchool);
		$("#applicantMajor").val(applicantMajor);

		$("#r_" + applicantAsset).attr("checked",true);
		$($("#r_101001").parent()).removeClass("radio-bg-checked");
		$($("#r_" + applicantAsset).parent()).addClass("radio-bg-checked");

		$("#r_" + applicantJobNature).attr("checked",true);
		$($("#r_101101").parent()).removeClass("radio-bg-checked");
		$($("#r_" + applicantJobNature).parent()).addClass("radio-bg-checked");
		$("#applicantCompany").val(applicantCompany);
		$("#applicantCompanyNature").val(applicantCompanyNature);
		$("#applicantCompanyIndustry").val(applicantCompanyIndustry);
		$("#applicantDuties").val(applicantDuties);
		$("#applicantWorkYears").val(applicantWorkYears);
		$("#applicantCompanyAddress").val(applicantCompanyAddress);
		$("#applicantCompanyPhone").val(applicantCompanyPhone);
		$("#applicantWages").val(applicantWages);

		//3.2
		var familyName = obj.familyName || "";
		var familyPhone = obj.familyPhone || "";
		var familyRelation = obj.familyRelation || "";
		var friendName = obj.friendName || "";
		var friendPhone = obj.friendPhone || "";

		$("#familyName").val(familyName);
		$("#familyPhone").val(familyPhone);
		$("#familyRelation").val(familyRelation);
		$("#friendName").val(friendName);
		$("#friendPhone").val(friendPhone);

		//3.3
		var liableName = obj.liableName || "";
		var liablePhone = obj.liablePhone || "";
		var liableIdentity = obj.liableIdentity || "";
		var liableRelation = obj.liableRelation || "";
		var liableAddress = obj.liableAddress || "";

		$("#liableName").val(liableName);
		$("#liablePhone").val(liablePhone);
		$("#liableIdentity").val(liableIdentity);
		$("#liableRelation").val(liableRelation);
		$("#liableAddress").val(liableAddress);

		var imglist = data.list || [];
		imgUploadEdit(imglist);
	}

	function imgUploadEdit(list){
		for(var i = 0, len = list.length; i < len; i++){
			var data = list[i] || {};

			var src = data.orderMaterialUrl + "?t=" + (new Date() - 0);
			var id = data.orderMaterialId || "";
			var orderMaterialType = data.orderMaterialType || "";
			var slen = orderMaterialType.length - 1;
			if(len > 9){
				slen = orderMaterialType.length - 2;
			}
			var uploadIndex = orderMaterialType.substring(slen) - 1;
			var html = [];
			html.push('<div id="img_' + id + '" class="upload-img-item">');
			html.push('<div class="upload-inf-img">');
			html.push('<img src="' + src + '" width=230 height=130 />');
			html.push('</div>');
			html.push('<div class="upload-img-edit">');
			//html.push('<a href="javascript:void(0)" onclick="" class="common-ico ico-edit"></a>
			html.push('<a href="javascript:deleteUploadImg(\'' + id + '\',\'' + uploadIndex + '\')" class="common-ico ico-rubbish"></a>');
			html.push('</div>');
			html.push('</div>');

			$("#imgdiv_" + uploadIndex).append(html.join(''));

			if(uploadIndex == 0){
				var fm = g.uploadMark[0];
				if(fm === 1){
					g.uploadMark[uploadIndex + 1] = 1;
				}
				else{
					g.uploadMark[uploadIndex] = 1;
				}
			}
			else{
				g.uploadMark[uploadIndex + 1] = 1;
			}
		}
	}


	window.deleteUploadImg = deleteUploadImg;
});












