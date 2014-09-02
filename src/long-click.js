var _ = require('lodash'),
	$ = window.$;

function longClick($root, selector, cb){
	$root.on('mousedown', selector, function(){
		var self = this,
		args = _.toArray(arguments);
		$(self).addClass('active');

		var timeoutHandler = setTimeout(function(){
			$(self).removeClass('active');
			cb.apply(self, args);
		}, 800);

		$('body').on('mouseup mousedown', selector, function(){
			if (timeoutHandler){
				clearTimeout(timeoutHandler);
			}
			$(self).removeClass('active');
			return false;
		});

		return false;
	});
}

module.exports = longClick;
