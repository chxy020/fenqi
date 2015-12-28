$(document).ready(function(){	
	var g = {};
	g.hongbao = Utils.offLineStore.get("hongbao",false) || "";

	$("#hongbao_a_btn").bind("click",get_hongbao);
	$(".sbox_bg,.sbox").bind("click",sbox_out);
		
function get_hongbao(){
	var hongbao = g.hongbao || 0;
	$('html,body').animate({scrollTop:0},100);
	$("#hongbao_sbox .money").html(hongbao);
	$("html,body").css("overflow","hidden");
	$(".sbox_bg,.sbox").fadeIn(300);	
}
function sbox_out(){
	$("html,body").css("overflow","auto");
	$(".sbox_bg,.sbox").fadeOut(0);		
}	



window.get_hongbao = get_hongbao;
window.sbox_out = sbox_out;
/*  */
})
