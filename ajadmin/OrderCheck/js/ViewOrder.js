/**
 * function:查看订单信息
 * author:hmgx
 * data:2015-12-23
 */

//页面初始化
$(function () {
    var g = {};
    g.orderId = Utils.getQueryString("orderId") || "";
    g.login_token = Utils.offLineStore.get("token", false) || "";
    g.curCity = Utils.offLineStore.get("curCity", false) || "";//获取所在城市
    g.httpTip = new Utils.httpTip({});

    //验证登录状态
    var loginStatus = Utils.getUserInfo();
    if (!loginStatus) {
        alert("未登陆!");
    } else {
        g.httpTip.show();
        ReadOrderInfo();
    }

    //========================读取订单明细============================
    function ReadOrderInfo() {
        $.ajax({//处理字段、图片、并存放全局变量
            url: Base.serverUrl + "order/queryOrdersByOrderIdController",
            data: {login_token: g.login_token, orderId: g.orderId},
            type: "POST", async: false, dataType: "json", context: this,
            success: function (data) {
                //console.log(data);
                if (data.obj == null) {
                    Utils.alert("订单号[" + g.orderId + "]非法！");
                    g.httpTip.hide();
                    return false;
                }
                //存放全局变量
                g.companyId = data.obj.companyId; //品牌编号
                g.packageType = data.obj.packageType;//产品编号
                g.subsidiaryId = data.obj.subsidiaryId;//商家编号
                g.applicantMarital = data.obj.applicantMarital;//婚姻状况
                g.repaymentType = data.obj.repaymentType; //还款方式
                g.applicantStudyStatus = data.obj.applicantStudyStatus;//最高学历
                g.applicantJobNature = data.obj.applicantJobNature;//工作性质
                g.applicantCompanyNature = data.obj.applicantCompanyNature;//工作单位性质
                g.applicantCompanyIndustry = data.obj.applicantCompanyIndustry;//所属行业
                g.applicantDuties = data.obj.applicantDuties;//担当职务
                g.applicantWorkYears = data.obj.applicantWorkYears;//工作年限
                g.familyTwoRelation = data.obj.familyTwoRelation;//亲属关系
                g.designer = data.obj.designer;//设计时
                g.packageName = data.obj.packageName;//产品名称
                //字段值
                for (a in data.obj) {
                    //console.log(a + "=" + data.obj[a]);
                    if ($("#" + a.toString()).length == 1) {
                        $("#" + a.toString()).val(data.obj[a]); //字段
                        $("#" + a.toString()).attr("readonly","readonly");
                    }
                }
                //图片
                for (var i = 0; i < data.list.length; i++) {
                    var ImgType = data.list[i].orderMaterialType.toString();
                    var ImgUrl = data.list[i].orderMaterialUrl.toString();
                    if ($("#Img" + ImgType).length == 1) {//图片的宽度和宽度不起作用，暂不处理
                        $("#Img" + ImgType).append("<a href='" + ImgUrl + "' target='_blank' title='点击查看大图'><img src='" + ImgUrl + "' width='200' height='150' style='margin: 5px'></a>");
                    } else {
                        alert("[" + ImgType + "]类型图片，暂未处理!");
                    }
                }
                //电子协议
                var phtml = [];
                phtml.push('<a href="../protocol/protocol-fenqi.html?orderId=' + g.orderId + '" target="_blank">借款协议</a>&nbsp;&nbsp;');
                phtml.push('<a href="../protocol/protocol-authorization.html?orderId=' + g.orderId + '" target="_blank">征信授权</a>&nbsp;&nbsp;');
                phtml.push('<a href="../protocol/protocol-customer-commitment.html?orderId=' + g.orderId + '" target="_blank">客户承诺</a>&nbsp;&nbsp;');
                phtml.push('<a href="../protocol/protocol-credit-counseling.html?orderId=' + g.orderId + '" target="_blank">咨询协议</a>&nbsp;&nbsp;');
                phtml.push('<a href="../protocol/protocol-transfer.html?orderId=' + g.orderId + '" target="_blank">债权转让协议</a>');
                $("#protocol").html(phtml.join(''));
                g.httpTip.hide();
                sendGetProductHttp(g.companyId);//读取产品类型
                sendGetcompanys(g.companyId); //合作商户
                sendGetDicHttp();//获取其它字典数据(绑定)
            }, error: function (data) {
                g.httpTip.hide();
            }
        });
    }

    //========================获取产品信息============================
    function sendGetProductHttp(companyId) {
        g.httpTip.show();
        var url = Base.serverUrl + "order/queryProductController";
        var condi = {};
        condi.companyId = companyId;
        $.ajax({
            url: url, data: condi, type: "POST", dataType: "json", context: this, async: false,
            success: function (data) {
                //console.log("sendGetProductHttp",data);
                var status = data.success || false;
                if (status) {
                    changeProductSelectHtml(data);
                } else {
                    var msg = data.message || "获取产品数据失败";
                    Utils.alert(msg);
                }
                g.httpTip.hide();
            },
            error: function (data) {
                g.httpTip.hide();
            }
        });
    }

    function changeProductSelectHtml(obj) {
        var data = obj.list || [];
        var option = [];
        for (var i = 0, len = data.length; i < len; i++) {
            var d = data[i];
            var id = d.productId || "";
            var cid = d.companyId || "";
            var name = d.productName || "";
            option.push('<option value="' + id + '">' + name + '</option>');
        }
        $("#packageType").html(option.join(''));
        if (g.packageType != "" && g.companyId != "") {
            $("#packageType").val(g.packageType);
        }
    }

    //========================获取合作商户列表 ============================
    function sendGetcompanys(companyId) {
        g.httpTip.show();
        var url = Base.serverUrl + "subsidiary/getSubsidiarys";
        var condi = {};
        condi.brandtype = companyId;
        $.ajax({
            url: url, data: condi, type: "POST", dataType: "json", context: this,
            success: function (data) {
                //console.log("sendGetNavigationKeyHttp",data);
                var status = data.success || false;
                if (status) {
                    changeSelect(data);
                } else {
                    var msg = data.message || "获取公司信息字典数据失败";
                    Utils.alert(msg);
                }
                g.httpTip.hide();
            }, error: function (data) {
                g.httpTip.hide();
            }
        });
    }

    function changeSelect(obj) {
        var data = obj.list || {};
        var option = [];
        for (var i = 0; i < data.length; i++) {
            var name = data[i].name;
            var conf = (g.curCity).indexOf(data[i].cityName) || false;
            if (conf != -1) {
                option.push('<option selected="true" value="' + data[i].id + '">' + name + '</option>');
                g.curCity = "1";//防止重复
            } else {
                option.push('<option value="' + data[i].id + '">' + name + '</option>');
            }
        }
        $("#subsidiaryId").html(option.join(''));
        $("#subsidiaryId").val(g.subsidiaryId);
    }

    //========================费率计算 ============================
    function countFee() {
        var qs = $("#applyFenQiTimes option:selected").attr("value"); //期数
        var fl = {3: 0, 6: 0.04, 12: 0.07, 18: 0.1, 24: 0.13, 36: 0.16}; //费率
        var AppAmount = $("#applyPackageMoney").val();//申请金额
        var ServerCost = (AppAmount * fl[qs]).toFixed(2); //服务费
        var mouthprice = (AppAmount / qs).toFixed(2);//月还金额
        $("#poundage").val(ServerCost);
        $("#moneyMonth").val(mouthprice);
    }

    //========================获取字典信息 ============================
    function sendGetDicHttp() {
        var url = Base.serverUrl + "baseCodeController/getBaseCodeByParents";
        $.ajax({
            url: url,
            data: {parents: "1003,1008,1009,10010,1011,1012,1013,1014,1015,1016"},
            type: "POST",
            dataType: "json",
            context: this,
            success: function (data) {
                //console.log("sendGetDicHttp",data);
                var status = data.success || false;
                if (status) {
                    var obj = data.obj || {};
                    //console.log(obj[1003]);
                    changeSelectHtml(obj);
                } else {
                    var msg = data.message || "获取字典数据失败";
                    Utils.alert(msg);
                }
                g.httpTip.hide();
            },
            error: function (data) {
                g.httpTip.hide();
            }
        });
    }

    //========================填充其它字段信息 ============================
    function changeSelectHtml(obj) {
        var repaymentType = obj["1008"] || {};
        for (var k in repaymentType) {
            g.repaymentType = k;
        }
        //婚姻状况、还款方式、最高学历、工作性质、工作单位性质、所属行业、担当职务、工作年限、亲属关系
        var parents = ["1003", "1008", "1009", "1011", "1012", "1013", "1014", "1015", "1016"];
        var ids = ["applicantMarital", "repaymentType", "applicantStudyStatus", "applicantJobNature", "applicantCompanyNature", "applicantCompanyIndustry", "applicantDuties", "applicantWorkYears", "familyTwoRelation"]

        for (var i = 0, len = parents.length; i < len; i++) {
            var data = obj[parents[i]] || {};
            var option = [];
            for (var k in data) {
                var id = k || "";
                var name = data[k] || "";
                option.push('<option value="' + id + '">' + name + '</option>');
            }
            //alert(ids[i] + "\n" + option.join());
            $("#" + ids[i]).html(option.join(''));
            $("#" + ids[i]).val(eval("g." + ids[i]));//默认选择
        }
    }

    //========================根据身份证号计算年龄 ============================
    function discriCard(){
        var UUserCard = $("#applicantIdentity").val();
        //获取出生日期
        UUserCard.substring(6, 10) + "-" + UUserCard.substring(10, 12) + "-" + UUserCard.substring(12, 14);
        //获取性别
        //if (parseInt(UUserCard.substr(16, 1)) % 2 == 1) {
        //    alert("男");
        //} else {
        //    alert("女");
        //}
        //获取年龄
        var myDate = new Date();
        var month = myDate.getMonth() + 1;
        var day = myDate.getDate();
        var age = myDate.getFullYear() - UUserCard.substring(6, 10) - 1;
        if (UUserCard.substring(10, 12) < month || UUserCard.substring(10, 12) == month && UUserCard.substring(12, 14) <= day) {
            age++;
        }
        $("#applicantAge").val( Math.abs(age)>100?"身份号号输入错误，请检查！":age);
    }

    //========================绑定事件 ============================
    $("#companyId").bind("change",function(){
        var companyId = $("#companyId").val();
        sendGetProductHttp(companyId );
        sendGetcompanys( companyId );
    });
    $("#applyFenQiTimes").bind("change", countFee);
    $("#applyPackageMoney").bind("change", countFee);
    $("#applicantIdentity").bind("change", discriCard);
    $('#backid').click(function () {
        window.close();
    });

});