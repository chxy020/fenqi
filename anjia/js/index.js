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












