require('./index.less');
require('./leaflet.usermarker.js');
var template = require('./index.vash');
var L = require('leaflet');
var geolocation = require('geolocation');

var $ = require('jquery');
L.Icon.Default.imagePath = 'node_modules/leaflet/dist/images/';

function MapView(){
	var self = this;
	var southWest = L.latLng(-16.5467, 23.8898),
		northEast = L.latLng(-12.5653, 29.4708),
		bounds = L.latLngBounds(southWest, northEast);

	self.$element = $(template({}));

	var loaded = false;
	self.load = function(geojson){
		if (loaded) return;
		loaded = true;
		self.$element.find('.js-etho-map')
			.css('height', window.innerHeight-78)
			.css('width', window.innerWidth);

		var map = L.map('temp-map',{
			//center: [-13.4484, 28.072],
			center: [40.774484, -73.917],
		//	maxBounds: bounds,
			zoom: 15,
		});
	var tiles = 'http://{s}.tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/997/256/{z}/{x}/{y}.png';
 
		L.tileLayer('http://{s}.tile.thunderforest.com/outdoors/{z}/{x}/{y}.png', {
		//L.tileLayer('lib/img/MapQuest/{z}/{x}/{y}.jpg', {
		//L.tileLayer(tiles, {
			maxZoom: 17,
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

		var user; 
		function locationUpdate(data){
			var latLng = L.latLng(data.coords.latitude, data.coords.longitude);
			if (!user){
				user = L.userMarker(latLng, {pulsing:true, accuracy:data.coords.accuracy || 1000, smallIcon:true});
				user.addTo(map);
			}
			user.setLatLng(latLng);
		}

		function locationError(err){
			console.error(err);
		}

		// geojson.coordinates = [];
		// geojson.coordinates.push([[40.798790199,-73.9965883], [40.798790199,-74.9865883]]);
		// geojson.coordinates.push([[40.798790199,-73.9965883], [40.778790199,-74.9865883]]);
		debugger
			var myStyle = {
				    "color": "#ff7800",
					    "weight": 5,
						    "opacity": 0.65
			};
		// geojson.type="LineString";
		// geojson.coordinates = [
		// 		[-73.9181, 40.7747],
		// 		[-73.9028, 40.7718],
		// 	];
		// geojson.coordinates = geojson.coordinates.map(function(c){
		// 	console.dir(c);
		// 	return [c[0],c[1]];
		// });


		geolocation.watch(locationUpdate, locationError);
		var myLayer = L.geoJson(geojson, {style: myStyle}).addTo(map);
		//myLayer.addData(geojson);

	};
}

module.exports = MapView;
