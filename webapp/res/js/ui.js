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
			$('.select-city-area').find('a').on('click',document,function(){
				var areaValue = $(this).text();
				$('#curCity').text(areaValue);
				$('.select-city-area').hide();
			});
		},
		//填充底部html
		insertBottomHtml:function(){
			$('.ui-bottom').empty().load('/anjia/footer.html',function(){});
		},
		//合作商家经过函数
		businessHoverFun:function(){
			$('.border_outside').hover(function(){
				$(this).find('.cooperative-part-logo').stop().animate({
					'margin-top':'20px'
				});
				$(this).find('.cooperative-example').stop().animate({
					'top':'112px',"z-index":"11"
				});
				$(this).find(".cooperative_border3").fadeIn(300);
			},function(){
				$(this).find('.cooperative-part-logo').stop().animate({
					'margin-top':'109px'
				});
				$(this).find('.cooperative-example').stop().animate({
					'top':'300px',"z-index":"11"
				});
				$(this).find(".cooperative_border3").fadeOut(300);
			});
		},
		//@param String protocolPageUrl
		//$.fn.showProtocolPop('../anjia/protocol/protocol-fenqi.html','分期付款协议');
		//$.fn.showProtocolPop('../anjia/protocol/protocol-reg.html','燕子安家网站用户注册协议');
 		//$.fn.showProtocolPop('../anjia/protocol/protocol-authorization.html','个人征信等信息查询及使用授权书');
		//$.fn.showProtocolPop('../anjia/protocol/protocol-customer-commitment.html','客户承诺函');
		//$.fn.showProtocolPop('../anjia/protocol/protocol-credit-counseling.html','信用咨询及居间服务协议');
		//$.fn.showProtocolPop('../anjia/protocol/protocol-credit-counseling.html','债权承诺回购函');
		//$.fn.showProtocolPop('../anjia/protocol/protocol-transfer.html','债权转让协议');
		showProtocolPop:function(protocolPageUrl,protocolTitle){
			if(typeof protocolPageUrl === 'undefined') return;
			var protocolTitle = protocolTitle || '协议';
			layer.open({
				type: 2,
				title: protocolTitle,
				shadeClose: true,
				shade: 0.8,
				area: ['1000px', ($(window).height() - 50) +'px'],
				content: [protocolPageUrl],
				btn: ['确定'],
				yes: function(index, layero){
					layer.close(index);
				}
			});
		}	
	});
})(jQuery);
$(function(){
	$.fn.selectArea();
	$.fn.insertBottomHtml();
	$('.common-radio').yyptRadio();
	$('.common-checkbox').yyptCheckbox();
})
