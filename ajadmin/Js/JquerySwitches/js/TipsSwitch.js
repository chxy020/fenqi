/**
 * Created by wlx on 2016/1/28.
 * function: 任务开关
 */
$(document).ready(function (e) {
    var roleId = Utils.offLineStore.get("user_roleId", false) || "";
    var FinancialObj = {};
    if (roleId == "20151118000001") {//财务提示开关
        FinancialObj.Status = true;
        $("input[id='FinancialTips']").lc_switch();
        // triggered each time a field changes status 触发更新
        $('body').delegate('.lcs_check', 'lcs-statuschange', function () {
            var status = ($(this).is(':checked')) ? 'checked' : 'unchecked';
        });
        // triggered each time a field is checked  选择
        $('body').delegate('.lcs_check', 'lcs-on', function () {
            FinancialObj.Status = true;
            SetTimer();
        });
        // triggered each time a is unchecked 取消选择
        $('body').delegate('.lcs_check', 'lcs-off', function () {
            FinancialObj.Status = false;
            SetTimer();
        });
        SetTimer();
    }

    function SetTimer() {
        if (FinancialObj.Status) {
            $(".lcs_wrap").attr("title", "提醒[财务待放款]的订单！");
            FinancialObj.TimerId = setInterval(function () {
                GetTipsData("order/queryFinancialTips", {login_token: Utils.offLineStore.get("token", false) || ""});
            }, 120000);
        } else {
            $(".lcs_wrap").attr("title", "已禁用提醒功能！");
            clearInterval(FinancialObj.TimerId);
            message.clear();
        }
    }

    function GetTipsData(Url, Parar) {

        if (!$('#TipsModal').is(':hidden')) {
            return;
        }
        $.ajax({
            url: Base.serverUrl + Url, data: Parar, type: "POST", dataType: "json", context: this,
            success: function (data) {
                var DataList = data.list || [];
                $('#TipsModal').modal('show');
                $("#TipsList").html("您有[<span style='color: red'>" + DataList.length + "</span>]条待放款的订单，请及时处理！");
                message.show();
                //CarateTable("TipsList",DataList);
            },
            error: function (data) {
                alert("获取提示数据失败！");
            }
        });
    }

    function CarateTable(TableId, Data) {
        var html = [];
        html.push('<table id="orderinfotable" class="table table-bordered table-hover definewidth m10">')
        html.push('<tr><td class="tableleft">订单号</td><td>产品名称</td><td>申请人</td></tr>');
        for (var i = 0; i < Data.length; i++) {
            var RowHtml = "<tr><td>" + Data[i].orderId + "</td><td>" + Data[i].packageName + "</td><td>" + Data[i].applicantName + "</td>";
            html.push(RowHtml);
        }
        html.push('</table>');
        $("#" + TableId).html(html.join(''));
    }

    // 使用message对象封装消息
    var message = {
        Status: false,
        Title: document.title,
        TimerId: 0,
        show: function () {// 显示新消息提示
            if(message.TimerId == 0){
                message.TimerId = setInterval(function () { message.ChangeTitle(); },400);
            }
            return [message.TimerId, message.Title];
        },
        clear: function () { // 取消新消息提示
            clearTimeout(message.TimerId);
            message.TimerId = 0;
            document.title = message.Title;
        },
        ChangeTitle: function(){ // 更改标题栏
            var title = message.Title.replace("【　　　】", "").replace("【新消息】", "");
            if(message.Status){
                document.title = "【新消息】" + title;
            }else{
                document.title = "【　　　】" + title;
            }
            message.Status?message.Status=false:message.Status=true;
            //console.log(document.title);
        }
    };

    $('#TipsModal').on('hide.bs.modal', function () {
        message.clear();
    });

});