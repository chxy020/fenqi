/**
 * author:hmgx
 * function:待交手续费
 * data:2016-1-12
 */

//页面初始化
$(function () {
    if (typeof eui !== "undefined") {
        eui.calendar({
            startYear: 1900,
            input: document.getElementById('createTimeBegin'),
            id: "createTimeBegin"
        });
        eui.calendar({
            startYear: 1900,
            input: document.getElementById('createTimeEnd'),
            id: "createTimeEnd"
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

    } else {
        sendGetUserInfoDicHttp();
        queryOrderList();
    }

    $("#querybtn").bind("click", queryOrderList);

    function queryOrderList() {
        g.currentPage = 1;
        sendQueryOrderListHttp();
    }

    function sendGetCompanyInfoHttp() {
        g.httpTip.show();
        var url = Base.serverUrl + "order/queryCompanyController";
        var condi = {};
        $.ajax({
            url: url,
            data: condi,
            type: "POST",
            dataType: "json",
            context: this,
            success: function (data) {
                //console.log("sendGetCompanyInfoHttp",data);
                var status = data.success || false;
                if (status) {
                    var obj = data.list || [];
                    changeSelectHtml(obj);

                    sendQueryOrderListHttp();
                } else {
                    var msg = data.message || "获取公司信息字典数据失败";
                    Utils.alert(msg);
                }
                g.httpTip.hide();
            },
            error: function (data) {
                g.httpTip.hide();
            }
        });
    }



    //获取用户信息字典信息
    function sendGetUserInfoDicHttp() {
        g.httpTip.show();
        var url = Base.serverUrl + "baseCodeController/getBaseCodeByParents";
        var condi = {};
        condi.parents = "1005";
        $.ajax({
            url: url,
            data: condi,
            type: "POST",
            dataType: "json",
            context: this,
            success: function (data) {
                //console.log("sendGetUserInfoDicHttp",data);
                var status = data.success || false;
                if (status) {
                    var obj = data.obj || {};
                    changeSelectHtml(obj);
                } else {
                    var msg = data.message || "获取用户信息字典数据失败";
                    Utils.alert(msg);
                }
                g.httpTip.hide();
            },
            error: function (data) {
                g.httpTip.hide();
            }
        });
    }

    function changeSelectHtml(obj) {
        var parents = ["1005"];
        var ids = ["status"];
        for (var i = 0, len = parents.length; i < len; i++) {
            var data = obj[parents[i]] || {};
            var option = [];
            option.push('<option value="">全部订单</option>');
            for (var k in data) {
                var id = k || "";
                var name = data[k] || "";
                option.push('<option value="' + id + '">' + name + '</option>');
            }
            $("#" + ids[i]).html(option.join(''));
        }
        if (g.orderStatus !== "") {
            $("#orderstatus").val(g.orderStatus);
        }
    }

    function sendQueryOrderListHttp() {
        g.httpTip.show();
        var url = Base.serverUrl + "order/queryOrdersController";
        var condi = {};
        condi.login_token = g.login_token;
        condi.status = $("#status").val() || "100505";
        condi.currentPageNum = g.currentPage;
        condi.applicantName = $("#applicantName").val() || "";
        condi.applicantPhone = $("#applicantPhone").val() || "";
        condi.createTimeBegin = $("#createTimeBegin").val() || "";
        condi.createTimeEnd = $("#createTimeEnd").val() || "";
        condi.orderId = $("#orderId").val() || ""
        //condi.companyId = $("#company").val() || "";

        $.ajax({
            url: url,
            data: condi,
            type: "POST",
            dataType: "json",
            context: this,
            success: function (data) {
                //console.log("sendQueryOrderListHttp",data);
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
        html.push('<th>订单编号</th>');
        html.push('<th>合同编号</th>');
        html.push('<th>所属公司</th>');
        html.push('<th>产品名称</th>');
        html.push('<th>申请分期金额</th>');
        html.push('<th>申请分期期数</th>');
        html.push('<th>审批分期金额</th>');
        html.push('<th>审批分期期数</th>');
        html.push('<th>订单状态</th>');
        html.push('<th>真实姓名</th>');
        html.push('<th>未还期数</th>');
        html.push('<th>服务费</th>');
        html.push('<th>操作</th>');
        html.push('</tr>');
        var obj = data.list || [];
        for (var i = 0, len = obj.length; i < len; i++) {
            var d = obj[i];
            var deleted = d.deleted - 0 || 0;

            if (deleted !== 0) {
                continue;
            }

            var orderId = d.orderId || "";
            var contractNo = d.contractNo || "";
            var subsidiary = d.subsidiary || "";//所属公司
            var packageName = d.packageName || "";
            var packageMoney = d.packageMoney || 0;
            var statusDes = d.statusDes || "";
            var status = d.status || "";

            var applicantName = d.applicantName || "";
            var applicantPhone = d.applicantPhone || "";

            var fenQiTimes = d.fenQiTimes || 0;
            var noRepaymentTimes = d.noRepaymentTimes || 0;

            html.push('<tr>');
            html.push('<td>' + orderId + '</td>');
            html.push('<td>' + contractNo + '</td>');
            html.push('<td>' + subsidiary + '</td>');//所属公司
            html.push('<td>' + packageName + '</td>');
            html.push('<td>' + d.applyPackageMoney + '元</td>');
            html.push('<td>' + d.applyFenQiTimes + '期</td>');
            html.push('<td>' + packageMoney + '元</td>');
            html.push('<td>' + fenQiTimes + '期</td>');
            html.push('<td>' + statusDes + '</td>');

            html.push('<td>' + applicantName + '</td>');
            html.push('<td>' + noRepaymentTimes + '期</td>');
            html.push('<td>' + d.poundage + '</td>');

            if (status == "100505") {
                //html.push('<td><a href="ViewOrderDetail.html?orderid=' + orderId + '">查看</a>&nbsp&nbsp<a href="javascript:deleteOrderById(\'' + orderId + '\')">代缴费</a></td>');
                var buttonStr = '<a class="btn btn-primary" href="javascript:ShowWin(\'' + d.orderId +  '\',\'' + d.customerId + '\',\'' + d.poundage + '\')">代缴费</a>&nbsp;&nbsp;';
                buttonStr += '<a class="btn btn-success" href="javascript:SendWin(' + d.orderId +  ',\'' + d.customerId + '\',' +  d.poundage + ')">发优惠券</a>&nbsp;&nbsp;';
                html.push('<td>' + buttonStr + '</td>');
            }
            html.push('</tr>');
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

    function countListPage(data) {
        var html = [];
        g.totalPage = Math.ceil(data.totalRowNum / data.pageSize);
        //g.totalPage = 1;
        //g.currentPage = 1;
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
                }
                else {
                    //末尾少于5页
                    var len = 9 - (g.totalPage - g.currentPage);
                    for (var j = len; j >= 0; j--) {
                        if (j == 0) {
                            html.push('<a href="javascript:void(0)" style="' + css + '">' + (g.currentPage) + '</a>');
                        }
                        else {
                            html.push('<a href="javascript:void(0)" >' + (g.currentPage - j) + '</a>');
                        }
                    }
                }
                for (var i = 1; i < 6; i++) {
                    var np = g.currentPage + i;
                    if (np <= g.totalPage) {
                        html.push('<a href="javascript:void(0)" >' + np + '</a>');
                    }
                    else {
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
            }
            else {
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
                    }
                    else {
                        g.currentPage = 1;
                    }
                    break;
                case "page-pre":
                    //前一页
                    if (g.currentPage > 1) {
                        g.currentPage--;
                    }
                    else {
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
        }
        else {
            Utils.alert("当前是最后一页");
        }
    }


    //*********************************代交服务费
    //获取优惠券数据
    function GetCoupon(orderId,customerId,useMoney){
        var url = Base.serverUrl + "coupon/getAvailableCouponsByCustomerId";
        var condi = {};
        condi.login_token = g.login_token;
        condi.customerId = customerId;
        condi.useMoney = useMoney;
        condi.orderId = orderId;
        $.ajax({
            url: url, data: condi,type: "POST", dataType: "json", context: this,
            success: function (data) {
                var status = data.success || false;
                if (status) {
                    var obj = data.list || [];
                    var RadioHtml = [];
                    for(var i = 0 ; i < obj.length ; i ++){
                        if(obj[i].couponType == "0" || (obj[i].couponType == "2") ){
                            RadioHtml.push('<li><input name="couponList" type="radio" value="' + obj[i].id + '" />&nbsp;&nbsp;<label>名称:' + obj[i].title + '&nbsp;&nbsp;金额:' + obj[i].money +  '</label></li>');
                        //}else if(obj[i].couponType == "2") {
                        //    RadioHtml.push('<li><input type="radio" value="' + obj[i].id + '" />&nbsp;&nbsp;<label>名称:' + obj[i].title + '&nbsp;&nbsp;金额:' + obj[i].money +  '</label></li>');
                        }else{
                            RadioHtml.push('<li><input  name="couponList" type="radio" value="' + obj[i].id + '" />&nbsp;&nbsp;<label>名称:' + obj[i].title + '&nbsp;&nbsp;折扣:' + obj[i].discount +  '</label></li>');
                        }

                    }
                    if(obj.length ==0){
                        RadioHtml.push("此用户无优惠券可用！");
                    }
                    RadioHtml.push('<input type="hidden" id="orderId" value="' + orderId + '">');
                    $("#ul").html(RadioHtml.join(''));
                } else {
                    var msg = data.message || "获取用户优惠券失败！";
                    Utils.alert(msg);
                }
            }
        });
    }
    //显示代缴费窗口
    window.ShowWin = function (orderId,customerId,useMoney){
        GetCoupon(orderId,customerId,useMoney);//获取优惠券数据
        $('#pass').modal('show');
    	//$('#pass').modal('show').css({
    	//	width: '1000',
    	//	'margin-left': function () {
    	//		return -($(this).width() / 2);
    	//		//return 20;
    	//	}
    	//});
    };
    //代缴费
    window.DaiJiaoFei = function(id){
        $('#pass').modal('hide');
        if(confirm("你确认要执行代交操作吗?")) {
            g.httpTip.show();
            var condi = {};
            condi.orderId = $("#ul input[id='orderId']").val();
            condi.customerCouponId = $("#ul li input[type='radio']:checked").val();
            condi.login_token = g.login_token;
            var url = Base.serverUrl + "order/helpPayPoundage";
            $.ajax({
                url: url, data: condi, type: "POST", dataType: "json", context: this,
                success: function (data) {
                    var status = data.success || false;
                    if (status) {
                        Utils.alert(data.message);
                    } else {
                        var msg = data.message || "使用优惠券失败";
                        Utils.alert(msg);
                    }
                    g.httpTip.hide();
                },
                error: function (data) {
                    g.httpTip.hide();
                }
            });
        }
    };


    //显示下发优惠券窗口
    window.SendWin = function (orderId,customerId,poundage){//用户ID，订单手续费
        GetExistCoupon(orderId,customerId,poundage);//获取用户存在的优惠券数据
        $('#SendCoupon').modal('show');
    };
    //获取该用户存在的优惠券数据
    function GetExistCoupon(orderId,customerId,poundage){
        var url = Base.serverUrl + "coupon/getReceivableCoupons";
        var condi = {};
        condi.login_token = g.login_token;
        condi.orderId = orderId;
        condi.customerId = customerId;
        condi.useMoney = poundage;
        $.ajax({
            url: url, data: condi,type: "POST", dataType: "json", context: this,
            success: function (data) {
                var status = data.success || false;
                if (status) {
                    var obj = data.list || [];
                    var RadioHtml = [];
                    for(var i = 0 ; i < obj.length ; i ++){
                        var rowData = obj[i];
                        if(rowData.couponType == "0"){
                            RadioHtml.push('<li><input name="sendCouponList" type="radio" id="couponId" value="' + rowData.id + '" />&nbsp;&nbsp;<label>名称:' + rowData.title + '&nbsp;&nbsp;金额:' + rowData.money +  '</label></li>');
                        }else{
                            RadioHtml.push('<li><input name="sendCouponList" type="radio" id="couponId" value="' + rowData.id + '" />&nbsp;&nbsp;<label>名称:' + rowData.title + '&nbsp;&nbsp;折扣:' + rowData.discount +  '</label></li>');
                        }
                    }
                    RadioHtml.push('<li><input name="sendCouponList" type="radio" id="couponId" value="0" /><label>&nbsp;&nbsp;自定义金额:</label><input style="margin-top: 10px;" type="text" id="couponMoney"></li>');
                    RadioHtml.push('<input type="hidden" id="customerId" value="' + customerId + '" />');
                    RadioHtml.push('<input type="hidden" id="poundage"  value="' + poundage + '" />');
                    $("#CoponUl").html(RadioHtml.join(''));
                } else {
                    var msg = data.message || "获取用户优惠券失败！";
                    Utils.alert(msg);
                }
            }
        });
    }
    //保存下发优惠券
    window.SaveSendCoupon=function(customerId){
        var condi = {};
        condi.customerId = $("#CoponUl > input[id='customerId']").val();
        condi.couponId = $("#CoponUl li input[type='radio']:checked").val();
        condi.couponMoney = $("#CoponUl li input[id='couponMoney']").val();
        condi.poundage = $("#CoponUl > input[id='poundage']").val();
        condi.login_token = g.login_token;
        if(typeof(condi.couponId) === "undefined"){
            alert("请选择您要下发的优惠券！");
            return false;
        }
        if(condi.couponId == 0){
            if(condi.couponMoney == "") {
                alert("您选择的是自定义优惠券,请输入自定义金额！");
                return false;
            }
            if(isNaN(condi.couponMoney)){
                alert("自定义金额必须为数字,请重新输入！");
                $("li input[id='couponMoney']").focus();
                return false;
            }
        }
        if(confirm("你确认要执行下发优惠券操作吗?")) {
            g.httpTip.show();
            $('#SendCoupon').modal('hide');
            var url = Base.serverUrl + "coupon/sendDownCoupon";
            $.ajax({
                url: url, data: condi, type: "POST", dataType: "json", context: this,
                success: function (data) {
                    var status = data.success || false;
                    if (status) {
                        Utils.alert(data.message);
                    } else {
                        var msg = data.message || "下发优惠券失败";
                        Utils.alert(msg);
                    }
                    g.httpTip.hide();
                },
                error: function (data) {
                    g.httpTip.hide();
                }
            });
        }
    };
});