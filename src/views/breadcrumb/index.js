require('./index.less');

var template = require('./index.vash'),
	crumbTemplate = require('./crumb.vash'),
	$ = require('jquery');

function toElement(crumb){
	return crumbTemplate(crumb);
}

function Breadcrumb(opt){
	const self = this;

	self.$element = $(template({crumbs: opt.crumbs}));
	const $cntr = self.$element.find('.js-crumbs');

	opt.crumbs.map(c => toElement(c))
		.forEach(el => $cntr.append(el));


	self.add = function(crumb){


	};
}

module.exports = Breadcrumb;
