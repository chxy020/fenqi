/**
 * author:hmgx
 * data:2016-1-7
 */

//http://111.198.136.245:8080/order/queryOrdersByOrderIdController
//页面初始化
$(function () {
    var g = {};
    g.phone = "";
    g.imgCodeId = "";
    g.sendCode = false;
    g.sendTime = 60;
    g.orderId = Utils.getQueryString("orderid") || "";
    g.login_token = Utils.offLineStore.get("token", false) || "";
    g.phoneNumber = Utils.offLineStore.get("user_phoneNumber", false) || "";
    g.usersId = Utils.offLineStore.get("user_usersId", false) || "";
    g.usersName = Utils.offLineStore.get("user_usersName", false) || "";
    g.httpTip = new Utils.httpTip({});

    g.productDic = {};
    g.selectDic = {};

    //验证登录状态
    var loginStatus = Utils.getUserInfo();
    if (!loginStatus) {
        alert("请先登陆!");
    } else {
        sendGetOrderInfoHttp();
    }

    //******************************获取订单信息
    function sendGetOrderInfoHttp() {
        var url = Base.serverUrl + "order/getOrderDescByOrderId";
        var condi = {};
        condi.login_token = g.login_token;
        condi.orderId = g.orderId;
        g.httpTip.show();
        $.ajax({
            url: url, data: condi, type: "POST", dataType: "json", context: this,
            success: function (data) {
                //console.log(data);
                var status = data.success || false;
                if (status) {
                    //console.log(data.list);
                    changeOrderInfoHtml(data.obj,data.list);
                } else {
                    var msg = data.message || "获取订单信息失败";
                    Utils.alert(msg);
                }
                g.httpTip.hide();
            },
            error: function (data) {
                g.httpTip.hide();
            }
        });
    }
    function changeOrderInfoHtml(data,ImgData) {
        var JsonObj = {};
        var html = [];
        html.push('<table class="table table-bordered table-hover definewidth m10" >');
        for (var i = 0; i < data.length; i++) {
            html.push('<tr><td width="16%" class="tableleft">' + data[i].orderColumnName + '</td>');
            html.push('<td id="TD' + data[i].orderColumn  + '">' + data[i].orderColumnValue + '</td></tr>');
            JsonObj[data[i].orderColumn] = data[i].orderColumnValue;
        }
        if(data.length ==0){
            html.push('<tr><td style="text-align: center" colspan="2">您没有权限查看订单字段，请在[角色管理]-[订单字段权限]里设置！</td></tr>');
        }
        html.push('<tr><td style="text-align: center" colspan="2"><button type="button" class="btn btn-success" name="backid" id="backid">返回列表</button></td></tr>');
        html.push('</table>');
        $("#TableInfo").html(html.join(''));
        $('#backid').click(function () {
            window.location.href = "orderquery.html";
        });

        //处理服务费
        if(JsonObj["poundage"] == 0){
            $("#TDpoundage").html("无服务费");
        }
        //处理电子协议
        if(JsonObj["electronicAgreement"] == null){
            var phtml = [];
            phtml.push('<a href="../protocol/protocol-fenqi.html?orderId=' + g.orderId + '" target="_blank">借款协议</a>&nbsp;&nbsp;');
            phtml.push('<a href="../protocol/protocol-authorization.html?orderId=' + g.orderId + '" target="_blank">征信授权</a>&nbsp;&nbsp;');
            phtml.push('<a href="../protocol/protocol-customer-commitment.html?orderId=' + g.orderId + '" target="_blank">客户承诺</a>&nbsp;&nbsp;');
            phtml.push('<a href="../protocol/protocol-credit-counseling.html?orderId=' + g.orderId + '" target="_blank">咨询协议</a>&nbsp;&nbsp;');
            phtml.push('<a href="../protocol/protocol-transfer.html?orderId=' + g.orderId + '" target="_blank">债权转让协议</a>');
            $("#TDelectronicAgreement").html(phtml.join(''));
        }
        //处理身份证
        if(JsonObj["identityImage"] == null){
            var ImgHtml = [];
            for(var i = 0 ; i <  ImgData.length ; i++){
                if( ImgData[i].orderMaterialType == "100701"){
                    ImgHtml.push("<a href='" + ImgData[i].orderMaterialUrl + "' target='_blank' title='点击查看大图'><img src='" + ImgData[i].orderMaterialUrl + "' width='200' height='150' style='margin: 5px'></a>");
                }
            }
            $("#TDidentityImage").html(ImgHtml.join(''));
        }
        //房产证资料
        if(JsonObj["housePropertyImage"] == null){
            var ImgHtml = [];
            for(var i = 0 ; i <  ImgData.length ; i++){
                if( ImgData[i].orderMaterialType == "100702"){
                    ImgHtml.push("<a href='" + ImgData[i].orderMaterialUrl + "' target='_blank' title='点击查看大图'><img src='" + ImgData[i].orderMaterialUrl + "' width='200' height='150' style='margin: 5px'></a>");
                }
            }
            $("#TDhousePropertyImage").html(ImgHtml.join(''));
        }
        //console.log(ImgData);
    }
});