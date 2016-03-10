/**
 * 通用头部
*/

//var __Tel__ = "400-968-9088";
var typePageId = '';
var __html__ = [];
__html__.push('<div class="ui-header">');
__html__.push('<div class="ui-wrap">');
__html__.push('<div class="ui-head-left f-left clearfix">');
/* __html__.push('<i class="happy_body_red_head"></i>'); */
__html__.push('<a href="/anjia/index.html"><img class="ui-logo" src="../res/images/logo.png"></a>');
__html__.push('<div class="ui-head-left-l f-left">');
__html__.push('<span class="cur-pos"><i class="common-ico ico-position"></i><em id="curCity">&nbsp;&nbsp;&nbsp;&nbsp;</em></span>');
__html__.push('<div class="select-city-box">');
__html__.push('<a href="javascript:void(0)" class="select-city-btn">[切换]</a>');
__html__.push('<div class="select-city-area">');
__html__.push('<ul class="select-city-area-ul clearfix">');
__html__.push('<li>');
__html__.push('<a href="javascript:void(0)">成都</a>');
__html__.push('</li>');
__html__.push('<li>');
__html__.push('<a href="javascript:void(0)">南充</a>');
__html__.push('</li>');
__html__.push('<li>');
__html__.push('<a href="javascript:void(0)">贵阳</a>');
__html__.push('</li>');
__html__.push('<li>');
__html__.push('<a href="javascript:void(0)">昆明</a>');
__html__.push('</li>');
__html__.push('<li>');
__html__.push('<a href="javascript:void(0)">西安</a>');
__html__.push('</li>');
__html__.push('<li>');
__html__.push('<a href="javascript:void(0)">武汉</a>');
__html__.push('</li>');
__html__.push('<li>');
__html__.push('<a href="javascript:void(0)">长沙</a>');
__html__.push('</li>');
__html__.push('<li>');
__html__.push('<a href="javascript:void(0)">南京</a>');
__html__.push('</li>');
__html__.push('<li>');
__html__.push('<a href="javascript:void(0)">合肥</a>');
__html__.push('</li>');
__html__.push('<li>');
__html__.push('<a href="javascript:void(0)">重庆</a>');
__html__.push('</li>');
__html__.push('<li>');
__html__.push('<a href="javascript:void(0)">北京</a>');
__html__.push('</li>');
__html__.push('<li>');
__html__.push('<a href="javascript:void(0)">大连</a>');
__html__.push('</li>');
__html__.push('<li>');
__html__.push('<a href="javascript:void(0)">天津</a>');
__html__.push('</li>');
__html__.push('<li>');
__html__.push('<a href="javascript:void(0)">济南</a>');
__html__.push('</li>');
__html__.push('<li>');
__html__.push('<a href="javascript:void(0)">苏州</a>');
__html__.push('</li>');
__html__.push('<li>');
__html__.push('<a href="javascript:void(0)">广州</a>');
__html__.push('</li>');
__html__.push('<li>');
__html__.push('<a href="javascript:void(0)">济宁</a>');
__html__.push('</li>');
__html__.push('<li>');
__html__.push('<a href="javascript:void(0)">杭州</a>');
__html__.push('</li>');
__html__.push('<li>');
__html__.push('<a href="javascript:void(0)">青岛</a>');
__html__.push('</li>');
__html__.push('<li>');
__html__.push('<a href="javascript:void(0)">沈阳</a>');
__html__.push('</li>');
__html__.push('<li>');
__html__.push('<a href="javascript:void(0)">太原</a>');
__html__.push('</li>');
__html__.push('<li>');
__html__.push('<a href="javascript:void(0)">宁波</a>');
__html__.push('</li>');
__html__.push('<li>');
__html__.push('<a href="javascript:void(0)">上海</a>');
__html__.push('</li>');
__html__.push('<li>');
__html__.push('<a href="javascript:void(0)">石家庄</a>');
__html__.push('</li>');
__html__.push('</ul>');
__html__.push('</div>');
__html__.push('</div>');
__html__.push('</div>');
__html__.push('</div>');
__html__.push('<div class="ui-phone-service">');
__html__.push('<p class="phone-service">全国统一免费咨询热线</p>');
__html__.push('<img src="../res/images/phone-number.png" width="168" height="14">');
__html__.push('</div>');
__html__.push('<div class="ui-nav">');
__html__.push('<ul>');
//通过url参数,判断selected应该加在哪
typePageId = getQueryString('typePageId');
__html__.push('<li><a href="/anjia/index.html?typePageId=0" class="'+((typePageId == '0' || typePageId == '')&&"selected")+'"><span><i>首页</i></span></a></li>');
__html__.push('<li><a href="/anjia/staging.html?typePageId=1" class="'+((typePageId == '1')&&"selected")+'"><span><i>家装分期</i></span></a></li>');
__html__.push('<li><a href="/anjia/business.html?typePageId=2" class="'+((typePageId == '2')&&"selected")+'"><span><i>合作商家</i></span></a></li>');
__html__.push('<li class="no-right-border"><a href="/anjia/about.html?typePageId=3" class="'+((typePageId == '3')&&"selected")+'"><span><i>关于我们</i></span></a></li>');
__html__.push('</ul>');
__html__.push('</div>');
__html__.push('</div>');
__html__.push('</div>');
//圣诞右侧图片
__html__.push('<i class="happy_body_ico"></i>');
document.write(__html__.join(''));
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
};


