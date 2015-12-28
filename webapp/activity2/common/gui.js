
$(document).ready(function(){
	/*  */	
	
	sendGetUserInfoDicHttp();
	$("#submit_a_btn").bind("click",submit_form);
	//if(!isWeiXin()){alert("请使用微信");}
	/* 单选 */
	$(".radio_common").click(function(){
			$(this).siblings(".radio_common").removeClass("checked").find("input").attr("checked",false);
			$(this).addClass("checked");
			$(this).find("input").attr("checked","checked");
	})
	/* 复选 */
	$(".check_common").click(function(){
		if($(this).find("input").attr("checked") == "checked"){
			$(this).removeClass("checked");
			$(this).find("input").attr("checked",false);
		}else{
			$(this).addClass("checked");
			$(this).find("input").attr("checked","checked");
		}
	})
	
	
	function submit_form(){
		var condi = {};
		var question = [];
		var str="";
            $("input[name='checkbox3']:checkbox").each(function(){ 
                if($(this).attr("checked")){
                    str += ("10040"+$(this).attr("value")+",");
                }
            })
		condi.userName = $("#input_name_value").val() || "";
		condi.userPhone = $("#input_phone_value").val() || "";
		condi.question1 = $("#select_city option:selected").attr("value") || "";
		condi.question4 = str || "";
		condi.question12 = $("#input_common_value").val() || "";
		var question2 = $("input[name='radio1']:checked").attr("value") || "";
		var question3 = $("input[name='radio2']:checked").attr("value") || "";
		var question5 = $("input[name='radio4']:checked").attr("value") || "";
		var question6 = $("input[name='radio5']:checked").attr("value") || "";
		var question7 = $("input[name='radio6']:checked").attr("value") || "";
		var question8 = $("input[name='radio7']:checked").attr("value") || "";
		var question9 = $("input[name='radio8']:checked").attr("value") || "";
		var question10 = $("input[name='radio10']:checked").attr("value") || "";
		var question11 = $("input[name='radio11']:checked").attr("value") || "";
		
		if(condi.userName == ""){alert("姓名不能为空","提示");return;}
		if(!validPhone()){return;}
		if(condi.question1 == ""){alert("第"+1+"题不能为空","提示");return;}
		if(question2 == ""){condi.question2 = "";alert("第2题不能为空","提示");return;}else{condi.question2 = "10020" + question2}
		if(question3 == ""){condi.question3 = "";alert("第3题不能为空","提示");return;}else{condi.question3 = "10030" + question3}
		if(condi.question4 == ""){alert("第"+4+"题不能为空","提示");return;}
		if(question5 == ""){condi.question5 = "";alert("第5题不能为空","提示");return;}else{condi.question5 = "10050" + question5}
		if(question6 == ""){condi.question6 = "";alert("第6题不能为空","提示");return;}else{condi.question6 = "10060" + question6}
		if(question7 == ""){condi.question7 = "";alert("第7题不能为空","提示");return;}else{condi.question7 = "10070" + question7}
		if(question8 == ""){condi.question8 = "";alert("第8题不能为空","提示");return;}else{condi.question8 = "10080" + question8}
		if(question9 == ""){condi.question9 = "";alert("第9题不能为空","提示");return;}else{condi.question9 = "10090" + question9}		
		if(question10 == ""){condi.question10 = "";alert("第10题不能为空","提示");return;}else{condi.question10 = "10100" + question10}
		if(question11 == ""){condi.question11 = "";alert("第11题不能为空","提示");return;}else{condi.question11 = "10110" + question11}
		if(condi.question12 == ""){alert("第"+12+"题不能为空","提示");return;}
	
		var url = Base.serverUrl + "questionnaire/yzajddc";
		//if(!isWeiXin()){alert("请使用微信");return;}
			$.ajax({
				url:url,
				data:condi,
				type:"GET",
				dataType:"json",
				context:this,
				global:false,
				success: function(data){
					var success = data.success || "";
					if(success){
						/* var hongbao = data.obj;
						Utils.offLineStore.set("hongbao",hongbao,false); */
						location.replace("success.html");
					}
					else{
						var msg = data.message || "提交失败";
						alert(msg);
					}
				},
				error:function(data){
				}
			})
		
		
	}
		//验证手机号
	function validPhone(){
		var phone = $("#input_phone_value").val() || "";
		var reg = /^1[3,5,7,8]\d{9}$/g;
		if(phone !== ""){
			if(!reg.test(phone)){
				alert("手机号输入错误");
				return false;
			}else{
				return true;
			}
		}else{
			alert("请输入手机号");
		}
	}
	
	//获取城市列表
	function sendGetUserInfoDicHttp(){
		var url = Base.serverUrl + "city/getCitys";
		var condi = {};
		$.ajax({
			url:url,
			data:condi,
			type:"POST",
			dataType:"json",
			context:this,
			success: function(data){
				var status = data.success || false;
				if(status){
					changeSelectHtml(data);
				}
				else{
					var msg = data.message || "获取城市列表失败";
					alert(msg);
				}				
			},
			error:function(data){
			}
		});
	}

	function changeSelectHtml(obj){
			var data = obj.list || {};
			var option = [];
			option.push('<option value="">选择城市</option>');
			for(var i=0;i<data.length;i++){
				var name = data[i].name;
				var id = data[i].id || "";
					option.push('<option value="' + id + '">' + name + '</option>');
			}
			$("#select_city").html(option.join(''));
	}
	/* 判断是否是微信登录 */
	function isWeiXin(){
		var ua = window.navigator.userAgent.toLowerCase();
		if(ua.match(/MicroMessenger/i) == 'micromessenger'){			
			return true;
		}else{
			return false;
		}
	}
	
	window.submit_form = submit_form;
	window.sendGetUserInfoDicHttp = sendGetUserInfoDicHttp;
	window.validPhone = validPhone;
	window.isWeiXin = isWeiXin;
/*  */
})


