
// JavaScript Document
var map = null;
window.flightPath = null;
window.path = [];
var doc = null;
var route_colors = ["#FF0000","#00FF00","#0000FF","#9F00C5","#000000", "#6600CC", "#0066CC", "FF8000","FF007F", "800000"]; 

function init(){// no reloading pages
	var mapOptions = {
          center: new google.maps.LatLng(34.033424,-118.02807),
          zoom: 8,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };
    map = new google.maps.Map(document.getElementById("map-canvas"),
        mapOptions);//initialize model}
		}
function initMap(){
	for(var q = 0; q < path.length; q++){
		path[q].setMap(null);
		}// no overlapping paths
	
	var f;
	/*if(document.getElementById("file1").checked){
		f="euclideanRoute.json";}
		else{f="tdRoute.json";}
	 var file_dir= "/JSON%20File/"+f;*/
	 var routesarray =null;var n =null ;var lng = null; var lat = null;
	 var file = document.getElementById("configFile").files[0];
	 var reader = new FileReader();
	 reader.onload = (function(theFile) {
        return function(e) {
			data =eval('('+e.target.result+')');
			// Render thumbnail.
          /*var span = document.createElement('span');
          span.innerHTML = ['<img class="thumb" src="', e.target.result,
                            '" title="', escape(theFile.name), '"/>'].join('');
          document.getElementById('list').insertBefore(span, null);*/
		  var routesarray;var n ;
		var routes = data.routes;
		marker = new google.maps.Marker({
        		//position: new google.maps.LatLng(node.lat,node.lng),//Marker position. Required.
				position: new google.maps.LatLng(data.depot.lat,data.depot.lng),
        		map:map,//Map on which to display Marker.
	  });
		 n = data.numOfVehicles;
		routesarray = new Array(n);
		for(var i = 0; i < n; i++){
			routesarray[i] = routes[i];
			}
			window.coordinates= new Array(n);
	for(var j = 0; j < n; j++){
		
			var route = routesarray[j];
			var len = route.length;coordinates[j] = [];
			for(var k = 0; k < len; k++){
				lng1 = route[k].lng;
				lat1 = route[k].lat;
			     var b = new google.maps.LatLng(lat1,lng1);
				coordinates[j].push(b);
				}
			coordinates[j].push(new google.maps.LatLng(route[0].lat,route[0].lng));
flightPath=new google.maps.Polyline({
	
  path: window.coordinates[j],
   strokeColor: route_colors[j],
  strokeOpacity: 1.0,
  strokeWeight: 2,
  map:map
});
path.push(flightPath);
			}
        };
      })(f);

      // Read in the image file as a data URL.
      reader.readAsText(file);
	
	
}

window.onload=init;