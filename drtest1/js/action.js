var map = null;

var visiable = [];
var curActive = null;
function addVisiable(ele){
	visiable[visiable.length] = ele;//js index in zero-index based
}
function clearVisiable(){	
	for(var i=0;i<visiable.length;++i){
		visiable[i].setMap(null);//Renders the marker on the specified map or panorama. If map is set to null, the marker will be removed.
	}
	visiable = [];
	$("#routeInfo").empty();//The empty() method removes all child nodes and content from the selected elements. A jquery function
}

function initMap(){
	var mapOptions = {
          center: new google.maps.LatLng(34.033424,-118.02807),
          zoom: 8,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };
    map = new google.maps.Map(document.getElementById("map-canvas"),
        mapOptions);//initialize model
    
    google.maps.event.addListener(map, 'click', function(event) {    //Adds the given listener function to the given event name for the given object instance. Returns an identifier for this listener that can be used with removeListener().    
        loc = event.latLng;
        alert(event.latLng.lat()+" "+loc.lng());//this is why I click the map and pop up with alert
        $.getJSON("/Demo/findNode",{"lat":loc.lat(),"lng":loc.lng()},function(node){//Load JSON-encoded data from the server using a GET HTTP request.  url,data,success
		//This is a shorthand Ajax function, which is equivalent to:
		/*
		$.ajax({
			dataType: "json",
			url: url,
			data: data,
			success: success
		 });
		*/
        	marker = new google.maps.Marker({
        		//position: new google.maps.LatLng(node.lat,node.lng),//Marker position. Required.
				position: new google.maps.LatLng(event.latLng.lat(),event.latLng.lng()),
        		map:map,//Map on which to display Marker.
        	});
			addVisiable(marker);
        	//alert(node.node_id);
        });
    });
}

function showSensorView(){	
	$.getJSON("/Demo/getSensors",function(sensors){		
		for(var i=0;i<sensors.length;++i){			
			s=sensors[i];
          	loc = new google.maps.LatLng(s.lat,s.lng);
          	
          	var icon=null;
			switch(s.dir){
			case 0:
				icon="img/0.png";
				break;
			case 1:
				icon="img/1.png";
				break;
			case 2:
				icon="img/2.png";
				break;
			case 3:
				icon="img/3.png";
			}
          
			var marker = new google.maps.Marker({            
				position: loc,
				icon:icon,
				map: map          
			});

			addVisiable(marker);
		}
	});
}

function showPatternView(){
	$.getJSON("/Demo/getAvailName",function(data){
		for(var i=0;i<data.length;++i){
			$("#roadNames").append("<option value='"+data[i].name_id+"'>"+data[i].name+"</option>");
		}
	});		
}

function showRouteView(){

}

function timeToStr(t){		
	sec = parseInt(t/1000);
	hour = parseInt(sec/3600);
	sec = sec-hour*3600;
	minute = parseInt(sec/60);
	sec = sec-minute*60;
	return ""+hour+":"+minute+":"+sec;
}
var route_colors = ["#FF0000","#00FF00","#0000FF","#9F00C5","#000000", "#6600CC", "#0066CC", "FF8000","FF007F", "800000"]; 

function attachStationEvent(marker,lat,lng,arrTime){
	google.maps.event.addListener(marker, 'click', function() {
		var infoWindow = new google.maps.InfoWindow({
   			content: ""
		});
		infoWindow.setContent("<div><p>LatLng: "+lat+","+lng+"</p>"+
			"<p>Arrive Time: "+timeToStr(arrTime)+"</p></div>");
		infoWindow.open(map,marker);
  	});
}

function computeDistance(lat1,lng1,lat2,lng2){
    var Radius = 6371* 0.621371192;
    
    var dLat = (lat2-lat1)*Math.PI/180;
    var dLon = (lng2-lng1)*Math.PI/180;
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
       Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) *
       Math.sin(dLon/2) * Math.sin(dLon/2);
    var c = 2 * Math.asin(Math.sqrt(a));
    return Math.round(Radius * c*100)*1.0/100;
}

