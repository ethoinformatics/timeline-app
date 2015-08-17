var $ = require('jquery'),
	MapView = require('map');


var tmpl = require('./index.vash');

function MapTab(){
	var self = this,
		_context;
	var map = new MapView();
	self.label = 'Map';

	self.$element = $(tmpl({}));
	self.$element.append(map.$element);

	self.setContext = function(ctx){
		_context = ctx;
	};

	self.show = function(){
		self.$element.show();
		map.showGeoJson(_context.entity.footprint);
	};
}

module.exports = MapTab;


