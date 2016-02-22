/**
 * Created by wlx on 2016/2/19.
 */
var Hmgx = {
    openWin: function (url, name, iWidth, iHeight) {
        if(typeof(iWidth) === "undefined"){
            iWidth = 720;
        }
        if(typeof(iHeight) === "undefined"){
            iHeight = 620;
        }
        //获得窗口的垂直位置
        var iTop = (window.screen.availHeight - 30 - iHeight) / 2;
        //获得窗口的水平位置
        var iLeft = (window.screen.availWidth - 10 - iWidth) / 2;
        window.open(url, name, 'height=' + iHeight + ',,innerHeight=' + iHeight + ',width=' + iWidth + ',innerWidth=' + iWidth + ',top=' + iTop + ',left=' + iLeft + ',status=no,toolbar=no,menubar=no,location=no,resizable=no,scrollbars=1,titlebar=no');
    }
};
