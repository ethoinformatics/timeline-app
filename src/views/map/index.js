require('./index.less');
//require('./leaflet.usermarker.js');
var template = require('./index.vash');
var L = require('leaflet');

var $ = require('jquery');
L.Icon.Default.imagePath = 'node_modules/leaflet/dist/images/';

function MapView(){
	var self = this;
	var southWest = L.latLng(-16.5467, 23.8898),
		northEast = L.latLng(-12.5653, 29.4708),
		bounds = L.latLngBounds(southWest, northEast);

	self.$element = $(template({}));

	var loaded = false;
	self.load = function(){
		if (loaded) return;
		console.dir('***********');
		loaded = true;
		self.$element.find('.js-etho-map')
			.css('height', window.innerHeight-78)
			.css('width', window.innerWidth);

		var map = L.map('temp-map',{
			center: [-13.4484, 28.072],
			maxBounds: bounds,
			zoom: 10,
		});
	var tiles = 'http://{s}.tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/997/256/{z}/{x}/{y}.png';
 
		L.tileLayer('http://{s}.tile.thunderforest.com/outdoors/{z}/{x}/{y}.png', {
		//L.tileLayer('lib/img/MapQuest/{z}/{x}/{y}.jpg', {
		//L.tileLayer(tiles, {
			maxZoom: 14,
			minZoom: 8,
			id: 'examples.map-i875mjb7'
		}).addTo(map);



		var popup = L.popup();

		function onMapClick(coords) {
			popup
				.setLatLng(coords.latlng)
				.setContent("You clicked the map at " + Math.round(coords.latlng.lat * 10000)/10000 + ", " + Math.round(coords.latlng.lng*10000)/10000)
				.openOn(map);
		}


		map.on('click', onMapClick);

		// example current position
		//var latLng = L.latLng(-15.7473, 27.2598);
		//var marker = L.userMarker(latLng, {pulsing:true, accuracy:250, smallIcon:true});
		//marker.addTo(map);

	};
}

module.exports = MapView;
