/**
 * Created by wlx on 2016/2/19.
 */
var Hmgx = {
    showParam:false,
    openWin: function (url, name, iWidth, iHeight) {
        if (typeof(iWidth) === "undefined") {
            iWidth = 720;
        }
        if (typeof(iHeight) === "undefined") {
            iHeight = 620;
        }
        //获得窗口的垂直位置
        var iTop = (window.screen.availHeight - 30 - iHeight) / 2;
        //获得窗口的水平位置
        var iLeft = (window.screen.availWidth - 10 - iWidth) / 2;
        window.open(url, name, 'height=' + iHeight + ',,innerHeight=' + iHeight + ',width=' + iWidth + ',innerWidth=' + iWidth + ',top=' + iTop + ',left=' + iLeft + ',status=no,toolbar=no,menubar=no,location=no,resizable=no,scrollbars=1,titlebar=no');
    },
    getQueryParamet: function (FormId, ParamObj) {
        if (typeof(ParamObj) !== "object") {
            ParamObj = {};
        }
        $.each($("#" + FormId).serializeArray(), function (index, param) {
            ParamObj[param.name] = param.value;
        });
        return ParamObj;
    },
    serializeDownload: function (Url, FormId, AddedParam, DownloadIframe) {
        if (typeof(DownloadIframe) === "undefined") {
            DownloadIframe = "_new";
        }
        var form = $('<form />', {
            action: Url,
            method: "post",
            target: DownloadIframe,
            style: "display:none;"
        }).appendTo('body');
        //处理表单参数
        $.each($('#' + FormId).serializeArray(), function (index) {
            if(Hmgx.showParam)alert( this['name']  + "=" + this['value']);
            form.append('<input type="hidden" name="' + this['name'] + '" value="' + this['value'] + '" />');
        });
        //处理附加参数
        if (typeof(AddedParam) === "object") {
            for (var Key in AddedParam) {
                if(Hmgx.showParam)alert( Key  + "=" + AddedParam[Key]);
                form.append('<input type="hidden" name="' + Key + '" value="' + AddedParam[Key] + '" />');
            }
        }
        form.submit();
        setTimeout(function () {
            form.remove()
        }, 100);
    }
};
