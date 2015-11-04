//地图操作
	var map;
	//添加script标签
	function loadScript() {
		var script = document.createElement("script");
		script.src = "http://api.map.baidu.com/api?v=1.4&callback=initialize";
		document.body.appendChild(script);
	}

	function initialize() {
		map = new BMap.Map('map');
		map.enableScrollWheelZoom();//启动鼠标滚轮操作
		//添加控件
		var opts={type:BMAP_NAVIGATION_CONTROL_ZOOM};//设置左侧调节栏的样式
		map.addControl(new BMap.NavigationControl(opts));//左侧调节栏
		map.addControl(new BMap.ScaleControl());//测量尺
		var point=new BMap.Point(116.488029,40.002315);
		map.centerAndZoom(point,15);
		var	marker = new BMap.Marker(point); //创建标注
		map.clearOverlays();//清除所有覆盖物(标注)
		map.addOverlay(marker);

		var cp = point;//cp为临时point
		map.addEventListener("tilesloaded",function(){//加载完成时,触发
			map.setCenter(cp);
		});
		map.addEventListener("dragend", function showInfo(){ //监听中心点位置
			cp = map.getCenter();
		});
		map.panBy(140,120);
	}
