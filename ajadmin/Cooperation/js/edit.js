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

	//g.orderId = Utils.getQueryString("orderId") || "";
	g.login_token = Utils.offLineStore.get("token",false) || "";
	g.phoneNumber = Utils.offLineStore.get("user_phoneNumber",false) || "";
	g.usersId = Utils.offLineStore.get("user_usersId",false) || "";
	g.usersName = Utils.offLineStore.get("user_usersName",false) || "";
	g.bmId = Utils.getQueryString("bmId") || "";
	g.httpTip = new Utils.httpTip({});

	//验证登录状态
	var loginStatus = Utils.getUserInfo();
	if(!loginStatus){
		//未登录
		//location.replace("/login.html");
		//window.parent.location.href = "../Public/login.html";
	}
	else{
		//获取页面分类信息
		//sendGetNavigationKeyHttp();
		sendGetBannerInfoById();
		
		$("#bmId").val(g.bmId);
		$("#login_token").val(g.login_token);		
		$("#createBy").val(g.usersId);
		$("#createByName").val(g.usersName);
	}

	//获取图形验证码
	//sendGetImgCodeHttp();

	//g.httpTip.show();

	$("#addform").bind("submit",validForm);

	function validForm(){
		/* if(!validNoEmpty("bmTitle")){
			layer.msg('轮播图片标题不能为空');
			return false;
		} */


		var url = Base.serverUrl + "subsidiary/updateSubsidiary";
		$("#addform").attr("action",url);
		return true;
	}

	function validNoEmpty(id){
		var b = false;
		var txt = $("#" + id).val() || "";
		if(txt !== ""){
			b = true;
		}
		return b;
	}


/* 	function sendGetNavigationKeyHttp(){
		g.httpTip.show();
		var url = Base.serverUrl + "bannerImage/getNavigationKey";
		var condi = {};
		$.ajax({
			url:url,
			data:condi,
			type:"POST",
			dataType:"json",
			context:this,
			success: function(data){
				//console.log("sendGetNavigationKeyHttp",data);
				var status = data.success || false;
				if(status){
					changeSelectHtml(data);

					//获取轮播图详情
					sendGetBannerInfoById();
				}
				else{
					var msg = data.message || "获取公司信息字典数据失败";
					Utils.alert(msg);
				}
				g.httpTip.hide();
			},
			error:function(data){
				g.httpTip.hide();
			}
		});
	}

	function changeSelectHtml(obj){
		var data = obj.obj || {};
		var option = [];
		for(var k in data){
			var name = data[k];
			option.push('<option value="' + k + '">' + name + '</option>');
		}
		$("#navigationKey").html(option.join(''));
	} */

	function sendGetBannerInfoById(){
		var bmId = g.bmId;
		g.httpTip.show();
		var url = Base.serverUrl + "subsidiary/getSubsidiary";
		var condi = {};
		condi.login_token = g.login_token;
		condi.id = bmId;
		$.ajax({
			url:url,
			data:condi,
			type:"POST",
			dataType:"json",
			context:this,
			success: function(data){
				//console.log("sendGetBannerInfoById",data);
				var status = data.success || false;
				if(status){
					changeBannerHtml(data);
					sendGetNavigationKeyHttp2();
					sendGetCiTy();
				}
				else{
					var msg = data.message || "获取公司信息失败";
					Utils.alert(msg);
				}
				g.httpTip.hide();
			},
			error:function(data){
				g.httpTip.hide();
			}
		});
	}

	function changeBannerHtml(data){
		var obj = data.obj || "";
		var name = obj.name || "";
		var shortName = obj.shortName || "";
		var cityid = obj.cityid || "";
			g.cityid=cityid;
		var brandtype = obj.brandtype || "";
			g.brandtype=brandtype;
			g.id=obj.id;$("#id").val(g.id);
		var address = obj.address || "";
		var legalperson = obj.legalperson || "";
		var stamp = obj.stamp || "";
		var orderNum = obj.orderNum || "";
		var summary = obj.summary || "";
		
		$("#name").val(name);
		$("#shortName").val(shortName);
		//$("#cityName").val(cityName);
		//$("#brandtypeName").val(brandtypeName);
		$("#address").val(address);
		$("#stamp").attr("src",stamp);
		$("#legalperson").val(legalperson);
		$("#summary").text(summary);
	}
	/* 获取品牌类型 */
function sendGetNavigationKeyHttp2(){
		g.httpTip.show();
		var url = Base.serverUrl + "company/getBranchs";
		var condi = {};
		$.ajax({
			url:url,
			data:condi,
			type:"POST",
			dataType:"json",
			context:this,
			success: function(data){
				//console.log("sendGetNavigationKeyHttp2",data);
				var status = data.success || false;
				if(status){
					changeSelectHtml(data);
				}
				else{
					var msg = data.message || "获取公司信息字典数据失败";
					Utils.alert(msg);
				}
				g.httpTip.hide();
			},
			error:function(data){
				g.httpTip.hide();
			}
		});
	}

	function changeSelectHtml(obj){
		var data = obj.list || {};
		var option = [];
		for(var i=0;i<data.length;i++){
			var name = data[i].companyName;
			
			if(g.brandtype == data[i].companyId){option.push('<option selected="true" value="' + data[i].companyId + '">' + name + '</option>');}
			else{option.push('<option value="' + data[i].companyId + '">' + name + '</option>');}
		}
		$("#brandtype").html(option.join(''));
		
	}
	/* 获取城市 */
	function sendGetCiTy(){
		g.httpTip.show();
		var url = Base.serverUrl + "city/getCitys";
		var condi = {};
		$.ajax({
			url:url,
			data:condi,
			type:"POST",
			dataType:"json",
			context:this,
			success: function(data){
				//console.log("sendGetNavigationKeyHttp",data);
				var status = data.success || false;
				if(status){
					changeSelectCiTy(data);
				}
				else{
					var msg = data.message || "获取公司信息字典数据失败";
					Utils.alert(msg);
				}
				g.httpTip.hide();
			},
			error:function(data){
				g.httpTip.hide();
			}
		});
	}

	function changeSelectCiTy(obj){
		var data = obj.list || {};
		var option = [];
		for(var i=0;i<data.length;i++){
			var name = data[i].name;			
			if(data[i].id==g.cityid){option.push('<option selected="true" value="' + data[i].id + '">' + name + '</option>');}
			else{option.push('<option value="' + data[i].id + '">' + name + '</option>');}
		}
		$("#cityid").html(option.join(''));
	}
	
	
});