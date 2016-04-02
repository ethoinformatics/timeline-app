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
	 
	function _renderMarker(context, draggable){
		
		
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
		

		var coordinates = entityManager.getGeo( context.entity ).coordinates;
		var markerOptions = {
			draggable: draggable	
		};
		
		var marker = L.marker( coordinates, markerOptions ).addTo(lmapLayerGroup);
		marker.bindPopup('<strong>Heading Here</strong><br>Body of pop up here below heading.');
		marker.on('click', function(e) {
		    //marker.setIcon(bigIcon);
		});
		marker.on('drag', function(e) {
		    //marker.setIcon(bigIcon);
			_updateEntityCoordinates( [ marker.getLatLng().lat, marker.getLatLng().lng ] );
		});
	
		mapMarkers.push(marker);
	}

	function _renderPoint(context){
		
		
		
		var coordinates = entityManager.getGeo( context.entity ).coordinates;
		var circle = L.circle( coordinates, 500, {
		    color: 'red',
		    fillColor: '#f03',
		    fillOpacity: 0.5
		}).addTo(lmapLayerGroup);
		
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
		
		
		if(footprint.type == 'Point') _renderMarker(_context, true);//_renderPoint(_context);
		else if(footprint.type == 'LineString') _renderPath(_context);
		_renderChildren(_context.entity, 0);
		map.show();


				
//		L.marker([41.3839, -73.9405]).addTo(map).bindPopup('A pretty CSS3 popup.<br> Easily customizable.').openPopup();
		
	};
}

module.exports = MapTab;


