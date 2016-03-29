/**
 * file:绑定银行卡
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

	g.codeImg = $("#imgcodebtn")[0];
	g.guid = Utils.getGuid();
	g.customerId = "";
	g.bindBankCardId = "";
	g.bindCondi = {};


	//验证登录状态
	var loginStatus = Utils.getUserInfo();
	if(!loginStatus){
		//未登录
		location.replace("/anjia/login.html");
	}
	else{
		getUserInfo();
		//获取个人绑定银行卡列表
		sendGetBindBankCardByCustomerId();
	}

	/*
	sendPlayBindRequest11111();
	function sendPlayBindRequest11111(bbcId){
		var url = Base.serverUrl + "payPc/queryBindBanCardList";
		g.httpTip.show();
		var condi = {};
		//condi.login_token = g.login_token;
		condi.customerId = g.customerId;
		condi.identitytype = 5;
		$.ajax({
			url:url,
			type:"POST",
			data:condi,
			dataType:"json",
			context:this,
			success: function(data){
				console.log("sendPlayBindRequest11111",data);
				var status = data.success || false;
				if(status){
					//请求成功
					g.payId = data.obj || "";
				}
				else{
					var msg = data.message || "支付请求失败";
					Utils.alert(msg);
				}
				g.httpTip.hide();
			},
			error:function(data){
				g.httpTip.hide();
			}
		});
	}
	*/


	//头像
	$(document).on("change","#avatar",avatarBtnUp);

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


	function sendGetBindBankCardByCustomerId(){
		var url = Base.serverUrl + "payPc/getBindBankCardByCustomerId";
		var condi = {};
		condi.login_token = g.login_token;
		condi.customerId = g.customerId;
		$.ajax({
			url:url,
			data:condi,
			type:"POST",
			dataType:"json",
			context:this,
			success: function(data){
				console.log("sendGetBindBankCardByCustomerId",data);
				var status = data.success || false;
				if(status){
					changeBankCardHtml(data);
				}
				else{
					var msg = data.message || "获取绑定银行卡失败";
					Utils.alert(msg);

					changeBankCardHtml(data);
				}
			},
			error:function(data){
			}
		});
	}


	function changeBankCardHtml(data){
		var list = data.list || [];
		if(list.length > 0){
			var obj = list[0] || {};
			var bbcId = obj.bbcId || "";

			var html = [];
			for(var i = 0,len = list.length; i < len; i++){
				var d = list[i] || {};
				var bbcId = d.bbcId || "";
				var bankType = d.bankType || "";
				bankType = bankType.toLowerCase();
				var bankCard = d.bankCardLast || "";
				bankCard = "****" + bankCard;
				var bankTypeDesc = d.bankTypeDesc || "";
				var logo = "../res/images/bank-logo/" + bankType + ".gif";

				html.push('<li>');
				html.push('<i class="close-ico"></i>');
				html.push('<a href="javascript:void(0)" class="card-item">');
				html.push('<img src="' + logo + '" class="bank-card-logo" />');
				html.push('<p value='+bbcId+' class="card-number">' + bankCard + '</p>');
				html.push('</a>');
				html.push('</li>');
				
			}
			$("#cardlist").html(html.join(''));
		}
		else{
		/* 	var html = [];
			html.push('<tr>');
			html.push('<th width="240">银行卡LOGO</th>');
			html.push('<th width="240">发卡行名称</th>');
			html.push('<th width="240">银行卡号</th>');
			html.push('<th>操作</th>');
			html.push('</tr>');
			$("#cardlist").html(html.join('')); */
			layer.msg("你还没有绑定银行卡");
		}
		edit();
	}
	//右上角编辑按钮
	function edit(){	
		$('#stateEdit').on('click',function(){
			$this = $(this);
			if($('.card-list-ul').hasClass('edit-state')){
				$this.text('编辑');
				$('.card-list-ul').removeClass('edit-state');
			}else{
				$this.text('保存');
				$('.card-list-ul').addClass('edit-state');
			}
		});
		//解绑银行卡点击效果
		$('.card-list-ul .close-ico').on('click',function(){
			var $this = $(this);
			COMMON_PLUGIN.COMMON.ALERT_DIALOG_TWO('确定要解绑该银行卡吗',function(){releaseCardBind($this)},function(){});
		});
	}	
		function releaseCardBind(obj){
			obj.parents('li').remove();
			var bbcId = obj.parents('li').find("p").attr("value");
			sendUnBindBanCard(bbcId);
		}




	function avatarBtnUp(){
		var avatar = $("#avatar").val() || "";
		if(avatar !== ""){
			uploadBtnUp();
		}
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


	//解除绑定银行卡
	function sendUnBindBanCard(bbcId){
		g.httpTip.show();
		var url = Base.serverUrl + "payPc/unBindBanCard";
		var condi = {};
		condi.login_token = g.login_token;
		condi.customerId = g.customerId;
		condi.bbcId = bbcId;

		$.ajax({
			url:url,
			data:condi,
			type:"POST",
			dataType:"json",
			context:this,
			success: function(data){
				console.log("sendUnBindBanCard",data);
				var status = data.success || false;
				if(status){
					layer.msg("解除绑定银行卡成功");
					sendGetBindBankCardByCustomerId();
				}
				else{
					var msg = data.message || "解除绑定银行卡失败";
					Utils.alert(msg);
				}
				g.httpTip.hide();
			},
			error:function(data){
				g.httpTip.hide();
			}
		});
	}

	function cardReleaseBound(bbcId){
		layer.confirm('重新绑定也只能绑定同一张银行卡,您确定要解除绑定的银行卡吗？', {
			//按钮
			btn: ['确定','取消']
		}, function(){
			sendUnBindBanCard(bbcId);
		}, function(){
		});
	}

	window.cardReleaseBound = cardReleaseBound;
	window.edit = edit;
	window.releaseCardBind = releaseCardBind;
});







