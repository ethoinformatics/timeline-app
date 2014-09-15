var _ = require('lodash'),
	$ = require('jquery');

function longClick($root, selector, cb){
	$root.on('touchstart', selector, function(){
		var self = this,
			args = _.toArray(arguments);
			$(self).addClass('active');

		var timeoutHandler = setTimeout(function(){
			$(self).removeClass('active');

			cb.apply(self, args);
		}, 800);

		var mouseUp = function(){
			if (timeoutHandler){
				clearTimeout(timeoutHandler);
				$(self).removeClass('active');
			}

			return true;
		};

		$('body').one('touchend', selector, mouseUp);

		return true;
	});
}

module.exports = longClick;
