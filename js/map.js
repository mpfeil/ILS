var geojson,
	selectedLayer = {
		layer: "wanderunggesamt", 
		name: "Wanderungen gesamt", 
		overlay: undefined,
		associatedLayers: ["YEARs2000T","YEARs200_1","YEARs2004T","YEARs2008T"],
		timeStamp: 0
	};
var southWest = new L.LatLng(43.54854811091288, -8.1298828125),
    northEast = new L.LatLng(57.397624055000456, 27.0263671875),
    bounds = new L.LatLngBounds(southWest, northEast);

var map = L.map('map',{
	// center: [50.98609893339354, 9.4482421875],
	center: [50.98609893339354, 9.4482421875],
	zoom: 6,
	minZoom: 5,
	maxZoom: 9,
	maxBounds: bounds
});

L.tileLayer('http://{s}.tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/3/256/{z}/{x}/{y}.png', {
	maxZoom: 18,
	attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>'
}).addTo(map);

var divSlider = L.DomUtil.create('div', 'info actionControls');

//stop and catch events that happen on the slider div
var stop = L.DomEvent.stopPropagation;

L.DomEvent
    .on(divSlider, 'click', stop)
    .on(divSlider, 'mousedown', stop)
    .on(divSlider, 'dblclick', stop)
    .on(divSlider, 'click', L.DomEvent.preventDefault);

divSlider.innerHTML = "<div id='slider'></div>";
$('#divSlider').append(divSlider.outerHTML);

// control that shows state info on hover
var divlegend = L.control();

var div = L.DomUtil.create('div', 'info legend'),
// grades = [-50000, -500, -499, -250, -249, -50, -49, 50, 51, 250, 251, 500, 501, 50000],
grades = [-500, -499, -250, -249, -50, -49, 50, 51, 250, 251, 500, 500],
labels = [],
from, to;

labels.push(
'<i style="background:' + getColor(grades[0]) + '"></i> unter ' + grades[0]);

for (var i = 1; i < grades.length; i=i+2) {
from = grades[i];
to = grades[i + 1];

labels.push(
	'<i style="background:' + getColor(from + 1) + '"></i> ' +
	(to ? from + ' &ndash; ' + to : 'über ' + from));
}
div.innerHTML = '<h4 id="legendTitle">Gewinn / Verlust durch Wanderungen im mittleren Alter 2000 - 2011</h4>';
div.innerHTML += '<h6>Anzahl Personen pro 100.000 Einwohner</h6>';
div.innerHTML += labels.join('<br>');
$('#divLegend').append(div.outerHTML);

var extentGermany = L.control({position: 'topleft'});

extentGermany.onAdd = function (map) {
	var div = L.DomUtil.create('div', 'info extent');

	//stop and catch events that happen on the slider div
	var stop = L.DomEvent.stopPropagation;

	L.DomEvent.on(div,'click',function(){
		map.setView([50.98609893339354, 9.4482421875],5);	
	});

	L.DomEvent
	    .on(div, 'click', stop)
	    .on(div, 'mousedown', stop)
	    .on(div, 'dblclick', stop)
	    .on(div, 'click', L.DomEvent.preventDefault);

	div.innerHTML = "<div id='extent'></div>";
	return div;
}

extentGermany.addTo(map);


//slider control to switch between years
// var slider = L.control({position: 'bottomleft'})

// slider.onAdd = function (map) {
// 	var div = L.DomUtil.create('div', 'info');

// 	//stop and catch events that happen on the slider div
// 	var stop = L.DomEvent.stopPropagation;

// 	L.DomEvent
// 	    .on(div, 'click', stop)
// 	    .on(div, 'mousedown', stop)
// 	    .on(div, 'dblclick', stop)
// 	    .on(div, 'click', L.DomEvent.preventDefault);

// 	div.innerHTML = "<div id='slider'></div>";
// 	$('#divSlider').append(div.outerHTML);
// 	return div;
// }

$(function() {
	$('#slider').labeledslider({
		min:1,
		max: 4, 
		step: 1,
		tickArray:[1,2,3,4],
		tickLabels:{
			1: '2000-2011',
			2: '2000-2003',
			3: '2004-2007',
			4: '2008-2011',	
		},
		slide: function ( e, ui ) {
			selectedLayer.timeStamp = ui.value-1;
			info.update();
			updateLegend();
        	geojson.setStyle(style);
       	} 
	});
});

