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
	
	var popupOffset = [0,-40];

	function _updateEntityCoordinates(coordinates){
		console.log( coordinates );		
	}
	 
	function _clearMarkers(){
		console.log('_clearMarkers');
		for(var i=0; i<mapMarkers.length; i++){
			lmapLayerGroup.removeLayer(mapMarkers[i]);
		}		
	}
	
	 
	function _renderMarker(context, draggable){

		var coordinates = entityManager.getGeo( context.entity ).coordinates;

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
		
		
		
	}
	
	function _renderContactTrace(coordinates, heading){

		var circleMarker = L.circleMarker( coordinates, {
		    color:     'rgb(38,126,202)',
			weight: 	0,
		    fillColor: 'rgb(38,126,202)', //rgb(255,255,255)',
			fillOpacity: 1.0
		}).addTo(lmapLayerGroup);
		circleMarker.setRadius(4);
		circleMarker.on('click', function(e) {
			var popup = L.popup()
		    	.setLatLng(coordinates)
		    	.setContent( '<strong>CONTACT: '+heading+'</strong></div>' ) 
		    	.addTo(lmapLayerGroup);			
		});
		mapMarkers.push(circleMarker);

	}

	function _renderPath(context){
		console.log("_renderPath");
		console.log(entityManager.getGeo( context.entity ));
		
		var footprint = entityManager.getGeo( context.entity );
		/*if (typeof footprint == 'string'){
			footprint = JSON.parse(footprint);
		}*/

		console.log("_renderPath");
		console.log(JSON.stringify(footprint));
		var path = L.geoJson(footprint, {
			style: mainPathOptions
		});
		path.addTo(lmapLayerGroup);
		

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
		
		var footprint = entityManager.getGeo( _context.entity );
		
		
		if(footprint.type == 'Point') _renderMarker(_context, true); 
		else if(footprint.type == 'LineString') _renderPath(_context);
		_renderChildren(_context.entity, 0);
		map.show();


		_renderContactTrace( [41.37874070257893, -73.94545555114746],  'Contact Name 2' );
		_renderContactTrace( [41.397608221508406, -73.94330978393555], 'Contact Name 3' );
		_renderContactTrace( [41.398187683195665, -73.92931938171387], 'Contact Name 4' );
		_renderContactTrace( [41.37242884295152, -73.92751693725586],  'Contact Name 5' );

				
//		L.marker([41.3839, -73.9405]).addTo(map).bindPopup('A pretty CSS3 popup.<br> Easily customizable.').openPopup();
		
	};
}

module.exports = MapTab;


