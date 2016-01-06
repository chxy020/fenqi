var COMMON_PLUGIN = {},rankListScroll;
/**
 * 定义命名空间的变量
 */
COMMON_PLUGIN.namespace = function(str) {
    var arr = str.split("."),
        o = COMMON_PLUGIN;
    for (i = (arr[0] == "COMMON_PLUGIN") ? 1 : 0; i < arr.length; i++) {
        o[arr[i]] = o[arr[i]] || {};
        o = o[arr[i]];
    }
};
COMMON_PLUGIN.namespace("COMMON"); //定义命名空间

COMMON_PLUGIN.COMMON.HOVER_MOBILE = function(){
	document.body.addEventListener('touchstart', function () {});
}
COMMON_PLUGIN.COMMON.INIT = function(){
	COMMON_PLUGIN.COMMON.HOVER_MOBILE();
}
//toast
/*
	@param String toastMsg;
	@param Number durationTime;
*/
COMMON_PLUGIN.COMMON.TOAST = function(toastMsg,durationTime){
	if(typeof toastMsg === 'undefined' || typeof durationTime === 'undefined') return;
	layer.open({
		content: toastMsg,
		shadeClose: true,
		style: 'background-color:rgba(0,0,0,0.7); color:#fff; border:none;padding:5px;',
		time: durationTime
	});
}
COMMON_PLUGIN.COMMON.LOADING = function(){
	var loadingHtml = '<div class="spinner">'
  					   +'<div class="rect1"></div>'
					   +'<div class="rect2"></div>'
					   +'<div class="rect3"></div>'
					   +'<div class="rect4"></div>'
					   +'<div class="rect5"></div>'
					  +'</div>';
	layer.open({
		content: loadingHtml,
		shadeClose: false,
		style: 'background-color:rgba(0,0,0,0.7); color:#fff; border:none;padding:5px;'
	});
}
COMMON_PLUGIN.COMMON.REMOVE_LOADING = function(){
	setTimeout(function(){
		$('.layermbox').remove();
	},1000);
	
}
//dialog one-btn
/*
	@param String showMsg;
	@param Function sureClickCallBack;
*/
COMMON_PLUGIN.COMMON.ALERT_DIALOG_ONE = function(showMsg,sureClickCallBack){
	if(typeof showMsg === 'undefined') return;
	var sureClickCallBackFun = sureClickCallBack || function(){};
	layer.open({
		content: showMsg,
		 shadeClose: false,
		btn: ['确定'],
		yes: function(index){
			sureClickCallBackFun();
			layer.close(index);
		}
	});
}
//dialog two-btn
/*
	@param String showMsg;
	@param Function sureClickCallBack 确定点击按钮;
	@param Function cancelClickCallBack 确定点击按钮;
*/
COMMON_PLUGIN.COMMON.ALERT_DIALOG_TWO = function(showMsg,sureClickCallBack,cancelClickCallBack){
	if(typeof showMsg === 'undefined' || typeof sureClickCallBack !== 'function' || typeof cancelClickCallBack !== 'function') return;
	layer.open({
		content: showMsg,
		btn: ['确定','取消'],
		yes: function(index){
			sureClickCallBack();
			layer.close(index);
		},
		no: function(index){
			cancelClickCallBack();
			layer.close(index);
		}
	});
}
COMMON_PLUGIN.COMMON.SLIDE_INIT = function (bannerImgInterface,bannerInterfactType){
		var imgInterface = bannerImgInterface || '';
		var interfactType = bannerInterfactType || ''
		var condi = {};
		var slideHtml = []
		condi.navigationKey = interfactType;

		var url = Base.serverUrl + imgInterface;
		$.ajax({
			url:url,
			data:condi,
			type:"POST",
			dataType:"json",
			context:this,
			success: function(data){
				console.log(data);
				var status = data.success || false;
				if(status){
					var list = data.list;
					for(var i = 0, len = list.length; i < len; i++){
						var d = list[i] || {};
						var deleted = d.deleted || 0;
						if(deleted === 1){
							continue;
						}
						var bmUrl = d.bmUrl || "";
						var bmClickUrl = d.bmClickUrl || "javascript:void(0);";
						if(bmUrl !== ""){
							slideHtml.push('<li><a href="'+bmClickUrl+'"><img src="'+bmUrl+'" /></li>');
						}
					}
					$('.am-slides').html(slideHtml.join(''));
					$('.am-slider').flexslider();
				}
				else{
					var msg = data.message || "获取首页轮播图数据失败";
					Utils.alert(msg);
				}
				//g.httpTip.hide();
			},
			error:function(data){
				//g.httpTip.hide();
			}
		});	
}
//targetObj 初始化对象
//maxTime 最长时间
//minTime 最短时间
//onselectCallBack 点击确定回调方法
COMMON_PLUGIN.COMMON.MOBILE_SCROLL_INIT=function(targetObj,maxTime,minTime,changeValueObj,onselectCallBack){
	var opt = {
		preset: 'date', 
		display: 'bottom', 
		mode: 'scroller', 
		dateFormat: 'yy-mm-dd', 
		setText: '确定', 
		cancelText: '取消',
		dateOrder: 'yymmdd', 
		dayText: '年', monthText: '月', yearText: '日', 
		endYear:2050,
		startYear:1950,
		minDate:minTime,
		maxDate:maxTime ,
		onSelect: function(){
			//onselectCallBack();
		}
	};
	targetObj.mobiscroll(opt);
	targetObj.attr('readonly','readonly');
}
COMMON_PLUGIN.COMMON.DELAY_ITEM = function(){
	$('.delay-item').bind('click',function(){
		COMMON_PLUGIN.COMMON.ALERT_DIALOG_ONE('敬请期待10月底上线',function(){});
	});
}
;(function($){
/*
	 //多选checkbox
	 */
	$.fn.yyptCheckbox=function() {
		return this.each(function(i,obj){
			var $this=$(this);
			var yyptCheckboxId = (this.name||this.id)+'__yyptCheckbox'+i||'__yyptCheckbox'+i;
			yyptCheckboxId = yyptCheckboxId.replace(/[\.,\[\]]/g,"_");
			if(obj.style.display != 'none' && $(this).parents()[0].id.indexOf('__yyptCheckbox')<0){
				var yyptCheckboxStyle = $this.attr("style");
				if(undefined==yyptCheckboxStyle){
					yyptCheckboxStyle="";
				}
				var chk_bg = $('<i id="'+yyptCheckboxId+'" class="chk-bg chk-bg-checked" style='+yyptCheckboxStyle+'></i>');
				$this.before(chk_bg).appendTo(chk_bg);
				var $thisCotain = $("#"+yyptCheckboxId);
				$thisCotain.bind("click",function(){
					if(!$this.prop("disabled")){
						if($this.attr("checked")) {
							$this.attr("checked",false);
							$thisCotain.removeClass("chk-bg-checked");
						}else{
							$thisCotain.addClass("chk-bg-checked");
							$this.attr("checked","checked");
						}
					}
				});

				/*
				if($this.prop("checked")) {
					$thisCotain.addClass("chk-bg-checked");
				}else{
					$thisCotain.removeClass("chk-bg-checked");
				}
				*/

				//貌似写反了 chenxy add
				/* if($this.prop("checked")) {
					$thisCotain.removeClass("chk-bg-checked");
				}else{
					$thisCotain.addClass("chk-bg-checked");
				} */
				$this.hide();
			}
		});
	}
	//radio插件
	$.fn.yyptRadio=function() {
		return this.each(function(i,obj){
			var yyptRadioId = (this.name||this.id)+'__yyptRadio'+i||'__yyptRadio'+i;
			yyptRadioId = yyptRadioId.replace(/[\.,\[\]]/g,"_");
			if(obj.style.display != 'none' && $(this).parents()[0].id.indexOf('__yyptRadio')<0){
				var $this = $(this);
				var yyptRadioStyle = $this.attr("style");
				if(undefined==yyptRadioStyle){
					yyptRadioStyle="";
				}
				var radio_bg = $('<div id="'+yyptRadioId+'" class="radio-bg" style="'+yyptRadioStyle+'"></div>');
				$("#"+yyptRadioId).append(radio_bg);
				$this.before(radio_bg).prependTo(radio_bg);
				var $RadioContain = $("#"+yyptRadioId);
				$RadioContain.bind("click",function(e){
					//阻止冒泡
					if (e.stopPropagation) {
						// this code is for Mozilla and Opera
						e.stopPropagation();
					}
					else if (window.event) {
						// this code is for IE
						window.event.cancelBubble = true;
					}
					var $RadioName = $this.attr("name");
					$("input[name='"+$RadioName+"']").each(function(i,obj_r){
						var $RadioParent = $(obj_r).parent(".radio-bg");
						$(obj_r).prop("checked",false);
						$RadioParent.removeClass("radio-bg-checked");
					});
					if($this.prop("checked")) {
						$this.prop("checked",false);
						$RadioContain.removeClass("radio-bg-checked");
					}else{
						$RadioContain.addClass("radio-bg-checked");
						$this.prop("checked",'true');
					}
				});
				if($this.prop("checked")) {
					$RadioContain.addClass("radio-bg-checked");
				}else{
					$RadioContain.removeClass("radio-bg-checked");
				}
				$this.hide();
			}
		});
	}
})(jQuery);
$(function(){
	COMMON_PLUGIN.COMMON.DELAY_ITEM();
	COMMON_PLUGIN.COMMON.INIT();
	//初始化checkbox
	$(".ui-checkbox").yyptCheckbox();
	//初始化radiobox
	$('.ui-radio').yyptRadio();
	//30分钟超时
	if(Utils.offLineStore.get("token",false) != ""){
		setTimeout(function(){Utils.offLineStore.remove("token",false);alert('页面超时，请重录登陆！');location.reload()},1800000);
	}
});