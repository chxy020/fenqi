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
	g.loginStatus = Utils.getUserInfo();
	if(!g.loginStatus){
		//未登录
	}
	else{
		getUserInfo();
	}

	//获取轮播图数据
	//sendGetBannerImageByNavigationKey();


	$("#person-btn").bind("click",personBtnUp);
	$("#bottom-ul > li").bind("click",bottomBtnUp);

	//获取个人资料
	function getUserInfo(){
		var info = Utils.offLineStore.get("userinfo",false) || "";
		if(info !== ""){
			var obj = JSON.parse(info) || {};
			console.log("getUserInfo",obj);
			setUserInfoHtml(obj);
		}
	}
	//修改个人资料
	function setUserInfoHtml(data){
		var obj = data || {};
		//用户登录ID
		g.customerId = obj.customerId || "";

		//var phoneNumber = obj.phoneNumber || "";
		//$("#userphone").html(phoneNumber);
		var avatar = obj.icon || "";
		if(avatar !== ""){
			avatar = avatar + "?t=" + (new Date() - 0);
			$("#avatarimg").attr("src",avatar);
		}
	}

	function personBtnUp(evt){
		if(g.loginStatus){
			location.href = "../personal-center/index.html";
		}
		else{
			location.href = "../login/login.html";
		}
	}

	function bottomBtnUp(evt){
		var id = this.id || "";
		var url = "";
		switch(id){
			case "li_0":
				location.href = "../index/index.html";
			break;
			case "li_1":
				url = location.href = "../personal-center/index.html";
				if(g.loginStatus){
					location.href = url;
				}
				else{
					location.href = "../login/login.html";
				}
			break;
			case "li_2":
				url = location.href = "../mystaging/staging-step.html";
				if(g.loginStatus){
					location.href = url;
				}
				else{
					location.href = "../login/login.html";
				}
			break;
			case "li_3":
				url = location.href = "../personal-center/index.html";
				if(g.loginStatus){
					location.href = url;
				}
				else{
					location.href = "../login/login.html";
				}
			break;
			case "li_4":
				url = location.href = "tel://4006616896";
				location.href = url;
//				if(g.loginStatus){
//					location.href = url;
//				}
//				else{
//					location.href = "../login/login.html";
//				}
			break;
		}
	}


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
				//html.push('<li style="background:url(' + bmUrl + ') top center no-repeat"><a href="' + bmClickUrl + '"><div class="ui-wrap"></div></a></li>');
				html.push('<li><img src="' + bmUrl + '" /></li>');
			}
		}
		$("#bannerSlider").html(html.join(''));

		//初始化
		//~ $('#bannerSlider').carouFredSel({
			//~ width: '100%',
			//~ height: 540,
			//~ prev: '#prev',
			//~ next: '#next',
			//~ pagination: "#pager",
			//~ //auto:false,
			//~ scroll:{
				//~ items: 1,
				//~ duration: 1000,
				//~ fx:'crossfade',
				//~ timeoutDuration: 7000
			//~ },
			//~ swipe: {
				//~ onMouse: true,
				//~ onTouch: true
			//~ }
		//~ });

	}

});












