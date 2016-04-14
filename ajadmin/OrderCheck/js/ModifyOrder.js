/**
 * function:修改订单信息
 * author:hmgx
 * data:2015-12-21
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

    $("*").bind('keydown.Ctrl_q',function (evt){SaveData(); return false});

    //自动行高
    $('textarea').bind('keyup', function () {
        var line =  $(this).val().split("\n").length + 1;
        $(this).attr("rows",line);
    });

    //========================读取订单明细============================
    function ReadOrderInfo() {
        $.ajax({//处理字段、图片、并存放全局变量
            //url: Base.serverUrl + "order/queryOrdersByOrderIdController",
            url: Base.serverUrl + "order/getCustomerOrderByOrderIdController",
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
                g.designer = data.obj.designer;//设计师
                g.packageName = data.obj.packageName;//产品名称
                g.customerId = data.obj.customerId;//客户编号
                //字段值
                for (a in data.obj) {
                    //console.log(a + "=" + data.obj[a]);
                    if ($("#" + a.toString()).length == 1) {
                        $("#" + a.toString()).val(data.obj[a]); //字段
                    }
                }
                //图片
                ShowPic(data.list);
                //电子协议
                var phtml = [];
                phtml.push('<a href="../protocol/protocol-fenqi.html?orderId=' + g.orderId + '" target="_blank">借款协议</a>&nbsp;&nbsp;');
                phtml.push('<a href="../protocol/protocol-authorization.html?orderId=' + g.orderId + '" target="_blank">征信授权</a>&nbsp;&nbsp;');
                phtml.push('<a href="../protocol/protocol-customer-commitment.html?orderId=' + g.orderId + '" target="_blank">客户承诺</a>&nbsp;&nbsp;');
                phtml.push('<a href="../protocol/protocol-credit-counseling.html?orderId=' + g.orderId + '" target="_blank">咨询协议</a>&nbsp;&nbsp;');
                phtml.push('<a href="../protocol/protocol-transfer.html?orderId=' + g.orderId + '" target="_blank">债权转让协议</a>');
                $("#protocol").html(phtml.join(''));
                g.httpTip.hide();
                changePoundageRepaymentType( data.obj.poundageRepaymentType );//改变 服务费支付方式 显示的 TR
                sendGetProductHttp(g.companyId);//读取产品类型
                sendGetcompanys(g.companyId); //合作商户
                sendGetDicHttp();//获取其它字典数据(绑定)
            }, error: function (data) {
                g.httpTip.hide();
            }
        });
    }

    //处理显示图片
    function ShowPic(picData) {
        for (var i = 0; i < picData.length; i++) {
            var ImgType = picData[i].orderMaterialType.toString();
            var ImgUrl = picData[i].orderMaterialUrl.toString();
            var orderMaterialId = picData[i].orderMaterialId.toString();
            if(ImgType == 100713){//资源文件
                var divHtml = '<div class="' + orderMaterialId + '" style=" float:left; margin:5px; pading:5px;background:#ccc;">';
                divHtml += "<a href='" + ImgUrl + "' target='_blank' title='点击下载此资源文件'><img src='../Images/Save.png' style='margin: 5px'></a>";
                divHtml += "<img src='../Images/del.png' width='20' height='20' onclick='DelPic(" + orderMaterialId + ")' style='margin: 5px; vertical-align: bottom;cursor: pointer '>";
                divHtml += "</div>";
                $("#Img" + ImgType).append(divHtml);
            }else {
                if ($("#Img" + ImgType).length == 1) {//图片的宽度和宽度不起作用，暂不处理
                    var divHtml = '<div class="' + orderMaterialId + '" style=" float:left; margin:5px; pading:5px;background:#ccc;">';
                    divHtml += "<a href='" + ImgUrl + "' target='_blank' title='点击查看大图'><img src='" + ImgUrl + "' width='200' height='150' style='margin: 5px'></a>";
                    divHtml += "<img src='../Images/del.png' width='20' height='20' onclick='DelPic(" + orderMaterialId + ")' style='margin: 5px; vertical-align: bottom;cursor: pointer '>";
                    divHtml += "</div>";
                    $("#Img" + ImgType).append(divHtml);
                } else {
                    alert("[" + ImgType + "]类型图片，暂未处理!");
                }
            }
        }
    }

    //删除图片
    window.DelPic = function (orderMaterialId) {
        if (!confirm("您确定要删除此资源吗？")) {
            return
        }
        var url = Base.serverUrl + "order/deleteOrderMaterial";
        $.ajax({
            url: url,
            data: {login_token: g.login_token, orderMaterialId: orderMaterialId},
            type: "POST",
            dataType: "json",
            context: this,
            success: function (data) {
                var status = data.success || false;
                if (status) {
                    $("." + orderMaterialId).remove();
                }
                var msg = data.message || "删除资源失败！";
                Utils.alert(msg);
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
    function discriCard() {
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
        //alert(age);
        $("#applicantAge").val(Math.abs(age) > 100 ? "身份号号输入错误，请检查！" : age);
    }

    //========================保存数据 ============================
    function SaveData(e) {
        if ($("#packageType").val() == "" || $("#packageType").val() == null) {
            Utils.alert("请选择产品类型！");
            $("#packageType").focus();
            return false;
        }
        if ($("#subsidiaryId").val() == "" || $("#subsidiaryId").val() == null) {
            Utils.alert("请选择分公司！");
            $("#subsidiaryId").focus();
            return false;
        }
        g.httpTip.show();
        var url = Base.serverUrl + "order/updateOrderByFK";
        var condi = {};
        condi.login_token = g.login_token;
        condi.companyId = g.companyId;
        condi.designer = g.designer || "";
        condi.packageName = $("#packageType").find("option:selected").text();
        var parm = function getQueryParameters1(Obj, FormId) {
            $.each($("#" + FormId).serializeArray(), function (index, param) {
                Obj[param.name] = param.value;
            });
            return Obj;
        };
        condi = parm(condi, "editform");
        //console.log(condi);
        $.ajax({
            url: url, data: condi, type: "POST", dataType: "json", context: this,
            success: function (data) {
                //console.log("sendQueryRiskOrderListHttp",data);
                var status = data.success || false;
                var msg = data.message || "修改基本资料失败！";
                Utils.alert(msg);
                g.httpTip.hide();
            },
            error: function (data) {
                g.httpTip.hide();
            }
        });
    }

    //触发上传图片
    function orderMaterialFileBtnUp() {
        var orderMaterialFile = $("#orderMaterialFile").val() || "";
        var upType = $('#orderMaterialFile').attr("upType");
        if (orderMaterialFile !== "") {
            uploadBtnUp(upType);
        }
    }
    //触发上传压缩包
    function yaSuoBtnUp() {
        var uploadFile = $("#uploadFile").val() || "";
        var upType = $('#uploadFile').attr("upType");
        if (uploadFile !== "") {
            saveUploadFile(upType);
        }
    }

    //上传图片
    function uploadBtnUp(upType) {
        var condi = {};
        condi.login_token = g.login_token;
        condi.customerId = g.customerId;
        condi.orderId = g.orderId;
        condi.orderMaterialType = upType;
        var url = Base.serverUrl + "order/uploadOrderMaterial";
        $.ajaxFileUpload({
            url: url, data: condi,
            secureuri: false, //一般设置为false
            fileElementId: 'orderMaterialFile', //文件上传空间的id属性  <input type="file" id="file" name="file" />
            dataType: 'jsonp', //返回值类型 一般设置为json
            success: function (data, status) {
                //重新获新上传的资源文件，解决跨域的问题
                RefreshImage(g.orderId,upType);
            },
            error: function (data, status, e) {
                Utils.alert("图片上传失败");
            }
        });
    }
    //上传文件
    function saveUploadFile(upType) {
        var condi = {};
        condi.login_token = g.login_token;
        condi.customerId = g.customerId;
        condi.orderId = g.orderId;
        condi.orderMaterialType = upType;
        var url = Base.serverUrl + "order/uploadOrderMaterialFile";
        $.ajaxFileUpload({
            url: url, data: condi,
            secureuri: false, //一般设置为false
            fileElementId: 'uploadFile', //文件上传控件的id属性  <input type="file" id="file" name="file" />
            dataType: 'jsonp', //返回值类型 一般设置为json
            success: function (data, status) {
                //重新获新上传的资源文件，解决跨域的问题
                RefreshImage(g.orderId,upType);
            },
            error: function (data, status, e) {
                Utils.alert("文件上传失败");
            }
        });
    }

    //刷新图片
    function RefreshImage(orderId,upType) {
        $.ajax({
            url: Base.serverUrl + "order/getOrderMaterialsByOrderId",
            data: {login_token: g.login_token, orderId:orderId,orderMaterialType:upType},
            type: "POST", async: false, dataType: "json", context: this,
            success: function (data) {
                $("td[id^='Img" + upType +"']").each(function(){
                   $(this).html('');
                });
                ShowPic(data.list);
            }
        });
    }


    //========================绑定事件 ============================
    $("#companyId").bind("change", function () {
        var companyId = $("#companyId").val();
        sendGetProductHttp(companyId);
        sendGetcompanys(companyId);
    });
    $("#applyFenQiTimes").bind("change", countFee);
    $("#applyPackageMoney").bind("change", countFee);
    $("#applicantIdentity").bind("change", discriCard);
    $("#but_edit").bind("click", SaveData);
    $('#backid').click(function () {
        window.close()
    });

    //打开选择图片窗口
    $(".upType").bind("click", function () {
        var upType = $(this).attr("upType");
        $('#orderMaterialFile').attr("upType", upType);
        $('#orderMaterialFile').click();
    });
    //打开文件上传窗口
    $(".upFile").bind("click", function () {
        var upType = $(this).attr("upType");
        $('#uploadFile').attr("upType", upType);
        $('#uploadFile').click();
    });
    //上传图片
    $(document).on("change", "#orderMaterialFile", orderMaterialFileBtnUp);
    //上传压缩包
    $(document).on("change", "#uploadFile", yaSuoBtnUp);
});

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
    var qs = $("#applyFenQiTimes option:selected").attr("value"); //期数
    if(poundageRepaymentType == "103001") {//一次性支付
        var fl = {6: 0.04, 12: 0.07, 18: 0.1, 24: 0.13, 36: 0.16}; //费率
        var AppAmount = $("#applyPackageMoney").val();//申请金额
        var ServerCost = (AppAmount * fl[qs]).toFixed(2); //服务费
        var moneyMonth = (AppAmount / qs).toFixed(2);//月还本金
        $("#interestRate").val((fl[qs]*100).toFixed(0));//更新 服务费率
        $("#poundage").val(ServerCost);
        $("#moneyMonth").val(moneyMonth);
        $("#monthRepay").val(moneyMonth);//月还款
    }
    if(poundageRepaymentType == "103002") {//分期支付
        $("#monthInterestRate").val(0.7);
        var AppAmount = $("#applyPackageMoney").val();//申请金额
        var monthPoundage = ( parseFloat(AppAmount) * 0.007).toFixed(2); //月服务费
        var moneyMonth = (parseFloat(AppAmount) / qs).toFixed(2);//月还本金
        var monthRepay = (parseFloat(monthPoundage) + parseFloat(moneyMonth)).toFixed(2) ; //月还款
        $("#monthPoundage").val(monthPoundage);
        $("#moneyMonth").val(moneyMonth);
        $("#monthRepay").val(monthRepay);//月还款
    }
}