// slider.addTo(map);


// control that shows state info on hover
var info = L.control();

info.onAdd = function (map) {
	this._div = L.DomUtil.create('div', 'info');
	this.update();
	return this._div;
};

info.update = function (props) {

	this._div.innerHTML = '<h4>'+selectedLayer.name.split(" (")[0]+' ('+getTimeValue(selectedLayer.timeStamp)+')</h4>' +  (props ?
		'<b>' + props.Kreisname + '</b><hr>' + props[selectedLayer.associatedLayers[selectedLayer.timeStamp]] + ' Personen pro 100.000 Einwohnern <hr> Einwohnerzahl (Stand: 31.12.2011): ' + numberWithKDots(props.Einwohnerzahl) 
		// '<br /> ' + props.GewinneVerluste + '<hr>' 
		
		: 'Wähle einen Kreis');
};

info.addTo(map);

var baseLayers = {
	"Wanderungen gesamt": "wanderunggesamt",
	"Bildungswanderungen (18 - 24 Jahre)": "bildungswanderung",
	"Berufseinstiegswanderungen (25 - 29 Jahre)": "berufseinstiegswanderung",
	"Familienwanderungen (30 - 49 Jahre)": "familienwanderung",
	"Wanderungen im mittleren Alter (50 - 64 Jahre)": "wanderungImMittlerenAlter",
	"Altenwanderungen (65 und mehr Jahre)": "altenwanderung"
};

