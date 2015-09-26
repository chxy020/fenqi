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
//dialog one-btn
/*
	@param String showMsg;
	@param Function sureClickCallBack;
*/
COMMON_PLUGIN.COMMON.ALERT_DIALOG_ONE = function(showMsg,sureClickCallBack){
	if(typeof showMsg === 'undefined') return;
	var sureClickCallBackFun = sureClickCallBack || function(){};
	layer.open({
		content: 'showMsg',
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
		content: 'showMsg',
		btn: ['确定','取消'],
		yes: function(index){
			sureClickCallBack();
			layer.close(index);
		},
		no: function(index){
			sureClickCallBack();
			layer.close(index);
		}
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
				var chk_bg = $('<i id="'+yyptCheckboxId+'" class="chk-bg" style='+yyptCheckboxStyle+'></i>');
				$this.before(chk_bg).appendTo(chk_bg);
				var $thisCotain = $("#"+yyptCheckboxId);
				$thisCotain.bind("click",function(){
					if(!$this.prop("disabled")){
						if($this.prop("checked")) {
							$this.prop("checked",false);
							$thisCotain.removeClass("chk-bg-checked");
						}else{
							$thisCotain.addClass("chk-bg-checked");
							$this.prop("checked",'true');
						}
					}
				});
				if($this.prop("checked")) {
					$thisCotain.addClass("chk-bg-checked");
				}else{
					$thisCotain.removeClass("chk-bg-checked");
				}
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
	COMMON_PLUGIN.COMMON.INIT(); 
	//初始化checkbox
	$(".ui-checkbox").yyptCheckbox();		
	//初始化radiobox
	$('.ui-radio').yyptRadio();
});