var southWest = new L.LatLng(45.120052841530516, -3.7353515625),
    northEast = new L.LatLng(56.1944808772697, 22.631835937499996),
    bounds = new L.LatLngBounds(southWest, northEast);

var map = L.map('map',{
	center: [50.98609893339354, 9.4482421875],
	zoom: 5,
	//maxBounds: bounds
});

L.tileLayer('http://{s}.tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/997/256/{z}/{x}/{y}.png', {
	maxZoom: 18,
	attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>'
}).addTo(map);

var shpfile = new L.Shapefile('DatenMSWissenschaft.zip',{onEachFeature:function(feature, layer) {
	if (feature.properties) {
    	layer.bindPopup(Object.keys(feature.properties).map(function(k){
        	return k + ": " + feature.properties[k] ;
        }).join("<br />"),{maxHeight:200});
    }
}});

shpfile.addTo(map);