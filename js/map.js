var southWest = new L.LatLng(45.120052841530516, -3.7353515625),
    northEast = new L.LatLng(56.1944808772697, 22.631835937499996),
    bounds = new L.LatLngBounds(southWest, northEast);

var map = L.map('map',{
	center: [50.98609893339354, 9.4482421875],
	zoom: 5,
	// maxBounds: bounds
});

L.tileLayer('http://{s}.tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/997/256/{z}/{x}/{y}.png', {
	maxZoom: 18,
	attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>'
}).addTo(map);

var shpfile = new L.Shapefile('DatenMSWissenschaft.zip',{onEachFeature:function(feature, layer) {
	// console.log(feature);
	console.log("==NEXT==");
	console.log(layer);
	console.log(layer.defaultOptions);
	if (layer.defaultOptions != undefined) {
		layer.defaultOptions.color = "#00BFFF";
	};
	// layer.defaultOptions.color="#00BFFF";
	if (feature.properties) {
    	layer.bindPopup(Object.keys(feature.properties).map(function(k){
        	return k + ": " + feature.properties[k] ;
        }).join("<br />"),{maxHeight:200});
    }
}});

shpfile.addTo(map);

// get color depending on selected layer
function getColor(d) {
	return d <= -500 	? '#0070A2' :
	       d <= -250  	? '#2D92BE' :
	       d <= -50  	? '#82BFDB' :
	       d <= 50  	? '#FEFCE5' :
	       d <= 250   	? '#F5BACE' :
	       d <= 500   	? '#E76798' :
	       d <= 50000  	? '#C93070' :
	                  '#FFEDA0';
}

var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {

	var div = L.DomUtil.create('div', 'info legend'),
		grades = [-50000, -500, -499, -250, -249, -50, -49, 50, 51, 250, 251, 500, 501, 50000],
		labels = [],
		from, to;

	for (var i = 0; i < grades.length; i=i+2) {
		from = grades[i];
		to = grades[i + 1];

		labels.push(
			'<i style="background:' + getColor(from + 1) + '"></i> ' +
			from + (to ? '&ndash;' + to : '+'));
	}

	div.innerHTML = labels.join('<br>');
	return div;
};

legend.addTo(map);