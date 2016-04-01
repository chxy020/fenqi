/**
 * author:hmgx by 2016-2-19
 */

//页面初始化
$(function () {
    //处理滚动条
    var DivIframes = $(".tab-content", window.parent.document);
    for (var i = 0; i < DivIframes.length; i++) {
        if ($(DivIframes[i]).find("iframe").attr("src") == "Order/RepayManage.html") {
            $(DivIframes[i]).css({overflow: "hidden"});
            break;
        }
    }

    var g = {};
    g.phone = "";
    g.imgCodeId = "";
    g.sendCode = false;
    g.sendTime = 60;
    g.login_token = Utils.offLineStore.get("token", false) || "";
    g.httpTip = new Utils.httpTip({});

    g.totalPage = 1;
    g.currentPage = 1;
    g.pageSize = 10;


    //验证登录状态
    var loginStatus = Utils.getUserInfo();
    if (!loginStatus) {
        alert("请登陆！");
    } else {
        sendQueryOrderListHttp();
        window.ExpandState = false;
    }

    //绑定事件
    $("#querybtn").bind("click", queryOrderList);
    $("#ExpandBtn").bind("click", Expand);

    function queryOrderList() {
        g.currentPage = 1;
        $("#ExpandBtn").text("展开");
        ExpandState = false;
        sendQueryOrderListHttp();
    }

    //获取订单数据
    function sendQueryOrderListHttp() {
        g.httpTip.show();
        var url = Base.serverUrl + "order/queryRepaymentOrdersController";
        var condi = {};
        condi.login_token = g.login_token;
        condi.currentPageNum = g.currentPage;
        condi = Hmgx.getQueryParamet("CX", condi);
        $.ajax({
            url: url, data: condi, type: "POST", dataType: "json", context: this,
            success: function (data) {
                var status = data.success || false;
                if (status) {
                    changeOrderListHtml(data);
                } else {
                    var msg = data.message || "获取订单列表数据失败";
                    Utils.alert(msg);
                }
                g.httpTip.hide();
            },
            error: function (data) {
                g.httpTip.hide();
            }
        });
    }

    //显示订单列表
    function changeOrderListHtml(data) {
        var html = [];
        html.push('<table class="table table-bordered table-hover definewidth m10" style="table-layout: fixed"><thead>');
        html.push('<tr>');
        html.push('<th width="16"></th>');
        html.push('<th width="100">订单编号</th>');
        html.push('<th width="300">所属公司</th>');
        html.push('<th width="100">用户姓名</th>');
        html.push('<th width="130">身份证号码</th>');
        html.push('<th width="100">审批分期金额</th>');
        html.push('<th width="100">审批分期期数</th>');
        html.push('<th width="80">待还期数</th>');
        html.push('<th width="80">订单状态</th>');
        html.push('<th width="80">手机号</th>');
        html.push('<th width="80">逾期笔数</th>');
        html.push('<th width="80">服务费支付方式</th>');
        html.push('<th width="150">操作</th>');
        html.push('</tr>');
        var obj = data.list || [];
        for (var i = 0, len = obj.length; i < len; i++) {
            var d = obj[i];
            var aStr = "";
            html.push('<tr id="Tr' + d.orderId + '" >');
            html.push('<td style="padding: 0px; margin: 0px; text-align: center; vertical-align: middle;"><a href="javascript:void(0)" onclick="ShowTableSub(' + d.orderId + ')" title="展开或关闭"><img id="but' + d.orderId + '" src="js/open.png"></a></td>');
            html.push('<td>' + d.orderId + '</td>');
            html.push('<td>' + (d.subsidiary || "") + '</td>');
            html.push('<td>' + d.applicantName + '</td>');
            html.push('<td>' + d.applicantIdentity + '</td>');
            html.push('<td>' + d.packageMoney + '元</td>');
            html.push('<td>' + d.fenQiTimes + '期</td>');
            html.push('<td>' + (d.noRepaymentTimes==0?0:(d.fenQiTimes - d.noRepaymentTimes + 1) )+ '期</td>');

            //订单状态
            if (d.status == "100507") {
                html.push('<td id="F_Status' + d.orderId + '">还款中</td>');
                aStr = '<a href="javascript:void(0)" onclick="YiCiHuanQing(' + d.totalCurrentBalance + ',\'' + d.orderId + '\')">一次还清</a>';
            } else if (d.status == "100508") {
                html.push('<td id="F_Status' + d.orderId + '">已还清</td>');
                aStr = '';
            } else if (d.status == "100510") {
                html.push('<td id="F_Status' + d.orderId + '">已逾期</td>');
                aStr = '<a href="javascript:void(0)" onclick="DaiHuanKuan(' + d.currentBalance + ',\'' + d.orderId + '\')">代还款</a>';
            } else {
                html.push('<td id="F_Status' + d.orderId + '">未知状态</td>');
                console.log(d.status);
            }

            html.push('<td>' + d.applicantPhone + '</td>');
            html.push('<td>' + d.overdueCount + '期</td>');
            html.push('<td>' + (d.poundageRepaymentType == "103001" ? "一次性付款" : "分期付款") + '</td>');

            //操作列
            if (d.status == "100508") {
                html.push('<td>' + aStr + '</td>');
            } else {
                html.push('<td><a href="javascript:void(0)" onclick="popZhhzWin(' + d.orderId + ')">终止合同</a> &nbsp;&nbsp;' + aStr + '</td>');
            }

            html.push('</tr>');
            html.push('<tr><td id="Sub' + d.orderId + '" OrderStatus="' + d.status + '" colspan="13" style="display: none;background-color: #FAFAD2;margin: 0px;padding:5px 5px 5px 40px;"></td></tr>');
        }
        html.push('</table>');

        var pobj = data.obj || {};
        if (obj.length > 0) {
            var page = countListPage(pobj);
            html.push(page);
        } else {
            Utils.alert("没有订单数据");
        }
        $("#orderlist").html(html.join(''));
        $("#orderlistpage a").bind("click", pageClick);
    }

    //显示子表格处理
    window.ShowTableSub = function (OrderId, Status) {
        var TdObj = $("#Sub" + OrderId);//TD容器放子表使用
        //获取当前子表格的状态:显示=true/隐藏=false
        if (typeof(Status) === "undefined") {
            if (TdObj.is(":hidden")) {
                Status = false;
            } else {
                Status = true;
            }
        }
        if (Status) {//隐藏
            TdObj.hide(0);
            $("#but" + OrderId).attr("src", "js/open.png");
        } else {//显示
            if (TdObj.html() == "") {//后台获取数据
                var OrderStatus = $(TdObj).attr("OrderStatus");
                paramObj = {};
                paramObj.login_token = g.login_token;
                paramObj.currentPageNum = g.currentPage;
                paramObj.orderId = OrderId;
                paramObj.repaymentStatus = $("#repaymentStatus").val();
                paramObj.overdueDay = $("#overdueDay").val();
                paramObj.expectRepaymentTimeBegin = $("#expectRepaymentTimeBegin").val();
                paramObj.expectRepaymentTimeEnd = $("#expectRepaymentTimeEnd").val();
                CreateSubHtml(paramObj, TdObj, OrderStatus);
            }
            TdObj.show(0);
            $("#but" + OrderId).attr("src", "js/close.png");
        }
    };

    //创建子表表格 [paramObj=查询参数 ,TdObj=子表格的TD容器, OrderStatus 订单状态]
    function CreateSubHtml(paramObj, TdObj, OrderStatus) {
        g.httpTip.show();
        var url = Base.serverUrl + "order/queryRepaymentOrderDetail";
        $.ajax({
            url: url, data: paramObj, type: "POST", dataType: "json", context: this,
            success: function (data) {
                var status = data.success || false;
                var List = data.list;
                if (status) {
                    var SubHtml = [];
                    var First = false;//保存第一个未还款的状态
                    SubHtml.push('<table class="SubTable" style="table-layout: fixed;width: 100%">');
                    SubHtml.push('<tr>');
                    SubHtml.push('<th>分期编号</th>');
                    SubHtml.push('<th>应还时间</th>');
                    SubHtml.push('<th>分期本金</th>');
                    if (List.length > 0) {
                        if (List[0].monthPoundage > 0) {
                            SubHtml.push('<th>分期服务费</th>');
                        }
                    }
                    SubHtml.push('<th>逾期管理费</th>');
                    SubHtml.push('<th>逾期罚息</th>');
                    SubHtml.push('<th>应还金额</th>');
                    SubHtml.push('<th width="140px">实还时间</th>');
                    SubHtml.push('<th>实还金额</th>');
                    SubHtml.push('<th>逾期天数</th>');
                    SubHtml.push('<th>还款状态</th>');
                    SubHtml.push('<th>操作</th>');
                    SubHtml.push('</tr>');
                    for (var i = 0; i < List.length; i++) {
                        var row = List[i];
                        SubHtml.push('<tr>');
                        SubHtml.push('<td>' + row.repaymentTimes + '</td>');
                        SubHtml.push('<td>' + row.expectRepaymentTime + '</td>');
                        SubHtml.push('<td>' + (row.residuePrincipal || "") + '</td>');
                        if (row.monthPoundage > 0) {
                            SubHtml.push('<td>' + row.monthPoundage + '元</td>');
                        }
                        SubHtml.push('<td>' + (row.managementFee || "") + '</td>');
                        SubHtml.push('<td>' + (row.overdueInterest || "") + '</td>');
                        SubHtml.push('<td>' + row.currentBalance + '</td>');
                        SubHtml.push('<td>' + (row.realRepaymentTime || "") + '</td>');
                        SubHtml.push('<td>' + row.realRepaymentMoney + '</td>');
                        SubHtml.push('<td>' + row.overdueTime + '</td>');
                        SubHtml.push('<td>' + row.statusDesc + '</td>');

                        if (OrderStatus == "100510" || OrderStatus == "100508") {//订单状态=已逾期 或者 已还清
                            if (row.status == "101902") {//已还款
                                SubHtml.push('<td></td>');
                            } else {
                                SubHtml.push('<td><a href="javascript:SMSTips(' + row.orderId + ',' + row.repaymentRecordId + ')">提醒</a></td>');
                            }
                        } else if (OrderStatus == "100507") {//订单状态=还款中
                            if (row.status == "101902") {//已还款
                                SubHtml.push('<td></td>');
                            } else if (row.status == "101903") {//已逾期
                                SubHtml.push('<td><a href="javascript:SMSTips(' + row.orderId + ',' + row.repaymentRecordId + ')">提醒</a></td>');
                            } else if (row.status == "101901") {//还款中
                                if (First) {
                                    SubHtml.push('<td><a href="javascript:SMSTips(' + row.orderId + ',' + row.repaymentRecordId + ')">提醒</a></td>');
                                } else {
                                    SubHtml.push('<td><a href="javascript:SMSTips(' + row.orderId + ',' + row.repaymentRecordId + ')">提醒</a>&nbsp;&nbsp;<a href="javascript:void(0)" onclick="popFqlb_dhkWin(' + row.currentBalance + ',' + row.repaymentRecordId + ')">代还款</a></td>');
                                    First = true;
                                }
                            } else {
                                SubHtml.push('<td>未知状态</td>');
                            }
                        }
                        SubHtml.push('</tr>');
                    }
                    SubHtml.push('</table>');
                    TdObj.html(SubHtml.join(''));
                } else {
                    var msg = data.message || "获取订单数据失败!";
                    Utils.alert(msg);
                }
                g.httpTip.hide();
            },
            error: function (data) {
                g.httpTip.hide();
            }
        });
    }

    //展开全部
    function Expand() {
        var TdList = $("td[id^='Sub']");
        var TdId = null;
        for (var i = 0; i < TdList.length; i++) {
            TdId = $(TdList[i]).attr("id").toString().substring(3);
            ShowTableSub(TdId, ExpandState);
        }
        if (ExpandState) {
            $("#ExpandBtn").text("展开");
            ExpandState = false;
        } else {
            $("#ExpandBtn").text("折叠");
            ExpandState = true;
        }
    }

    //*****************************************************功能操作
    //订单状态=已逾期 代还款
    window.DaiHuanKuan = function (Amount, OrderId) {
        if (confirm('是否确定执行代还款? ') == false) {
            return false;
        }
        $("#dhk_Amount").text(Amount);
        $("#dhk_Amount").attr("OrderId", OrderId);
        $('#dhkDiv').modal('show');
    };
    window.SaveDhk = function () {
        var OrderId = $("#dhk_Amount").attr("OrderId");
        var realRepaymentTime = $("#dhkTime");
        if (OrderId == "" || typeof(OrderId) == "undefined") {
            alert("订单号非法！");
            return false;
        }
        if (realRepaymentTime.val() == "") {
            alert("请选择还款时间！");
            return false;
            ;
        }
        g.httpTip.show();
        var url = Base.serverUrl + "order/helpPayOverdueFenqi";
        var condi = {};
        condi.login_token = g.login_token;
        condi.orderId = OrderId;
        condi.realRepaymentTime = realRepaymentTime.val();
        $.ajax({
            url: url, data: condi, type: "POST", dataType: "json", context: this,
            success: function (data) {
                console.log(data);
                var msg = data.message || "代还款失败!";
                Utils.alert(msg);
                g.httpTip.hide();
                $('#dhkDiv').modal('hide');
            },
            error: function (data) {
                g.httpTip.hide();
            }
        });
    };
    //订单状态=还款中 一次还清
    window.YiCiHuanQing = function (Amount, OrderId) {
        if (confirm('是否确定执行一次还清? ') == false) {
            return false;
        }
        $("#ychq_Amount").text(Amount);
        $("#ychq_Amount").attr("OrderId", OrderId);
        $('#ychqDiv').modal('show');
    };
    window.SaveYchq = function () {
        var OrderId = $("#ychq_Amount").attr("OrderId");
        var realRepaymentTime = $("#ychqTime");
        if (OrderId == "" || typeof(OrderId) == "undefined") {
            alert("订单号非法！");
            return false;
        }
        if (realRepaymentTime.val() == "") {
            alert("请选择还款时间！");
            return false;
            ;
        }
        g.httpTip.show();
        var url = Base.serverUrl + "order/updateRepaymentRecordsByOncepaidFinish";
        var condi = {};
        condi.login_token = g.login_token;
        condi.orderId = OrderId;
        condi.realRepaymentTime = realRepaymentTime.val();
        $.ajax({
            url: url, data: condi, type: "POST", dataType: "json", context: this,
            success: function (data) {
                var msg = data.message || "一次还清失败!";
                Utils.alert(msg);
                g.httpTip.hide();
                $('#ychqDiv').modal('hide');
            },
            error: function (data) {
                g.httpTip.hide();
            }
        });
    };
    //终止合同
    window.popZhhzWin = function (OrderId) {
        $("#reason").attr("OrderId", OrderId);
        $('#zzhtDiv').modal('show');
    };
    window.ZhongZhi = function () {
        var OrderId = $("#reason").attr("OrderId");
        var Reason = $("#reason");
        if (OrderId == "" || typeof(OrderId) == "undefined") {
            alert("订单号非法！");
            return false;
        }
        if (Reason.val() == "") {
            alert("请填写终止合同的原因！");
            Reason.focus();
            return false;
            ;
        }
        g.httpTip.show();
        var url = Base.serverUrl + "order/finishContractController";
        var condi = {};
        condi.login_token = g.login_token;
        condi.orderId = OrderId;
        condi.reason = Reason.val();
        $.ajax({
            url: url, data: condi, type: "POST", dataType: "json", context: this,
            success: function (data) {
                var msg = data.message || "终止合同失败!";
                Utils.alert(msg);
                g.httpTip.hide();
                $('#zzhtDiv').modal('hide');
            },
            error: function (data) {
                g.httpTip.hide();
            }
        });
    };
    //分期列表 - 代还款
    window.popFqlb_dhkWin = function (Amount, repaymentRecordId) {
        if (confirm('是否确定执行代还款? ') == false) {
            return false;
        }
        $("#fqlb_Amount").text(Amount);
        $("#fqlb_Amount").attr("repaymentRecordId", repaymentRecordId);
        $('#fqlb_dhkDiv').modal('show');
    };
    window.SafeFqlb_Dhk = function () {
        var repaymentRecordId = $("#fqlb_Amount").attr("repaymentRecordId");
        var realRepaymentTime = $("#realRepaymentTime");
        if (repaymentRecordId == "" || typeof(repaymentRecordId) == "undefined") {
            alert("还款编号非法！");
            return false;
        }
        if (realRepaymentTime.val() == "") {
            alert("请选择还款时间！");
            return false;
            ;
        }
        g.httpTip.show();
        var url = Base.serverUrl + "order/helpPayFenqi";
        var condi = {};
        condi.login_token = g.login_token;
        condi.repaymentRecordId = repaymentRecordId;
        condi.realRepaymentTime = realRepaymentTime.val();
        $.ajax({
            url: url, data: condi, type: "POST", dataType: "json", context: this,
            success: function (data) {
                var msg = data.message || "代还款操作失败!";
                Utils.alert(msg);
                g.httpTip.hide();
                $('#fqlb_dhkDiv').modal('hide');
            },
            error: function (data) {
                g.httpTip.hide();
            }
        });
    };
    //分期列表 - 提醒
    window.SMSTips = function (OrderId, repaymentRecordId) {
        g.httpTip.show();
        var url = Base.serverUrl + "order/sendRepaymentMessage";
        var condi = {};
        condi.login_token = g.login_token;
        condi.orderId = OrderId;
        condi.repaymentRecordId = repaymentRecordId;
        $.ajax({
            url: url, data: condi, type: "POST", dataType: "json", context: this,
            success: function (data) {
                var msg = data.message || "提醒操作失败!";
                Utils.alert(msg);
                g.httpTip.hide();
                $('#fqlb_dhkDiv').modal('hide');
            },
            error: function (data) {
                g.httpTip.hide();
            }
        });
    };


    //*****************************************************处理分页
    function countListPage(data) {
        var html = [];
        g.totalPage = Math.ceil(data.totalRowNum / data.pageSize);
        html.push('<div id="orderlistpage" class="inline pull-right page">');
        html.push(data.totalRowNum + ' 条记录' + g.currentPage + '/' + g.totalPage + ' 页');
        html.push('<a href="javascript:void(0);" class="page-next">下一页</a>');

        if (g.totalPage > 10) {
            if (g.currentPage >= 10) {
                var css = "color: #ff0000;";
                if ((g.totalPage - g.currentPage) >= 5) {
                    html.push('<a href="javascript:void(0)" >' + (g.currentPage - 4) + '</a>');
                    html.push('<a href="javascript:void(0)" >' + (g.currentPage - 3) + '</a>');
                    html.push('<a href="javascript:void(0)" >' + (g.currentPage - 2) + '</a>');
                    html.push('<a href="javascript:void(0)" >' + (g.currentPage - 1) + '</a>');
                    html.push('<a href="javascript:void(0)" style="' + css + '">' + (g.currentPage) + '</a>');
                } else {
                    //末尾少于5页
                    var len = 9 - (g.totalPage - g.currentPage);
                    for (var j = len; j >= 0; j--) {
                        if (j == 0) {
                            html.push('<a href="javascript:void(0)" style="' + css + '">' + (g.currentPage) + '</a>');
                        } else {
                            html.push('<a href="javascript:void(0)" >' + (g.currentPage - j) + '</a>');
                        }
                    }
                }
                for (var i = 1; i < 6; i++) {
                    var np = g.currentPage + i;
                    if (np <= g.totalPage) {
                        html.push('<a href="javascript:void(0)" >' + np + '</a>');
                    } else {
                        break;
                    }
                }
            } else {
                for (var i = 0; i < 10; i++) {
                    var css = (i + 1) == g.currentPage ? "color: #ff0000;" : "";
                    html.push('<a href="javascript:void(0)" style="' + css + '">' + (i + 1) + '</a>');
                }
            }
        } else {
            for (var i = 0; i < g.totalPage; i++) {
                var css = (i + 1) == g.currentPage ? "color: #ff0000;" : "";
                html.push('<a href="javascript:void(0)" style="' + css + '">' + (i + 1) + '</a>');
            }
        }
        html.push('</div>');
        return html.join('');
    }

    function pageClick(evt) {
        $("#ExpandBtn").text("展开");
        ExpandState = false;

        var index = $(this).index();
        var text = $(this).text() - 0 || "";
        if (text !== "") {
            if (g.currentPage === text) {
                Utils.alert("当前是第" + text + "页");
                return;
            } else {
                g.currentPage = text;
            }
        } else {
            var cn = $(this)[0].className;
            switch (cn) {
                case "page-pre-end":
                    //第一页
                    if (g.currentPage == 1) {
                        Utils.alert("当前是第一页");
                        return;
                    } else {
                        g.currentPage = 1;
                    }
                    break;
                case "page-pre":
                    //前一页
                    if (g.currentPage > 1) {
                        g.currentPage--;
                    } else {
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

        if (g.currentPage <= g.totalPage) {
            sendQueryOrderListHttp();
        } else {
            Utils.alert("当前是最后一页");
        }
    }

    //*****************************************************模拟框事件
    window.OutXls = function () {
        var ParamObj = {};
        ParamObj.login_token = g.login_token;
        Hmgx.serializeDownload(Base.serverUrl + "order/queryRepaymentOrdersControllerExport", "CX", ParamObj);
    }
});

