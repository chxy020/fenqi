/**
 * author:chenxy
*/

//页面初始化
$(function(){
	var g = {};
	g.phone = "";
	g.imgCodeId = "";
	g.sendCode = false;
	g.sendTime = 60;
	g.login_token = Utils.offLineStore.get("token",false) || "";
	g.httpTip = new Utils.httpTip({});

	//验证登录状态
	var loginStatus = Utils.getUserInfo();
	if(!loginStatus){
		//未登录
	}
	else{
	}

	//合作商家经过效果
	$.fn.businessHoverFun();

	//获取轮播图数据
	sendGetBannerImageByNavigationKey();

	function sendGetBannerImageByNavigationKey(){
		//g.httpTip.show();
		var condi = {};
		condi.navigationKey = "INDEX";

		var url = Base.serverUrl + "bannerImage/getBannerImageByNavigationKey";
		$.ajax({
			url:url,
			data:condi,
			type:"POST",
			dataType:"json",
			context:this,
			success: function(data){
				console.log("sendGetBannerImageByNavigationKey",data);
				var status = data.success || false;
				if(status){
					changeBannerHtml(data);
				}
				else{
					var msg = data.message || "获取首页轮播图数据失败";
					Utils.alert(msg);
				}
				//g.httpTip.hide();
			},
			error:function(data){
				//g.httpTip.hide();
			}
		});
	}

	function changeBannerHtml(data){
		var list = data.list || [];
		var html = [];
		for(var i = 0, len = list.length; i < len; i++){
			var d = list[i] || {};
			var deleted = d.deleted || 0;
			if(deleted === 1){
				continue;
			}
			var bmUrl = d.bmUrl || "";
			var bmClickUrl = d.bmClickUrl || "javascript:void(0);";
			if(bmUrl !== ""){
				html.push('<li style="background:url(' + bmUrl + ') top center no-repeat"><a href="' + bmClickUrl + '"><div class="ui-wrap"></div></a></li>');
			}
		}
		$("#bannerSlider").html(html.join(''));

		//初始化
		$('#bannerSlider').carouFredSel({
			width: '100%',
			height: 540,
			prev: '#prev',
			next: '#next',
			pagination: "#pager",
			//auto:false,
			scroll:{
				items: 1,
				duration: 1000,
				fx:'crossfade',
				timeoutDuration: 7000
			},
			swipe: {
				onMouse: true,
				onTouch: true
			}
		});

	}

});

$(document).ready(function(){
//	首页计算器
	$("#do_btn").bind("click",countBtnUp2);

	function countFee2(allprice,time){
		var numarr = [3,6,6,12,18,24,36];
		var ratearr = [0,0.04,0.07,0.1,0.13,0.16];

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

	function countBtnUp2(){
		var allprice = $("#allprice2").val() - 0 || 0;
		var time = $("#select-option option:selected").attr("value");

		if(allprice > 0){
			var obj = countFee2(allprice,time);

			//$("#capitaltext").html(allprice.toFixed(2));
			//$("#alltext").html(obj.all);
			$("#feetext2").html(obj.rate+"万元");
			$("#mouthtext2").html(obj.mouth+"万元");
		}
	}
	
//二维码鼠标经过
	$(".weixin_er a.er").hover(function(){
		$(this).parents(".weixin_er").find(".big_er").fadeIn(300);				
	},function(){
		$(this).parents(".weixin_er").find(".big_er").fadeOut(100);		
	})
	
//ready_end	
})











