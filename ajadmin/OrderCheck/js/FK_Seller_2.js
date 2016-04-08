/**
 * function:二审
 * author:hmgx
 * data:2015-12-18
 */

//页面初始化
$(function () {
    var g = {};
    g.orderId = Utils.getQueryString("orderId") || "";
    g.login_token = Utils.offLineStore.get("token", false) || "";
    g.phoneNumber = Utils.offLineStore.get("user_phoneNumber", false) || "";
    g.usersId = Utils.offLineStore.get("user_usersId", false) || "";
    g.usersName = Utils.offLineStore.get("user_usersName", false) || "";
    g.httpTip = new Utils.httpTip({});

    g.totalPage = 1;
    g.currentPage = 1;
    g.pageSize = 10;

    //验证登录状态
    var loginStatus = Utils.getUserInfo();
    if (!loginStatus) {
        alert("未登陆!");
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
                $("#fenQiTimes").val(RowData.fenQiTimes || "请选择审批期数！");
                //fenQiTimesChange();//绑定分期期数后， 要计算一下，否则在不修改的时候 审批通过取不到值
                $("#fk1_approve_report").val(RowData.fk1_approve_report);
                $("#fk1_approve_nameSpan").text(RowData.fk1_approve_name);
                $("#fk1_approve_remarks").val(RowData.fk1_approve_remarks);
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
    $('#backid').click(function () {
        window.location.href = "Fk_OrderList_2.html";
    });
    /* $("#packageMoney").bind("blur", fenQiTimesChange);
    $("#fenQiTimes").bind("change", fenQiTimesChange); */
	$("#packageMoney").bind("blur", countFee);
    $("#fenQiTimes").bind("change", countFee);

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
                if (Number($("#packageMoney").val()) <= 0) {
                    alert("审批金额必须大于0!");
                    $("#packageMoney").focus();
                    return false;
                }
                if (Number($("#packageMoney").val()) > Number($("#contractMoney").val())) {
                    alert("审批金额不能大于合同总金额[" + $("#contractMoney").val() + "]!");
                    $("#packageMoney").focus();
                    return false;
                }
            }
            if (($("#fenQiTimes").val() || 0) == 0) {
                alert("请选择审批期数!");
                $("#fenQiTimes").focus();
                return false;
            }
            condi.packageMoney = $("#packageMoney").val();
            condi.poundage = g.poundage;
            condi.fenQiTimes = $("#fenQiTimes").val() || "";//g.stagnum;
            condi.moneyMonth = g.moneyMonth;
        } else if (ActType == 1) {//拒绝
            condi.packageMoney = 0;
            condi.fenQiTimes = 0;
        }
        if ($("#fk2_approve_report").val() == "") {
            alert("复审报告不能为空，请检查！");
            return false;
        }
        g.httpTip.show();
        condi.orderId = g.orderId;
        condi.login_token = g.login_token;
        condi.approvePerson = g.usersId;
        condi.approveName = g.usersName;
        condi.approveResult = e.data.approveResult;
        condi.approveReport = $("#fk2_approve_report").val() || "";
        var url = Base.serverUrl + "order/riskManagementSecondApproveOrderController";
        //console.log(condi);
        g.httpTip.hide();
        $.ajax({
            url: url, data: condi, type: "POST", dataType: "json", context: this,
            success: function (data) {
                var status = data.success || false;
                if (status) {
                    alert("处理成功！");
                    window.close();
                    //window.location.href = "Fk_OrderList_2.html";
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

    //计算费率
/*     function countFee(allprice, time) {
        var Rates = {"3":0,"6":0.04,"9":0.04,"12":0.07,"18":0.1,"24":0.13,"36":0.16};

        var obj = {};
        obj.poundage = (allprice * Rates[time]).toFixed(2);//手续费
        obj.moneyMonth = (allprice / time ).toFixed(2) ; //月还款金额
        obj.stagnum = time ; //期数
        g.poundage = obj.poundage + "";
        g.moneyMonth = obj.moneyMonth + "";
        g.stagnum = obj.stagnum;
        return obj;
    }

    function fenQiTimesChange() {
        var packageMoney = $("#packageMoney").val() - 0 || 0;
        if (packageMoney > 500000) {
            Utils.alert("最大审批额度不能大于50万");
            return false;
        }
        if (packageMoney > 0) {
            if (Number(packageMoney) > Number($("#contractMoney").val())) {
                Utils.alert("初审审批额度不能大于合同总金额" + $("#contractMoney").val() + "元");
            }else {
                var time = $("#fenQiTimes").val() || 0;
                if(time != 0) {
                    var obj = countFee(packageMoney, time);
                    $("#poundage").html(obj.poundage > 0 ? (obj.poundage + "元") : "免费");
                    $("#moneyMonth").html(obj.moneyMonth + "元");
                }
            }
        } else {
            Utils.alert("最大审批额度必须大于0元");
        }
    } */
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