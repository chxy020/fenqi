/**
 * function:初审
 * author:hmgx
 * daa
 */

//页面初始化
$(function () {
    var g = {};
    g.phone = "";
    g.imgCodeId = "";
    g.sendCode = false;
    g.sendTime = 60;
    g.login_token = Utils.offLineStore.get("token", false) || "";
    g.orderId = Utils.getQueryString("orderId") || "";
    g.usersId = Utils.offLineStore.get("user_usersId", false) || "";
    g.usersName = Utils.offLineStore.get("user_usersName", false) || "";
    g.httpTip = new Utils.httpTip({});

    g.totalPage = 1;
    g.currentPage = 1;
    g.pageSize = 10;

    //验证登录状态
    var loginStatus = Utils.getUserInfo();
    if (!loginStatus) {
        alert("未登陆");
    } else {
        g.httpTip.show();
        $("#orderId").val(g.orderId);
        $("#usersId").val(g.usersId);
        $("#usersName").val(g.usersName);
        $.ajax({
            url: Base.serverUrl + "order/selectFKApproveRecordByOrderId",
            data: {login_token: g.login_token, orderId: g.orderId}, type: "POST", dataType: "json", context: this,
            success: function (data) {
                if (data.obj == null) {
                    Utils.alert("订单号[" + g.orderId + "]非法！");
                    g.httpTip.hide();
                    return false;
                }
                var RowData = data.obj;
                g.packageMoney = RowData.packageMoney;
                $("#applicantName").val(RowData.applicantName);
                $("#applicantPhone").val(RowData.applicantPhone);

                $("#contractMoney").val(RowData.contractMoney);
                $("#applyPackageMoney").val(RowData.applyPackageMoney);
                $("#applyFenQiTimes").val(RowData.applyFenQiTimes);

                $("#packageMoney").val(RowData.packageMoney || "");
                var fenarr = {"3": 0, "6": 1, "9": 2, "12": 3, "18": 4, "24": 5, "36": 6};
                var fenQiTimes = fenarr[(RowData.fenQiTimes + "")];
                $("#fenQiTimes").val(fenQiTimes);

                $("#fk1_approve_report").val(RowData.fk1_approve_report);
                $("#fk1_approve_remarks").val(RowData.fk1_approve_remarks);

                //var obj = countFee(RowData.applyPackageMoney, fenQiTimes);
                $("#poundage").html(RowData.poundage > 0 ? (RowData.poundage + "元") : "免费"); //$("#poundage").html(obj.rate > 0 ? (obj.rate + "元") : "免费");
                $("#moneyMonth").html(RowData.moneyMonth + "元"); //$("#moneyMonth").html(obj.mouth + "元");
                $("#poundageRepaymentType").val(RowData.poundageRepaymentType);
				changePoundageRepaymentType(RowData.poundageRepaymentType)				
			   g.httpTip.hide();
            },
            error: function (data) {
                g.httpTip.hide();
            }
        });

        var phtml = [];
        phtml.push('<a href="../protocol/protocol-fenqi.html?orderId=' + g.orderId + '" target="_blank">借款协议</a>&nbsp;&nbsp;');
        phtml.push('<a href="../protocol/protocol-authorization.html?orderId=' + g.orderId + '" target="_blank">征信授权</a>&nbsp;&nbsp;');
        phtml.push('<a href="../protocol/protocol-customer-commitment.html?orderId=' + g.orderId + '" target="_blank">客户承诺</a>&nbsp;&nbsp;');
        phtml.push('<a href="../protocol/protocol-credit-counseling.html?orderId=' + g.orderId + '" target="_blank">咨询协议</a>&nbsp;&nbsp;');
        phtml.push('<a href="../protocol/protocol-transfer.html?orderId=' + g.orderId + '" target="_blank">债权转让协议</a>');
        $("#protocol").html(phtml.join(''));
    }

    $("#but_tg").bind("click", {approveResult: 0}, fkSellerBtnUp);
    $("#but_jj").bind("click", {approveResult: 1}, fkSellerBtnUp);
    $("#but_th").bind("click", {approveResult: 2}, fkSellerBtnUp);
    $("#packageMoney").bind("blur", changePoundageRepaymentType);
    $("#fenQiTimes").bind("change", changePoundageRepaymentType);
	$("#packageMoney").bind("blur", countFee);
    $("#fenQiTimes").bind("change", countFee);

    $('#backid').click(function () {
        window.location.href = "Fk_OrderList_1.html";
    });

    function fkSellerBtnUp(e) {
        var ActType = e.data.approveResult;
        var condi = {};
        if (ActType == 0) { //只有通过的时候才处理以下参数
            if ($("#packageMoney").val() == "") {
                alert("请输入审批金额!");
                $("#packageMoney").focus();
                return false;
            } else {
                if (isNaN($("#packageMoney").val())) {
                    alert("审批金额必须为数字!");
                    $("#packageMoney").focus();
                    return false;
                }
                if(Number($("#packageMoney").val()) < 0 ){
                    alert("审批金额必须大于0!");
                    $("#packageMoney").focus();
                    return false;
                }
                if(Number($("#packageMoney").val()) > Number($("#contractMoney").val()) ){
                    alert("审批金额不能大于合同总金额[" +  $("#contractMoney").val() + "]!");
                    $("#packageMoney").focus();
                    return false;
                }
            }
            if ($("#fenQiTimes").val() == "") {
                alert("请选择审批期数!");
                $("#fenQiTimes").focus();
                return false;
            }
            condi.packageMoney = $("#packageMoney").val();
            condi.poundage = g.poundage;
            condi.fenQiTimes = $("#fenQiTimes").val() || "";//g.stagnum;
            condi.moneyMonth = g.moneyMonth;
        }else{
            condi.packageMoney = 0;
            condi.fenQiTimes = 0;
        }
        if ($("#approveReport").val() == "") {
            alert("初审报告不能为空，请检查！");
            $("#approveReport").focus();
            return false;
        }
        if ($("#approveRemarks").val() == "") {
            alert("初审批意见不能为空，请检查！");
            $("#approveRemarks").focus();
            return false;
        }
        g.httpTip.show();
        condi.orderId = g.orderId;
        condi.login_token = g.login_token;
        condi.approvePerson = g.usersId;
        condi.approveName = g.usersName;
        condi.approveResult = ActType;
        condi.approveRemarks = $("#approveRemarks").val() || "";
        condi.approveReport = $("#approveReport").val() || "";
        var url = Base.serverUrl + "order/riskManagementFirstApproveOrderController";
        $.ajax({
            url: url, data: condi, type: "POST", dataType: "json", context: this,
            success: function (data) {
                var status = data.success || false;
                if (status) {
                    alert("处理成功！");
                    window.close();
                    //window.location.href = "Fk_OrderList_1.html";
                } else {
                    var msg = data.message || "处理失败！";
                    Utils.alert(msg);
                }
                g.httpTip.hide();
            },
            error: function (data) {
                g.httpTip.hide();
            }
        });
    }

    //改变 服务费支付方式 时触发
    function changePoundageRepaymentType(V){
        if(V == 103001){
            $(".ZF103001").show();
            $(".ZF103002").hide();
        }
        if(V == 103002){
            $(".ZF103001").hide();
            $(".ZF103002").show();
        }
        countFee();//重新计算费率
    }

    //费率计算
    function countFee() {
        var poundageRepaymentType = $("#poundageRepaymentType option:selected").attr("value");//服务费分期方式
        var qs = $("#fenQiTimes option:selected").attr("value") == "" ? $("#applyFenQiTimes").val() : $("#fenQiTimes option:selected").attr("value"); //期数
		 var AppAmount = $("#packageMoney").val() == "" ?  $("#applyPackageMoney").val() : $("#packageMoney").val();//申请金额
		 console.log(AppAmount);
		 console.log(qs);
		if(poundageRepaymentType == "103001") {//一次性支付
            var fl = {6: 0.04, 12: 0.07, 18: 0.1, 24: 0.13, 36: 0.16}; //费率          
            var ServerCost = (AppAmount * fl[qs]).toFixed(2); //服务费
            var moneyMonth = (AppAmount / qs).toFixed(2);//月还本金
            $("#interestRate").val((fl[qs]*100).toFixed(0)+"%");//更新 服务费率
            $("#poundage").val(ServerCost);
            $("#moneyMonth").val(moneyMonth);
            $("#monthRepay").val(moneyMonth);//月还款
        }
        if(poundageRepaymentType == "103002") {//分期支付
            $("#monthInterestRate").val(0.7+"%");
            var monthPoundage = ( parseFloat(AppAmount) * 0.007).toFixed(2); //月服务费
            var moneyMonth = (parseFloat(AppAmount) / qs).toFixed(2);//月还本金
            var monthRepay = (parseFloat(monthPoundage) + parseFloat(moneyMonth)).toFixed(2) ; //月还款
            $("#monthPoundage").val(monthPoundage);
            $("#moneyMonth").val(moneyMonth);
            $("#monthRepay").val(monthRepay);//月还款
        }
    }
});