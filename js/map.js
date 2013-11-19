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

var cloudmadeUrl = 'http://{s}.tile.cloudmade.com/API-key/{styleId}/256/{z}/{x}/{y}.png',
    cloudmadeAttribution = 'Map data &copy; 2011 OpenStreetMap contributors, Imagery &copy; 2011 CloudMade';

var bildungswanderung   = L.tileLayer(cloudmadeUrl),
    berufseinstiegswanderung  = L.tileLayer(cloudmadeUrl, {styleId: 999,   attribution: cloudmadeAttribution}),
    familienwanderung  = L.tileLayer(cloudmadeUrl, {styleId: 999,   attribution: cloudmadeAttribution}),
    wanderungImMittlerenAlter  = L.tileLayer(cloudmadeUrl, {styleId: 999,   attribution: cloudmadeAttribution}),
    altenwanderung  = L.tileLayer(cloudmadeUrl, {styleId: 999,   attribution: cloudmadeAttribution});

var baseLayers = {
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
		var id = this._uniqid(layer);

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

	_eliminateDuplicates: function (arr) {
	    var i, len = arr.length,
	        out = [],
	        obj = {};

	    for (i = 0; i < len; i++) {
	        obj[arr[i]] = 0;
	    }
	    for (i in obj) {
	        out.push(i);
	    }
	    return out;
	},

	_uniqid: function (str) {
	    var len = str.length;
	    var chars = [];
	    for (var i = 0; i < len; i++) {

	        chars[i] = str[Math.floor((Math.random() * len))];

	    }

	    var filtered = this._eliminateDuplicates(chars);

	    return filtered.join('');
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
		    checked = this._map.hasLayer(obj.layer);
		if (obj.overlay) {
			input = document.createElement('input');
			input.type = 'checkbox';
			input.className = 'leaflet-control-layers-selector';
			input.defaultChecked = checked;
		} else {
			input = this._createRadioElement('leaflet-base-layers', checked);
		}

		// input.layerId = L.stamp(obj.layer);
		// input.layerId = this._uniqid(obj.layer);

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
			obj = this._layers[input.layerId];

			if (input.checked && !this._map.hasLayer(obj.layer)) {
				this._map.addLayer(obj.layer);

			} else if (!input.checked && this._map.hasLayer(obj.layer)) {
				this._map.removeLayer(obj.layer);
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

// L.control.layers(baseLayers).addTo(map);

// map.on('baselayerchange', changeTopic);

function changeTopic(layer){
	console.log(layer);
};

// var loadingControl = L.Control.loading({
// 	separate: true
// });

// map.addControl(loadingControl);
// map.on('layeradd', addLayer );
// map.on('viewreset', function(){
// 	console.log("adsadsadsadsad");
// });

// function addLayer(event) {
// 	console.log(event);
// 	map.fire('dataloading');
// }

var shpfile = new L.Shapefile('DatenMSWissenschaft.zip',{onEachFeature:function(feature, layer) {
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