function uploadConfig(type){	
	clearVisiable();
	var files = $("#configFile")[0].files;
	 if (files.length>0) {
        var file = files[0];
        var reader = new FileReader();
		/*The FileReader object lets web app;ications asynchronously read the contents of files stored on the user's computer*/
        var sttime_index = $("#select_sttime").val();        
        reader.onload = function() {    // the onload event occurs when an object has been loaded    	
        	$.getJSON("/Demo/getRoute",{"config":this.result,"type":type,"start_time":sttime_index},function(res){
        		
        		depot=new google.maps.Marker({
        			position : new google.maps.LatLng(res.depot.lat,res.depot.lng),        			
        			map:map
        		});
        		addVisiable(depot);
        		var totaltime = 0;
        		var totaldist = 0;
        		for(var i=0;i<res.routesInfo.length;++i){
        			var sttime = 6*3600*1000+sttime_index*15*60*1000;
        			var traveltime = 0;
        			var distance = 0;
        			var plat = res.depot.lat;
        			var plng = res.depot.lng;
        			for(var j=0;j<res.routesInfo[i].length;++j){
        				station = res.routesInfo[i][j];
        				loc = new google.maps.LatLng(station.loc.lat,station.loc.lng);
        				traveltime=station.travelTime;  
        				distance+=computeDistance(plat, plng, station.loc.lat, station.loc.lng);
        				plat = station.loc.lat;
        				plng = station.loc.lng;
        				if(j<res.routesInfo[i].length-1){
	        				marker = new google.maps.Marker({
	        					position:loc,
	        					map: map,        			
	        					icon:"img/v"+(i+1)+".png" 
	        				});
	        				attachStationEvent(marker, station.loc.lat, station.loc.lng, sttime+traveltime);
	        				addVisiable(marker);
	        			}   				
        			}
        			totaltime += traveltime;
        			totaldist += distance;
        			$("#routeInfo").append("<p>Vehicle "+(i+1)+" Info: deli. no -->" +	(res.routesInfo[i].length -1) +" total time--> "+timeToStr(traveltime)+" total distance--> " + distance + " miles </p>");
        		}
        		$("#routeInfo").append("<p>Summary for "+(i)+" vehicles:	time--> "+timeToStr(totaltime) +" distance--> "+totaldist+" miles</p>");

        		for(var i=0;i<res.routes.length;++i){
        			var route = res.routes[i];
        			var locs = [];
        			for(var j =0;j<route.length;++j){
        				loc = new google.maps.LatLng(route[j].lat,route[j].lng);
        				locs[j] = loc;
        			}
        			locs[locs.length] = locs[0];
        			line = new google.maps.Polyline({
	        			path: locs,
	                    strokeColor: route_colors[i],
	                    strokeOpacity: 1.0,
	                    strokeWeight: 2,
	                    map:map
                    });
        			addVisiable(line);        			
        		}
        	});
        	
        }
        reader.readAsText(file);//Starts reading the contents of the specified Blob, once finished, the result attribute contains the contents of the file as a text string.        
    }
}

function showSpeed(link_id){
	$.getJSON("/Demo/getSpeed",{"link_id":link_id},function(speed){
		$('#chart').highcharts({
              chart: {
                  type: 'line'
              },
              title: {
                  text: 'Day Speed of '+link_id
              },
              xAxis: {
                type: 'datetime',
                  tickPixelInterval:5*60*1000
              },
              yAxis: {
                  title: {
                      text: 'Speed'
                  }
              },
              series: [{
                  name: ''+link_id,
                  data: speed
              }]// the actual series to append to the chart.
        });
    });
}	

var ma=null,mb=null;
function attachLineClickEvent(line,locs,link_id){
	if(ma!=null) ma.setMap(null);
	if(mb!=null) mb.setMap(null);
	google.maps.event.addListener(line,"click",function(){
		ma = new google.maps.Marker({            
            position:  locs[0],
            map: map          
          });
		mb = new google.maps.Marker({            
            position:  locs[locs.length-1],
            map: map          
          });
		alert(link_id);		
		showSpeed(link_id);
	});
}

//SHOW ONE LINE ON THE GOOGLE MAP
function showRoad(name_id){
	$.getJSON("/Demo/getRoad",{"name_id":name_id},function(edges){
		alert("ROAD");
		clearVisiable();
		for(var i=0;i<edges.length;++i){			
			e = edges[i];

			var j=0;
			locs = [];
			while(j<e.coords.length){
				locs[j/2] = new google.maps.LatLng(e.coords[j+1],e.coords[j]);
				j+=2;
			}
			line = new google.maps.Polyline({
              path: locs,
              strokeColor: "#FF0000",
              strokeOpacity: 1.0,
              strokeWeight: 2,
              map:map
            }); 
            
            attachLineClickEvent(line,locs,e.link_id);
            addVisiable(line);
		}
		alert("DONE");
	});
}
$(function(){//jQuery() = $()  jQuery(callback) binds a function to be executed when the DOM has finished loading
	initMap();
	time_index = 0;
	for(var h = 6;h<21;++h){
		for(var m = 0;m<60;m+=15){
			s = h+":";
			if(m==0) s+= "00";
			else s+=m;
			$("#select_sttime").append("<option value='"+time_index+"'>"+s+"</option>");
			++time_index;
		}
	
	}
	$("#sensor").click(function(){
		$(".edgeViewComp").hide();
		$(".routeViewComp").hide();
		clearVisiable();
		if(curActive!=null) curActive.removeClass("active");//removeClass->remove a single class, multiple classes, or all classes from each element in the set of matched elements
		curActive = $("#sensor").parent();// get the parent of each element in the current set of matched elements, optionally filtered by a selector
		curActive.addClass("active");// Adds the spcified class to each of the set of matched elements. This method is often used with .removeClass() to switch elemtns' classes from one to another

		showSensorView();
		return false;
	});

	$("#pattern").click(function(){// similar to the former one
		$(".edgeViewComp").show();
		$(".routeViewComp").hide();
		clearVisiable();
		if(curActive!=null) curActive.removeClass("active");
		curActive = $("#pattern").parent();
		curActive.addClass("active");

		showPatternView();
		return false;
	});
	$("#route").click(function(){
		$(".routeViewComp").show();
		$(".edgeViewComp").hide();
		clearVisiable();
		if(curActive!=null) curActive.removeClass("active");
		curActive = $("#route").parent();
		curActive.addClass("active");

		showRouteView();		
		return false;	
	});
	$("#roadNames").change(function(event){
		alert($("#roadNames").val());
		showRoad($("#roadNames").val());
	});
});