LayerSwitcher = L.Control.extend({
	options: {
		collapsed: false,
		position: 'topright',
		autoZIndex: true
	},

	initialize: function (baseLayers, options) {
		L.setOptions(this, options);

		this._layers = {};
		this._lastZIndex = 0;
		this._handlingClick = false;

		for (var i in baseLayers) {
			this._addLayer(baseLayers[i], i);
		}
	},

	_addLayer: function (layer, name, overlay) {
		var id = layer;

		if (layer == "wanderunggesamt") {
			associatedLayers = ["YEARs2000T","YEARs200_1","YEARs2004T","YEARs2008T"];
		} else if(layer == "bildungswanderung"){
			associatedLayers = ["YEARs200_2","YEARs200_3","YEARs200_4","YEARs200_5"];
		} else if(layer == "berufseinstiegswanderung"){
			associatedLayers = ["YEARs200_6","YEARs200_7","YEARs200_8","YEARs200_9"];
		} else if(layer == "familienwanderung"){
			associatedLayers = ["YEARs20_10","YEARs20_11","YEARs20_12","YEARs20_13"];
		} else if(layer == "wanderungImMittlerenAlter"){
			associatedLayers = ["YEARs20_14","YEARs20_15","YEARs20_16","YEARs20_17"];
		} else if(layer == "altenwanderung"){
			associatedLayers = ["YEARs20_18","YEARs20_19","YEARs20_20","YEARs20_21"];
		};

		this._layers[id] = {
			layer: layer,
			name: name,
			overlay: overlay,
			associatedLayers: associatedLayers,
			timeStamp: 1
		};

		if (this.options.autoZIndex && layer.setZIndex) {
			this._lastZIndex++;
			layer.setZIndex(this._lastZIndex);
		}
	},

	onAdd: function (map) {
		this._initLayout();
		this._update();
		updateLegend();

		return this._container;
	},

	onRemove: function (map) {
		map
		    .off('layeradd', this._onLayerChange)
		    .off('layerremove', this._onLayerChange);
	},

	_initLayout: function () {
		var className = 'leaflet-control-layers',
		    container = this._container = L.DomUtil.create('div', className);

		//Makes this work on IE10 Touch devices by stopping it from firing a mouseout event when the touch is released
		container.setAttribute('aria-haspopup', true);

		if (!L.Browser.touch) {
			L.DomEvent
				.disableClickPropagation(container)
				.disableScrollPropagation(container);
		} else {
			L.DomEvent.on(container, 'click', L.DomEvent.stopPropagation);
		}

		var form = this._form = L.DomUtil.create('form', className + '-list');

		if (this.options.collapsed) {
			if (!L.Browser.android) {
				L.DomEvent
				    .on(container, 'mouseover', this._expand, this)
				    .on(container, 'mouseout', this._collapse, this);
			}
			var link = this._layersLink = L.DomUtil.create('a', className + '-toggle', container);
			link.href = '#';
			link.title = 'Layers';

			if (L.Browser.touch) {
				L.DomEvent
				    .on(link, 'click', L.DomEvent.stop)
				    .on(link, 'click', this._expand, this);
			}
			else {
				L.DomEvent.on(link, 'focus', this._expand, this);
			}

			L.DomEvent.on(form, 'click', function () {
				setTimeout(L.bind(this._onInputClick, this), 0);
			}, this);

			this._map.on('click', this._collapse, this);
		} else {
			this._expand();
		}

		this._baseLayersList = L.DomUtil.create('div', className + '-base', form);

		container.appendChild(form);
	},

	_update: function () {
		if (!this._container) {
			return;
		}

		this._baseLayersList.innerHTML = '';

		var baseLayersPresent = false,
		    overlaysPresent = false,
		    i, obj;

		for (i in this._layers) {
			obj = this._layers[i];
			this._addItem(obj);
			baseLayersPresent = baseLayersPresent || !obj.overlay;
		}
	},

	_addItem: function (obj) {
		var label = document.createElement('label'),
		    input,
		    checked = obj.layer == "wanderunggesamt" ? true : false;
		if (obj.overlay) {
			input = document.createElement('input');
			input.type = 'checkbox';
			input.className = 'leaflet-control-layers-selector';
			input.defaultChecked = checked;
		} else {
			input = this._createRadioElement('leaflet-base-layers', checked);
		}

		input.id = obj.layer;

		L.DomEvent.on(input, 'click', this._onInputClick, this);

		var name = document.createElement('span');
		name.innerHTML = ' ' + obj.name;

		label.appendChild(input);
		label.appendChild(name);

		var container = obj.overlay ? this._overlaysList : this._baseLayersList;
		container.appendChild(label);

		return label;
	},

	_onInputClick: function () {
		var i, input, obj,
		    inputs = this._form.getElementsByTagName('input'),
		    inputsLen = inputs.length;

		this._handlingClick = true;
		
		for (i = 0; i < inputsLen; i++) {
			input = inputs[i];
			if (input.checked) {
				selectedLayer = this._layers[input.id];
				selectedLayer.timeStamp = 0;
				$('#slider').labeledslider("value", 0);
				geojson.setStyle(style);
				info.update();
				updateLegend();
			} 
		}

		this._handlingClick = false;

		this._refocusOnMap();
	},

	// IE7 bugs out if you create a radio dynamically, so you have to do it this hacky way (see http://bit.ly/PqYLBe)
	_createRadioElement: function (name, checked) {

		var radioHtml = '<input type="radio" class="leaflet-control-layers-selector" name="' + name + '"';
		if (checked) {
			radioHtml += ' checked="checked"';
		}
		radioHtml += '/>';

		var radioFragment = document.createElement('div');
		radioFragment.innerHTML = radioHtml;

		return radioFragment.firstChild;
	},

	_expand: function () {
		L.DomUtil.addClass(this._container, 'leaflet-control-layers-expanded');
	},

	_collapse: function () {
		this._container.className = this._container.className.replace(' leaflet-control-layers-expanded', '');
	}
});

map.addControl(new LayerSwitcher(baseLayers));
$('.leaflet-control-layers').addClass('actionControls').appendTo('#divSwitcher');

function highlightFeature(e) {
	var layer = e.target;

	layer.setStyle({
		weight: 5,
		color: '#666',
		dashArray: '',
		fillOpacity: 0.7
	});

	if (!L.Browser.ie && !L.Browser.opera) {
		layer.bringToFront();
	}

	info.update(layer.feature.properties);
}

function resetHighlight(e) {
	geojson.resetStyle(e.target);
	info.update();
}

function zoomToFeature(e) {
	map.fitBounds(e.target.getBounds());
}

function onEachFeature(feature, layer) {
	layer.on({
		mouseover: highlightFeature,
		mouseout: resetHighlight,
		click: zoomToFeature
	});
}


geojson = L.geoJson(ils, {

	style: style,

	onEachFeature: onEachFeature,

}).addTo(map);


// get color depending on selected layer
function getColor(d) {
	return d <= -500 	? '#0070A2' :
	       d <= -250  	? '#2D92BE' :
	       d <= -50  	? '#82BFDB' :
	       d <= 50  	? '#FEFCE5' :
	       d <= 250   	? '#F5BACE' :
	       d <= 500   	? '#E76798' :
	       d <= 50000  	? '#C93070' :
	                  	  '#FFEDA0' ;
}

