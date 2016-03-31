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
	g.channel = Utils.getQueryString("channel") || "";
	if(g.channel != ""){Utils.offLineStore.set("channel",g.channel,false);}	
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

	/* “我要分期”判断是否登录 */
	$("#fenqi_btn1,#fenqi_btn2").bind("click",fenqi_btn_click);
	function fenqi_btn_click(){
		if(!loginStatus){
			location.href = "/anjia/login.html?p=1";
		}else{
			location.href = "/anjia/mystaging.html";
		}
	}
	/* 选择一次性支付 还是分期支付 */	
		/* 单选 */
	$(".radio_common").click(function(){
			$(this).siblings(".radio_common").removeClass("checked").find("input").attr("checked",false);
			$(this).addClass("checked");
			$(this).find("input").attr("checked","checked");
			g.choise = $(this).find("input").val() || "1";
			if($(this).find("input").val() == "2"){
				$("#one_or_other_c").addClass("one_or_other_show");
			}
			else if($(this).find("input").val() == "1"){
				$("#one_or_other_c").removeClass("one_or_other_show");
			}
	})
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
				//console.log("sendGetBannerImageByNavigationKey",data);
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
				html.push('<li style="background:url(' + bmUrl + ') top center no-repeat"><a target="_blank" href="' + bmClickUrl + '"><div class="ui-wrap"></div></a></li>');
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
				timeoutDuration: 5000
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
		var numarr = [3,6,12,18,24,36];
		var ratearr = [0,0.04,0.07,0.1,0.13,0.16];
		var allprice_l=allprice;
		var rate = ratearr[time] * allprice_l;
		var all = allprice_l + rate;
		var mouthprice = allprice_l / numarr[time];
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

	function countBtnUp2(){
		var allprice = $("#allprice").val() - 0 || 0;
		var time = $("#select-option option:selected").attr("value") || "";

		if(allprice > 0 && time != ""){
			var obj = countFee2(allprice,time);

			//$("#capitaltext").html(allprice.toFixed(2));
			//$("#alltext").html(obj.all);
			$("#feetext2").html(obj.rate+"元");
			$("#mouthtext2").html(obj.mouth+"元");
			$("#mouthtext4").html(obj.mouth+"元");
			//$("#interestRate").html(obj.interestRate);//服务费率
			//$("#monthInterestRate").html('0.7');//月服务费率
			$("#monthPoundage").html(obj.monthPoundage+"元");//月服务费
			$("#monthRepay").html(obj.monthRepay+"元");//月还款
		}else{
			Utils.alert("请输入分期金额并选择分期期数!");
		}
	}
	/* 添加千位分隔符 */
	function formatNumber(num){  
		 if(!(/^(\+|-)?(\d+)(\.\d+)?$/).test(num)){  
		  return num;  
		 }  
		 var a = RegExp.$1,b = RegExp.$2,c = RegExp.$3;  
		 var re = new RegExp().compile("(\\d)(\\d{3})(,|$)"); 
		 var re2=re.test(b) || false;		 
		 while(re2){  
		  b = b.replace(re,"$1,$2$3");  
		 }  
		 return a +""+ b +""+ c;  
		}
	
//二维码鼠标经过
	$(".weixin_er a.er").hover(function(){
		$(this).parents(".weixin_er").find(".big_er").fadeIn(300);				
	},function(){
		$(this).parents(".weixin_er").find(".big_er").fadeOut(100);		
	})
	
/* 平台优势 动态效果 */
	$(".staging-step-box  .staging-step-item .staging-ico").each(function(){
	$(this).hover(
	   function(){
		var ths=$(this);
            ths.siblings(".li3").animate({'left':'100px','opacity':"0"},10,function(){
			ths.siblings(".txt1").animate({"left":"0","opacity":"1"},150,function(){
			ths.siblings(".txt2").animate({"left":"0","opacity":"1"},150)
			})
		 })
	   },
	   function(){
		   var ths=$(this);
		   ths.siblings(".li3").css({"left":"0","opacity":"1"})}
	   )

})

/* 返回顶部效果 */
	$(window).load(function(){
		backTop();
	})
	$(window).on("scroll",backTop);
	
	$(".weixin_er a.top").click(function(){
		$(".weixin_er a.top").css({"background":"url('../res/images/right_box_img9.png') no-repeat center center"});
		$(window).off("scroll",backTop); 		
	$('html,body').animate({scrollTop:0},900,function(){if ($(this).scrollTop() <= 450){$(window).on("scroll",backTop);$(".weixin_er").fadeOut(0)}});
		
	});
	
//ready_end	
})

/* 返回顶部效果 */
	function backTop(){
		if ($(this).scrollTop() >= 200) {
				$(".weixin_er a.top").css({"background":"none","background":"url('../res/images/right_box_img2.png') no-repeat center center"});
		}else{
			$(".weixin_er a.top").css({"background":"url('../res/images/right_box_img9.png') no-repeat center center"});
		  }
		 if ($(this).scrollTop() <= 350){$(".weixin_er").fadeOut(0)}else{$(".weixin_er").fadeIn(300)} 
	}









