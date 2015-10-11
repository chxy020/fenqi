/**
 * file:登录
 * author:chenxy
*/

//页面初始化
$(function(){
	var g = {};
	g.codeId = "";
	g.tout = null;
	g.httpTip = new Utils.httpTip({});

	var userPhone = Utils.offLineStore.get("userphone_login",true) || "";
	$("#inputphone").val(userPhone);

	$("#inputphone").bind("blur",validPhone);
	$("#inputpwd").bind("blur",validPwd);
	$("#loginbtn").bind("click",loginBtnUp);
	//找回密码
	//$("#findpwd").bind("click",findPwdPage);

	//计算费用
	$("#countfeebtn").bind("click",countFeeBtnUp);
	//第一步,提交套餐信息
	$("#casebtn").bind("click",caseBtnUp);
	//第二部,提交个人信息
	$("#personalbtn1").bind("click",personal1BtnUp);



	function countFee(sum,times){
		//分期月数
		var numarr = [3,6,9,12,15,18,24,36];
		//利率
		var ratearr = [0,0.01,0.04,0.07,0.1,0.13,0.19];

		var fees = sum * ratearr[times] * numarr[times];
		var allfees = sum + fees;
		var mouthfee = sum / numarr[times];

		var obj = {};
		obj.fees = fees;
		obj.allfees = allfees;
		obj.mouthfee = mouthfee;
		return;
	}

	function countFeeBtnUp(){
		var sum = $("#sumprice").val() - 0 || "";
		if(sum !== ""){
			if(sum > 0){
				var times = $("#numbertimes").val() - 0;
				var obj = countFee(times);
			}
			else{
				Utils.alert("套餐金额必须大于0");
			}
		}
		else{
			Utils.alert("请输入套餐金额");
			$("#sumprice").focus();
		}
	}


	function caseBtnUp(){
		var contractno = $("#contractno").val() || "";
		var casttype = $("#casetype").val() || "";
		var caseprice = $("#caseprice").val() || "";
		var feetimes = $("#feetimes").val() || "";

		var obj = countFee(caseprice,feetimes);

		//提交订单
		var condi = {};
		sendSetOrder1Http(condi);
	}

	function sendSetOrder1Http(condi){
		var url = Base.serverUrl + "user/CustomerLoginController";
		g.httpTip.show();
		$.ajax({
			url:url,
			data:condi,
			type:"POST",
			dataType:"json",
			context:this,
			success: function(data){
				console.log("sendSetOrder1Http",data);
				var status = data.success || false;
				if(status){
					var userInfo = data.obj || "";
					if(userInfo !== ""){
						userInfo = JSON.stringify(userInfo);
						//保存用户数据
						Utils.offLineStore.set("userinfo",userInfo,false);
						var token = data.token || "";

						Utils.offLineStore.set("token",token,false);
						location.href = "usercenter.html";
					}

					//location.href = "center.html";
					//var token = data.result.token || "";
					//Utils.offLineStore.set("token",token,false);
					//location.href = "center.html?token=" + token + "&p=0";
				}
				else{
					//var msg = data.error || "";
					var msg = data.message || "登录失败";
					Utils.alert(msg);
					//getImgCode();
				}
				g.httpTip.hide();
			},
			error:function(data){
				g.httpTip.hide();
			}
		});
	}



	//个人基本信息
	function personal1BtnUp(){
		var name = $("#name").val() || "";
		var age = $("#age").val() || "";
		var sex = $("#sex").val() || "";
		var idcard = $("#idcard").val() || "";

		var marriage = $("#marriage").val() || "";
		var address = $("#address").val() || "";
		var worktype = $("#worktype").val() || "";
		var companyname = $("#companyname").val() || "";
		var companytype = $("#companytype").val() || "";
		var post = $("#post").val();
		var workexperience = $("#workexperience").val() || "";
		var companyaddress = $("#companyaddress").val() || "";
		var companytel = $("#companytel").val() || "";
		var income = $("#income").val() || "";
	}

	//联系人信息
	function personal2BtnUp(){
		//亲属
		var rname1 = $("#rname1").val() || "";
		var rtel1 = $("#rtel1").val() || "";
		var rtype1 = $("#rtype1").val() || "";
		var riskown1 = $("#riskown1").val() || "";

		var rname2 = $("#rname2").val() || "";
		var rtel2 = $("#rtel2").val() || "";
		var rtype2 = $("#rtype2").val() || "";
		var riskown2 = $("#riskown2").val() || "";

		//朋友
		var fname1 = $("#fname1").val() || "";
		var ftel1 = $("#ftel1").val() || "";

		var fname2 = $("#fname2").val() || "";
		var ftel2 = $("#ftel2").val() || "";

		//同事
		var cname1 = $("#cname1").val() || "";
		var ctel1 = $("#cname1").val() || "";

		var cname2 = $("#cname2").val() || "";
		var ctel2 = $("#ctel2").val() || "";
	}


	//连带责任人信息
	function personal3BtnUp(){
		var ldname = $("#ldname").val() || "";
		var ldtel = $("#ldtel").val() || "";
		var ldidcard = $("#ldidcard").val() || "";
		var ldtype = $("#ldtype").val() || "";
		var ldaddress = $("#ldaddress").val() || "";
	}






	function idCardBtnUp(){
		var idcardfile = $("#idcardfile").val() || "";
		if(idcardfile !== ""){
			uploadBtnUp("idcardfile","idcardimg1","身份证");
			//uploadBtnUp("idcardfile","idcardimg2","身份证");
		}
	}
	function vouchBtnUp(){
		var vouchfile = $("#vouchfile").val() || "";
		if(vouchfile !== ""){
			uploadBtnUp("vouchfile","vouchimg1","担保函");
			//uploadBtnUp("idcardfile","idcardimg2","身份证");
		}
	}
	function commitmentBtnUp(){
		var commitmentfile = $("#commitmentfile").val() || "";
		if(commitmentfile !== ""){
			uploadBtnUp("commitmentfile","commitmentimg1","借款承诺书");
			//uploadBtnUp("idcardfile","idcardimg2","身份证");
		}
	}
	function creditBtnUp(){
		var creditfile = $("#creditfile").val() || "";
		if(creditfile !== ""){
			uploadBtnUp("creditfile","creditimg1","个人征信报告");
			//uploadBtnUp("idcardfile","idcardimg2","身份证");
		}
	}
	function accountBtnUp(){
		var accountfile = $("#accountfile").val() || "";
		if(accountfile !== ""){
			uploadBtnUp("accountfile","accountimg1","户口本");
			//uploadBtnUp("idcardfile","idcardimg2","身份证");
		}
	}


	function uploadBtnUp(fileid,imgid,msg){
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
							$("#" + imgid).attr("src",src);
						}
						catch(e){
							Utils.alert(msg + "上传失败");
						}
					}
					//Utils.alert("头像上传成功");
					//console.log("ajaxFileUpload",data,status);
					//location.reload();
				},
				error: function (data, status, e)//服务器响应失败处理函数
				{
					Utils.alert(msg + "上传失败");
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











	//验证手机号
	function validPhone(){
		var phone = $("#inputphone").val() || "";
		var reg = /^1[3,5,7,8]\d{9}$/g;
		if(phone !== ""){
			if(!reg.test(phone)){
				Utils.alert("用户名/手机号输入错误");
				$("#inputphone").focus();
			}
		}
	}

	//验证密码6-16
	function validPwd(){
		var pwd = $("#inputpwd").val() || "";
		if((pwd.length < 6 || pwd.length > 16) && pwd !== ""){
			Utils.alert("密码输入错误");
			$("#inputpwd").focus();
		}
	}


	function loginBtnUp(evt){
		var phone = $("#inputphone").val() || "";
		var pwd = $("#inputpwd").val() || "";
		//var code = $("#inputCode3").val() || "";
		if(phone !== ""){
			if(pwd !== ""){
				var savePhone = $("#chkphone")[0].checked;
				if(savePhone){
					Utils.offLineStore.set("userphone_login",phone,true);
				}
				var condi = {};
				condi.phone_number = phone;
				condi.password = pwd;
				sendLoginHttp(condi);
			}
			else{
				Utils.alert("请输入密码");
				$("#inputpwd").focus();
			}
		}
		else{
			Utils.alert("请输入手机号");
			$("#inputphone").focus();
		}
	}

	function sendLoginHttp(condi){
		var url = Base.serverUrl + "user/CustomerLoginController";
		g.httpTip.show();
		$.ajax({
			url:url,
			data:condi,
			type:"POST",
			dataType:"json",
			context:this,
			success: function(data){
				console.log("sendLoginHttp",data);
				var status = data.success || false;
				if(status){
					var userInfo = data.obj || "";
					if(userInfo !== ""){
						userInfo = JSON.stringify(userInfo);
						//保存用户数据
						Utils.offLineStore.set("userinfo",userInfo,false);
						var token = data.token || "";

						Utils.offLineStore.set("token",token,false);
						location.href = "usercenter.html";
					}

					//location.href = "center.html";
					//var token = data.result.token || "";
					//Utils.offLineStore.set("token",token,false);
					//location.href = "center.html?token=" + token + "&p=0";
				}
				else{
					//var msg = data.error || "";
					var msg = data.message || "登录失败";
					Utils.alert(msg);
					//getImgCode();
				}
				g.httpTip.hide();
			},
			error:function(data){
				g.httpTip.hide();
			}
		});
	}















	function findPwdPage(){
		location.href = "findpwd.html";
	}

	setTimeout(function(){
		getImgCode();
	},2000);
	//换一组图片
	function getImgCode(evt){
		var userName = $("#inputEmail3").val() || "";
		if(userName !== ""){
			g.codeId = userName;
			//console.log(g.codeId);
			$("#updatecodebtn").attr("src",Base.imgCodeUrl + "?id=" + g.codeId + "&t=" + (new Date() - 0));
			clearTimeout(g.tout);
			g.tout = setTimeout(function(){
				getImgCode();
			},60000);
		}
	}

	//重置信息
	function resetRegInfo(evt){
		$("#inputEmail3").val("");
		$("#inputPassword3").val("");
		$("#inputPhone3").val("");
		$("#inputImgCode3").val("");
		$("#inputCode3").val("");
		$("#password").val("");
	}

	function codeKeyDown(evt){
		evt = evt || event;
		if(evt.keyCode == 13){
			//
			$("#loginbtn").trigger("click");
		}
	}

	//打开注册用户页面
	function openRegPage(evt){
		window.open("reg.html");
	}
});