/**
 * author:chenxy
*/

//页面初始化
$(function(){
	var g = {};
	g.codeId = "";
	g.tout = null;
	g.httpTip = new Utils.httpTip({});
	g.choise = "1";
	$("#allprice").bind("keyup blur",countBtnUp);
	
	$("#stagingtime").bind("change",stagingTimeChange);
	/* 选择一次性支付 还是分期支付 */
	
		/* 单选 */
	$(".radio_common").click(function(){
			$(this).siblings(".radio_common").removeClass("checked").find("input").attr("checked",false);
			$(this).addClass("checked");
			$(this).find("input").attr("checked","checked");
			g.choise = $(this).find("input").val() || "1";
			if($(this).find("input").val() == "1"){
				$("#show_hidden_c").addClass("show_hidden_choise");
			}
			else if($(this).find("input").val() == "2"){
				$("#show_hidden_c").removeClass("show_hidden_choise");
			}
	})
	/* 选择分期事件 */
	$("#stagingtime li").each(function(n){
		$(this).click(function(){
			var a = n+1;
			$(this).addClass("active").siblings("li").removeClass("active");
			$("#ratelist li:nth-child("+a+")").addClass("active").siblings("li").removeClass("active");
			countBtnUp();
		})
	});
	$("#ratelist li").each(function(n){
		$(this).click(function(){
			var a = n+1;
			$(this).addClass("active").siblings("li").removeClass("active");
			$("#stagingtime li:nth-child("+a+")").addClass("active").siblings("li").removeClass("active");
			countBtnUp();
		})
	});
	function countFee(allprice,time){
		var numarr = [3,6,6,12,18,24,36];
		var ratearr = [0,0.04,0.04,0.07,0.1,0.13,0.16];

		var rate = ratearr[time] * allprice;
		var all = allprice + rate;
		var mouthprice = allprice / numarr[time];
		var obj = {};
		obj.all = all;
		obj.mouth = mouthprice.toFixed(2);
		obj.rate = rate.toFixed(2);
		obj.stagnum = numarr[time];
		obj.interestRate = ratearr[time];//服务费率
		obj.monthInterestRate = 0.7/100;//月服务费率
		obj.monthPoundage = (allprice*obj.monthInterestRate).toFixed(2);//月服务费
		obj.monthRepay = (mouthprice+allprice*obj.monthInterestRate).toFixed(2);//月还款
		return obj;
	}

	function stagingTimeChange(evt){
		var time = $("#stagingtime").val() || "";
		var ratearr = [0,0.04,0.04,0.07,0.1,0.13,0.16];
		var r = ratearr[time] || 0;
		$("#ratetext").val((r*100).toFixed(0));
	}

	
	function countBtnUp(){
		var allprice = $("#allprice").val() - 0 || 0;
		//allprice = allprice * 10000;
		var time = 0;
		$("#stagingtime li").each(function(n){
			if($(this).hasClass("active")){
				time = $(this).attr("value");
			}
		})
		//var time = $("#stagingtime").val() - 0 || 0;

		if(allprice > 0){
			var obj = countFee(allprice,time);
			//$("#capitaltext").html(allprice.toFixed(2));
			//$("#alltext").html(obj.all.toFixed(2));
			$("#feetext").html(obj.rate);
			$("#mouthtext").html(obj.mouth);
			$("#mouthtext2").html(obj.mouth);
			//$("#interestRate").html(obj.interestRate);//服务费率
			//$("#monthInterestRate").html('0.7');//月服务费率
			$("#monthPoundage").html(obj.monthPoundage);//月服务费
			$("#monthRepay").html(obj.monthRepay);//月还款
		}
		else{
			//alert("请输入分期金额");
		}
	}
});