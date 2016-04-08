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
	
	var diaryPromise = null;

	self.setContext = function(ctx){
		console.log("setContext");
		console.log(ctx);
		_context = ctx;
		
		if(!diaryPromise) {
			diaryPromise = entityManager.getDiary( ctx.entity );
			console.log("diaryPromise");
		}
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
	
	function _getGeo(beginTime, endTime) {
		// go to the diary,
		// get teh data,
		// format it
		// return it
		
		var count;
		if(!endTime) {
			endTime - beginTime;
		}
		
		count = endTime - beginTime;
		if(count == 0) count = 1;
		
		// return new Promise(function(resolve, reject) {
		// 	diaryPromise.then(function(diary) {
		// 		var startPoint = diary.geo.footprint.coordinates[0]; // this will break on empty data
		// 		var coordinates = [];
		// 		for(var i = 0; i < count; i++) {
		// 			coordinates.push([startPoint[0] + Math.random() * 0.1, startPoint[1] + Math.random() * 0.1, startPoint[2]]);
		// 		}
		// 		if(coordinates.length == 1) {
		// 			var geoJson = { "type": "Point", "coordinates": coordinates };
		// 		} else {
		// 			var geoJson = { "type": "LineString", "coordinates": coordinates };
		// 		}
		// 		resolve(geoJson);
		// 	});
		// });



		return new Promise(function(resolve, reject) {
			diaryPromise.then(function(diary) {
				var startIndex, endIndex;

				for(var i = 0; i < diary.geo.timestamps.length; i++) {
					var thisTimestamp = diary.geo.timestamps[0];
					if(beginTime >= thisTimestamp) startIndex = i;
					if(endTime >= thisTimestamp) endIndex = i;
				}

				if(!startIndex) startIndex = diary.geo.timestamps.length - 1;				
				if(!endIndex) endIndex = diary.geo.timestamps.length - 1;

				var startPoint = diary.geo.footprint.coordinates[0]; // this will break on empty data
				var coordinates = [];
				for(var i = startIndex; i <= endIndex; i++) {
					coordinates.push([startPoint[0] + Math.random() * 0.1, startPoint[1] + Math.random() * 0.1, startPoint[2]]);
				}
				if(coordinates.length == 1) {
					var geoJson = { "type": "Point", "coordinates": coordinates[0] };					
				} else {
					var geoJson = { "type": "LineString", "coordinates": coordinates };
				}
				console.log("beginTime: " + beginTime + ", endTime: " + endTime);
				console.log("startIndex: " + startIndex + ", endIndex: " + endIndex);
				console.log(geoJson);
				resolve(geoJson);
			});
		});



		// var arr = [[41.3839, -73.9405]]; // Garrison
		// if( arr.length > 1 ) return { "type": "LineString", "coordinates": arr };
		// else return { "type": "Point", "coordinates": arr[0] };
		
		
	}
	
	 
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
		// entityManager.getDiary( context.entity ).then(function(diary) {
		diaryPromise.then(function(diary) {
			var coordinates = diary.geo.footprint.coordinates;
			
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



// >>>>>>> origin/master
		
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
		
			//
			// _renderMarker_TEMPORARY_DEMO( [41.37874070257893, -73.94545555114746],  true, 'Contact 2' );
			// _renderMarker_TEMPORARY_DEMO( [41.397608221508406, -73.94330978393555], true, 'Contact 3' );
			// _renderMarker_TEMPORARY_DEMO( [41.398187683195665, -73.92931938171387], true, 'Contact 4' );
			// _renderMarker_TEMPORARY_DEMO( [41.37242884295152, -73.92751693725586],  true, 'Contact 5' );
		});






// <<<<<<< HEAD
// 		mapMarkers.push(marker);
//
//
// =======
		
//>>>>>>> origin/master
		
	}
	
	
	function _renderGeoJsonMarker(geoJson, draggable){

		console.log('_renderGeoJsonMarker');
		
		
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
		// entityManager.getDiary( context.entity ).then(function(diary) {
			var coordinates = geoJson.coordinates;
			
			console.log(coordinates);
			
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



// >>>>>>> origin/master
		
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
		
			//
			// _renderMarker_TEMPORARY_DEMO( [41.37874070257893, -73.94545555114746],  true, 'Contact 2' );
			// _renderMarker_TEMPORARY_DEMO( [41.397608221508406, -73.94330978393555], true, 'Contact 3' );
			// _renderMarker_TEMPORARY_DEMO( [41.398187683195665, -73.92931938171387], true, 'Contact 4' );
			// _renderMarker_TEMPORARY_DEMO( [41.37242884295152, -73.92751693725586],  true, 'Contact 5' );






// <<<<<<< HEAD
// 		mapMarkers.push(marker);
//
//
// =======
		
//>>>>>>> origin/master
		
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
		
		// entityManager.getDiary( context.entity ).then(function(diary) {
		diaryPromise.then(function(diary) {
			console.log("geoJson path");
			console.log(diary.geo.footprint);
			var path = L.geoJson(diary.geo.footprint, {
				style: mainPathOptions
			});
			path.addTo(lmapLayerGroup);
			
		});
		/*if (typeof footprint == 'string'){
			footprint = JSON.parse(footprint);
		}*/

		

	}



	function _renderGeoJsonPath(geoJson){
		console.log("_renderGeoJsonPath");
		
	// entityManager.getDiary( context.entity ).then(function(diary) {
		var path = L.geoJson(geoJson, {
			style: mainPathOptions
		});
		path.addTo(lmapLayerGroup);
		
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


	function _doSave(entity){
			console.log("_doSave");
		var rootDomain = app.getDomain(entity.domainName),
			rootEntityManager = rootDomain.getService('entity-manager');


		return rootEntityManager.save(entity)
			.then(function(info){
				console.log("_doSave response");
				console.log(info);
				console.log(entity);
				entity._id = info.id;
				entity._rev = info.rev;

				return info;
			});
	}

	function _createFakeGeo(diary) {
		// diary.newTestField = "new test";

		var numPoints = 100;		
		// var startPoint = [-0.6261, -76.1153,null];
		// var startPoint = [-76.1153,-0.6261,null];
		var startPoint = [-76.15, -0.638333, null];
		var offset = [0,0];
		var timeStep = 1;
		var startTimestamp = 1460050794000;
		var offsetStepLimit = 0.001;
		var offsetLimit = 0.001;
		
		var geo = {
			footprint: {
				coordinates: [startPoint],
				type: "LineString"
			},
			timestamps: [startTimestamp]
		};
		
		for(var i = 0; i < numPoints-1; i++) {
			var newTimestamp = geo.timestamps[i] + timeStep;
			offset = [
				offset[0] + Math.random() * offsetStepLimit - offsetStepLimit / 2, 
				offset[1] + Math.random() * offsetStepLimit - offsetStepLimit / 2
			];
			if(offset[0] < -offsetLimit) offset[0] = -offsetLimit;
			if(offset[0] > offsetLimit) offset[0] = offsetLimit;
			if(offset[1] < -offsetLimit) offset[1] = -offsetLimit;
			if(offset[1] > offsetLimit) offset[1] = offsetLimit;

			var lastPoint = geo.footprint.coordinates[i];
			var newPoint = [lastPoint[0] + offset[0], lastPoint[1] + offset[1], null];
			geo.footprint.coordinates.push(newPoint);
			geo.timestamps.push(newTimestamp);
		}
		
		// console.log(geo);
		diary.geo = geo;
	}

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
		
		// entityManager.getDiary( _context.entity ).then(function(diary) {
		diaryPromise.then(function(diary) {
			
			var footprint = diary.geo.footprint;
// <<<<<<< HEAD
//
// 			console.log('diary');
// 			console.log(diary);
//
// =======


			// This is where fake geo data is created. Comment out the next two lines to disable it
			if(!(diary.geo && diary.geo.footprint && diary.geo.timestamps && diary.geo.timestamps.length > 50)) {
				_createFakeGeo(diary);
				_doSave(diary);				
			}


//>>>>>>> origin/master
			
			console.log('data study');
			console.log(diary.contacts);
			
			
			// if(footprint.type == 'Point') _renderMarker(_context, true);//_renderPoint(_context); //
			// else if(footprint.type == 'LineString') _renderPath(_context);
			//
			// _renderContactTrace( [41.37874070257893,  -73.94545555114746],  'Contact Name 2' );
			// _renderContactTrace( [41.397608221508406, -73.94330978393555], 'Contact Name 3' );
			// _renderContactTrace( [41.398187683195665, -73.92931938171387], 'Contact Name 4' );
			// _renderContactTrace( [41.37242884295152,  -73.92751693725586],  'Contact Name 5' );

			if(_context.entity.geo && _context.entity.geo.footprint) {
				if(_context.entity.geo.footprint.type == 'Point') _renderGeoJsonMarker(_context.entity.geo.footprint, true);//_renderPoint(_context); // 
				else if(_context.entity.geo.footprint.type == 'LineString') _renderGeoJsonPath(_context.entity.geo.footprint);
			} else {
				_getGeo(_context.entity.beginTime,_context.entity.endTime).then(function(footprint) {
					console.log("footprint");
					console.log(footprint);
					if(footprint.type == 'Point') _renderGeoJsonMarker(footprint, true);//_renderPoint(_context); // 
					else if(footprint.type == 'LineString') _renderGeoJsonPath(footprint);
				

				});				
			}
			
			_renderChildren(_context.entity, 0);			
			map.show();


		});
		



				
//		L.marker([41.3839, -73.9405]).addTo(map).bindPopup('A pretty CSS3 popup.<br> Easily customizable.').openPopup();
		
	};
}

module.exports = MapTab;


