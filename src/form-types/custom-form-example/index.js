var $ = require('jquery'),
	template = require('./index.vash');


function CurrentLocation(){

	function getCoordinateField(selector){ return +self.$element.find(selector).val(); }

	function onLocationReady(data){
		self.$element.find('.js-get-location').text('Load current location');
		self.$element.find('.js-lng').val(data.coords.longitude);
		self.$element.find('.js-lat').val(data.coords.latitude);
	}

	var self = this;
	self.$element = $(template({ }));
	self.type = 'Location';

	self.$element.find('.js-get-location')
		.on('click', function(ev){
			ev.preventDefault();

			$(this).text('Working...');
			navigator.geolocation
				.getCurrentPosition(onLocationReady, window.alert.bind(window, 'location error'), { enableHighAccuracy: false });
		});

	self.getData = function(){
		return {
			lat: getCoordinateField('.js-lat'),
			lng: getCoordinateField('.js-lng'),
		};
	};
}

module.exports = CurrentLocation;
