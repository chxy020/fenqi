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
	g.curCity = Utils.offLineStore.get("curCity",false) || "";//获取所在城市
	g.sendTime = 60;
	g.customerId = "";
	g.userPhone = "";
	
	g.orderId = Utils.getQueryString("orderid") || "";
	g.poundage = 0;
	g.moneyMonth = 0;
	g.stagnum = 0;
	g.repaymentType = "";
	g.orderUserInfo = {};

	g.packageType = "";
	g.companyId = "";

	g.uploadImgType = ["100701","100702","100703","100704","100705","100706","100707","100708","100709","100710","100711"];
	g.uploadIndex = 0;
	g.uploadMark = [[0],[0]];

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
		//sendGetProductHttp();
		sendGetDicHttp();
		sendGetcompanys();
		//getCompanyinfo();//发送商户信息到协议
	}
	/* 获取合作商户列表 */
	function sendGetcompanys(){
		g.httpTip.show();
		var url = Base.serverUrl + "subsidiary/getSubsidiarys";
		var condi = {};		
		$.ajax({
			url:url,
			data:condi,
			type:"POST",
			dataType:"json",
			context:this,
			success: function(data){
				//console.log("sendGetNavigationKeyHttp",data);
				var status = data.success || false;
				if(status){
					changeSelect(data);
					getCompanyinfo();//初次加载给协议里的合作商户赋值
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

	function changeSelect(obj){
		var data = obj.list || {};
		var option = [];
		for(var i=0;i<data.length;i++){
			var name = data[i].name;
			var conf = (g.curCity).indexOf(data[i].cityName) || false;
			if(conf!=-1)	{
				option.push('<option selected="true" value="' + data[i].id + '">' + name + '</option>');
				g.curCity="1";//防止重复
			}else{
				option.push('<option value="' + data[i].id + '">' + name + '</option>');
			}				
		}
		$("#subsidiaryId").html(option.join(''));
	}
	
	//获取图形验证码
	//sendGetImgCodeHttp();

	$("#nextbtn1").bind("click",nextBtnUp1);

	//g.httpTip.show();
	$("#countbtn").bind("click",countBtnUp);
	$("#nextbtn2").bind("click",nextBtnUp2);

	$("#packageMoney").bind("blur",fenQiTimesChange);
	$("#fenQiTimes").bind("change",fenQiTimesChange);

	$("#perbtn1").bind("click",preBtnUp1);
	$("#nextbtn3").bind("click",nextBtnUp3);
	$("#subsidiaryId").bind("change",getCompanyinfo);//协议获取商户信息
	/* $("#userinfotab li").bind("click",userInfoTabChange); */
	$("#prebtn2").bind("click",preBtnUp2);
	$("#nextbtn32").bind("click",nextBtnUp32);

	$("#prebtn31").bind("click",preBtnUp31);
	$("#nextbtn33").bind("click",nextBtnUp33);

	$("#prebtn32").bind("click",preBtnUp32);
	$("#nextbtn4").bind("click",nextBtnUp4);

	$("#prebtn3").bind("click",preBtnUp3);
	$("#nextbtn5").bind("click",nextBtnUp5);

	//头像
	//$(document).on("change","#orderMaterialFile",orderMaterialFileBtnUp);
	//$("#orderMaterialFile").change(function(){orderMaterialFileBtnUp()});	
	/* $(".upload-btn").bind("click",function(){
		g.uploadIndex = this.id.split("_")[1] - 0;
		document.getElementById('orderMaterialFile').click();
	}); */

	
	//$("#contractNo").bind("blur",validNoEmpty);
	$("#contractNo").bind("blur",validNoChinese);
	$("#contractMoney").bind("blur",validNoEmpty);
	$("#contractMoney").bind("blur",validIsNumber);

	$("#packageMoney").bind("blur",validNoEmpty);
	$("#packageMoney").bind("blur",validIsNumber);
	$("#packageMoney").bind("blur",sendValidIsBig);

	$("#applicantName").bind("blur",validNoEmpty);
	$("#applicantName").bind("blur",validChineseName);

	//$("#nation").bind("blur",validNoEmpty);
	$("#nation").bind("blur",validChineseName);
	$("#designerPhone").bind("blur",validIsPhone);
	$("#email").bind("blur",validIsEmail);	
	/* $("#weChat").bind("blur",validNoEmpty); */
	
	$("#decorateAddress").bind("blur",validNoEmpty);
	$("#decorateAddress").bind("blur",validChineseName);
	
	$("#applicantAge").bind("blur",validNoEmpty);
	$("#applicantAge").bind("blur",validIsNumber);
	$("#applicantIdentity").bind("blur",validNoEmpty);
	$("#applicantIdentity").bind("blur",validIsIdentity);
	$("#applicantAddress").bind("blur",validNoEmpty);
	$("#applicantAddress").bind("blur",validChineseName);
	$("#applicantSchool").bind("blur",validNoEmpty);
	$("#applicantSchool").bind("blur",validChineseName);
	/* $("#applicantMajor").bind("blur",validNoEmpty);
	$("#applicantMajor").bind("blur",validChineseName); */

	$("#applicantCompany").bind("blur",validNoEmpty);
	$("#applicantCompany").bind("blur",validChineseName);
	$("#applicantCompanyAddress").bind("blur",validChineseName);
	$("#applicantCompanyAddress").bind("blur",validNoEmpty);
	$("#department").bind("blur",validChineseName);	
	$("#applicantCompanyPhone").bind("blur",validNoEmpty);
	$("#applicantCompanyPhone").bind("blur",validChineseTel);
	$("#applicantCompanyIndustry").bind("blur",validNoEmpty);
	$("#applicantCompanyIndustry").bind("blur",validChineseName);
	$("#applicantDuties").bind("blur",validNoEmpty);
	$("#applicantDuties").bind("blur",validChineseName);
	$("#applicantWages").bind("blur",validNoEmpty);
	$("#applicantWages").bind("blur",validIsNumber);

	//$("#familyName").bind("blur",validNoEmpty);
	$("#familyName").bind("blur",validChineseName);
	//$("#familyPhone").bind("blur",validNoEmpty);
	$("#familyPhone").bind("blur",validIsPhone);
	$("#familyTwoName").bind("blur",validNoEmpty);
	$("#familyTwoName").bind("blur",validChineseName);
	$("#familyTwoPhone").bind("blur",validNoEmpty);
	$("#familyTwoPhone").bind("blur",validIsPhone);

	$("#friendName").bind("blur",validNoEmpty);
	$("#friendName").bind("blur",validChineseName);
	$("#friendPhone").bind("blur",validNoEmpty);
	$("#friendPhone").bind("blur",validIsPhone);
	//$("#friendTwoName").bind("blur",validNoEmpty);
	//$("#friendTwoPhone").bind("blur",validNoEmpty);
	$("#friendTwoName").bind("blur",validChineseName);
	$("#friendTwoPhone").bind("blur",validIsPhone);


	$("#workmateName").bind("blur",validNoEmpty);
	$("#workmateName").bind("blur",validChineseName);
	$("#workmatePhone").bind("blur",validNoEmpty);
	$("#workmatePhone").bind("blur",validIsPhone);
	//$("#workmateTwoName").bind("blur",validNoEmpty);
	//$("#workmateTwoPhone").bind("blur",validNoEmpty);
	$("#workmateTwoName").bind("blur",validChineseName);
	$("#workmateTwoPhone").bind("blur",validIsPhone);

	/*
	$("#liableName").bind("blur",validNoEmpty);
	$("#liablePhone").bind("blur",validNoEmpty);
	$("#liablePhone").bind("blur",validIsPhone);
	$("#liableIdentity").bind("blur",validNoEmpty);
	$("#liableIdentity").bind("blur",validIsIdentity);
	$("#liableAddress").bind("blur",validNoEmpty);
	*/
	/* 分期支付判断是一次性支付 还是 分期支付服务费 */
	$("#show_or_hidden .sign-item .sign-right-cont .radio-bg").bind("click",show_hidden_one_pay);
	function show_hidden_one_pay(){
		if($("#one_pay_input").attr("checked") == "checked"){
			$("#show_or_hidden").addClass("one_pay");
		}
		else if($("#other_pay_input").attr("checked") == "checked"){
			$("#show_or_hidden").removeClass("one_pay");
		}
	}
	
	/* 判断是否大于50万 */
	function sendValidIsBig(txt,dom){
		txt=$("#packageMoney").val();
		dom=$("#packageMoney");
		var b = false;
		var next = dom.next();
		if(txt>500000){			
			$(next).html('<i class="common-ico validate-ico"></i>金额不能大于50万');
			$(next).removeClass("validate-success");
			$(next).addClass("validate-error");
			$(next).show();
		}else{b = true;}
		return b;
	}
	/* 合同协议获取选择商户信息 */
	function getCompanyinfo(){
		var data=$("#subsidiaryId option:selected").attr("value") || "";
		var info = data;
		Utils.offLineStore.set("Companyinfo_id",info,false);
	}
	
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
		if(t !== ""){
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
		else{
			$(next).hide();
		}
	}

	/* 校验邮箱blur */
	function validIsEmail(evt){
		var t = $(this).val() || "";
		var reg = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
		var next = $(this).next();
		if(t !== ""){
			if(reg.test(t)){
				$(next).html('<i class="common-ico validate-ico"></i>填写正确');
				$(next).removeClass("validate-error");
				$(next).addClass("validate-success");
				$(next).show();
			}
			else{
				$(next).html('<i class="common-ico validate-ico"></i>邮箱输入错误');
				$(next).removeClass("validate-success");
				$(next).addClass("validate-error");
				$(next).show();
			}
		}
		else{
			$(next).hide();
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

	function validNoChinese(evt){
		var t = $(this).val() || "";
		if(t == ""){
			return;
		}
		var id = this.id || "";
		var next = $(this).next();
		var reg = /[\u4e00-\u9fa5]/gi;
		var result = t.match(reg);
		if(result == null || result.length == 0){
			$(next).html('<i class="common-ico validate-ico"></i>填写正确');
			$(next).removeClass("validate-error");
			$(next).addClass("validate-success");
			$(next).show();
		}
		else{
			$(next).html('<i class="common-ico validate-ico"></i>只能输入英文字符,数字,符号');
			$(next).removeClass("validate-success");
			$(next).addClass("validate-error");
			$(next).show();
		}
	}

	function validChineseName(evt){
		var t = $(this).val() || "";		
		var id = this.id || "";
		var next = $(this).next();
		if(t == ""){			
			$(next).hide();
			return;
		}
		var reg = /[\u4e00-\u9fa5]/gi;
		var result = t.match(reg);
		if(result != null && result.length > 0){
			var reg2 = /\~\!\@\#\$\%\^\*\(\)\_\+\-\=/gi;
			var result2 = t.match(reg2);
			if(result2 == null || result2.length == 0){
				$(next).html('<i class="common-ico validate-ico"></i>填写正确');
				$(next).removeClass("validate-error");
				$(next).addClass("validate-success");
				$(next).show();
			}
			else{
				$(next).html('<i class="common-ico validate-ico"></i>只能输入汉字或汉字+字符');
				$(next).removeClass("validate-success");
				$(next).addClass("validate-error");
				$(next).show();
			}
		}
		else{
			$(next).html('<i class="common-ico validate-ico"></i>只能输入汉字或汉字+字符');
			$(next).removeClass("validate-success");
			$(next).addClass("validate-error");
			$(next).show();
		}
	}

	function validChineseTel(evt){
		var t = $(this).val() || "";
		if(t == ""){
			return;
		}
		var id = this.id || "";
		var next = $(this).next();
		//var reg = /^(\d{3})?-?\d{8}|(\d{4})?-?\{7,8}&/gi;
		var reg = /^(\d{3}-?\d{8}|\d{4}-?\d{7,8})$/g;
		if(reg.test(t)){
			$(next).html('<i class="common-ico validate-ico"></i>填写正确');
			$(next).removeClass("validate-error");
			$(next).addClass("validate-success");
			$(next).show();
		}
		else{
			$(next).html('<i class="common-ico validate-ico"></i>填写示意010-123456或01012345678');
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
		if(txt == ""){
			b = true;
			return b;
		}
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

	function sendValidNoChinese(txt,dom){
		var b = false;
		if(txt == ""){
			return true;
		}
		var reg = /[\u4e00-\u9fa5]/gi;
		var next = dom.next();
		var result = txt.match(reg);
		if(result == null || result.length == 0){
			$(next).html('<i class="common-ico validate-ico"></i>填写正确');
			$(next).removeClass("validate-error");
			$(next).addClass("validate-success");
			$(next).show();
			b = true;
		}
		else{
			$(next).html('<i class="common-ico validate-ico"></i>只能输入英文字符,数字,符号');
			$(next).removeClass("validate-success");
			$(next).addClass("validate-error");
			$(next).show();
			b = false;
		}
		return b;
	}

	function sendValidChineseName(txt,dom){
		var b = false;
		if(txt == ""){
			return true;
		}
		var reg = /[\u4e00-\u9fa5]/gi;
		var next = dom.next();
		var result = txt.match(reg);
		if(result != null && result.length > 0){
			var reg2 = /\~\!\@\#\$\%\^\*\(\)\_\+\-\=/gi;
			var result2 = txt.match(reg2);
			if(result2 == null || result2.length == 0){
				$(next).html('<i class="common-ico validate-ico"></i>填写正确');
				$(next).removeClass("validate-error");
				$(next).addClass("validate-success");
				$(next).show();
				b = true;
			}
			else{
				$(next).html('<i class="common-ico validate-ico"></i>只能输入汉字或汉字+字符');
				$(next).removeClass("validate-success");
				$(next).addClass("validate-error");
				$(next).show();
				b = false;
			}
		}
		else{
			$(next).html('<i class="common-ico validate-ico"></i>只能输入汉字或汉字+字符');
			$(next).removeClass("validate-success");
			$(next).addClass("validate-error");
			$(next).show();
			b = true;
		}
		return b;
	}

	function sendValidChineseTel(txt,dom){
		var b = false;
		if(txt == ""){
			return true;
		}
		var next = dom.next();
		var reg = /^(\d{3}-?\d{8}|\d{4}-?\d{7,8})$/g;
		if(reg.test(txt)){
			$(next).html('<i class="common-ico validate-ico"></i>填写正确');
			$(next).removeClass("validate-error");
			$(next).addClass("validate-success");
			$(next).show();
			b = true;
		}
		else{
			$(next).html('<i class="common-ico validate-ico"></i>只能输入010-12345678或01012345678');
			$(next).removeClass("validate-success");
			$(next).addClass("validate-error");
			$(next).show();
			b = false;
		}
		return b;
	}

	/* 校验邮箱 */
		function sendValidEmail(txt,dom){
		var b = false;
		if(txt == ""){
			return true;
		}
		var next = dom.next();
		var reg = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
		if(reg.test(txt)){
			$(next).html('<i class="common-ico validate-ico"></i>填写正确');
			$(next).removeClass("validate-error");
			$(next).addClass("validate-success");
			$(next).show();
			b = true;
		}
		else{
			$(next).html('<i class="common-ico validate-ico"></i>邮箱格式错误');
			$(next).removeClass("validate-success");
			$(next).addClass("validate-error");
			$(next).show();
			b = false;
		}
		return b;
	}
	//获取产品信息
	function sendGetProductHttp(companyId){
		g.httpTip.show();
		var url = Base.serverUrl + "order/queryProductController";
		var condi = {};
		condi.companyId = companyId;
		$.ajax({
			url:url,
			data:condi,
			type:"POST",
			dataType:"json",
			context:this,
			async: false,
			success: function(data){
				//console.log("sendGetProductHttp",data);
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
		condi.parents = "1003,1008,1009,1012,1015,1016,1028";
		$.ajax({
			url:url,
			data:condi,
			type:"POST",
			dataType:"json",
			context:this,
			success: function(data){
				//console.log("sendGetDicHttp",data);
				var status = data.success || false;
				if(status){
					var obj = data.obj || {};
					changeSelectHtml(obj);

					//判断是否是编辑状态
					if(g.orderId !== ""){
						//$("#step1").hide();
						//$("#step2").show();

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

		var parents = ["1003","1009","1012","1015","1016","1016","1016","1028"];
		var ids = ["applicantMarital","applicantStudyStatus","applicantCompanyNature","applicantWorkYears","familyRelation","familyTwoRelation","liableRelation","houseNature"];

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

		if(g.packageType != "" && g.companyId != ""){
			$("#packageType").val((g.packageType + "_" + g.companyId));
		}
	}


	//获取个人资料
	function getUserInfo(){
		var info = Utils.offLineStore.get("userinfo",false) || "";
		//console.log("getUserInfo",info);
		if(info !== ""){
			var obj = JSON.parse(info) || {};
			g.customerId = obj.customerId || "";
			g.userPhone = obj.phoneNumber || "";
		}
	}


	function nextBtnUp1(){
		var companyId = $("#companydiv .selected").attr("id");
		g.companyId = companyId;
		

		if(g.loginStatus){
			//显示第二步
			$("#step1").hide();
			$("#step2").show();
			Utils.offLineStore.remove("userorderinfo_detail",false);
			sendGetProductHttp(companyId);

			if(g.orderId == ""){
				//获取订单编号
				sendGetOrderIdHttp();
			}
			window.scrollTo(0,170);
		}
		else{
			location.href = "/anjia/login.html?p=1";
		}
	}

	function countFee(allprice,time){
		var numarr = [3,6,9,12,18,24,36];
		var ratearr = [0,0.04,0.04,0.07,0.1,0.13,0.16];

		var rate = ratearr[time] * allprice;
		var all = allprice + rate;
		var mouthprice = allprice / numarr[time];
		var obj = {};
		obj.all = all;
		obj.mouth = mouthprice.toFixed(2);
		obj.rate = rate.toFixed(2);
		obj.stagnum = numarr[time];
		obj.interestRate = (ratearr[time]*100).toFixed(0);//服务费率
		obj.monthInterestRate = 0.7/100;//月服务费率
		obj.monthPoundage = (allprice*obj.monthInterestRate).toFixed(2);//月服务费
		obj.monthRepay = (mouthprice+allprice*obj.monthInterestRate).toFixed(2);//月还款
		return obj;
	}

	function countBtnUp(){
		var allprice = $("#allprice").val() - 0 || 0;
		var time = $("#stagingtime .selected").attr("id").split("_")[1] - 0;

		if(allprice > 0){
			var obj = countFee(allprice,time);

			$("#capitaltext").html(allprice.toFixed(2));
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

	function preBtnUp1(){
		$("#step2").hide();
		$("#step1").show();
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
				//console.log("sendGetOrderIdHttp",data);
				var status = data.success || false;
				if(status){
					g.orderId = data.obj || "";
				}
				else{
					//var msg = data.error || "";
					var msg = data.message || "获取订单编号失败";
					Utils.alert(msg);
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

			$("#poundage").html(obj.rate > 0 ? (obj.rate + "元") : "免费");//服务费
			$("#moneyMonth").html(obj.mouth + "元");//月还款本金
			$("#interestRate").html(obj.interestRate+"%");//服务费率
			$("#monthInterestRate").html(obj.monthInterestRate*100+'%');//月服务费率
			$("#monthPoundage").html(obj.monthPoundage + "元");//月服务费
			$("#monthRepay").html(obj.monthRepay + "元");//月还款
			
			g.interestRate = obj.interestRate + "";
			//g.monthInterestRate = obj.monthInterestRate + "";
			g.monthPoundage = obj.monthPoundage + "";
			g.monthRepay = obj.monthRepay + "";
			g.poundage = obj.rate + "";
			g.moneyMonth = obj.mouth + "";
			g.stagnum = obj.stagnum;
		}
	}

	function nextBtnUp3(){
		var contractNo = $("#contractNo").val() || "";
		var designer = $("#designer").val() || "";
		var designerPhone = $("#designerPhone").val() || "";
		if($("#packageType")[0].selectedIndex == - 1){
			Utils.alert("请选择产品类型");
			return;
		}
		var packageName = $("#packageType")[0].options[$("#packageType")[0].selectedIndex].text;
		var packageType = $("#packageType").val() || "";
		var contractMoney = $("#contractMoney").val() || "";
		var packageMoney = $("#packageMoney").val() || "";
		var fenQiTimes = $("#fenQiTimes").val() || "";
		var subsidiaryId = $("#subsidiaryId option:selected").attr("value") || "";//合作商户
		var agreeck = $("#agreeck").attr("checked")=="checked" || false;
		ptype = packageType.split("_");
		packageType = ptype[0] || "";
		var companyId = ptype[1] || "";
		var poundageRepaymentType = "";
		$("[name='choice_pay']").each(function(){
			if($(this).attr("checked") == "checked"){poundageRepaymentType = $(this).val()}
		})
		if(!sendValidIsPhone(designerPhone,$("#designerPhone"))){
			return;
		}
		if(!sendValidNoChinese(contractNo,$("#contractNo"))){
			return;
		}
		if(!sendValidNoEmpty(contractMoney,$("#contractMoney"))){
			return;
		}
		if(!sendValidIsNumber(contractMoney,$("#contractMoney"))){
			return;
		}
		if((packageMoney - 0) > (contractMoney - 0)){
			var next = $("#packageMoney").next();
			$(next).html('<i class="common-ico validate-ico"></i>分期金额必须小于总金额');
			$(next).removeClass("validate-success");
			$(next).addClass("validate-error");
			$(next).show();
			return;
		}

		if(sendValidNoEmpty(packageMoney,$("#packageMoney"))){
			if(sendValidIsNumber(packageMoney,$("#packageMoney"))){
				if(sendValidIsBig(packageMoney,$("#packageMoney"))){//判断是否大于50万元
					if(agreeck){
						var condi = {};
						condi.login_token = g.login_token;
						condi.customerId = g.customerId;
						condi.orderId = g.orderId;
						condi.contractNo = contractNo;
						condi.packageName = packageName;
						condi.packageType = packageType;
						condi.companyId = companyId;
						condi.contractMoney = contractMoney;
						condi.applyPackageMoney = packageMoney;//提交到申请分期金额
						condi.applyFenQiTimes = g.stagnum;//提交到申请分期期数
						condi.interestRate = g.interestRate;
						condi.monthPoundage = g.monthPoundage;
						condi.monthRepay = g.monthRepay;
						condi.monthInterestRate = '0.7';//月服务费率
						condi.poundageRepaymentType = poundageRepaymentType;
						condi.poundage =  g.poundage;
						condi.repaymentType = g.repaymentType;
						condi.moneyMonth = g.moneyMonth;
						condi.designer=designer;//设计师
						condi.designerPhone = designerPhone;
						condi.subsidiaryId = subsidiaryId;//合作商户
						sendSetOrderPackageHttp(condi);
					}
					else{
						Utils.alert("请勾选同意协议");
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
				//console.log("sendSetOrderPackageHttp",data);
				var status = data.success || false;
				if(status){
					//显示第二步
					$("#step2").hide();
					$("#step3").show();

					window.scrollTo(0,170);
				}
				else{
					//var msg = data.error || "";
					var msg = data.message || "获取订单编号失败";
					Utils.alert(msg);
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
		var nation = $("#nation").val() || "";
		var weChat = $("#weChat").val() || "";
		var email = $("#email").val() || "";
		var houseNature = $("#houseNature").val() || "";
		var decorateAddress = $("#decorateAddress").val() || "";
		var decorateTime = $("#decorateTime").val() || "";
		var applicantAge = $("#applicantAge").val() || "";
		var applicantSex = "";
		$("[name='rsex']").each(function(){
			if($(this).attr("checked") == "checked"){applicantSex = $(this).val()}
		})
		var applicantIdentity = $("#applicantIdentity").val() || "";
		var applicantMarital = $("#applicantMarital").val() || "";
		var applicantAddress = $("#applicantAddress").val() || "";
		var applicantStudyStatus = $("#applicantStudyStatus").val() || "";
		var applicantAsset = "";
		$("[name='zcradio']").each(function(){
			if($(this).attr("checked") == "checked"){applicantAsset = $(this).val()}
		})
		if(!sendValidNoEmpty(applicantName,$("#applicantName"))){
			return;
		}
		if(!sendValidChineseName(applicantName,$("#applicantName"))){
			return;
		}
		/* if(!sendValidNoEmpty(nation,$("#nation"))){
			return;
		} */
		if(!sendValidChineseName(nation,$("#nation"))){
			return;
		}
		/* if(!sendValidNoEmpty(weChat,$("#weChat"))){
			return;
		} */
		if(!sendValidEmail(email,$("#email"))){
			return;
		}		
		if(!sendValidNoEmpty(decorateAddress,$("#decorateAddress"))){
			return;
		}
		if(!sendValidChineseName(decorateAddress,$("#decorateAddress"))){
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
		if(!sendValidChineseName(applicantAddress,$("#applicantAddress"))){
			return;
		}
/* 		if(!sendValidNoEmpty(applicantSchool,$("#applicantSchool"))){
			return;
		}
		if(!sendValidChineseName(applicantSchool,$("#applicantSchool"))){
			return;
		} */

		var condi = {};
		condi.applicantIdentity = applicantIdentity;
		condi.applicantName = applicantName;
		condi.nation = nation;
		condi.weChat = weChat;
		condi.email = email;
		condi.houseNature = houseNature;
		condi.decorateAddress = decorateAddress;
		condi.decorateTime = decorateTime;
		condi.applicantPhone = g.userPhone;
		condi.applicantAge = applicantAge;
		condi.applicantSex = applicantSex;
		condi.applicantMarital = applicantMarital;
		condi.applicantAddress = applicantAddress;
		condi.applicantStudyStatus = applicantStudyStatus;
		//condi.applicantSchool = applicantSchool;
		//condi.applicantMajor = applicantMajor;
		condi.applicantAsset = applicantAsset;

		condi.applicantHouseNumber = 0;
		condi.applicantHouseWorth = 0;
		condi.applicantCarNumber = 0;
		condi.applicantCarWorth = 0;
		condi.login_token = g.login_token;
		condi.orderId = g.orderId;
		
		sendSetCustomerInfoHttp1(condi);
		//g.orderUserInfo = condi;

		
	}


	/* 个人信息提交 */
	function sendSetCustomerInfoHttp1(condi){
		var url = Base.serverUrl + "customer/editCustomerPersonalInfoController";
		g.httpTip.show();
		$.ajax({
			url:url,
			data:condi,
			type:"POST",
			dataType:"json",
			context:this,
			success: function(data){
				//console.log("sendSetCustomerInfoHttp",data);
				var status = data.success || false;
				if(status){
					//显示三步,里面的第二步
					$("#userinfotab li").removeClass("selected");
					$("#tab1").addClass("selected");
					$("#step31").hide();
					$("#step32").show();
					$("#step33").hide();

					window.scrollTo(0,170);
				}
				else{
					//var msg = data.error || "";
					var msg = data.message || "提交个人信息失败";
					Utils.alert(msg);
				}
				g.httpTip.hide();
			},
			error:function(data){
				g.httpTip.hide();
			}
		});
	}
	
	function preBtnUp31(){
		$("#userinfotab li").removeClass("selected");
		$("#tab0").addClass("selected");
		$("#step32").hide();
		$("#step31").show();
		$("#step33").hide();
	}

	function nextBtnUp33(){
		var applicantJobNature = "";
		$("[name='gzxzradio']").each(function(){
			if($(this).attr("checked") == "checked"){applicantJobNature = $(this).val()}
		})
		var applicantCompany = $("#applicantCompany").val() || "";
		var applicantCompanyNature = $("#applicantCompanyNature").val() || "";
		var applicantCompanyIndustry = $("#applicantCompanyIndustry").val() || "";
		var applicantDuties = $("#applicantDuties").val() || "";
		var applicantWorkYears = $("#applicantWorkYears").val() || "";
		var department = $("#department").val() || "";
		var applicantCompanyAddress = $("#applicantCompanyAddress").val() || "";
		var applicantCompanyPhone = $("#applicantCompanyPhone").val() || "";
		var applicantWages = $("#applicantWages").val() || "";

		if(!sendValidNoEmpty(applicantCompany,$("#applicantCompany"))){
			return;
		}
		if(!sendValidChineseName(applicantCompany,$("#applicantCompany"))){
			return;
		}
		if(!sendValidNoEmpty(applicantCompanyIndustry,$("#applicantCompanyIndustry"))){
			return;
		}
		if(!sendValidChineseName(applicantCompanyIndustry,$("#applicantCompanyIndustry"))){
			return;
		}
		if(!sendValidNoEmpty(applicantDuties,$("#applicantDuties"))){
			return;
		}
		if(!sendValidChineseName(applicantDuties,$("#applicantDuties"))){
			return;
		}		
		if(!sendValidNoEmpty(applicantCompanyAddress,$("#applicantCompanyAddress"))){
			return;
		}
		if(!sendValidChineseName(applicantCompanyAddress,$("#applicantCompanyAddress"))){
			return;
		}
		if(!sendValidChineseName(department,$("#department"))){
			return;
		}
		if(!sendValidNoEmpty(applicantCompanyPhone,$("#applicantCompanyPhone"))){
			return;
		}
		if(!sendValidChineseTel(applicantCompanyPhone,$("#applicantCompanyPhone"))){
			return;
		}
		if(!sendValidNoEmpty(applicantWages,$("#applicantWages"))){
			return;
		}
		if(!sendValidIsNumber(applicantWages,$("#applicantWages"))){
			return;
		}

		var condi = {};
		condi.applicantJobNature = applicantJobNature;
		condi.applicantCompany = applicantCompany;
		condi.applicantCompanyNature = applicantCompanyNature;
		condi.applicantCompanyIndustry = applicantCompanyIndustry;
		condi.applicantWorkYears = applicantWorkYears;
		condi.applicantDuties = applicantDuties;
		condi.department = department;
		condi.applicantCompanyAddress = applicantCompanyAddress;
		condi.applicantCompanyPhone = applicantCompanyPhone;
		condi.applicantWages = applicantWages;
		condi.login_token = g.login_token;
		condi.orderId = g.orderId;
		sendSetCustomerInfoHttp2(condi);
		
	}

	/* 工作信息提交 */
	function sendSetCustomerInfoHttp2(condi){
		var url = Base.serverUrl + "customer/editCustomerWorkInfoController";
		g.httpTip.show();
		$.ajax({
			url:url,
			data:condi,
			type:"POST",
			dataType:"json",
			context:this,
			success: function(data){
				//console.log("sendSetCustomerInfoHttp",data);
				var status = data.success || false;
				if(status){
					//显示三步,里面的第三步
					$("#userinfotab li").removeClass("selected");
					$("#tab2").addClass("selected");
					$("#step31").hide();
					$("#step32").hide();
					$("#step33").show();

					window.scrollTo(0,170);
				}
				else{
					//var msg = data.error || "";
					var msg = data.message || "提交个人信息失败";
					Utils.alert(msg);
				}
				g.httpTip.hide();
			},
			error:function(data){
				g.httpTip.hide();
			}
		});
	}

	function preBtnUp32(){
		$("#userinfotab li").removeClass("selected");
		$("#tab1").addClass("selected");
		$("#step31").hide();
		$("#step33").hide();
		$("#step32").show();
	}

	function nextBtnUp4_1(){
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

		//sendSetCustomerInfoHttp(g.orderUserInfo);
	}

	
	function nextBtnUp4(){
		var familyName = $("#familyName").val() || "";
		var familyPhone = $("#familyPhone").val() || "";
		var familyRelation = $("#familyRelation").val() || "";
		var familyTwoName = $("#familyTwoName").val() || "";
		var familyTwoPhone = $("#familyTwoPhone").val() || "";
		var familyTwoRelation = $("#familyTwoRelation").val() || "";

		var friendName = $("#friendName").val() || "";
		var friendPhone = $("#friendPhone").val() || "";
		var friendTwoName = $("#friendTwoName").val() || "";
		var friendTwoPhone = $("#friendTwoPhone").val() || "";

		var workmateName = $("#workmateName").val() || "";
		var workmatePhone = $("#workmatePhone").val() || "";
		var workmateTwoName = $("#workmateTwoName").val() || "";
		var workmateTwoPhone = $("#workmateTwoPhone").val() || "";

		/* if(!sendValidNoEmpty(familyName,$("#familyName"))){
			return;
		} */
		if(!sendValidChineseName(familyName,$("#familyName"))){
			return;
		}
		/* if(!sendValidNoEmpty(familyPhone,$("#familyPhone"))){
			return;
		} */
		if(!sendValidIsPhone(familyPhone,$("#familyPhone"))){
			return;
		}
		if(!sendValidNoEmpty(familyTwoName,$("#familyTwoName"))){
			return;
		}
		if(!sendValidChineseName(familyTwoName,$("#familyTwoName"))){
			return;
		}
		if(!sendValidNoEmpty(familyTwoPhone,$("#familyTwoPhone"))){
			return;
		}
		if(!sendValidIsPhone(familyTwoPhone,$("#familyTwoPhone"))){
			return;
		}

		if(!sendValidNoEmpty(friendName,$("#friendName"))){
			return;
		}
		if(!sendValidChineseName(friendName,$("#friendName"))){
			return;
		}
		if(!sendValidNoEmpty(friendPhone,$("#friendPhone"))){
			return;
		}
		if(!sendValidIsPhone(friendPhone,$("#friendPhone"))){
			return;
		}
		//~ if(!sendValidNoEmpty(friendTwoName,$("#friendTwoName"))){
			//~ return;
		//~ }
		//~ if(!sendValidNoEmpty(friendTwoPhone,$("#friendTwoPhone"))){
			//~ return;
		//~ }
		/* if(!sendValidChineseName(friendTwoName,$("#friendTwoName"))){
			return;
		}
		if(friendTwoPhone !== ""){
			if(!sendValidIsPhone(friendTwoPhone,$("#friendTwoPhone"))){
				return;
			}
		} */

		if(!sendValidNoEmpty(workmateName,$("#workmateName"))){
			return;
		}
		if(!sendValidChineseName(workmateName,$("#workmateName"))){
			return;
		}
		if(!sendValidNoEmpty(workmatePhone,$("#workmatePhone"))){
			return;
		}
		if(!sendValidIsPhone(workmatePhone,$("#workmatePhone"))){
			return;
		}
		//~ if(!sendValidNoEmpty(workmateTwoName,$("#workmateTwoName"))){
			//~ return;
		//~ }
		//~ if(!sendValidNoEmpty(workmateTwoPhone,$("#workmateTwoPhone"))){
			//~ return;
		//~ }
		/* if(!sendValidChineseName(workmateTwoName,$("#workmateTwoName"))){
			return;
		}
		if(workmateTwoPhone !== ""){
			if(!sendValidIsPhone(workmateTwoPhone,$("#workmateTwoPhone"))){
				return;
			}
		} */
		var condi = {};
		condi.familyName = familyName;
		condi.familyPhone = familyPhone;
		//condi.familyRelation = familyRelation;
		condi.familyTwoName = familyTwoName;
		condi.familyTwoPhone = familyTwoPhone;
		condi.familyTwoRelation = familyTwoRelation;

		condi.friendName = friendName;
		condi.friendPhone = friendPhone;
		//g.orderUserInfo.friendTwoName = friendTwoName;
		//g.orderUserInfo.friendTwoPhone = friendTwoPhone;

		condi.workmateName = workmateName;
		condi.workmatePhone = workmatePhone;
		//g.orderUserInfo.workmateTwoName = workmateTwoName;
		//g.orderUserInfo.workmateTwoPhone = workmateTwoPhone;

		//显示三步,里面的第三步
		//~ $("#userinfotab li").removeClass("selected");
		//~ $("#tab2").addClass("selected");
		//~ $("#step31").hide();
		//~ $("#step32").hide();
		//~ $("#step33").show();


		condi.login_token = g.login_token;
		condi.orderId = g.orderId;

		sendSetCustomerInfoHttp(condi);
		window.scrollTo(0,170);
	}

	function sendSetCustomerInfoHttp(condi){
		var url = Base.serverUrl + "customer/editCustomerContactInfoController";
		g.httpTip.show();
		$.ajax({
			url:url,
			data:condi,
			type:"POST",
			dataType:"json",
			context:this,
			success: function(data){
				//console.log("sendSetCustomerInfoHttp",data);
				var status = data.success || false;
				if(status){
					//显示第4步
					$("#step3").hide();
					$("#step4").show();
				}
				else{
					//var msg = data.error || "";
					var msg = data.message || "提交订单用户信息失败";
					Utils.alert(msg);
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
	
	$("#orderMaterialFile").change(function(){
		var orderMaterialFile = $("#orderMaterialFile").val() || "";
		if(orderMaterialFile != ""){
			uploadBtnUp();
		}
	});
	$("#orderMaterialFile2").change(function(){
		var orderMaterialFile = $("#orderMaterialFile2").val() || "";
		if(orderMaterialFile != ""){
			uploadBtnUp2();
			
		}
	});
/* 	function orderMaterialFileBtnUp(){
		var orderMaterialFile = $("#orderMaterialFile").val() || "";
		if(orderMaterialFile !== ""){
			uploadBtnUp();
		}
	} */


	function uploadBtnUp(){
		if(lastname()){
			g.httpTip.show();
			var url = Base.serverUrl + "order/uploadOrderMaterial";
			var condi = {};
			condi.login_token = g.login_token;
			condi.customerId = g.customerId;
			condi.orderId = g.orderId;
			condi.orderMaterialType  = g.uploadImgType[0];
			//console.log("uploadBtnUp",condi);
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
					//console.log("ajaxFileUpload",data);
					
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
					}else if(data == undefined){sendGetOrderInfoHttp2();g.uploadMark[0][0]++;}
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
//上传图片
	function sendGetOrderInfoHttp2(){
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
				//console.log("sendGetOrderInfoHttp",data);
				var status = data.success || false;
				if(status){
					$("#imgdiv_0,#imgdiv_1").html("");
					var imglist = data.list || [];
					imgUploadEdit(imglist,true);					
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
		html.push('<a href="javascript:deleteUploadImg(\'' + id + '\',\'' + 0 + '\')" class="common-ico ico-rubbish"></a>');
		html.push('</div>');
		html.push('</div>');

		$("#imgdiv_0").append(html.join(''));
		g.uploadMark[0][0]++;
	}
	
	/*  */
		function uploadBtnUp2(){
		if(lastname2()){
			g.httpTip.show();
			var url = Base.serverUrl + "order/uploadOrderMaterial";
			var condi = {};
			condi.login_token = g.login_token;
			condi.customerId = g.customerId;
			condi.orderId = g.orderId;
			condi.orderMaterialType  = g.uploadImgType[1];
			//console.log("uploadBtnUp",condi);

			//document.domain = "partywo.com";
			$.ajaxFileUpload({
				url: url, //用于文件上传的服务器端请求地址
				data:condi,
				secureuri: false, //一般设置为false
				fileElementId: 'orderMaterialFile2', //文件上传空间的id属性  <input type="file" id="file" name="file" />
				dataType: 'jsonp', //返回值类型 一般设置为json
				success: function (data, status)  //服务器成功响应处理函数
				{
					//data = '{"success":true,"message":1111,"obj":"http://123.57.5.50:8888/anjia/201508240001/201508300051/100701.jpg","list":null,"code":null,"token":null}';
					//console.log("ajaxFileUpload",data);
					
					g.httpTip.hide();
					if(data != null && data != ""){
						try{							
							var obj = JSON.parse(data);
							imgUploadCallBack2(obj);	
							//var src = obj.obj + "?t=" + (new Date() - 0);
							//$("#avatarimg").attr("src",src);
						}
						catch(e){
							Utils.alert("图片上传失败");
						}
					}else if(data == undefined){sendGetOrderInfoHttp2();g.uploadMark[1][0]++;}
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

	function imgUploadCallBack2(data){
		var src = data.obj + "?t=" + (new Date() - 0);
		var id = data.message || "";
		var html = [];
		html.push('<div id="img_' + id + '" class="upload-img-item">');
		html.push('<div class="upload-inf-img">');
		html.push('<img src="' + src + '" width=230 height=130 />');
		html.push('</div>');
		html.push('<div class="upload-img-edit">');
		//html.push('<a href="javascript:void(0)" onclick="" class="common-ico ico-edit"></a>
		html.push('<a href="javascript:deleteUploadImg(\'' + id + '\',\'' + 1 + '\')" class="common-ico ico-rubbish"></a>');
		html.push('</div>');
		html.push('</div>');

		$("#imgdiv_1").append(html.join(''));
		g.uploadMark[1][0]++;
	}
	/*  */
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
				//console.log("deleteUploadImg",data);
				var status = data.success || false;
				if(status){
					$("#img_" + id).hide();
					index = index - 0;					
					var fm = g.uploadMark[index][0];
					if(fm > 0){g.uploadMark[index][0]--;}						
				}
				else{
					//var msg = data.error || "";
					var msg = data.message || "删除上传图片失败";
					Utils.alert(msg);
				}
				g.httpTip.hide();
			},
			error:function(data){
				g.httpTip.hide();
			}
		});
	}
	//判断是不是ie6,7,8,9
	function interploer(){
		var b = false;
		if(navigator.appName == "Microsoft Internet Explorer" && navigator.appVersion.match(/6./i)=="6."){ 
			b = true; return b;
		} 
		else if(navigator.appName == "Microsoft Internet Explorer" && navigator.appVersion.match(/7./i)=="7."){ 
			b = true; return b;
		} 
		else if(navigator.appName == "Microsoft Internet Explorer" && navigator.appVersion.match(/8./i)=="8."){ 
			b = true; return b;
		} 
		else if(navigator.appName == "Microsoft Internet Explorer" && navigator.appVersion.match(/9./i)=="9."){ 
			b = true; return b;
		} 
		
	}
	
	function nextBtnUp5(){
		var condi = {};
		condi.login_token = g.login_token;
		condi.orderId = g.orderId;
		var confirm = (g.uploadMark[0][0] > 0 && g.uploadMark[1][0] > 0) || false;
		//if(interploer()){confirm = true;}
		if(confirm){
			sendSetOrderCompleteHttp(condi);
		}
		else{
			var msg = ["身份证未上传","房产证明未上传","身份证需要上传正反面","身份证需要上传手持身份证照片","房产证明未上传","现住址证明未上传","工作证明未上传","收入证明未上传"];
			if(g.uploadMark[0][0] <= 0){Utils.alert(msg[0]);}
			else if(g.uploadMark[1][0] <= 0){Utils.alert(msg[1]);}
			/* for(var i = 0,len = g.uploadMark.length; i < len; i++){
				var m = g.uploadMark[i];
				if(m === 0){
					Utils.alert(msg[i]);
					break;
				}
			} */
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
				//console.log("sendSetOrderCompleteHttp",data);
				var status = data.success || false;
				if(status){
					//显示第5步
					$("#step4").hide();
					$("#step5").show();
					window.scrollTo(0,170);
					setTimeout(function(){
						location.href = "/anjia/usercenter.html";
					},5000);
				}
				else{
					//var msg = data.error || "";
					var msg = data.message || "提交订单用户信息失败";
					Utils.alert(msg);
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
			Utils.alert("您选择的上传文件不是有效的图片文件！");
			return false;
		}
	}
	function lastname2(){
		//获取欲上传的文件路径
		var filepath = document.getElementById("orderMaterialFile2").value;
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
				//console.log("sendGetOrderInfoHttp",data);
				var status = data.success || false;
				if(status){
					changeOrderInfoHtml(data);
				}
				else{
					//var msg = data.error || "";
					var msg = data.message || "获取订单信息失败";
					Utils.alert(msg);
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

		//第一步
		var companyId = obj.companyId || "";
		g.companyId = companyId;
		$("#companydiv .select-brand-item").removeClass("selected");
		$("#" + companyId).addClass("selected");

		//第二步数据,套餐信息
		var contractNo = obj.contractNo || "";
		var packageType = obj.packageType || "";
		//var companyId = obj.companyId || "";
		var contractMoney = obj.contractMoney || "";
		var packageMoney = obj.applyPackageMoney || "";//查询申请分期金额2016-1-26
		var fenQiTimes = obj.applyFenQiTimes || "";//查询申请分期期数2016-1-26
		var poundage = obj.poundage || "0";
		var moneyMonth = obj.moneyMonth || "0";
		var designer = obj.designer || "";
		var designerPhone = obj.designerPhone || "";
		var interestRate = obj.interestRate || "0";
		var monthPoundage = obj.monthPoundage || "0";
		var monthRepay = obj.monthRepay || "0";
		var poundageRepaymentType = obj.poundageRepaymentType || "";
		var monthInterestRate = 0.7;//obj.monthInterestRate || "0";
		g.subsidiaryId=obj.subsidiaryId || "";
		g.packageType = packageType;

		g.monthInterestRate = monthInterestRate;
		g.stagnum = fenQiTimes;
		g.poundage = poundage;
		g.moneyMonth = moneyMonth;
		g.interestRate = interestRate;
		g.monthPoundage = monthPoundage;
		g.monthRepay = monthRepay;
		
		var fenarr = {"3":0,"6":1,"9":2,"12":3,"18":4,"24":5,"36":6};
		fenQiTimes = fenarr[(fenQiTimes + "")];

		sendGetProductHttp(companyId);
		$("#subsidiaryId").val(g.subsidiaryId);
		$("#contractNo").val(contractNo);
		$("#packageType").val((packageType + "_" + companyId));
		$("#contractMoney").val(contractMoney);
		$("#designer").val(designer);
		$("#designerPhone").val(designerPhone);
		$("#packageMoney").val(packageMoney);
		$("#fenQiTimes").val(fenQiTimes);
		$("#poundage").html((poundage == "0" ? "免费" : (poundage + "元")));
		$("#interestRate").html(interestRate+"%");//服务费率
		$("#monthPoundage").html(monthPoundage + "元");//月服务费
		$("#monthRepay").html(monthRepay + "元");//月还款
		$("#monthInterestRate").html(monthInterestRate + "%");//月服务费率
		$("#moneyMonth").html((moneyMonth + "元"));
		$("#agreeck").attr("checked",true);
		$($("#agreeck").parent()).addClass("chk-bg-checked");
		/* 判断选中的是一次性付 还是分期付服务费 */
		if(poundageRepaymentType == "103002"){
			$("#other_pay_input").attr("checked",true);
			$($("#one_pay_input").parent()).removeClass("radio-bg-checked");
			$($("#other_pay_input").parent()).addClass("radio-bg-checked");
			$("#show_or_hidden").removeClass("one_pay");
		}
		//第三步数据,个人信息
		//3.1
		var applicantName = obj.applicantName || "";
		var nation = obj.nation || "";
		var weChat = obj.weChat || "";
		var email = obj.email || "";
		var houseNature = obj.houseNature || "";
		var decorateAddress = obj.decorateAddress || "";
		var decorateTime = obj.decorateTime || "";
		var applicantAge = obj.applicantAge || "";
		var applicantSex = obj.applicantSex || "";
		var applicantIdentity = obj.applicantIdentity || "";
		var applicantMarital = obj.applicantMarital || "";
		var applicantAddress = obj.applicantAddress || "";
		var applicantStudyStatus = obj.applicantStudyStatus || "";
		//var applicantSchool = obj.applicantSchool || "";
		//var applicantMajor = obj.applicantMajor || "";
		var applicantAsset = obj.applicantAsset || "";

		var applicantJobNature = obj.applicantJobNature || "";
		var applicantCompany = obj.applicantCompany || "";
		var applicantCompanyNature = obj.applicantCompanyNature || "";
		var applicantCompanyIndustry = obj.applicantCompanyIndustry || "";
		var applicantDuties = obj.applicantDuties || "";
		var applicantWorkYears = obj.applicantWorkYears || "";
		var department = obj.department || "";
		var applicantCompanyAddress = obj.applicantCompanyAddress || "";
		var applicantCompanyPhone = obj.applicantCompanyPhone || "";
		var applicantWages = obj.applicantWages || "";

		$("#applicantName").val(applicantName);
		$("#nation").val(nation);
		$("#weChat").val(weChat);
		$("#email").val(email);
		$("#houseNature").val(houseNature);
		$("#decorateAddress").val(decorateAddress);
		$("#decorateTime").val(decorateTime);
		$("#applicantAge").val(applicantAge);
		if(applicantSex == "100102"){
			$("#applicantSex").attr("checked",true);
			$($("#r_100101").parent()).removeClass("radio-bg-checked");
			$($("#applicantSex").parent()).addClass("radio-bg-checked");
		}
		$("#applicantIdentity").val(applicantIdentity);
		if(applicantMarital !== ""){
			$("#applicantMarital").val(applicantMarital);
		}
		$("#applicantAddress").val(applicantAddress);
		if(applicantStudyStatus !== ""){
			$("#applicantStudyStatus").val(applicantStudyStatus);
		}
		//$("#applicantSchool").val(applicantSchool);
		//$("#applicantMajor").val(applicantMajor);

		if(applicantAsset !== ""){
			$("#r_" + applicantAsset).attr("checked",true);
			$($("#r_101001").parent()).removeClass("radio-bg-checked");
			$($("#r_" + applicantAsset).parent()).addClass("radio-bg-checked");
		}
		if(applicantJobNature !== ""){
			$("#r_" + applicantJobNature).attr("checked",true);
			$($("#r_101101").parent()).removeClass("radio-bg-checked");
			$($("#r_" + applicantJobNature).parent()).addClass("radio-bg-checked");
		}

		$("#applicantCompany").val(applicantCompany);
		if(applicantCompanyNature !== ""){
			$("#applicantCompanyNature").val(applicantCompanyNature);
		}
		if(applicantCompanyIndustry !== ""){
			$("#applicantCompanyIndustry").val(applicantCompanyIndustry);
		}
		if(applicantDuties !== ""){
			$("#applicantDuties").val(applicantDuties);
		}
		if(applicantWorkYears !== ""){
			$("#applicantWorkYears").val(applicantWorkYears);
		}		
		$("#department").val(department);
		$("#applicantCompanyAddress").val(applicantCompanyAddress);
		$("#applicantCompanyPhone").val(applicantCompanyPhone);
		$("#applicantWages").val(applicantWages);

		//3.2
		var familyName = obj.familyName || "";
		var familyPhone = obj.familyPhone || "";
		var familyRelation = obj.familyRelation || "";
		var familyTwoName = obj.familyTwoName || "";
		var familyTwoPhone = obj.familyTwoPhone || "";
		var familyTwoRelation = obj.familyTwoRelation || "";

		var friendName = obj.friendName || "";
		var friendPhone = obj.friendPhone || "";
		var friendTwoName = obj.friendTwoName || "";
		var friendTwoPhone = obj.friendTwoPhone || "";

		var workmateName = obj.workmateName || "";
		var workmatePhone = obj.workmatePhone || "";
		var workmateTwoName = obj.workmateTwoName || "";
		var workmateTwoPhone = obj.workmateTwoPhone || "";

		$("#familyName").val(familyName);
		$("#familyPhone").val(familyPhone);
		if(familyRelation !== ""){
			$("#familyRelation").val(familyRelation);
		}
		$("#familyTwoName").val(familyTwoName);
		$("#familyTwoPhone").val(familyTwoPhone);
		if(familyTwoRelation !== ""){
			$("#familyTwoRelation").val(familyTwoRelation);
		}

		$("#friendName").val(friendName);
		$("#friendPhone").val(friendPhone);
		$("#friendTwoName").val(friendTwoName);
		$("#friendTwoPhone").val(friendTwoPhone);

		$("#workmateName").val(workmateName);
		$("#workmatePhone").val(workmatePhone);
		$("#workmateTwoName").val(workmateTwoName);
		$("#workmateTwoPhone").val(workmateTwoPhone);

		//3.3
		//~ var liableName = obj.liableName || "";
		//~ var liablePhone = obj.liablePhone || "";
		//~ var liableIdentity = obj.liableIdentity || "";
		//~ var liableRelation = obj.liableRelation || "";
		//~ var liableAddress = obj.liableAddress || "";

		//~ $("#liableName").val(liableName);
		//~ $("#liablePhone").val(liablePhone);
		//~ $("#liableIdentity").val(liableIdentity);
		//~ $("#liableRelation").val(liableRelation);
		//~ $("#liableAddress").val(liableAddress);

		var imglist = data.list || [];
		imgUploadEdit(imglist);
	}

	function imgUploadEdit(list,clin){
		for(var i = 0, len = list.length; i < len; i++){
			var data = list[i] || {};

			var src = data.orderMaterialUrl + "?t=" + (new Date() - 0);
			var id = data.orderMaterialId || "";
			var orderMaterialType = data.orderMaterialType || "";
			var slen = orderMaterialType.length - 1;
			/* if(len > 9){
				slen = orderMaterialType.length - 2;
			} */
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
			if(clin){}else{
				g.uploadMark[uploadIndex][0]++;
			}						
		}
	}
/* 协议的隐藏显示 */
$(".protocol_slideToggle").click(function(){
	$(this).parents(".protocol_slideToggle_a").toggleClass("active");
	$(".protocol_slideToggle_a .protocol_slideToggle").html("更多>>");	
	$(".protocol_slideToggle_a.active .protocol_slideToggle").html("收起>>");	
})
	window.show_hidden_one_pay = show_hidden_one_pay;
	window.deleteUploadImg = deleteUploadImg;
});












