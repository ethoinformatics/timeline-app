var util = require('util'),
	EventEmitter = require('events').EventEmitter,
	tmpl = require('./index.vash');

function TimelineTab(){
	var self = this;

	EventEmitter.call(self);


	function _setTitleContent(){
		$content.find('.js-long-description-container')
			.html('<h1 class="loading-message">Loading...</h1>');

		descManager.getLongDescription(entity)
			.then(function(description){
				console.log('done loading form');
				$content.find('.js-long-description-container')
					.html(description);
			})
			.catch(function(err){
				console.error(err);
			});
	}
}

module.exports = TimelineTab;
