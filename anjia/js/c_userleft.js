/**
 * 通用头部
*/

//获取url参数
function getQueryString(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
	var r = window.location.search.substr(1).match(reg);
	if (r != null && typeof r != "undefined"){
		return unescape(r[2]);
	}
	else{
		return "";
	}
}

var __item__ = getQueryString("item") || "";
var __ostatus__ = getQueryString("ostatus") || "";

//var __Tel__ = "400-968-9088";
var __html__ = [];

__html__.push('<ul>');

//~ __html__.push('<li>');
//~ if(__item__ == 0 || __item__ == ""){
	//~ __html__.push('<div class="nav-main-item selected">');
//~ }
//~ else{
	//~ __html__.push('<div class="nav-main-item">');
//~ }
//~ __html__.push('<a href="/anjia/usercenter.html?item=0">个人账户</a>');
//~ __html__.push('<i class="common-ico ico-selected-flag"></i>');
//~ __html__.push('</div>');
//~ __html__.push('</li>');

__html__.push('<li>');
if(__item__ == 1 || __item__ == ""){
	__html__.push('<div class="nav-main-item selected">');
}
else{
	__html__.push('<div class="nav-main-item">');
}
__html__.push('<a href="/anjia/usercenter.html?item=1">我的订单</a>');
__html__.push('<i class="common-ico ico-selected-flag"></i>');
__html__.push('<a class="up_down_a"></a>');
__html__.push('</div>');
__html__.push('<dl class="sub-left-sec-nav sub-left-sec-nav-m">');

if(__ostatus__ == "100501"){
	__html__.push('<dd class="selected">');
}
else{
	__html__.push('<dd>');
}
__html__.push('<a href="/anjia/usercenter.html?item=1&ostatus=100501">未完成</a>');
__html__.push('<i class="common-ico ico-selected-flag"></i>');
__html__.push('</dd>');

if(__ostatus__ == "100502100503"){
	__html__.push('<dd class="selected">');
}
else{
	__html__.push('<dd>');
}
__html__.push('<a href="/anjia/usercenter.html?item=1&ostatus=100502100503">审核中</a>');
__html__.push('<i class="common-ico ico-selected-flag"></i>');
__html__.push('</dd>');

/*  */
if(__ostatus__ == "100515"){
	__html__.push('<dd class="selected">');
}
else{
	__html__.push('<dd>');
}
__html__.push('<a href="/anjia/usercenter.html?item=1&ostatus=100515">待确认</a>');
__html__.push('<i class="common-ico ico-selected-flag"></i>');
__html__.push('</dd>');

if(__ostatus__ == "100505"){
	__html__.push('<dd class="selected">');
}
else{
	__html__.push('<dd>');
}
__html__.push('<a href="/anjia/usercenter.html?item=1&ostatus=100505">待缴费</a>');
__html__.push('<i class="common-ico ico-selected-flag"></i>');
__html__.push('</dd>');


if(__ostatus__ == "100506"){
	__html__.push('<dd class="selected">');
}
else{
	__html__.push('<dd>');
}
__html__.push('<a href="/anjia/usercenter.html?item=1&ostatus=100506">待放款</a>');
__html__.push('<i class="common-ico ico-selected-flag"></i>');
__html__.push('</dd>');
/* 
if(__ostatus__ == "100502"){
	__html__.push('<dd class="selected">');
}
else{
	__html__.push('<dd>');
}
__html__.push('<a href="/anjia/usercenter.html?item=1&ostatus=100502">商家审核中</a>');
__html__.push('<i class="common-ico ico-selected-flag"></i>');
__html__.push('</dd>');

if(__ostatus__ == "100503" ){
	__html__.push('<dd class="selected">');
}
else{
	__html__.push('<dd>');
}
__html__.push('<a href="/anjia/usercenter.html?item=1&ostatus=100503">风控审核中</a>');
__html__.push('<i class="common-ico ico-selected-flag"></i>');
__html__.push('</dd>');
 */

//~ if(__ostatus__ == "100506"){
	//~ __html__.push('<dd class="selected">');
//~ }
//~ else{
	//~ __html__.push('<dd>');
//~ }
//~ __html__.push('<a href="/anjia/usercenter.html?item=1&ostatus=100506">我的支付</a>');
//~ __html__.push('<i class="common-ico ico-selected-flag"></i>');
//~ __html__.push('</dd>');


if(__ostatus__ == "100507"){
	__html__.push('<dd class="selected">');
}
else{
	__html__.push('<dd>');
}
__html__.push('<a href="/anjia/usercenter.html?item=1&ostatus=100507">还款中</a>');
__html__.push('<i class="common-ico ico-selected-flag"></i>');
__html__.push('</dd>');

if(__ostatus__ == "100508"){
	__html__.push('<dd class="selected">');
}
else{
	__html__.push('<dd>');
}
__html__.push('<a href="/anjia/usercenter.html?item=1&ostatus=100508">已还清</a>');
__html__.push('<i class="common-ico ico-selected-flag"></i>');
__html__.push('</dd>');

