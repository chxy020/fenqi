/**
 * file:我要分期
 * author:chenxy
*/

//页面初始化
$(function(){
	var g = {};
	g.phone = "";
	g.imgCodeId = "";
	g.sendCode = false;
	g.login_token = Utils.offLineStore.get("token",false) || "";
	g.channel = Utils.getQueryString("channel") || "";
	if(g.channel != ""){Utils.offLineStore.set("channel",g.channel,false);}	
	g.sendTime = 60;
	g.customerId = "";
	g.userPhone = "";	
	g.pageSize = 5;//多少条是一页
	g.page = 0;//总页数
	g.currentPage = 1;

		//验证登录状态
	var loginStatus = Utils.getUserInfo();
	if(!loginStatus){
		//未登录
		//location.replace("/anjia/login.html");
	}
	
	panduan_Qlist();
/* 判断问题个数 */
function panduan_Qlist(){
	g.Q_list_number = $("#Q_list_content").find(".Q_list").length || 0;
	g.page = Math.ceil(g.Q_list_number/g.pageSize) || 0;
	/* 页面加载分页 */
	$("#Q_list_content").find(".Q_list").each(function(n){
		var a = n + 1;
		for(var i = 0; i < g.page; i ++){
			var a = i +1;
			if(n >= g.pageSize*i && n < g.pageSize*a ){$(this).addClass("page"+a+"")}
		}
		$("#Q_list_content").find(".Q_list").fadeOut(0);
		$("#Q_list_content").find(".page"+1+"").fadeIn(0);
	})
	var html = "";
	html += '<li class="active">第一页</li>';
	var b = ["二","三","四","五","六","七","八","九","十","十一"];
	for(var i = 1; i < g.page;i ++){
		var a = i-1;
		html += '<li>第'+b[a]+'页</li>';
	}
	html += '<br>共'+g.Q_list_number+'条记录  共'+g.page+'页';
	$("#Q_list_page").html(html);
	/* 翻页点击 */
	$(".Q_body_div ul.list_page li").each(function(n){
		$(this).click(function(){
			var a = n +1;
			$(this).addClass("active").siblings("li").removeClass("active");
			$("#Q_list_content").find(".Q_list").fadeOut(0);
			$("#Q_list_content").find(".page"+a+"").fadeIn(0);
		})
	})
}
	
	
	
window.panduan_Qlist = panduan_Qlist;	
//ready_end	
})












