/**
 * file:更换手机号码
 * author:chenxy
*/

$(function(){
	var g = {};
	g.phone = "";
	g.newPhone = "";
	g.imgCodeId = "";
	g.sendCode = false;
	g.sendTime = 60;
	g.tout = null;
	g.httpTip = new Utils.httpTip({});

	g.codeImg = $("#imgcodebtn")[0];
	g.codeNewImg = $("#imgcodebtn_new")[0];
	g.guid = Utils.getGuid();
	g.guidNew = Utils.getGuid();
	//获取图形验证码
	/* sendGetImgCodeHttp(); */
	/* sendGetNewImgCodeHttp(); */

	g.customerId = "";
	g.login_token = Utils.offLineStore.get("token",false) || "";
	//验证登录状态
	var loginStatus = Utils.getUserInfo();
	if(!loginStatus){
		//未登录
		location.replace("/anjia/login.html");
	}
	else{
		getUserInfo();
	}

	//头像
	$(document).on("change","#avatar",avatarBtnUp);

	$("#inputphone").bind("blur",validPhone);
	$("#getcodebtn").bind("click",getValidCode);
	/* $("#imgcodebtn").bind("click",sendGetImgCodeHttp); 11-16*/
	$("#nextbtn").bind("click",validPhoneCode);

	$("#inputphone_new").bind("blur",validNewPhone);
	$("#getcodebtn_new").bind("click",getValidNewCode);
	/* $("#imgcodebtn_new").bind("click",sendGetNewImgCodeHttp); 11-16*/
	$("#changephonebtn").bind("click",validNewPhoneCode);




	//获取个人资料
	function getUserInfo(){
		var info = Utils.offLineStore.get("userinfo",false) || "";
		console.log("getUserInfo",info);
		if(info !== ""){
			var obj = JSON.parse(info) || {};
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

		$("#inputphone").val(phoneNumber);

		var avatar = obj.icon || "";
		if(avatar !== ""){
			//avatar = avatar + "?t=" + (new Date() - 0);
			//$("#avatarimg").attr("src",avatar);
		}
	}

	/* function sendGetImgCodeHttp(){
		//URL:  http://www.partywo.com/imageValidate/getImageValidate
		//参数: {image_key:string}
		var url = Base.serverUrl + "imageValidate/getImageValidate";
		url = url + "?image_key=" + g.guid + "&t=" + (new Date() - 0);
		g.codeImg.src = url;

		$("#inputimgcode").val("");
	} */
/* 	function sendGetNewImgCodeHttp(){
		//URL:  http://www.partywo.com/imageValidate/getImageValidate
		//参数: {image_key:string}
		var url = Base.serverUrl + "imageValidate/getImageValidate";
		url = url + "?image_key=" + g.guidNew + "&t=" + (new Date() - 0);
		g.codeNewImg.src = url;

		$("#inputimgcode_new").val("");
	} */


	//验证手机号
	function validPhone(){
		var phone = $("#inputphone").val() || "";
		var reg = /^1[3,5,7,8]\d{9}$/g;
		if(phone !== ""){
			if(!reg.test(phone)){
				Utils.alert("手机号输入错误");
				$("#inputphone").focus();
			}
		}
	}

	//获取验证码
	function getValidCode(evt){
		//var ele = evt.currentTarget;
		//$(ele).removeClass("curr");
		//if(!this.moved){}

		var p = $("#inputphone").val() || "";
		var imgCode = $("#inputimgcode").val() || "";
		if(p !== ""){
			var reg = /^1[3,5,7,8]\d{9}$/g;
			if(reg.test(p)){
				g.phone = p;
				/* if(imgCode !== ""){ 11-16*/
					if(!g.sendCode){
						sendGetCodeHttp(imgCode);
					}
				/* }
				else{
					Utils.alert("请输入图形验证码");
					$("#inputimgcode").focus();
				} 11-16*/
			}
			else{
				Utils.alert("手机号输入错误");
				$("#inputphone").focus();
			}
		}
		else{
			$("#inputphone").focus();
		}
	}
	//重新获取验证码
	function resetGetValidCode(){
		g.sendTime = g.sendTime - 1;
		if(g.sendTime > 0){
			$("#getcodebtn").val(g.sendTime + "秒后重新发送");
			g.tout = setTimeout(function(){
				resetGetValidCode();
			},1000);
		}
		else{
			$("#getcodebtn").val("重新发送");
			g.sendTime = 60;
			g.sendCode = false;

			//重新获取图形验证码,1分钟有效
			/* sendGetImgCodeHttp(); 11-16*/
		}
	}
	//请求验证码
	function sendGetCodeHttp(imgCode){
		//{'phone_number':string,'validate_key':string,'validate_code':string}
		var url = Base.serverUrl + "message/sendValidateMessage";
		var condi = {};
		condi.phone_number = g.phone;
		condi.validate_key = g.guid;
		condi.validate_code = imgCode;

		g.httpTip.show();
		$.ajax({
			url:url,
			data:condi,
			type:"POST",
			dataType:"json",
			context:this,
			//要求为Boolean类型的参数，默认为true。表示是否触发全局ajax事件。设置为false将不会触发全局ajax事件，ajaxStart或ajaxStop可用于控制各种ajax事件。
			//global:false,
			success: function(data){
				console.log("sendGetCodeHttp",data);
				var status = data.success || false;
				if(status){
					//alert("验证码:" + data.obj);
					Utils.alert("验证码已发送,请注意查收");
					g.sendCode = true;
					$("#getcodebtn").val("60秒后重新发送");
					setTimeout(function(){
						resetGetValidCode();
					},1000);
				}
				else{
					var msg = data.message || "验证码获取失败";
					Utils.alert(msg);

					//重新请求图形验证码
					/* sendGetImgCodeHttp(); 11-16*/
				}
				g.httpTip.hide();
			},
			error:function(data){
				g.httpTip.hide();
			}
		});
	}

	//验证短信验证码
	function validPhoneCode(evt){
		var code = $("#inputcode").val() || "";
		if(code !== ""){
			var condi = {};
			condi.phone_number = g.phone;
			condi.validate_code = code;
			sendValidCodeHttp(condi);
		}
		else{
			Utils.alert("请输入验证码");
			$("#inputcode").focus();
		}
	}

	function sendValidCodeHttp(condi){
		//URL:  http://www.partywo.com/user/updatePhoneNumberPreController
		//参数: {phone_number:string,validate_code:string}
		var url = Base.serverUrl + "user/updatePhoneNumberPreController";
		g.httpTip.show();
		$.ajax({
			url:url,
			data:condi,
			type:"POST",
			dataType:"json",
			context:this,
			success: function(data){
				console.log("sendValidCodeHttp",data);
				var status = data.success || false;
				if(status){
					g.validInfo = data;

					g.sendCode = false;
					g.sendTime = 60;
					clearTimeout(g.tout);
					$("#getcodebtn").val("获取动态码");

					//显示第二步
					$("#setup1").hide();
					$("#setup2").show();
					$("#progress").addClass("step2");
				}
				else{
					var msg = data.message || "验证码校验失败";
					Utils.alert(msg);
				}
				g.httpTip.hide();
			},
			error:function(data){
				g.httpTip.hide();
			}
		});
	}





	//第二步
	//验证手机号
	function validNewPhone(){
		var phone = $("#inputphone_new").val() || "";
		var reg = /^1[3,5,7,8]\d{9}$/g;
		if(phone !== ""){
			if(!reg.test(phone)){
				Utils.alert("手机号输入错误");
				$("#inputphone_new").focus();
			}
		}
	}

	//获取验证码
	function getValidNewCode(evt){
		//var ele = evt.currentTarget;
		//$(ele).removeClass("curr");
		//if(!this.moved){}

		var p = $("#inputphone_new").val() || "";
		var imgCode = $("#inputimgcode_new").val() || "";
		if(p !== ""){
			var reg = /^1[3,5,7,8]\d{9}$/g;
			if(reg.test(p)){
				g.newPhone = p;
				/* if(imgCode !== ""){ 11-16*/
					if(!g.sendCode){
						g.sendTime = 60;

						sendGetNewCodeHttp(imgCode);
					}
			/* 	}
				else{
					Utils.alert("请输入图形验证码");
					$("#inputimgcode_new").focus();
				} 11-16*/
			}
			else{
				Utils.alert("手机号输入错误");
				$("#inputphone_new").focus();
			}
		}
		else{
			$("#inputphone_new").focus();
		}
	}
	//重新获取验证码
	function resetGetNewValidCode(){
		g.sendTime = g.sendTime - 1;
		if(g.sendTime > 0){
			$("#getcodebtn_new").val(g.sendTime + "秒后重新发送");
			setTimeout(function(){
				resetGetNewValidCode();
			},1000);
		}
		else{
			$("#getcodebtn_new").val("重新发送");
			g.sendTime = 60;
			g.sendCode = false;

			//重新获取图形验证码,1分钟有效
			/* sendGetNewImgCodeHttp(); 11-16*/
		}
	}
	//请求验证码
	function sendGetNewCodeHttp(imgCode){
		//{'phone_number':string,'validate_key':string,'validate_code':string}
		var url = Base.serverUrl + "message/sendValidateMessage";
		var condi = {};
		condi.phone_number = g.newPhone;
		condi.validate_key = g.guidNew;
		condi.validate_code = imgCode;

		g.httpTip.show();
		$.ajax({
			url:url,
			data:condi,
			type:"POST",
			dataType:"json",
			context:this,
			success: function(data){
				console.log("sendGetNewCodeHttp",data);
				var status = data.success || false;
				if(status){
					//alert("验证码:" + data.obj);
					Utils.alert("验证码已发送,请注意查收");
					g.sendCode = true;
					$("#getcodebtn_new").val("60秒后重新发送");
					setTimeout(function(){
						resetGetNewValidCode();
					},1000);
				}
				else{
					var msg = data.message || "验证码获取失败";
					Utils.alert(msg);

					//重新请求图形验证码
					/* sendGetNewImgCodeHttp(); 11-16*/
				}
				g.httpTip.hide();
			},
			error:function(data){
				g.httpTip.hide();
			}
		});
	}

	//重置手机
	function validNewPhoneCode(evt){
		var code = $("#inputcode_new").val() || "";
		if(code !== ""){
			var condi = {};
			condi.customer_id = g.customerId;
			condi.token = g.login_token;
			condi.phoneNumber = g.newPhone;
			condi.validate_code = code;
			sendNewValidCodeHttp(condi);
		}
		else{
			Utils.alert("请输入验证码");
			$("#inputcode_new").focus();
		}
	}

	function sendNewValidCodeHttp(condi){
		//URL:  http://www.partywo.com/user/updatePhoneNumberController
		//参数: {customer_id:string,token:string,phoneNumber:string,validate_code:string}
		var url = Base.serverUrl + "user/updatePhoneNumberController";
		g.httpTip.show();
		$.ajax({
			url:url,
			data:condi,
			type:"POST",
			dataType:"json",
			context:this,
			success: function(data){
				console.log("sendNewValidCodeHttp",data);
				var status = data.success || false;
				if(status){
					//退出登录
					Utils.loginOut(true);

					//显示第三步
					$("#setup2").hide();
					$("#setup3").show();
					$("#progress").addClass("step3");
					$("#newphone").html(g.newPhone);
					setTimeout(function(){
						location.href = "/anjia/login.html";
					},2000);
				}
				else{
					var msg = data.message || "验证码校验失败";
					Utils.alert(msg);

					//重新获取图形验证码
					//sendGetNewImgCodeHttp();
					$("#inputimgcode_new").val("");
					$("#inputcode_new").val("");
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
			alert("您选择的上传文件不是有效的图片文件！");
			return false;
		}
	}
});