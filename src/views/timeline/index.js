var $ = window.$,
	cubism = require('cubism'),
	storage = require('jocal'),
	template = require('./index.vash');

function Timeline(){
	var self = this;
	self.$element = $(template({}));

	self.hide = self.$element.hide.bind(self.$element);
	self.show = function(){
		self.$element.find('pre').text(JSON.stringify(storage('activities'), '\t', 4));
		self.$element.show();
	};
}

module.exports = Timeline;
