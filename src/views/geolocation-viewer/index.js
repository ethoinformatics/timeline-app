require('./index.less');

var $ = require('jquery'),
	tmpl = require('./index.vash'),
	velocity = require('velocity-animate'),
	geolocation = require('geolocation'),
	Modal = require('modal');

function GeolocationViewer(){
	var self = this,
		$element = $(tmpl({})),
		$pre = $element.find('pre'),
		$status = $element.find('.status');

		function _resetColor(){
			setTimeout(function(){
				velocity($status, {'backgroundColor': '#FFFFFF', color:'#000000'}, {
					duration: 600, 
				});
			}, 1400);
		}

	var watch = function(err, result){
		_resetColor();
		if (err){
			console.log('geo error');
			console.dir(err);

			$status.text('Failure!')
				.css('color', 'white')
				.css('background-color', 'red');

			$pre.empty()
				.text(JSON.stringify(err, '\t', 2));

			return;
		}

		$status.text('Success!')
			.css('color', 'white')
			.css('background-color', 'green');

		$pre.empty()
			.text(JSON.stringify(result, '\t', 2));

	};
	

	geolocation.watch(watch);

	var modal = new Modal({
		title: 'Geolocation viewer',
		$content: $element,
		hideOkay: true,
	});

	self.show = function(){
		modal.show();
	};

	self.hide = function(){
		modal.hide();
	};

	self.remove = function(){
		self.$element.remove();
		geolocation.unwatch(watch);
	};


}

module.exports = GeolocationViewer;
