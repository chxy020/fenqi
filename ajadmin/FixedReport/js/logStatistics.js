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

    //验证登录状态
    var loginStatus = Utils.getUserInfo();
    if (!loginStatus) {
        alert("您未登陆！");
    } else {
        queryOrderList();
    }

    $("#querybtn").bind("click", queryOrderList);

    function queryOrderList() {
        g.currentPage = 1;
        sendQueryOrderListHttp();
    }


    //获取订单数据
    function sendQueryOrderListHttp() {
        g.httpTip.show();
        var url = Base.serverUrl + "oplog/getLoginCount";
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
        html.push('<th>类型</th>');
        html.push('<th>0:00~7:00</th>');
        for(var i = 8; i < 24 ; i++){
            html.push('<th>' + i + ':00</th>');
        }
        html.push('</tr>');

        var obj = data.list || [];
        for (var i = 0, len = obj.length; i < len; i++) {
            var d = obj[i];
            var deleted = d.deleted - 0 || 0;
            if (deleted !== 0) {
                continue;
            }
            var orderId = d.orderId || "";
            html.push('<tr>');
            if(d.platform ==1){
                html.push('<td>移动端</td>');
            }else if(d.platform ==3){
                html.push('<td>PC端</td>');
            }
            html.push('<td>' + ( parseInt((d.h1||0),10) + parseInt((d.h2||0),10) + parseInt((d.h3||0),10) + parseInt((d.h4||0),10) + parseInt((d.h5||0),10) + parseInt((d.h6||0),10) + parseInt((d.h7||0),10) ) + '</td>');

            for(var k = 8; k < 24 ; k++){
                html.push('<td>' + (eval("d.h" + k) || "") + '</td>');
            }
            html.push('</tr>');
        }
        html.push('</table>');

        $("#orderlist").html(html.join(''));
        //var pobj = data.obj || {};
        //if (obj.length > 0) {
        //    var page = countListPage(pobj);
        //    html.push(page);
        //} else {
        //    Utils.alert("数据为空");
        //}
        //$("#orderlistpage a").bind("click", pageClick);
    }

    //分页处理
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

});