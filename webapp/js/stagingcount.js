/**
 * author:chenxy
*/

//页面初始化
$(function(){
	var g = {};
	g.codeId = "";
	g.tout = null;
	g.httpTip = new Utils.httpTip({});

	$("#allprice").bind("keyup blur",countBtnUp);
	
	$("#stagingtime").bind("change",stagingTimeChange);
	
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
		}
		else{
			//alert("请输入分期金额");
		}
	}
});