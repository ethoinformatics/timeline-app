var $ = require('jquery'),
	_ = require('lodash'),
	MapView = require('map');


var tmpl = require('./index.vash');

function MapTab(){
	var self = this,
		_context;
	var map = new MapView();
	var L = map.getLeaflet();

	self.label = 'Map';

	self.$element = $(tmpl({}));
	self.$element.append(map.$element);

	var lmap = map.getLeafletMap();

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

	function _renderPath(entity){
		
		var footprint = entity.entity.footprint;
		/*if (typeof footprint == 'string'){
			footprint = JSON.parse(footprint);
		}*/
		console.log(JSON.stringify(footprint));
		var path = L.geoJson(footprint, {
			style: mainPathOptions
		});
		path.addTo(lmap);
	}

	function _renderChildren(entity, depth){
		//console.log("_renderChildren called.");
		var children = _context.getChildren(entity);

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

		/*if (!path){
			path = L.geoJson(_context.entity.footprint, {
				//style: GEOJSON_STYLE,
			});
			path.addTo(lmap);
		}*/
		//var children = _context.getChildren();
		_renderPath(_context);
		_renderChildren(_context.entity, 0);
		map.show();
	};
}

module.exports = MapTab;


