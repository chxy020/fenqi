/**
 * author:hmgx by 2016-2-26
 */

//页面初始化
$(function () {
    //处理滚动条
    var DivIframes = $(".tab-content", window.parent.document);
    for(var i = 0 ; i < DivIframes.length; i++){
        if($(DivIframes[i]).find("iframe").attr("src") == "Order/WeiYueManage.html"){
            $(DivIframes[i]).css({overflow:"hidden"});
            break;
        }
    }
    if (typeof eui !== "undefined") {
        eui.calendar({
            startYear: 1900,
            input: document.getElementById('finishContractTimeBegin'),
            id: "finishContractTimeBegin"
        });
        eui.calendar({
            startYear: 1900,
            input: document.getElementById('finishContractTimeEnd'),
            id: "finishContractTimeEnd"
        });
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
    $("#export").attr("href", Base.serverUrl  + "order/getBreakContractOrdersControllerExport?login_token=" + g.login_token);

    function queryOrderList() {
        g.currentPage = 1;
        sendQueryOrderListHttp();
    }

    //获取订单数据
    function sendQueryOrderListHttp() {
        g.httpTip.show();
        var url = Base.serverUrl + "order/getBreakContractOrdersController";
        var condi = {};
        condi.login_token = g.login_token;
        condi.currentPageNum = g.currentPage;
        condi = Hmgx.getQueryParamet("CX",condi);
        $.ajax({
            url: url, data: condi,  type: "POST", dataType: "json", context: this,
            success: function (data) {
                var status = data.success || false;
                if (status) {
                    changeOrderListHtml(data);
                } else {
                    var msg = data.message || "获取违约订单列表数据失败";
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
        html.push('<table class="table table-bordered table-hover definewidth m10" style=""><thead>');
        html.push('<tr>');
        html.push('<th width="100">订单编号</th>');
        html.push('<th width="100">用户姓名</th>');
        html.push('<th width="100">放款时间</th>');
        html.push('<th width="100">审批金额</th>');
        html.push('<th width="80">审批期数</th>');
        html.push('<th width="80">应还日</th>');
        html.push('<th width="80">每期还款本金</th>');
        html.push('<th width="80">每期服务费</th>');
        html.push('<th width="80">剩余本金</th>');
        html.push('<th width="80">剩余服务费</th>');
        html.push('<th width="80">已还期数</th>');
        html.push('<th width="80">逾期时间</th>');
        html.push('<th width="80">逾期期数</th>');
        html.push('<th width="80">逾期天数</th>');
        html.push('<th width="80">逾期费用</th>');
        html.push('<th width="80">应还金额</th>');
        html.push('<th width="80">实还金额</th>');
        html.push('<th width="80">实还时间</th>');
        html.push('<th width="80">违约原因</th>');
        html.push('<th width="80">违约时间</th>');
        html.push('<th width="80">服务费支付方式</th>');

        html.push('<th width="300">操作</th>');
        html.push('</tr>');
        var obj = data.list || [];
        for (var i = 0, len = obj.length; i < len; i++) {
            var d = obj[i];
            html.push('<tr id="Tr' + d.orderId + '" >');
            html.push('<td>' + d.orderId + '</td>');
            html.push('<td>' + (d.applicantName||"") + '</td>');
            html.push('<td>' + (d.loanTime || "") + '</td>');
            html.push('<td>' + d.packageMoney + '元</td>');
            html.push('<td>' + (d.fenQiTimes || "") + '</td>');
            html.push('<td>' + (d.loanTime.substr(8) )+ '</td>');
            html.push('<td>' + (d.moneyMonth || "") + '</td>'); //每期还款本金
            html.push('<td>' +  (d.monthPoundage) + '元</td>');
            html.push('<td>' +  (d.residuePrincipal ) + '元</td>');
            html.push('<td>' + (d.residuePoundage || 0) + '元</td>');//剩余服务费
            //html.push('<td>' + (d.noRepaymentTimes==0?0:(d.fenQiTimes - d.noRepaymentTimes + 1) )+ '期</td>');
            html.push('<td>' + (d.fenQiTimes - d.noRepaymentTimes )+ '期</td>');
            html.push('<td>' + (d.overdueDate  ||"" )+ '</td>');
            html.push('<td>' + (d.overdueCount ||"" )+ '</td>');
            html.push('<td>' + (d.overdueTime ||"" )+ '</td>');
            html.push('<td>' + (d.overdueFee ||"" )+ '</td>');
            html.push('<td>' + (d.currentBalance ||"" )+ '</td>');
            html.push('<td>' + (d.realRepaymentMoney ||"" )+ '</td>');
            html.push('<td>' + (d.lastRealRepaymentTime ||"" )+ '</td>');
            html.push('<td>' + (d.finishContractReason ||"" )+ '</td>');
            html.push('<td>' + (d.finishContractTime ||"" )+ '</td>');
            html.push('<td>' +  (d.poundageRepaymentType=="103001"?"一次性付款":"分期付款") + '</td>');

            //if(d.status == "100511"){
            //    html.push('<td>已违约</td>');
            //}else if(d.status == "100513"){
            //    html.push('<td>违约已还清</td>');
            //}
            //else{
            //    html.push('<td id="F_Status' + d.orderId + '">未知状态</td>');
            //}
            //html.push('<td>' + d.applicantPhone + '</td>');
            if(d.status == "100511"){
                html.push('<td width="300"><a href="javascript:Hmgx.openWin(\'ViewOrderDetail.html?orderid=' + d.orderId + '\')">查看</a>&nbsp;&nbsp;<a href="javascript:SMSTips('+ d.orderId +')">提醒</a>&nbsp;&nbsp;<a href="javascript:popFqlb_dhkWin(' + d.currentBalance + ',' + d.orderId +')">代还款</a></td>');
            }else{
                html.push('<td><a href="javascript:Hmgx.openWin(\'ViewOrderDetail.html?orderid=' + d.orderId + '\')">查看</a></td>');
            }
            html.push('</tr>');
            html.push('<tr><td id="Sub' + d.orderId + '" OrderStatus="' + d.status + '" colspan="11" style="display: none;background-color: #FAFAD2;margin: 0px;padding:5px 5px 5px 40px;"></td></tr>');
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

    //*****************************************************功能操作
    window.SMSTips=function(OrderId){
        g.httpTip.show();
        var url = Base.serverUrl + "order/sendBreakContractRepaymentMessage";
        var condi = {};
        condi.login_token = g.login_token;
        condi.orderId = OrderId;
        $.ajax({
            url: url, data: condi,  type: "POST", dataType: "json", context: this,
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
    //代还款
    window.popFqlb_dhkWin=function(Amount,OrderId){
        $("#fqlb_Amount").text(Amount);
        $("#fqlb_Amount").attr("OrderId",OrderId);
        $('#fqlb_dhkDiv').modal('show');
    };
    window.SafeFqlb_Dhk = function(){
        var OrderId =  $("#fqlb_Amount").attr("OrderId");
        var realRepaymentTime = $("#realRepaymentTime");
        if(OrderId == "" || typeof(OrderId) == "undefined"){
            alert("订单号非法！");
            return false;
        }
        if(realRepaymentTime.val() == ""){
            alert("请选择还款时间！");
            return false;;
        }
        g.httpTip.show();
        var url = Base.serverUrl + "order/helpPayBreakContractOrder";
        var condi = {};
        condi.login_token = g.login_token;
        condi.orderId = OrderId;
        condi.realRepaymentTime = realRepaymentTime.val();
        $.ajax({
            url: url, data: condi,  type: "POST", dataType: "json", context: this,
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
    $('#fqlb_dhkDiv').on('shown.bs.modal', function (e) {
        eui.calendar({
            startYear: 1900,
            input: document.getElementById('realRepaymentTime'),
            id: "realRepaymentTime"
        });
        $(".eui-calendar").css({"z-index":9999999});
    })
    window.OutXls = function(){
        var ParamObj={};
        ParamObj.login_token = g.login_token;
        Hmgx.serializeDownload(Base.serverUrl  + "order/getBreakContractOrdersControllerExport","CX",ParamObj);
    }
});