if(__ostatus__ == "100509" ){
	__html__.push('<dd class="selected">');
}
else{
	__html__.push('<dd>');
}
__html__.push('<a href="/anjia/usercenter.html?item=1&ostatus=100509">拒绝</a>');
__html__.push('<i class="common-ico ico-selected-flag"></i>');
__html__.push('</dd>');
/*  */
if(__ostatus__ == "100510"){
	__html__.push('<dd class="selected">');
}
else{
	__html__.push('<dd>');
}
__html__.push('<a href="/anjia/usercenter.html?item=1&ostatus=100510">已逾期</a>');
__html__.push('<i class="common-ico ico-selected-flag"></i>');
__html__.push('</dd>');
/*  */
if(__ostatus__ == "100511"){
	__html__.push('<dd class="selected">');
}
else{
	__html__.push('<dd>');
}
__html__.push('<a href="/anjia/usercenter.html?item=1&ostatus=100511">已违约</a>');
__html__.push('<i class="common-ico ico-selected-flag"></i>');
__html__.push('</dd>');
/*  */
if(__ostatus__ == "100512"){
	__html__.push('<dd class="selected">');
}
else{
	__html__.push('<dd>');
}
__html__.push('<a href="/anjia/usercenter.html?item=1&ostatus=100512">逾期已还清</a>');
__html__.push('<i class="common-ico ico-selected-flag"></i>');
__html__.push('</dd>');
/*  */
if(__ostatus__ == "100513"){
	__html__.push('<dd class="selected">');
}
else{
	__html__.push('<dd>');
}
__html__.push('<a href="/anjia/usercenter.html?item=1&ostatus=100513">违约已还清</a>');
__html__.push('<i class="common-ico ico-selected-flag"></i>');
__html__.push('</dd>');
/*  */
if(__ostatus__ == "100514"){
	__html__.push('<dd class="selected">');
}
else{
	__html__.push('<dd>');
}
__html__.push('<a href="/anjia/usercenter.html?item=1&ostatus=100514">已取消</a>');
__html__.push('<i class="common-ico ico-selected-flag"></i>');
__html__.push('</dd>');

/*  */
__html__.push('</dl>');
__html__.push('</li>');

__html__.push('<li>');

if(__item__ == 5){
	__html__.push('<div class="nav-main-item selected">');
}
else{
	__html__.push('<div class="nav-main-item">');
}
__html__.push('<a id="userleft_abtn" href="/anjia/usercenter.html?item=5&ostatus=100500">我的额度</a>');
__html__.push('<i class="common-ico ico-selected-flag"></i>');
__html__.push('</div>');
__html__.push('</li>');

__html__.push('<li>');

if(__item__ == 2){
	__html__.push('<div class="nav-main-item selected">');
}
else{
	__html__.push('<div class="nav-main-item">');
}
__html__.push('<a id="click_a_info" style="cursor:pointer;">我的资料</a>');
__html__.push('<i class="common-ico ico-selected-flag"></i>');
__html__.push('<a class="up_down_a2"></a>');
__html__.push('</div>');
/*  */
__html__.push('<dl class="sub-left-sec-nav sub-left-sec-nav-n">');

if(__ostatus__ == "1002"){
	__html__.push('<dd class="selected">');
}
else{
	__html__.push('<dd>');
}
__html__.push('<a href="/anjia/userinfo.html?item=2&ostatus=1002">编辑资料</a>');
__html__.push('<i class="common-ico ico-selected-flag"></i>');
__html__.push('</dd>');

if(__ostatus__ == "1005"){
	__html__.push('<dd class="selected">');
}
else{
	__html__.push('<dd>');
}
__html__.push('<a href="/anjia/changephone.html?item=2&ostatus=1005">换绑手机</a>');
__html__.push('<i class="common-ico ico-selected-flag"></i>');
__html__.push('</dd>');
__html__.push('</dl>');
/*  */
__html__.push('</li>');
/* __html__.push('<li>');

if(__item__ == 3){
	__html__.push('<div class="nav-main-item selected">');
}
else{
	__html__.push('<div class="nav-main-item">');
}

__html__.push('<a href="/anjia/changephone.html?item=3">换绑手机</a>');
__html__.push('<i class="common-ico ico-selected-flag"></i>');
__html__.push('</div>');
__html__.push('</li>'); */
__html__.push('<li>');

if(__item__ == 4){
	__html__.push('<div class="nav-main-item selected">');
}
else{
	__html__.push('<div class="nav-main-item">');
}
__html__.push('<a href="/anjia/card-center.html?item=4">我的银行卡</a>');
__html__.push('<i class="common-ico ico-selected-flag"></i>');
__html__.push('</div>');
__html__.push('</li>');
__html__.push('<li>');

if(__item__ == 6){
	__html__.push('<div class="nav-main-item selected">');
}
else{
	__html__.push('<div class="nav-main-item">');
}
__html__.push('<a href="/anjia/coupons.html?item=6">我的优惠券</a>');
__html__.push('<i class="common-ico ico-selected-flag"></i>');
__html__.push('</div>');
__html__.push('</li>');
__html__.push('</ul>');
document.write(__html__.join(''));


	$(".sub-left-nav ul li .nav-main-item .up_down_a").click(function(){
		$(this).toggleClass("up");
		$(this).parents(".nav-main-item").siblings("dl.sub-left-sec-nav-m").slideToggle(400);
	})
	$(".sub-left-nav ul li .nav-main-item .up_down_a2,#click_a_info").click(function(){
		$(".sub-left-nav ul li .nav-main-item .up_down_a2").toggleClass("up");
		$(".sub-left-nav ul li .nav-main-item .up_down_a2").parents(".nav-main-item").siblings("dl.sub-left-sec-nav-n").slideToggle(400);
	})
	
	if(__item__== 1 && __ostatus__!=""){
		$(".sub-left-nav ul li .nav-main-item .up_down_a").addClass("up");	
		$(".sub-left-nav .sub-left-sec-nav-m").fadeIn(0);
	}else if(__item__== 2 && __ostatus__!=""){
		$(".sub-left-nav ul li .nav-main-item .up_down_a2").addClass("up");	
		$(".sub-left-nav .sub-left-sec-nav-n").fadeIn(0);
	}

	
	