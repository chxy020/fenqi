$(document).ready(function(){	
	var g = {};
	g.hongbao = Utils.offLineStore.get("hongbao",false) || "";
	g.answer = 0;
	resize_width();	
	g.answer1_id = "";
	g.answer2_id = "";
	/* 元宵活动标记 */
	g.code = Utils.getQueryString("code") || "";
	g.customerId = "";
	g.dengmi = Utils.offLineStore.get("dengmi",false) || "";
	g.coupons_id = Utils.offLineStore.get("coupons_id",false) || "";
	g.login_token = Utils.offLineStore.get("token",false) || "";
	/* 判断有没有获得openid */
	confrim_openid();
	function confrim_openid(){
		if(g.code == ""){
			alert("请关注微信\"燕子安家\"参与活动！");
			$("#get_dialog_btn").bind("click",function(){alert("请关注微信\"燕子安家\"参与活动！");});//绑定打开猜谜语页面
		}else{
			var condi = {};	
				condi.user_code = g.code;
			var url = Base.serverUrl + "question/isParticipant";
			$.ajax({
					url:url,
					data:condi,
					type:"post",
					dataType:"json",
					context:this,
					global:false,
					success: function(data){
						var success = data.success || "";
						if(success){
							var data = data || "";
							g.openid = data.obj || "";
							Utils.offLineStore.set("openid",g.openid,false);
							$("#get_dialog_btn").bind("click",get_hongbao);//绑定打开猜谜语页面
						}
						else{
							var msg = data.message || "";
							alert(msg);
							if(msg == "您已参加活动"){
								$("#get_dialog_btn").bind("click",function(){
									alert("您已参加活动");
								});
							}else{
								$("#get_dialog_btn").bind("click",function(){
									alert("请关注微信\"燕子安家\"参与活动！");
								});
							}							
						}
					},
					error:function(data){
					}
				})			
		}
	}
		
	$("#next_btn").bind("click",next_btn_func);
	$("#sunmit_btn").bind("click",sunmit_btn_func);
	$("#login_btn").bind("click",login_btn_func);
	$("#focus_btn").bind("click",focus_btn_func);
	$(".sbox_bg,#exit_a_btn,#exit_a_btn2").bind("click",sbox_out);
		
	/* 下一题 */
	function next_btn_func(){
		if($("#question1 ul").hasClass("hidden")){alert("请答题");return;}
		$("#choise_b").removeClass().addClass("position Q2");
	}
	/* 提交 */
	function sunmit_btn_func(){		
		var condi = {};	
			condi.question_option_id = g.answer1_id +","+g.answer2_id || "";
		var url = Base.serverUrl + "question/commitUserLanternFestivalAnswer";
		if($("#question2 ul").hasClass("hidden")){alert("请答题");return;}
		$.ajax({
				url:url,
				data:condi,
				type:"post",
				dataType:"json",
				context:this,
				global:false,
				success: function(data){
					var success = data.success || "";
					if(success){
						var obj = data.obj || {};
						var type = obj.type || "2";
						var coupons_money = obj.money+"元" || "0元";
						var cash_money = obj.money+"元" || "0元";
						var coupons_id = obj.id || "";
						var pond_id = obj.id || "";
						switch(type){
							case "0" : 
								Utils.offLineStore.set("coupons_id",coupons_id,false);
								$("#coupons_money").html(coupons_money); 
								$("#choise_b").removeClass().addClass("position answer1");
								$("#yes_number").html(g.answer);								
								break; 
							case "1" : 
								g.pond_id = pond_id;
								$("#cash_money").html(cash_money); 
								$("#choise_b").removeClass().addClass("position answer2"); 
								break; 
							default: 
								$("#hongbao_sbox").removeClass().addClass("sbox answer3"); 
								break; 
						}
					}
					else{
						var msg = data.message || "";
						alert(msg);
					}
				},
				error:function(data){
				}
			})

		/* switch (g.answer){
		case 0 : $("#hongbao_sbox").removeClass().addClass("sbox answer3"); break; 
		case 1 : $("#choise_b").removeClass().addClass("position answer1"); break; 
		case 2 : $("#choise_b").removeClass().addClass("position answer2"); break; 
		default : alert("提交失败！"); break; 
		} */
	}

	//获取个人资料
	function getUserInfo(){
		var info = Utils.offLineStore.get("userinfo",false) || "";
		if(info !== ""){
			var obj = JSON.parse(info) || {};
			var obj = data || {};
			//用户登录ID
			g.customerId = obj.customerId || "";
		}
	}
	/* 登录领取优惠券 */
	var loginStatus = Utils.getUserInfo();
	function login_btn_func(){
		var dengmi = "dengmi";
		Utils.offLineStore.set("dengmi",dengmi,false);
		if(loginStatus){
			getUserInfo();
			get_user_coupons();
		}else{
			location.replace("../login/login.html");
		}		
	}
	
	//元宵活动的自动获取优惠券
	function get_user_coupons(){
		var url = Base.serverUrl + "coupon/claimCoupon";		
		var condi = {};
		condi.couponId = g.coupons_id;//优惠券id
		condi.customerId = g.customerId;
		condi.user_id = g.openid;
		condi.login_token = g.login_token;
		$.ajax({
			url:url,
			type:"POST",
			data:condi,
			dataType:"json",
			context:this,
			success: function(data){
				var status = data.success || false;
				if(status){
					/* 判断是否是从元宵活动页过来的 */
					location.href = "/webapp/coupons/index.html";

				}
				else{
					var msg = data.message || "获取优惠券失败";
					alert(msg);
					location.replace("../personal-center/index.html");
				}
			},
			error:function(data){
			}
		});
	}


	/* 请求红包 */
	function focus_btn_func(){
		var condi = {};	
			condi.user_id = g.openid;
			condi.pond_id = g.pond_id;
		var url = Base.serverUrl + "pond/claimRedpack";
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
						alert("领取成功！");
						WeixinJSBridge.call('closeWindow');	
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
	
	/* 获取信息 */
	function get_every(){
		var condi = {};	
		var url = Base.serverUrl + "question/selectRandomTwoQuestions";
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
						var question = data.obj || "";
						var Q1='';
						for(var i=0;i< question.length;i++){
							var a = i+1;
							var title = question[i].title || "";
							Q1 += '<div class="question question'+a+'" id="question'+a+'">';
							Q1 += '<h4 class="title">'+a+'、'+title+'</h4>';
							Q1 += '<ul class="answer hidden">';
							var options = question[i].options || "";
							for(var s=0;s< options.length;s++){
								var b = s+1;
								var optionDescr = options[s].optionDescr || "";
								var answer_1 = options[s].result || "";
								var questionOptionId = options[s].questionOptionId || "";
								var ans = answer_1 == 1 ? "yes" : "wrong";
								Q1 += '<li id="'+questionOptionId+'" class="'+ans+'"><i></i>'+optionDescr+'</li>';
							}
							Q1 += '</ul>';
							Q1 += '</div>';							
						}
						$("#question_list").html(Q1);	
						bind_click();
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

	/* 定义click */
	function bind_click(){
		$(".answer.hidden li").click(function(){
			if($(this).hasClass("yes") && $(this).parents("ul.answer").hasClass("hidden")){g.answer++;}
			if($(this).parents("div").hasClass("question1")&& $(this).parents("ul.answer").hasClass("hidden")){g.answer1_id = $(this).attr("id");}
			else if($(this).parents("div").hasClass("question2")&& $(this).parents("ul.answer").hasClass("hidden")){g.answer2_id = $(this).attr("id");}
			$(this).parents(".answer.hidden").removeClass("hidden").addClass("show");			
		})
	}
	
	
	
function get_hongbao(){
	get_every();
	$('body').animate({scrollTop:0},100);
	$("body").css("overflow","hidden");
	$("body").css({"position":"fixed","height":"100%"});
	$(".sbox_bg,.sbox").fadeIn(300);
}
function sbox_out(){
	$("body").css("overflow","auto");
	$("body").css({"position":"static","height":"auto"});
	$(".sbox_bg,.sbox").fadeOut(0);
}	
/* 灯笼区域点击效果 */
	/* $(".body_div").ripples({
		resolution: 200,
		dropRadius: 10, //px
		perturbance: 0.10,
	}); */
 /* jQuery('#ripple_img').waterripple({onclick: true}); */
 
function resize_width(){
	var width=$("html").width();
	var size=[0.5841,0.2,0.2133,1.11];//
	var size2=[0.584,0.15,0.23,0.29,0.26,0.25];
	var height=[];
		height[0]=(width/size[0]).toFixed(0);
		$(".body_div").css("height",height[0]+"px");
	//$(".er_div1 .red_box").css("top",(height[0]*size2[0]).toFixed(0)+"px");
	$(".sbox .bottom_btn a.a_btn").css("height",(width*size[1]).toFixed(0)+"px");
	$(".sbox .bottom_btn a.a_btn").css("width",(width*size[2]).toFixed(0)+"px");
}
$(window).resize(function(){
	resize_width();	
})


window.bind_click = bind_click;
window.resize_width=resize_width;
window.get_hongbao = get_hongbao;
window.sbox_out = sbox_out;
/*  */
})
