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

	function _renderChildren(entity, depth){
		var children = _context.getChildren(entity);

		var arr = [];
		_.chain(children)
			.toArray()
			.value()
			.forEach(function(child){
				_.values(child.geo)
					.forEach(function(geojson){
						var geoJsonLayer = L.geoJson(geojson, {
							//style: GEOJSON_STYLE,
							pointToLayer: function (feature, latlng) {
								var options = _.extend({draggable: true}, geojsonMarkerOptions);
								debugger
								var marker = L.circleMarker(latlng, options);
								marker.bindPopup('this is a test');
								return marker;
							},
						});

						arr.push(geoJsonLayer);
					});
			});

		var group = L.layerGroup(arr);
		group.addTo(lmap);
	}

	self.descend = function(){
	};

	var path;
	self.show = function(){
		self.$element.show();

		if (!path){
			path = L.geoJson(_context.entity.geo.footprint, {
				//style: GEOJSON_STYLE,
			});
			path.addTo(lmap);
		}
		//var children = _context.getChildren();
		_renderChildren(_context.entity, 0);
		map.show();
	};
}

module.exports = MapTab;


