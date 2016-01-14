/**
 * file:个人资料
 * author:chenxy
*/
//页面初始化
$(function(){
	if(typeof eui !== "undefined"){
		var birthday = $('#birthday');
		if(birthday.length > 0){
			eui.calendar({
				startYear: 1900,
				input:birthday[0]
			});
		}
	}


	var g = {};
	//g.userInfoDic = {};
	g.customerId = "";
	g.login_token = Utils.offLineStore.get("token",false) || "";
	//g.page = Utils.getQueryString("p") - 0;
	g.httpTip = new Utils.httpTip({});

	//验证登录状态
	var loginStatus = Utils.getUserInfo();
	if(!loginStatus){
		//未登录
		location.replace("/anjia/login.html");
	}
	else{
		getUserInfo();
		sendGetUserInfoDicHttp();
	}



	//头像
	$(document).on("change","#avatar",avatarBtnUp);
	//保存个人资料
	$("#savebtn").bind("click",saveBtnUp);


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

		var phoneNumber = obj.phoneNumber || "";
		$("#userphone").html(phoneNumber);
		var avatar = obj.icon || "";
		if(avatar !== ""){
			avatar = avatar + "?t=" + (new Date() - 0);
			$("#avatarimg").attr("src",avatar);
		}
	}

	//获取用户信息字典信息
	function sendGetUserInfoDicHttp(){
		g.httpTip.show();
		var url = Base.serverUrl + "baseCodeController/getBaseCodeByParents";
		/*
		性别：1001
		身份：1002
		婚姻状况：1003
		爱好：1004
		*/
		var condi = {};
		condi.parents = "1001,1002,1003,1004";
		$.ajax({
			url:url,
			data:condi,
			type:"POST",
			dataType:"json",
			context:this,
			success: function(data){
				console.log("sendGetUserInfoDicHttp",data);
				var status = data.success || false;
				if(status){
					var obj = data.obj || {};
					//g.userInfoDic = obj;
					changeUserInfoDefaultHtml(obj);
					//获取用户数据
					sendGetUserInfoHttp();
				}
				else{
					var msg = data.message || "获取用户信息字典数据失败";
					Utils.alert(msg);
				}
				g.httpTip.hide();
			},
			error:function(data){
				g.httpTip.hide();
			}
		});
	}

	//获取用户信息
	function sendGetUserInfoHttp(){
		g.httpTip.show();
		var url = Base.serverUrl + "user/getCustomerByCustomerIdController";
		//参数: {customerId:string用户编号}
		var condi = {};
		condi.customerId = g.customerId;
		$.ajax({
			url:url,
			data:condi,
			type:"POST",
			dataType:"json",
			context:this,
			success: function(data){
				console.log("sendGetUserInfoHttp",data);
				var status = data.success || false;
				if(status){
					var obj = data.obj || {};
					changeUserInfoHtml(obj);

					var userInfo = JSON.stringify(obj);
					//保存用户数据
					Utils.offLineStore.set("userinfo",userInfo,false);
				}
				else{
					var msg = data.message || "获取用户信息失败";
					Utils.alert(msg);
				}
				g.httpTip.hide();
			},
			error:function(data){
				g.httpTip.hide();
			}
		});
	}

	//更新用户信息模板
	function changeUserInfoDefaultHtml(obj){
		var sex = obj["1001"] || [];
		var identification = obj["1002"] || [];
		var maritalStatus = obj["1003"] || [];
		var interesting = obj["1004"] || [];

		var sexHtml = [];
		for(var k in sex){
			sexHtml.push('<input type="radio" name="sexradio" class="common-radio" id="' + k + '" value="' + k + '"><label for="' + k + '" style="float:none;">' + sex[k] + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</label>');
		}
		var identificationHtml = [];
		for(var k in identification){
			identificationHtml.push('<input type="radio" class="common-radio" name="idrodio" id="' + k + '" value="' + k + '"><label for="' + k + '" style="float:none;">' + identification[k] + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</label>');
		}
		var maritalStatusHtml = [];
		for(var k in maritalStatus){
			maritalStatusHtml.push('<input type="radio" class="common-radio" name="userstatus" id="' + k + '" value="' + k + '"><label for="' + k + '" style="float:none;">' + maritalStatus[k] + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</label>');
		}
		var interestingHtml = [];
		for(var k in interesting){
			interestingHtml.push('<input type="checkbox" class="common-checkbox" name="cklike" id="' + k + '" value="' + k + '"><label for="' + k + '" style="float:none;">' + interesting[k] + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</label>');
		}

		$("#sexdiv").html(sexHtml.join(''));
		$("#identificationdiv").html(identificationHtml.join(''));
		$("#maritalStatusdiv").html(maritalStatusHtml.join(''));
		$("#interestingdiv").html(interestingHtml.join(''));
		$("#edit-inf-box").css("visibility","visible");
		$('.common-radio').yyptRadio();
		$('.common-checkbox').yyptCheckbox();
	}
	//更新用户信息html
	function changeUserInfoHtml(obj){
		var sex = obj.sex || "";
		var birthday = obj.birthday || "";
		var identification = obj.identification || "";
		var maritalStatus = obj.maritalStatus || "";
		var interesting = obj.interesting || "";

		var avatar = obj.icon || "";
		if(avatar !== ""){
			avatar = avatar + "?t=" + (new Date() - 0);
			$("#avatarimg").attr("src",avatar);
		}

		if(sex !== ""){
			//$("#" + sex)[0].checked = true;
			$("#" + sex).attr("checked","checked");
			$($("#" + sex).parent()).removeClass("radio-bg-checked");
			$($("#" + sex).parent()).addClass("radio-bg-checked");
		}
		if(identification !== ""){
			//$("#" + identification)[0].checked = true;
			$("#" + identification).attr("checked","checked");
			$($("#" + identification).parent()).removeClass("radio-bg-checked");
			$($("#" + identification).parent()).addClass("radio-bg-checked");
		}
		if(maritalStatus !== ""){
			//$("#" + maritalStatus)[0].checked = true;
			$("#" + maritalStatus).attr("checked","checked");
			$($("#" + maritalStatus).parent()).removeClass("radio-bg-checked");
			$($("#" + maritalStatus).parent()).addClass("radio-bg-checked");
		}
		if(interesting !== ""){
			var inter = interesting.split(",") || [];
			for(var i = 0, len = inter.length; i < len; i++){
				$("#" + inter[i]).attr("checked","checked");
				$($("#" + inter[i]).parent()).addClass("chk-bg-checked");
			}
		}
		if(birthday !== ""){
			$("#birthday").val(birthday);
		}
	}


	//保存用户信息
	//更新个人资料
	function saveBtnUp(){
		//debugger
		var sex = $("input[name='sexradio']") || [];
		var ids = $("input[name='idrodio']") || [];
		var status = $("input[name='userstatus']") || [];
		var likes = $("input[name='cklike']:checked") || [];

		var birthday = $("#birthday").val() || "";
		var cksex = "";
		var ckid = "";
		var ckstatus = "";
		var cklikes = "";		
		sex.each(function(){
			if($(this).attr("checked") == "checked"){cksex = $(this).val()}
		})
		ids.each(function(){
			if($(this).attr("checked") == "checked"){ckid = $(this).val()}
		})
		status.each(function(){
			if($(this).attr("checked") == "checked"){ckstatus = $(this).val()}
		})
		
		/* if(sex.length > 0){
			
			cksex = sex[0].value || "";
		}
		if(ids.length > 0){
			ckid = ids[0].value || "";
		}
		if(status.length > 0){
			ckstatus = status[0].value || "";
		} */
		if(likes.length > 0){
			var like = [];
			for(var i = 0, len = likes.length; i < len; i++){
				var v = likes[i].value || "";
				if(v !== ""){
					like.push(v);
				}
			}
			cklikes = like.join(',');
		}

		if(g.login_token !== "" && g.customerId !== ""){
			var condi = {};
			condi.login_token = g.login_token;
			condi.customerId = g.customerId;
			if(cksex !== ""){
				condi.sex = cksex;
			}
			if(ckid !== ""){
				condi.identification = ckid;
			}
			if(ckstatus !== ""){
				condi.maritalStatus = ckstatus;
			}
			if(cklikes !== ""){
				condi.interesting = cklikes;
			}
			if(birthday !== ""){
				condi.birthday = birthday;
			}

			sendSetUserInfoHttp(condi);
		}
		else{
			Utils.alert("登录超时,请重新登录");
		}
	}

	//更新
	function sendSetUserInfoHttp(condi){
		g.httpTip.show();
		/*
		{"login_token":string登录标识,customerId:string用户编号,
		sex用户性别:string,
		identification:string用户身份,
		maritalStatus:string用户婚姻状况,
		interesting:string用户喜好,
		birthday:string用户生日}
		*/
		var url = Base.serverUrl + "user/updateCustomerInfoController";
		$.ajax({
			url:url,
			data:condi,
			type:"POST",
			dataType:"json",
			context:this,
			success: function(data){
				console.log("sendSetUserInfoHttp",data);
				var status = data.success || false;
				if(status){
					Utils.alert("用户信息更新成功");
				}
				else{
					var msg = data.message || "获取用户信息失败";
					Utils.alert(msg);
				}
				g.httpTip.hide();
			},
			error:function(data){
				g.httpTip.hide();
			}
		});
	}


	function avatarBtnUp(){
		var avatar = $("#avatar").val() || "";
		if(avatar !== ""){
			uploadBtnUp();
		}
		/*
		var popbox = $("#popbox");
		if(popbox.length == 0){
			var url = Base.serverUrl + "/api/user/changeAvatar";
			//var url = "http://192.168.10.209:8080/fenghuangzhujia-eshop-web/";
			var token = g.token;
			var html = [];
			html.push('<div id="popbox" class="prompt_mask transparentbg" style="display: block;">');
			html.push('<div class="p_load" style="width:600px;height:200px;background:#fff;margin-left:-300px;">');
			//html.push('<form id="avatarform" submit="return false;" action="' + url + '" method="post" enctype="multipart/form-data">');
			html.push('<p>');
			html.push('<input id="avatar" type="file" name="avatar" multiple="multiple" min="1" max="99" value="选择头像" accept="image/*" />');
			//html.push('<input id="uploadbtn" type="submit" value="upload" />');
			html.push('<input id="uploadbtn" type="button" value="upload" />');
			html.push('<input id="token" type="hidden" name="token" value="' + token + '" />');
			html.push('</p>');
			//html.push('</form>');
			html.push('</div>');
			html.push('</div>');

			$("body").append(html.join(''));

			$("#uploadbtn").bind("click",uploadBtnUp);
		}
		else{
			popbox.show();
		}
		*/
	}

	function uploadBtnUp(){
		if(lastname()){
			g.httpTip.show();
			var url = Base.serverUrl + "user/uploadIcon";
			var condi = {};
			condi.login_token = g.login_token;
			condi.customer_id = g.customerId;

			//document.domain = "partywo.com";
			$.ajaxFileUpload({
				url: url, //用于文件上传的服务器端请求地址
				data:condi,
				secureuri: false, //一般设置为false
				fileElementId: 'avatar', //文件上传空间的id属性  <input type="file" id="file" name="file" />
				dataType: 'jsonp', //返回值类型 一般设置为json
				success: function (data, status)  //服务器成功响应处理函数
				{
					//{"success":true,"obj":"http://123.57.5.50:8888/anjia/201508240001/201508240001.jpg","list":null,"message":null,"code":null,"token":null}
					console.log("ajaxFileUpload",data);
					g.httpTip.hide();
					if(data != null && data != ""){
						try{
							var obj = JSON.parse(data);
							var src = obj.obj + "?t=" + (new Date() - 0);
							$("#avatarimg").attr("src",src);
						}
						catch(e){
							Utils.alert("头像上传失败");
						}
					}
					//Utils.alert("头像上传成功");
					//console.log("ajaxFileUpload",data,status);
					//location.reload();
				},
				error: function (data, status, e)//服务器响应失败处理函数
				{
					Utils.alert("头像上传失败");
					g.httpTip.hide();
				}
			});
			return false;
		}
	}

	function lastname(){
		//获取欲上传的文件路径
		var filepath = document.getElementById("avatar").value;
		//为了避免转义反斜杠出问题，这里将对其进行转换
		var re = /(\\+)/g;
		var filename=filepath.replace(re,"#");
		//对路径字符串进行剪切截取
		var one=filename.split("#");
		//获取数组中最后一个，即文件名
		var two=one[one.length-1];
		//再对文件名进行截取，以取得后缀名
		var three=two.split(".");
		//获取截取的最后一个字符串，即为后缀名
		var last=three[three.length-1];
		//添加需要判断的后缀名类型
		var tp ="jpg,gif,bmp,JPG,GIF,BMP,png";
		//返回符合条件的后缀名在字符串中的位置
		var rs=tp.indexOf(last);
		//如果返回的结果大于或等于0，说明包含允许上传的文件类型
		if(rs>=0){
			return true;
		}else{
			Utils.alert("您选择的上传文件不是有效的图片文件！");
			return false;
		}
	}
});