/////////////////////////////////
//
// ethoinfo-framework/src/views/view-existing-dialog/tabs/map/index.js
//
// Maps tab
//
/////////////////////////////////


var $ = require('jquery'),
	_ = require('lodash'),
	app = require('app')(),
	MapView = require('map');
	
var tmpl = require('./index.vash');
var mapMarkers = [];

function MapTab(){
	var self = this,
		_context;
	var map = new MapView();
	var L = map.getLeaflet();
	mapMarkers = [];

	var settingsDomain = app.getDomain('_etho-settings');
	var entityManager = settingsDomain.getService('entity-manager');

	self.label = 'Map';

	self.$element = $(tmpl({}));
	self.$element.append(map.$element);

	var lmap = map.getLeafletMap();
	var lmapLayerGroup = L.layerGroup();
	lmapLayerGroup.addTo(lmap);

	self.setContext = function(ctx){
		_context = ctx;
	};

	var geojsonMarkerOptions = {
		radius: 8,
		fillColor: "#ff7800",
		color: "#000",
		weight: 1,
		opacity: 1,
		fillOpacity: 0.8
	};

	var mainPathOptions = {
		color: "#ff7800",
		weight: 2,
		opacity: 1
	};

	var childPathOptions = {
		color: "#333",
		weight: 2,
		opacity: 0.75,
	};

	function _updateEntityCoordinates(coordinates){
		console.log( coordinates );		
	}
	 
	function _clearMarkers(){
		console.log('_clearMarkers');
		for(var i=0; i<mapMarkers.length; i++){
			lmapLayerGroup.removeLayer(mapMarkers[i]);
		}		
	}
	
//	var icon = L.icon( { iconSize: [138, 195] } );
	 
	function _renderMarker(context, draggable){
		console.log('_renderMarker');
		
		
		///////////////////////
		///////////////////////
		///////////////////////
		// // todo: 
		// a.) make it so the markers are a small, but tap-able circle when loaded (with an alpha 50% state for when not highlighted)
		// b.) make it so click on the marker makes it draggable
		// c.) make it so click on a marker makes the size bigger and no alpha
		///////////////////////
		///////////////////////
		///////////////////////
		
		var popupOffset = [0,-40];
		
		
		
		// Promise-based
		var geoPromise = entityManager.getGeo( context.entity );
		console.log("geoPromise");
		console.log(geoPromise);
		geoPromise.then(function(footprint) {
			console.log("getGeo sent us: ");
			console.log(footprint);
			var coordinates = footprint.coordinates;
			
			var circleMarkerDrag = L.circleMarker( coordinates, {
			    color:     '#62ce21', //'rgb(38,126,202)',
				weight: 	6,
			    fillColor: 'rgb(255,255,255)',
				opacity: 1.0
			});//.addTo(lmapLayerGroup);
			circleMarkerDrag.setRadius(6);




		
			var myIcon = L.icon({
			    iconUrl: 'images/marker-icon.png',
			    iconRetinaUrl: 'images/marker-icon-2x.png',
				popupAnchor: popupOffset
			});
			var myIconSelected = L.icon({
			    iconUrl: 'images/marker-icon-GREEN-2x.png',
			    iconRetinaUrl: 'images/marker-icon-GREEN-2x.png',
				popupAnchor: popupOffset
			});



		
			var marker = L.marker( coordinates, { draggable: draggable	} ).addTo(lmapLayerGroup);
			marker.setIcon( myIcon );
			//marker.bindPopup('<strong>Heading Here</strong><br>Body of pop up here below heading.');
			marker.bindPopup( '<strong>Contact 1</strong><br>Body of pop up here below heading.<div style="border-top: solid 1px #aaa; padding-top: 5px; color: #62ce21;">lat: ' + marker.getLatLng().lat + '<br>lon: ' + marker.getLatLng().lng +'</div>' );
			marker.on('click', function(e) {
				marker.setPopupContent( '<strong>Contact 1</strong><br>Body of pop up here below heading.<div style="border-top: solid 1px #aaa; padding-top: 5px; color: #62ce21;">lat: ' + marker.getLatLng().lat + '<br>lon: ' + marker.getLatLng().lng +'</div>' );
			});

			marker.on('dragstart', function(e) {
				circleMarkerDrag.setLatLng( [ marker.getLatLng().lat, marker.getLatLng().lng ] );
				circleMarkerDrag.addTo(lmapLayerGroup);
				marker.setIcon( myIconSelected );
			});

			marker.on('drag', function(e) {
				_updateEntityCoordinates( [ marker.getLatLng().lat, marker.getLatLng().lng ] );
				marker.setPopupContent( '<strong>Contact 1</strong><br>Body of pop up here below heading.<div style="border-top: solid 1px #aaa; padding-top: 5px; color: #62ce21;">Relocating to<br>lat: ' + marker.getLatLng().lat + '<br>lon: ' + marker.getLatLng().lng +'</div>' );
				marker.openPopup();
			});	

			marker.on('dragend', function(e) {
				lmapLayerGroup.removeLayer(circleMarkerDrag);
				marker.setIcon( myIcon );			
			});

			mapMarkers.push(marker);
		
		
			_renderMarker_TEMPORARY_DEMO( [41.37874070257893, -73.94545555114746],  true, 'Contact 2' );
			_renderMarker_TEMPORARY_DEMO( [41.397608221508406, -73.94330978393555], true, 'Contact 3' );
			_renderMarker_TEMPORARY_DEMO( [41.398187683195665, -73.92931938171387], true, 'Contact 4' );
			_renderMarker_TEMPORARY_DEMO( [41.37242884295152, -73.92751693725586],  true, 'Contact 5' );
		});

		// var coordinates = entityManager.getGeo( context.entity ).coordinates; // existing




		/*
		
		*/
	}
	
	function _renderMarker_TEMPORARY_DEMO(coordinates, draggable, heading){
		
		
		var popupOffset = [0,-40];



		var circleMarkerDrag = L.circleMarker( coordinates, {
		    color:     '#62ce21', //'rgb(38,126,202)',
			weight: 	6,
		    fillColor: 'rgb(255,255,255)',
			opacity: 1.0
		});//.addTo(lmapLayerGroup);
		circleMarkerDrag.setRadius(6);




		
		var myIcon = L.icon({
		    iconUrl: 'images/marker-icon.png',
		    iconRetinaUrl: 'images/marker-icon-2x.png',
			popupAnchor: popupOffset
		});
		var myIconSelected = L.icon({
		    iconUrl: 'images/marker-icon-GREEN-2x.png',
		    iconRetinaUrl: 'images/marker-icon-GREEN-2x.png',
			popupAnchor: popupOffset
		});



		
		var marker = L.marker( coordinates, { draggable: draggable	} ).addTo(lmapLayerGroup);
		marker.setIcon( myIcon );
		//marker.bindPopup('<strong>Heading Here</strong><br>Body of pop up here below heading.');
		marker.bindPopup( '<strong>'+heading+'</strong><br>Body of pop up here below heading.<div style="border-top: solid 1px #aaa; padding-top: 5px; color: #62ce21;">lat: ' + marker.getLatLng().lat + '<br>lon: ' + marker.getLatLng().lng +'</div>' );
		marker.on('click', function(e) {
			marker.setPopupContent( '<strong>'+heading+'</strong><br>Body of pop up here below heading.<div style="border-top: solid 1px #aaa; padding-top: 5px; color: #62ce21;">lat: ' + marker.getLatLng().lat + '<br>lon: ' + marker.getLatLng().lng +'</div>' );
		});

		marker.on('dragstart', function(e) {
			circleMarkerDrag.setLatLng( [ marker.getLatLng().lat, marker.getLatLng().lng ] );
			circleMarkerDrag.addTo(lmapLayerGroup);
			marker.setIcon( myIconSelected );
		});

		marker.on('drag', function(e) {
			_updateEntityCoordinates( [ marker.getLatLng().lat, marker.getLatLng().lng ] );
			marker.setPopupContent( '<strong>'+heading+'</strong><br>Body of pop up here below heading.<div style="border-top: solid 1px #aaa; padding-top: 5px; color: #62ce21;">Relocating to<br>lat: ' + marker.getLatLng().lat + '<br>lon: ' + marker.getLatLng().lng +'</div>' );
			marker.openPopup();
		});	

		marker.on('dragend', function(e) {
			lmapLayerGroup.removeLayer(circleMarkerDrag);
			marker.setIcon( myIcon );			
		});

		mapMarkers.push(marker);
		
		
		/*
		[41.37874070257893, -73.94545555114746]
		
		*/
	}

	function _renderPoint(context){
		
		var coordinates = entityManager.getGeo( context.entity ).coordinates;
		var circleMarker = L.circleMarker( coordinates, {
		    color: 'red',
		    fillColor: '#f03',
		    fillOpacity: 0.5
		}).addTo(lmapLayerGroup);
		circleMarker.setRadius(10);
		
	}
	
	function _renderPath(context){
		console.log("_renderPath");
		
		var geoPromise = entityManager.getGeo( context.entity );
		geoPromise.then(function(footprint) {
			console.log("_renderPath");
			console.log(JSON.stringify(footprint));
			var path = L.geoJson(footprint, {
				style: mainPathOptions
			});
			path.addTo(lmapLayerGroup);
			
		});
		/*if (typeof footprint == 'string'){
			footprint = JSON.parse(footprint);
		}*/

		

	}

	function _renderChildren(entity, depth){
		//console.log("_renderChildren called.");
		var children = _context.getChildren(entity);

		console.log('geojson children');
		console.log(children);
		
		var arr = [];
		_.chain(children)
			.toArray()
			.value()
			//.forEach(function(child){
				//console.log(child);
				//_.values(child.footprint)
					.forEach(function(child){
						geojson = child.footprint;
						if (typeof geojson == "string"){
							geojson = JSON.parse(geojson);
						}
						
						console.log(JSON.stringify(geojson));
						var geoJsonLayer = L.geoJson(geojson, {
							style: childPathOptions
							/*pointToLayer: function (feature, latlng) {
								var options = _.extend({draggable: true}, geojsonMarkerOptions);
								debugger
								var marker = L.circleMarker(latlng, options);
								marker.bindPopup('this is a test');
								return marker;
							},*/
						});

						arr.push(geoJsonLayer);
					});
			
		var group = L.layerGroup(arr);
		group.addTo(lmap); 
	}

	self.descend = function(){
	};

	var path;
	self.show = function(){
		self.$element.show();
		lmap.invalidateSize();
		console.log( lmapLayerGroup.getLayers() );

		lmapLayerGroup.clearLayers();
		/*if (!path){
			path = L.geoJson(_context.entity.footprint, {
				//style: GEOJSON_STYLE,
			});
			path.addTo(lmap);
		}*/
		//var children = _context.getChildren();
		
				// var geoPromise = entityManager.getGeo( context.entity );
		// var footprint = entityManager.getGeo( _context.entity );
		var geoPromise = entityManager.getGeo( _context.entity );
		geoPromise.then(function(footprint) {
			console.log("in here");
			console.log(footprint);
			
			
			
			if(footprint.type == 'Point') _renderMarker(_context, true);//_renderPoint(_context); // 
			else if(footprint.type == 'LineString') _renderPath(_context);
			_renderChildren(_context.entity, 0);
			map.show();

		})
		


				
//		L.marker([41.3839, -73.9405]).addTo(map).bindPopup('A pretty CSS3 popup.<br> Easily customizable.').openPopup();
		
	};
}

module.exports = MapTab;