function getTimeValue(value) {
	return value == 0 ? '2000-2011' :
		   value == 1 ? '2000-2003' :
		   value == 2 ? '2004-2007' :
		   value == 3 ? '2008-2011' :
		   				'' ;
}

//style for non selected features
function style(feature) {
	value = selectedLayer.associatedLayers[selectedLayer.timeStamp];

    return {
        fillColor: selectedLayer.layer == "wanderunggesamt" ? getColor(feature.properties[value]) :
        		   selectedLayer.layer == "bildungswanderung" ? getColor(feature.properties[value]) :
        		   selectedLayer.layer == "berufseinstiegswanderung" ? getColor(feature.properties[value]) :
        		   selectedLayer.layer == "familienwanderung" ? getColor(feature.properties[value]) :
        		   selectedLayer.layer == "wanderungImMittlerenAlter" ? getColor(feature.properties[value]) :
        		   selectedLayer.layer == "altenwanderung" ? getColor(feature.properties[value]) :
        		   getColor(feature.properties.YEARs200_1),
        weight: 1,
        opacity: 1,
        color: 'black',
        dashArray: '3',
        fillOpacity: 0.7
    };
}

function numberWithKDots(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function updateLegend(){
	$('#legendTitle').text("Gewinn / Verlust durch "+selectedLayer.name+" "+getTimeValue(selectedLayer.timeStamp));
}

// // control that shows state info on hover
// var divlegend = L.control();

// divlegend.onAdd = function (map) {
// 		var div = L.DomUtil.create('div', 'info legend'),
// 		// grades = [-50000, -500, -499, -250, -249, -50, -49, 50, 51, 250, 251, 500, 501, 50000],
// 		grades = [-500, -499, -250, -249, -50, -49, 50, 51, 250, 251, 500, 501],
// 		labels = [],
// 		from, to;

// 	labels.push(
// 		'<i style="background:' + getColor(grades[0]) + '"></i> unter ' + grades[0]);

// 	for (var i = 1; i < grades.length; i=i+2) {
// 		from = grades[i];
// 		to = grades[i + 1];

// 		// labels.push(
// 		// 	'<i style="background:' + getColor(from + 1) + '"></i> ' +
// 		// 	from + (to ? ' &ndash; ' + to : '+'));

// 		labels.push(
// 			'<i style="background:' + getColor(from + 1) + '"></i> ' +
// 			(to ? from + ' &ndash; ' + to : 'über ' + from));
// 	}
// 	div.innerHTML = '<h4>Gewinn / Verlust</h4>';
// 	div.innerHTML += '<h6>Anzahl Personen pro 100.000 Einwohner</h6>';
// 	div.innerHTML += labels.join('<br>');
// 	$('#divLegend').append(div.outerHTML);
// 	// return div;
// 	return '';
// };

// divlegend.addTo(map);


// legend.onAdd = function (map) {

// 	var div = L.DomUtil.create('div', 'info legend'),
// 		// grades = [-50000, -500, -499, -250, -249, -50, -49, 50, 51, 250, 251, 500, 501, 50000],
// 		grades = [-500, -499, -250, -249, -50, -49, 50, 51, 250, 251, 500, 501],
// 		labels = [],
// 		from, to;

// 		console.log(grades[0]);

// 	labels.push(
// 		'<i style="background:' + getColor(grades[0]) + '"></i> unter ' + grades[0]);

// 	for (var i = 1; i < grades.length; i=i+2) {
// 		from = grades[i];
// 		to = grades[i + 1];

// 		// labels.push(
// 		// 	'<i style="background:' + getColor(from + 1) + '"></i> ' +
// 		// 	from + (to ? ' &ndash; ' + to : '+'));

// 		labels.push(
// 			'<i style="background:' + getColor(from + 1) + '"></i> ' +
// 			(to ? from + ' &ndash; ' + to : 'über ' + from));
// 	}
// 	div.innerHTML = '<h4>Gewinn / Verlust</h4>';
// 	div.innerHTML += '<h6>Anzahl Personen pro 100.000 Einwohner</h6>';
// 	div.innerHTML += labels.join('<br>');
// 	console.log(div);
// 	console.log(div.innerHTML);
// 	return div;
// };

// legend.addTo(map);