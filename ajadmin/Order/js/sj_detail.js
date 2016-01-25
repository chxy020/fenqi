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

	g.productDic = {};
	g.selectDic = {};


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
		//sendGetProductHttp();
		sendGetDicHttp();
	}

	//$("#sellerbtn").bind("click",sellerBtnUp);


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
					g.productDic = data.list;
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
					g.selectDic = obj;
					//判断是否是编辑状态
					if(g.orderId !== ""){
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
		//风控审核意见
		var approveRecords = obj.approveRecords || [];
		approveRecords = approveRecords[0] || {};
		var approveName = approveRecords.approveName || "";
		var approveRemarks = approveRecords.approveRemarks || "";
		var approveResult = approveRecords.approveResult || false;
		approveResult = approveResult ? "通过" : "不通过";
		var createTime = approveRecords.createTime || "";

		//第二步数据,套餐信息
		var contractNo = obj.contractNo || "";
		var packageType = obj.packageType || "";
		//~ for(var i = 0,len = g.productDic.length; i < len; i++){
			//~ var productId = g.productDic[i].productId;
			//~ if(productId == packageType){
				//~ packageType = g.productDic[i].productName;
				//~ break;
			//~ }
		//~ }
		var packageName = obj.packageName || "";
		var companyId = obj.companyId || "";
		var contractMoney = obj.contractMoney || "";
		var packageMoney = obj.packageMoney || "";
		var fenQiTimes = obj.fenQiTimes || "";
		var poundage = obj.poundage || "0";
		var moneyMonth = obj.moneyMonth || "0";

		g.stagnum = fenQiTimes;
		g.poundage = poundage;
		g.moneyMonth = moneyMonth;


		var html = [];
		html.push('<tr><td width="16%" class="tableleft">风控审核人</td>');
		html.push('<td>' + approveName + '</td></tr>');
		html.push('<tr><td class="tableleft">风控审核结果</td>');
		html.push('<td>' + approveResult + '</td></tr>');
		html.push('<tr><td  class="tableleft">风控审核意见</td>');
		html.push('<td>' + approveRemarks + '</td></tr>');
		html.push('<tr><td class="tableleft">风控审核日期</td>');
		html.push('<td>' + createTime + '</td></tr>');

		html.push('<tr><td class="tableleft">合同编号</td>');
		html.push('<td>' + contractNo + '</td></tr>');
		html.push('<tr><td class="tableleft">产品类型</td>');
		html.push('<td>' + packageName + '</td></tr>');
		html.push('<tr><td class="tableleft">合同总金额</td>');
		html.push('<td>' + contractMoney + '元</td></tr>');
		html.push('<tr><td class="tableleft">分期金额</td>');
		html.push('<td>' + packageMoney + '元</td></tr>');
		html.push('<tr><td class="tableleft">分期方式</td>');
		html.push('<td>' + fenQiTimes + '期</td></tr>');
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
		applicantSex = applicantSex == "100101" ? "男" : "女";
		var applicantIdentity = obj.applicantIdentity || "";
		var applicantMarital = obj.applicantMarital || "";
		applicantMarital = g.selectDic["1003"][applicantMarital] || "";
		var applicantAddress = obj.applicantAddress || "";
		var applicantStudyStatus = obj.applicantStudyStatus || "";
		applicantStudyStatus = g.selectDic["1009"][applicantStudyStatus] || "";
		var applicantSchool = obj.applicantSchool || "";
		var applicantMajor = obj.applicantMajor || "";
		var applicantAsset = obj.applicantAsset || "";
		var zcinfo = {"101001":"有房","101002":"有车","101004":"有房有车","101005":"无车无房"};
		applicantAsset = zcinfo[applicantAsset] || "";

		var applicantJobNature = obj.applicantJobNature || "";
		var gzxzinfo = {"101101":"工薪阶级","101102":"企业主","101103":"个体户","101104":"网商"};
		applicantJobNature = gzxzinfo[applicantJobNature] || "";
		var applicantCompany = obj.applicantCompany || "";
		var applicantCompanyNature = obj.applicantCompanyNature || "";
		applicantCompanyNature = g.selectDic["1012"][applicantCompanyNature] || "";
		var applicantCompanyIndustry = obj.applicantCompanyIndustry || "";
		applicantCompanyIndustry = g.selectDic["1013"][applicantCompanyIndustry] || "";
		var applicantDuties = obj.applicantDuties || "";
		applicantDuties = g.selectDic["1014"][applicantDuties] || "";
		var applicantWorkYears = obj.applicantWorkYears || "";
		applicantWorkYears = g.selectDic["1015"][applicantWorkYears] || "";
		var applicantCompanyAddress = obj.applicantCompanyAddress || "";
		var applicantCompanyPhone = obj.applicantCompanyPhone || "";
		var applicantWages = obj.applicantWages || "";


		html.push('<tr><td class="tableleft">姓名</td>');
		html.push('<td>' + applicantName + '</td></tr>');
		html.push('<tr><td class="tableleft">年龄</td>');
		html.push('<td>' +applicantAge + '周岁</td></tr>');
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
		html.push('<td>' + applicantWages + '元</td></tr>');


		//3.2
		var familyName = obj.familyName || "";
		var familyPhone = obj.familyPhone || "";
		var familyRelation = obj.familyRelation || "";
		familyRelation = g.selectDic["1016"][familyRelation] || "";

		var familyTwoName = obj.familyTwoName || "";
		var familyTwoPhone = obj.familyTwoPhone || "";
		var familyTwoRelation = obj.familyTwoRelation || "";
		familyTwoRelation = g.selectDic["1016"][familyTwoRelation] || "";

		var friendName = obj.friendName || "";
		var friendPhone = obj.friendPhone || "";
		var friendTwoName = obj.friendTwoName || "";
		var friendTwoPhone = obj.friendTwoPhone || "";

		var workmateName = obj.workmateName || "";
		var workmatePhone = obj.workmatePhone || "";
		var workmateTwoName = obj.workmateTwoName || "";
		var workmateTwoPhone = obj.workmateTwoPhone || "";

		html.push('<tr><td class="tableleft">亲属一姓名</td>');
		html.push('<td>' + familyName + '</td></tr>');
		html.push('<tr><td class="tableleft">亲属一手机号码</td>');
		html.push('<td>' + familyPhone + '</td></tr>');
		html.push('<tr><td class="tableleft">亲属一关系</td>');
		html.push('<td>' + familyRelation + '</td></tr>');
		html.push('<tr><td class="tableleft">亲属二姓名</td>');
		html.push('<td>' + familyTwoName + '</td></tr>');
		html.push('<tr><td class="tableleft">亲属二手机号码</td>');
		html.push('<td>' + familyTwoPhone + '</td></tr>');
		html.push('<tr><td class="tableleft">亲属二关系</td>');
		html.push('<td>' + familyTwoRelation + '</td></tr>');

		html.push('<tr><td class="tableleft">朋友一姓名</td>');
		html.push('<td>' + friendName + '</td></tr>');
		html.push('<tr><td class="tableleft">朋友一手机号码</td>');
		html.push('<td>' + friendPhone + '</td></tr>');
		html.push('<tr><td class="tableleft">朋友二姓名</td>');
		html.push('<td>' + friendTwoName + '</td></tr>');
		html.push('<tr><td class="tableleft">朋友二手机号码</td>');
		html.push('<td>' + friendTwoPhone + '</td></tr>');

		html.push('<tr><td class="tableleft">同事一姓名</td>');
		html.push('<td>' + workmateName + '</td></tr>');
		html.push('<tr><td class="tableleft">同事一手机号码</td>');
		html.push('<td>' + workmatePhone + '</td></tr>');
		html.push('<tr><td class="tableleft">同事二姓名</td>');
		html.push('<td>' + workmateTwoName + '</td></tr>');
		html.push('<tr><td class="tableleft">同事二手机号码</td>');
		html.push('<td>' + workmateTwoPhone + '</td></tr>');

		//3.3
		//~ var liableName = obj.liableName || "";
		//~ var liablePhone = obj.liablePhone || "";
		//~ var liableIdentity = obj.liableIdentity || "";
		//~ var liableRelation = obj.liableRelation || "";
		//~ liableRelation = g.selectDic["1016"][liableRelation];
		//~ var liableAddress = obj.liableAddress || "";

		//~ html.push('<tr><td class="tableleft">连带人姓名</td>');
		//~ html.push('<td>' + liableName + '</td></tr>');
		//~ html.push('<tr><td class="tableleft">连带人手机号码</td>');
		//~ html.push('<td>' + liablePhone + '</td></tr>');
		//~ html.push('<tr><td class="tableleft">连带人身份证号码</td>');
		//~ html.push('<td>' + liableIdentity + '</td></tr>');
		//~ html.push('<tr><td class="tableleft">连带人关系</td>');
		//~ html.push('<td>' + liableRelation + '</td></tr>');
		//~ html.push('<tr><td class="tableleft">连带人住址</td>');
		//~ html.push('<td>' + liableAddress + '</td></tr>');

		var imglist = data.list || [];
		var imghtml = imgUploadEdit(imglist);
		html.push(imghtml);



		html.push('<tr><td class="tableleft"></td>');
		html.push('<td>');
		html.push('<button type="button" class="btn btn-success" name="backid" id="backid">返回列表</button>');
		html.push('</td>');
		html.push('</tr>');

		$("#orderinfotable").html(html.join(''));

		$('#backid').click(function(){
			window.location.href="sj_index.html";
		});
		$('#sellerbtn').click(function(){
			window.location.href="seller.html?orderid=" + g.orderId;
		});
	}

	function imgUploadEdit(list){
		var html = [];
		var otype = "";
		for(var i = 0, len = list.length; i < len; i++){
			var data = list[i] || {};

			var src = data.orderMaterialUrl + "?t=" + (new Date() - 0);
			var id = data.orderMaterialId || "";
			var orderMaterialType = data.orderMaterialType || "";
			var isdelete = data["delete"];
			if(isdelete === 0){
				var imgtitle = {
					"100701":"身份证",
					"100702":"房产证明",
					"100703":"现住址证明",
					"100704":"工作证明",
					"100705":"收入证明",
					"100706":"结婚证/单身证明",
					"100707":"连带责任人身份证照片",
					"100708":"企业用户营业执照照片",
					"100709":"企业用户组织结构代码证",
					"100710":"企业用户税务登记证",
					"100711":"企业用户企业经营场所照片"
				}

				if(otype === ""){
					html.push('<tr><td class="tableleft">' + imgtitle[orderMaterialType] + '</td><td>');
				}
				else if(otype != orderMaterialType){
					html.push('</td></tr>');
					html.push('<tr><td class="tableleft">' + imgtitle[orderMaterialType] + '</td><td>');
				}
				html.push('<img src="' + src + '" />');
				otype = orderMaterialType;
			}

		}
		return html;
	}

});