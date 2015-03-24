require('./index.less');

var template = require('./index.vash'),
	$ = require('jquery');


function Breadcrumb(opt){

	var self = this;

	self.$element = $(template({crumbs: opt.crumbs}));

}

module.exports = Breadcrumb;
