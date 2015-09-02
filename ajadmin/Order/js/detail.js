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
	g.orderId = Utils.getQueryString("orderid") || "";
	g.login_token = Utils.offLineStore.get("token",false) || "";
	g.phoneNumber = Utils.offLineStore.get("user_phoneNumber",false) || "";
	g.usersId = Utils.offLineStore.get("user_usersId",false) || "";
	g.usersName = Utils.offLineStore.get("user_usersName",false) || "";
	g.httpTip = new Utils.httpTip({});


	//验证登录状态
	var loginStatus = Utils.getUserInfo();
	if(!loginStatus){
		//未登录
		//location.replace("/login.html");
		//window.parent.location.href = "../Public/login.html";
	}
	else{
		//$("#usersId").val(g.usersId);
		//$("#usersName").val(g.usersName);
		sendGetProductHttp();
		sendGetDicHttp();
	}

	//$("#sellerbtn").bind("click",sellerBtnUp);

	$('#backid').click(function(){
		window.location.href="index.html";
	});

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
					//changeProductSelectHtml(data);
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
					//changeSelectHtml(obj);
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

		var html = [];
		html.push('<tr><td width="16%" class="tableleft">合同编号</td>');
		html.push('<td>' + contractNo + '</td></tr>');
		html.push('<tr><td class="tableleft">套餐类型</td>');
		html.push('<td>' + (packageType + "_" + companyId) + '</td></tr>');
		html.push('<tr><td class="tableleft">套餐金额</td>');
		html.push('<td>' + packageMoney + '</td></tr>');
		html.push('<tr><td class="tableleft">分期方式</td>');
		html.push('<td>' + fenQiTimes + '</td></tr>');
		html.push('<tr><td class="tableleft">服务手续费</td>');
		html.push('<td>' + (poundage == "0" ? "免费" : (poundage + "元")) + '</td></tr>');
		html.push('<tr><td class="tableleft">还款方式</td>');
		html.push('<td>按月等额本金</td></tr>');
		html.push('<tr><td class="tableleft">月还款本金</td>');
		html.push('<td>' + (moneyMonth + "元") + '</td></tr>');


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


		html.push('<tr><td class="tableleft">姓名</td>');
		html.push('<td>' + applicantName + '</td></tr>');
		html.push('<tr><td class="tableleft">年龄</td>');
		html.push('<td>' +applicantAge + '</td></tr>');
		html.push('<tr><td class="tableleft">性别</td>');
		html.push('<td>' + applicantSex + '</td></tr>');
		html.push('<tr><td class="tableleft">身份证号</td>');
		html.push('<td>' + applicantIdentity + '</td></tr>');
		html.push('<tr><td class="tableleft">婚姻状况</td>');
		html.push('<td>' + applicantMarital + '</td></tr>');
		html.push('<tr><td class="tableleft">现居住地址</td>');
		html.push('<td>' + applicantAddress + '</td></tr>');
		html.push('<tr><td class="tableleft">最高学历</td>');
		html.push('<td>' + applicantStudyStatus + '</td></tr>');
		html.push('<tr><td class="tableleft">学校名称</td>');
		html.push('<td>' + applicantSchool + '</td></tr>');
		html.push('<tr><td class="tableleft">所学专业</td>');
		html.push('<td>' + applicantMajor + '</td></tr>');
		html.push('<tr><td class="tableleft">资产信息</td>');
		html.push('<td>' + applicantAsset + '</td></tr>');
		html.push('<tr><td class="tableleft">工作性质</td>');
		html.push('<td>' + applicantJobNature + '</td></tr>');
		html.push('<tr><td class="tableleft">工作单位全称</td>');
		html.push('<td>' + applicantCompany+ '</td></tr>');
		html.push('<tr><td class="tableleft">工作单位性质</td>');
		html.push('<td>' + applicantCompanyNature+ '</td></tr>');
		html.push('<tr><td class="tableleft">所属行业</td>');
		html.push('<td>' + applicantCompanyIndustry + '</td></tr>');
		html.push('<tr><td class="tableleft">担当职务</td>');
		html.push('<td>' + applicantDuties + '</td></tr>');
		html.push('<tr><td class="tableleft">工作年限</td>');
		html.push('<td> '+ applicantWorkYears + '</td></tr>');
		html.push('<tr><td class="tableleft">公司地址</td>');
		html.push('<td>' + applicantCompanyAddress + '</td></tr>');
		html.push('<tr><td class="tableleft">单位电话</td>');
		html.push('<td>' + applicantCompanyPhone + '</td></tr>');
		html.push('<tr><td class="tableleft">税后收入</td>');
		html.push('<td>' + applicantWages + '</td></tr>');


		//3.2
		var familyName = obj.familyName || "";
		var familyPhone = obj.familyPhone || "";
		var familyRelation = obj.familyRelation || "";
		var friendName = obj.friendName || "";
		var friendPhone = obj.friendPhone || "";

		html.push('<tr><td class="tableleft">亲属姓名</td>');
		html.push('<td>' + familyName + '</td></tr>');
		html.push('<tr><td class="tableleft">亲属手机号码</td>');
		html.push('<td>' + familyPhone + '</td></tr>');
		html.push('<tr><td class="tableleft">亲属关系</td>');
		html.push('<td>' + familyRelation + '</td></tr>');
		html.push('<tr><td class="tableleft">朋友姓名</td>');
		html.push('<td>' + friendName + '</td></tr>');
		html.push('<tr><td class="tableleft">朋友手机号码</td>');
		html.push('<td>' + friendPhone + '</td></tr>');

		//3.3
		var liableName = obj.liableName || "";
		var liablePhone = obj.liablePhone || "";
		var liableIdentity = obj.liableIdentity || "";
		var liableRelation = obj.liableRelation || "";
		var liableAddress = obj.liableAddress || "";

		html.push('<tr><td class="tableleft">连带人姓名</td>');
		html.push('<td>' + liableName + '</td></tr>');
		html.push('<tr><td class="tableleft">连带人手机号码</td>');
		html.push('<td>' + liablePhone + '</td></tr>');
		html.push('<tr><td class="tableleft">连带人身份证号码</td>');
		html.push('<td>' + liableIdentity + '</td></tr>');
		html.push('<tr><td class="tableleft">连带人关系</td>');
		html.push('<td>' + liableRelation + '</td></tr>');
		html.push('<tr><td class="tableleft">连带人住址</td>');
		html.push('<td>' + liableAddress + '</td></tr>');

		//var imglist = data.list || [];
		//imgUploadEdit(imglist);

		$("#orderinfotable").html(html.join(''));
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

});