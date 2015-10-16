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
	g.articleId = Utils.getQueryString("articleId") || "";
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

		//$("#articleId").val(g.articleId);
		$("#login_token").val(g.login_token);
		$("#createBy").val(g.usersId);
		$("#createByName").val(g.usersName);

		//获取文章图详情
		sendGetArticleInfoById();
	}

	//获取图形验证码
	//sendGetImgCodeHttp();

	//g.httpTip.show();

	$("#editbtn").bind("click",editBtnUp);



	$('#backid').click(function(){
		window.location.href="index.html";
	});

	function validForm(){
		if(!validNoEmpty("bmTitle")){
			layer.msg('轮播图片标题不能为空');
			return false;
		}


		var url = Base.serverUrl + "bannerImage/updateBannerImage";
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


	function sendGetNavigationKeyHttp(){
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
				console.log("sendGetNavigationKeyHttp",data);
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
	}

	function sendGetArticleInfoById(){
		var articleId = g.articleId;
		g.httpTip.show();
		var url = Base.serverUrl + "article/getArticleById";
		var condi = {};
		condi.login_token = g.login_token;
		condi.articleId = articleId;
		$.ajax({
			url:url,
			data:condi,
			type:"POST",
			dataType:"json",
			context:this,
			success: function(data){
				console.log("sendGetArticleInfoById",data);
				var status = data.success || false;
				if(status){
					changeArticleHtml(data);
				}
				else{
					var msg = data.message || "获取文章数据失败";
					Utils.alert(msg);
				}
				g.httpTip.hide();
			},
			error:function(data){
				g.httpTip.hide();
			}
		});
	}

	function changeArticleHtml(data){
		var obj = data.obj || "";
		var articleTitle = obj.articleTitle || "";
		var articleKey = obj.articleKey || "";
		var articleContent = obj.articleContent || "";

		$("#articleTitle").val(articleTitle);
		$("#articleKey").val(articleKey);
		$("#editor").html(articleContent);
	}

	function editBtnUp(){
		var articleTitle = $("#articleTitle").val() || "";
		var articleContent = $("#editor").html() || "";
		var articleKey = $("#articleKey").val() || "";
		var createBy = $("#createBy").val() || "";
		var createByName = $("#createByName").val() || "";

		if(articleTitle !== ""){
			var condi = {};
			condi.articleId = g.articleId;
			condi.articleTitle = articleTitle;
			condi.articleContent = articleContent;
			condi.articleKey = articleKey;
			condi.createBy = createBy;
			condi.createByName = createByName;
			condi.login_token = g.login_token;
			sendUpdateArticleInfoById(condi);
		}
		else{
			Utils.alert("标题不能为空");
		}
	}

	function sendUpdateArticleInfoById(condi){
		g.httpTip.show();
		var url = Base.serverUrl + "article/updateArticle";
		$.ajax({
			url:url,
			data:condi,
			type:"POST",
			dataType:"json",
			context:this,
			success: function(data){
				console.log("sendUpdateArticleInfoById",data);
				var status = data.success || false;
				if(status){
					window.location.href="index.html";
				}
				else{
					var msg = data.message || "获取文章数据失败";
					Utils.alert(msg);
				}
				g.httpTip.hide();
			},
			error:function(data){
				g.httpTip.hide();
			}
		});
	}

});