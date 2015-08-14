/**
 * file:案例直播
 * author:chenxy
 * date:2015-06-05
*/
function callback(a){
	console.log(a);
}
(function(){
	function sendGetCarouselsHttp(){
		var url = "http://www.partywo.com/test/getTestResult/";
		$.ajax({
			url:url,
			data:{},
			type:"POST",
			dataType:"json",
			context:this,
			global:false,
			async: false,
			success: function(data){
				debugger
				console.log("sendGetCarouselsHttp",data);
			},
			error:function(data){
				//g.httpTip.hide();
			}
		});
	}
	sendGetCarouselsHttp();
})();

