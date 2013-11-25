var geojson,
	selectedLayer = {
		layer: "wanderunggesamt", 
		name: "Wanderung gesamt", 
		overlay: undefined,
		associatedLayers: ["YEARs200_1","YEARs2004T","YEARs2008T"]
	};
var southWest = new L.LatLng(43.54854811091288, -8.1298828125),
    northEast = new L.LatLng(57.397624055000456, 27.0263671875),
    bounds = new L.LatLngBounds(southWest, northEast);

var map = L.map('map',{
	center: [50.98609893339354, 9.4482421875],
	zoom: 5,
	minZoom: 5,
	maxBounds: bounds
});

L.tileLayer('http://{s}.tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/997/256/{z}/{x}/{y}.png', {
	maxZoom: 18,
	attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>'
}).addTo(map);

var slider = L.control({position: 'bottomleft'});

slider.onAdd = function (map) {
	var div = L.DomUtil.create('div', 'info slider');

	
 //    <code>d3.slider().axis(true).min(2000).max(2100).step(5)</code>
 //    <div id="slider6"></div>

	// for (var i = 0; i < grades.length; i=i+2) {
	// 	from = grades[i];
	// 	to = grades[i + 1];

	// 	labels.push(
	// 		'<i style="background:' + getColor(from + 1) + '"></i> ' +
	// 		from + (to ? '&ndash;' + to : '+'));
	// }
	div.innerHTML = "<div id='slider'></div>";
	// div.innerHTML = labels.join('<br>');
	return div;
}

slider.addTo(map);


// control that shows state info on hover
var info = L.control();

info.onAdd = function (map) {
	this._div = L.DomUtil.create('div', 'info');
	this.update();
	return this._div;
};

info.update = function (props) {
	this._div.innerHTML = '<h4>'+selectedLayer.name+'</h4>' +  (props ?
		'<b>' + props.Kreisname + '</b><br />' + props.YEARs20_10
		: 'Wähle einen Kreis');
};

info.addTo(map);

var baseLayers = {
	"Wanderung gesamt": "wanderunggesamt",
	"Bildungswanderung": "bildungswanderung",
	"Berufseinstiegswanderung": "berufseinstiegswanderung",
	"Familienwanderung": "familienwanderung",
	"Wanderung im mittleren Alter": "wanderungImMittlerenAlter",
	"Altenwanderung": "altenwanderung"
};

LayerSwitcher = L.Control.extend({
	options: {
		collapsed: true,
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

		this._layers[id] = {
			layer: layer,
			name: name,
			overlay: overlay
		};

		if (this.options.autoZIndex && layer.setZIndex) {
			this._lastZIndex++;
			layer.setZIndex(this._lastZIndex);
		}
	},

	onAdd: function (map) {
		this._initLayout();
		this._update();
		// map
		//     .on('layeradd', this._onLayerChange, this)
		//     .on('layerremove', this._onLayerChange, this);

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
				geojson.setStyle(style);
				info.update();
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

	// var popupContent = "<p>I started out as a GeoJSON " +
	// 		feature.geometry.type + ", but now I'm a Leaflet vector!</p>";

	// if (feature.properties && feature.properties.popupContent) {
	// 	popupContent += feature.properties.popupContent;
	// }

	// layer.bindPopup(popupContent);
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

//style for non selected features
function style(feature) {
    return {
        fillColor: selectedLayer.layer == "wanderunggesamt" ? getColor(feature.properties.YEARs2000T) :
        		   selectedLayer.layer == "bildungswanderung" ? getColor(feature.properties.YEARs200_2) :
        		   selectedLayer.layer == "berufseinstiegswanderung" ? getColor(feature.properties.YEARs200_6) :
        		   selectedLayer.layer == "familienwanderung" ? getColor(feature.properties.YEARs20_10) :
        		   selectedLayer.layer == "wanderungImMittlerenAlter" ? getColor(feature.properties.YEARs20_14) :
        		   selectedLayer.layer == "altenwanderung" ? getColor(feature.properties.YEARs20_18) :
        		   getColor(feature.properties.YEARs200_1),
        weight: 2,
        opacity: 1,
        color: 'black',
        dashArray: '3',
        fillOpacity: 0.7
    };
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