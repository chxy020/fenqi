/**
 * file:登录
 * author:chenxy
 */

//页面初始化
$(function () {
    var g = {};
    g.phone = "";
    g.imgCodeId = "";
    g.sendCode = false;
    g.sendTime = 60;
    g.login_token = Utils.offLineStore.get("token", false) || "";
    g.httpTip = new Utils.httpTip({});
    g.SubsidiaryIdData = []; //分公司数据
    g.usersId = Utils.getQueryString("usersId", false) || "";

    //验证登录状态
    var loginStatus = Utils.getUserInfo();
    if (!loginStatus) {
        alert("请登陆系统！");
    } else {
        if (!Number(g.usersId)) {
            alert("用户编号非法！");
        } else {
            sendGetCompanyInfoHttp();//获取品牌
            GetSubsidiarys(); //获取分公司
            GetUserInfo(); //获取用户信息
        }
    }

    $('#updateBut').click(function () {
        SaveData();
    });
    $('#backid').click(function () {
        window.location.href = "index.html";
    });
    $("#companyId").bind("change", function () {
        FillSubsidiaryId();
    });

    // ============================获取用户信息 ============================
    function GetUserInfo() {
        g.httpTip.show();
        var url = Base.serverUrl + "user/queryUsersController";
        var condi = {};
        condi.login_token = g.login_token;
        condi.usersId = g.usersId;
        condi.pageSize = 1;
        condi.currentPageNum = 1;
        $.ajax({
            url: url, data: condi, type: "POST", dataType: "json", context: this, async:false,
            success: function (data) {
                //console.log(data);
                var status = data.success || false;
                if (status) {
                    var obj = data.list || [];
                    $("#usersPhone").val(obj[0].usersPhone);
                    $("#usersName").val(obj[0].usersName);
                    $("#companyId").val(obj[0].companyId);
                    FillSubsidiaryId();
                    $("#subsidiaryId").val(obj[0].subsidiaryId);
                } else {
                    var msg = data.message || "获取用户信息失败!";
                    Utils.alert(msg);
                }
                g.httpTip.hide();
            },
            error: function (data) {
                g.httpTip.hide();
            }
        });
    }

    // ============================获取品牌 ============================
    function sendGetCompanyInfoHttp() {
        g.httpTip.show();
        var url = Base.serverUrl + "order/queryCompanyController";
        var condi = {};
        condi.pageSize = 1000000;
        $.ajax({
            url: url, data: condi, type: "POST", dataType: "json", context: this,async:false,
            success: function (data) {
                var status = data.success || false;
                if (status) {
                    var obj = data.list || [];
                    changeSelectHtml(obj);
                } else {
                    var msg = data.message || "获取公司数据失败!";
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
        //console.log(obj);
        var data = obj || {};
        var option = [];
        option.push('<option value="">请选择品牌！</option>');
        for (var i = 0, len = data.length; i < len; i++) {
            option.push('<option value="' + data[i].companyId + '">' + data[i].companyName + '</option>');
        }
        $("#companyId").html(option.join(''));
    }

    // ============================获取合作商户列表 ============================
    function GetSubsidiarys() {
        g.httpTip.show();
        var url = Base.serverUrl + "subsidiary/getSubsidiarys";
        var condi = {};
        condi.pageSize = 1000;
        $.ajax({
            url: url, data: condi, type: "POST", dataType: "json", context: this,async:false,
            success: function (data) {
                g.SubsidiaryIdData = data.list || [];
                g.httpTip.hide();
            }, error: function (data) {
                g.httpTip.hide();
            }
        });
    }

    function FillSubsidiaryId() {
        var companyId = $("#companyId").val();
        var option = [];
        option.push('<option value="">请选择分公司！</option>');
        for (var i = 0; i < g.SubsidiaryIdData.length; i++) {
            if (companyId == g.SubsidiaryIdData[i].brandtype) {
                option.push('<option value="' + g.SubsidiaryIdData[i].id + '">' + g.SubsidiaryIdData[i].name + '</option>');
            }
        }
        $("#subsidiaryId").html(option.join(''));
    }

    //修改
    function SaveData() {
        var condi = {};
        condi.usersId = g.usersId;
        condi.companyId = $("#companyId").val();
        condi.subsidiaryId = $("#subsidiaryId").val();
        condi.usersName = $("#usersName").val();
        condi.usersPhone = $("#usersPhone").val();
        if(condi.companyId == ""){
            alert("请选择品牌！");
            return false;
        }
        var url = Base.serverUrl + "user/updateUsersController";
        g.httpTip.show();
        $.ajax({
            url: url, type: "POST", data: condi, dataType: "json", context: this,
            success: function (data) {
                //console.log("Save", data);
                var status = data.success || false;
                if (status) {
                    Utils.alert("账户修改成功");
                } else {
                    alert(data.message);
                }
                g.httpTip.hide();
            },
            error: function (data) {
                g.httpTip.hide();
            }
        });
    }
});