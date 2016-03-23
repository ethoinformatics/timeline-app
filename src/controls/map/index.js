require('./index.less');
require('./leaflet.usermarker.js');

var template = require('./index.vash'),
	L = require('leaflet'),
	geolocation = require('geolocation'),
	$ = require('jquery')
	app = require('app')();

L.Icon.Default.imagePath = 'images';

var GEOJSON_STYLE = {
	//color: "#ff7800",
	color: '#EECF20',
	weight: 5,
	opacity: 0.65,
};

function _ensureProperSize(map){
	setTimeout(function(){
		map.invalidateSize();
	}, 0);
}

function _trackLocationOnMap(map){
	var currentLocationMarker; 

	function locationUpdate(err, data){
		// var latLng = L.latLng(data.coords.latitude, data.coords.longitude);
		// if (!currentLocationMarker){
		// 	currentLocationMarker = L.userMarker(latLng, {pulsing:true, accuracy:data.coords.accuracy || 1000, smallIcon:true});
		// 	currentLocationMarker.addTo(map);
		// }
		// currentLocationMarker.setLatLng(latLng);
	}

	function locationError(err){
		console.error(err);
	}


	geolocation.watch(locationUpdate);
}

function _getBounds(){
	var southWest = L.latLng(-16.5467, 23.8898),
		northEast = L.latLng(-12.5653, 29.4708),
		bounds = L.latLngBounds(southWest, northEast);

	return bounds;
}

function MapView(){
	var self = this;

	self.$element = $(template({}));
	var $map = self.$element.find('.js-etho-map')
		.css('height', window.innerHeight-78)
		.css('width', window.innerWidth);


	var map = L.map($map[0],{
		//center: [-13.4484, 28.072],
		//maxBounds: bounds,
		center: app.setting('map-center'),
		// center: [-0.63306469,-76.15418904],
		zoom: 15,
	});
	self.getLeaflet = function(){return L;};
	self.getLeafletMap = function(){return map;};

	//var tiles = 'http://{s}.tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/997/256/{z}/{x}/{y}.png';
	L.tileLayer('http://{s}.tile.openstreetmap.se/hydda/full/{z}/{x}/{y}.png', {
	//L.tileLayer('lib/img/MapQuest/{z}/{x}/{y}.jpg', {
	//L.tileLayer(tiles, {
		maxZoom: 25,
		minZoom: 1,
		id: 'examples.map-i875mjb7'
	}).addTo(map);



	var geoJsonLayer;
	self.showGeoJson = function(geojson){
		_ensureProperSize(map);

		// if (!geojson) return;
		// if (geoJsonLayer)
		// 	map.removeLayer(map);


	};

	self.show = _ensureProperSize.bind(null, map);

	_trackLocationOnMap(map);
}

module.exports = MapView;
