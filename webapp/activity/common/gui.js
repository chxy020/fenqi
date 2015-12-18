
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
		condi.userPhone = $("#input_phone_value").val() || "";
		condi.question1 = "10010"+$("#select_city option:selected").attr("value");
		condi.question2 = "10020"+$("input[name='radio1']:checked").attr("value");
		condi.question3 = "10030"+$("input[name='radio2']:checked").attr("value");
		condi.question4 = str;
		condi.question5 = "10050"+$("input[name='radio4']:checked").attr("value");
		condi.question6 = "10060"+$("input[name='radio5']:checked").attr("value");
		condi.question7 = "10070"+$("input[name='radio6']:checked").attr("value");
		condi.question8 = "10080"+$("input[name='radio7']:checked").attr("value");
		condi.question9 = "10090"+$("input[name='radio8']:checked").attr("value");
		condi.question10 = $("#input_common_value").val() || "";
		condi.question11 = "10110"+$("input[name='radio10']:checked").attr("value");
		condi.question12 = "10120"+$("input[name='radio11']:checked").attr("value");
		condi.question13 = "10130"+$("input[name='radio12']:checked").attr("value");		
		/* if($("#select_city option:selected").attr("value") == ""){
			alert("第"+1+"题不能为空");return;
		}
		for(var i = 0; i < 12; i++){
			var a = i + 1,b = i + 2;
			if( a != 3 && a != 9){
				var a = 0;
				$("input[name='radio"+a+"']").each(function(){
					if($(this).attr("checked")){return;}else{a++;return;}
				})
				if(a >= 3){}
			}else if(a == 3 && str == "10040,"){
				alert("第"+4+"题不能为空");return;
			}else if(a == 9 && $("#input_common_value").val() == ""){
				alert("第"+4+"题不能为空");return;
			}
		}	 */			
		var url = Base.serverUrl + "questionnaire/addQuestionnaire";
		//if(!isWeiXin()){alert("请使用微信");return;}
		if(!validPhone()){return;}
			$.ajax({
				url:url,
				data:condi,
				type:"GET",
				dataType:"json",
				context:this,
				global:false,
				success: function(data){
					//console.log("sendGetMyOrderHttp",data);
					var success = data.success || "";
					if(success){
						var hongbao = data.obj;
						Utils.offLineStore.set("hongbao",hongbao,false);
						location.replace("hongbao.html");
					}
					else{
						var msg = data.message || "";
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
				//console.log("sendGetUserInfoDicHttp",data);
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
			g.platform = 1;
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


