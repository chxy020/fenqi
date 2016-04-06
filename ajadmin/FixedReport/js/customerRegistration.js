/**
 * author:hmgx
 * function:订单统计报表
 * data:2016-3-10
 */

//页面初始化
$(function () {
    if(typeof eui !== "undefined"){
        eui.calendar({
            startYear: 1900,
            input: document.getElementById('createTimeBegin'),
            id:"createTimeBegin"
        });
        eui.calendar({
            startYear: 1900,
            input: document.getElementById('createTimeEnd'),
            id:"createTimeEnd"
        });
    }
    var g = {};
    g.login_token = Utils.offLineStore.get("token", false) || "";
    g.httpTip = new Utils.httpTip({});
    g.totalPage = 1;
    g.currentPage = 1;
    g.pageSize = 10;

    //加载订单方法
    $.getScript("../OrderCheck/js/OrderFunction.js").done(function() {}).fail(function() {Utils.alert("@_@加载订单状态方法失败<br>请检查！");});

    //验证登录状态
    var loginStatus = Utils.getUserInfo();
    if (!loginStatus) {
        alert("您未登陆！");
    } else {
        getBranchCompany();
        queryOrderList();
    }

    $("#querybtn").bind("click", queryOrderList);
    $("#outBut").bind("click", function(){
        var ParamObj={};
        ParamObj.login_token = g.login_token;
        ParamObj.currentPageNum = 1;
        ParamObj.pageSize = 10000;
        Hmgx.serializeDownload(Base.serverUrl  + "oplog/selectClentRegisterReportExport","CX",ParamObj);
    });

    function queryOrderList() {
        g.currentPage = 1;
        sendQueryOrderListHttp();
    }

    //获取分公司
    function getBranchCompany(){
        g.httpTip.show();
        var url = Base.serverUrl + "subsidiary/getSubsidiarys";
        var condi = {};
        condi.pageSize = 1000;
        $.ajax({
            url: url, data: condi, type: "POST", dataType: "json", context: this,
            success: function (data) {
                var list = data.list || {};
                var option = [];
                option.push('<option value="">全部</option>');
                for(var i = 0;i< list.length;i++){
                    var d = list[i];
                    option.push('<option value="' + d.id + '">' + d.name + '</option>');
                }
                $("#subsidiaryId").html(option.join(''));
                g.httpTip.hide();
            }, error: function (data) {
                g.httpTip.hide();
            }
        });
    }

    //获取订单数据
    function sendQueryOrderListHttp() {
        g.httpTip.show();
        var url = Base.serverUrl + "oplog/selectClentRegisterReport";
        var condi = {};
        condi.login_token = g.login_token;
        condi.currentPageNum = g.currentPage;
        condi.pageSize = g.pageSize;
        condi = Hmgx.getQueryParamet("CX",condi);
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

    function changeOrderListHtml(data) {
        var html = [];
        html.push('<table class="table table-bordered table-hover definewidth m10" ><thead>');
        html.push('<tr>');
        html.push('<th>客户姓名</th>');
        html.push('<th>身份证号</th>');
        html.push('<th>手机号</th>');
        html.push('<th>合同编号</th>');
        html.push('<th>合作商家</th>');
        html.push('<th>所属公司</th>');
        html.push('<th>产品名称</th>');
        html.push('<th>合同金额</th>');
        html.push('<th>进件日期</th>');
        html.push('<th>申请分期金额</th>');
        html.push('<th>申请分期期数</th>');
        html.push('<th>初审人员</th>');
        html.push('<th>初审完成时间</th>');
        html.push('<th>复审人员</th>');
        html.push('<th>复审完成时间</th>');
        html.push('<th>终审专员</th>');
        html.push('<th>终审完成时间</th>');
        html.push('<th>审核结果</th>');
        html.push('<th>审批分期金额</th>');
        html.push('<th>审批分期期限</th>');
        html.push('<th>放款日期</th>');
        html.push('<th>服务费</th>');
        html.push('<th>优惠券金额</th>');
        html.push('<th>月还款金额</th>');
        html.push('</tr>');

        var obj = data.list || [];
        for (var i = 0, len = obj.length; i < len; i++) {
            var d = obj[i];
            html.push('<td>' + d.applicantName + '</td>');
            html.push('<td>' + d.applicantIdentity + '</td>');
            html.push('<td>' + d.applicantPhone + '</td>');
            html.push('<td>' + d.contraceNo + '</td>');
            html.push('<td>' + d.companyName + '</td>');
            html.push('<td>' + d.company + '</td>');
            html.push('<td>' + d.packageName + '</td>');
            html.push('<td>' + d.contractMoney + '</td>');
            html.push('<td>' + d.modifyTime + '</td>');
            html.push('<td>' + d.applyPackageMoney + '</td>');
            html.push('<td>' + d.applyFenQiTimes + '</td>');
            html.push('<td>' + (d.firstApprovePerson||"") + '</td>');
            html.push('<td>' + (d.firstCreateTime||"") + '</td>');
            html.push('<td>' + (d.SecondApprovePerson||"") + '</td>');
            html.push('<td>' + (d.SecondCreateTime||"") + '</td>');
            html.push('<td>' + (d.LastApprovePerson||"") + '</td>');
            html.push('<td>' + (d.LastCreateTime||"") + '</td>');
            html.push('<td>' + getCheckStatus(d.last_approve_type) + " " + getCheckResult(d.last_approve_result) + '</td>');
            html.push('<td>' + (d.packageMoney||"") + '</td>');
            html.push('<td>' + (d.fenQiTimes||"") + '</td>');
            html.push('<td>' + (d.loanTime||"") + '</td>');
            html.push('<td>' + (d.poundage||"") + '</td>');
            html.push('<td>' + (d.privilegeMoney||"") + '</td>');
            html.push('<td>' + (d.moneyMonth||"") + '</td>');
            html.push('</tr>');
        }
        html.push('</table>');

        var pobj = data.obj || {};
        if (obj.length > 0) {
            var page = countListPage(pobj);
            html.push(page);
        } else {
            Utils.alert("数据为空");
        }
        $("#orderlist").html(html.join(''));
        $("#orderlistpage a").bind("click", pageClick);
    }

    //分页处理
    function countListPage(data){
        var html = [];
        g.totalPage = Math.ceil(data.totalRowNum / data.pageSize);
        //g.totalPage = 1;
        //g.currentPage = 1;
        html.push('<div id="orderlistpage" class="inline pull-right page" style="position:fixed; right:30px;bottom: 30px;">');
        html.push(data.totalRowNum + ' 条记录' + g.currentPage + '/' + g.totalPage + ' 页');
        html.push('<a href="javascript:void(0);" class="page-next">下一页</a>');

        if(g.totalPage > 10){
            if(g.currentPage >= 10){
                var css = "color: #ff0000;";

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
                    var css = (i + 1) == g.currentPage ? "color: #ff0000;" : "";
                    html.push('<a href="javascript:void(0)" style="' + css + '">' + (i + 1) + '</a>');
                }
            }
        }
        else{
            for(var i = 0; i < g.totalPage; i++){
                var css = (i + 1) == g.currentPage ? "color: #ff0000;" : "";
                html.push('<a href="javascript:void(0)" style="' + css + '">' + (i + 1) + '</a>');
            }
        }
        html.push('</div>');

        return html.join('');
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
            sendQueryOrderListHttp();
        }
        else{
            Utils.alert("当前是最后一页");
        }
    }

});