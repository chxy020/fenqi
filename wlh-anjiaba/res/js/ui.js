(function($){
	$.fn.extend({
		yyptRadio: function() {
			return this.each(function(i,obj){
				var yyptRadioId = (this.name||this.id)+'__yyptRadio'+i||'__yyptRadio'+i;
				yyptRadioId = yyptRadioId.replace(".","_");
				yyptRadioId = yyptRadioId.replace("[","_");
				yyptRadioId = yyptRadioId.replace("]","_");
				if(obj.style.display != 'none' && $(this).parents()[0].id.indexOf('__yyptRadio')<0){
					var tabindex = this.tabIndex||0;
					var a = $(this);
					var yyptRadioStyle = a.attr("style");
					if(undefined==yyptRadioStyle){
						yyptRadioStyle="";
					}
					var radio_bg = $('<div id="'+yyptRadioId+'" class="radio-bg" style="'+yyptRadioStyle+'"></div>');
					$("#"+yyptRadioId).append(radio_bg);
					a.before(radio_bg).prependTo(radio_bg);
					var b = $("#"+yyptRadioId);
					b.addClass("normal");
					b.bind("click",function(e){
						if (e.stopPropagation) {
							// this code is for Mozilla and Opera
							e.stopPropagation();
						}
						else if (window.event) {
							// this code is for IE
							window.event.cancelBubble = true;
						}
						var c = a.attr("name");
						$("input[name='"+c+"']").each(function(i,obj){
							var d = $(this);
							var f = d.parent(".radio-bg");
							d.removeAttr("checked");
							f.removeClass("radio-bg-checked");
						});
						if(a.attr("checked")) {
							a.removeAttr("checked");
							b.removeClass("radio-bg-checked");
						}else{
							b.addClass("radio-bg-checked");
							a.attr("checked",'true');
						}
						eval(a.attr("onclick"));
					});
					if(a.attr("checked")) {
						b.addClass("radio-bg-checked");
					}else{
						b.removeClass("radio-bg-checked");
					}
					a.hide();
				}
			});
		}
	});
	$.fn.extend({
		yyptCheckbox: function() {
			return this.each(function(i,obj){
				var yyptCheckboxId = (this.name||this.id)+'__yyptCheckbox'+i||'__yyptCheckbox'+i;
				yyptCheckboxId = yyptCheckboxId.replace(".","_");
				yyptCheckboxId = yyptCheckboxId.replace("[","_");
				yyptCheckboxId = yyptCheckboxId.replace("]","_");
				yyptCheckboxId = yyptCheckboxId.replace(".","_");
				if(obj.style.display != 'none' && $(this).parents()[0].id.indexOf('__yyptCheckbox')<0){
					var tabindex = this.tabIndex||0;
					var a = $(this);
					var yyptCheckboxStyle = a.attr("style");
					if(undefined==yyptCheckboxStyle){
						yyptCheckboxStyle="";
					}
					var chk_bg = $('<div id="'+yyptCheckboxId+'" class="chk-bg" style="'+yyptCheckboxStyle+'"></div>');
					a.before(chk_bg).appendTo(chk_bg);
					var b = $("#"+yyptCheckboxId);
					b.bind("click",function(){
						if(!a.prop("disabled")){
							if(a.attr("type")=="checkbox"){
								if(a.attr("checked")) {
									a.removeAttr("checked");
									b.removeClass("chk-bg-checked");
								}else{
									b.addClass("chk-bg-checked");
									a.attr("checked",'true');
								}
							}else if(a.attr("type")=="radio"){
								$("[name="+a.attr("name")+"]").removeAttr("checked");
								$("[name="+a.attr("name")+"]").parents(".chk-bg").removeClass("chk-bg-checked");
								b.addClass("chk-bg-checked");
								a.attr("checked",'true');
							}
							eval(a.attr("onclick"));
						}
					});
					if(a.attr("checked")) {
						b.addClass("chk-bg-checked");
					}else{
						b.removeClass("chk-bg-checked");
					}
					a.hide();
				}
			});
		}
	});
	$.fn.extend({
		selectArea:function(){
			$('.select-city-box').hover(function(){
				$(this).find('.select-city-btn').addClass('active');
				$(this).find('.select-city-area').show();
			},function(){
				$(this).find('.select-city-btn').removeClass('active');
				$(this).find('.select-city-area').hide();
			});
		}	
	});


})(jQuery);
$(function(){
	$.fn.selectArea();
	$('.common-radio').yyptRadio();
	$('.common-checkbox').yyptCheckbox();
})
