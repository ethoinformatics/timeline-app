require('./index.less');

var $ = require('jquery'),
	tmpl = require('./index.vash'),
	geolocation = require('geolocation'),
	Modal = require('modal');

function GeolocationViewer(){
	var self = this,
		$element = $(tmpl({})),
		$pre = $element.find('pre'),
		$status = $element.find('.status');

	var watch = function(err, result){
		if (err){
			console.log('geo error');
			console.dir(err);
			$status.text('Failure!')
				.removeClass('success')
				.addClass('failure');

			$pre.empty()
				.text(JSON.stringify(err, '\t', 2));

			return;
		}


		console.dir('good');
		console.dir(result);
		$status.text('Success!')
			.addClass('success')
			.removeClass('failure');

		$pre.empty()
			.text(JSON.stringify(result, '\t', 2));
	};
	

	geolocation.watch(watch);

	var modal = new Modal({
		title: 'Coded field manager',
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
