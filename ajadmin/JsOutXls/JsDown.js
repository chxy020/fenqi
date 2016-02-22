/**
 * Created by wlx on 2016/2/19.
 */
function down(TabId, SheetName) {
    formattable($("#" + TabId).html(), SheetName);
}
function formattable(tableHtml, sheetName) {
    var template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--><meta http-equiv="content-type" content="text/plain; charset=UTF-8"/></head><body><table>{table}</table></body></html>';
    var ctx = {
        worksheet: name,
        table: tableHtml
    };
    try {
        var downloadLink = document.createElement("a");
        downloadLink.href = 'data:application/vnd.ms-excel;base64,' + base64(format(template, ctx));
        downloadLink.download = sheetName + ".xls";
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    }catch(e){
        alert(e);
    }

    // window.open('data:application/vnd.ms-excel;base64,'+ base64(format(template, ctx)));
}


function base64(s) {
    return $.base64.btoa(unescape(encodeURIComponent(s)));
}


var format = function (s, c) {
    return s.replace(/{(\w+)}/g, function (m, p) {
        return c[p];
    });
}