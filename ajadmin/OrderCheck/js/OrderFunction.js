/**
 * function:风控订单功能扩展方法
 * author:hmgx
 * date:2015-12-16
 */
function getOrderStatus(StatusCode){
    switch (StatusCode){
        case "100501":
			return "未完成";
		case "100502": 
			return "商家审核中";
		case "100503": 
			return "风控审核中";
		case "10050301":
			return "风控初审中";
		case "10050302": 
			return"风控复审中";
		case "10050303": 
			return"风控终审中";
		case "100504": 
			return"已删除";
		case "100505": 
			return"待缴费";
		case "100506": 
			return"待放款";
		case "100507":
			return "还款中";
		case "100508": 
			return"已还清";
		case "100509":
			return"拒绝";
		case "100510": 
			return"已逾期";
		case "100511":
			return "已违约";
		case "100512":
			return "逾期已还清";
		case "100513":
			return "违约已还清";
        default :
            return "错误状态";
    }
}
function getCheckResult(CheckCode){
	switch (CheckCode){
		case "0":
			return "通过";
		case "1":
			return "拒绝";
		case "2":
			return "退回";
		case "3":
			return "审核中";
		default :
			return "错误状态";
	}
}

function getCheckStatus(CheckCode){
	switch(CheckCode){
		case "":
			return "";
		case null:
			return "";
		case "101701":
			return "商家审批";
		case "101702":
			return "终审";
		case "101703":
			return "复审";
		case "101704":
			return "初审";
		default :
			return "错误状态";
	}
}


function getQueryParameters1(Obj,FormId){
	$.each($("#" + FormId).serializeArray(),function(index,param) {
		Obj[param.name] = param.value;
	});
	return Obj;
}