var app = require('app'),
	createTimeline = require('d3-timeline'),
	_ = require('lodash');

var DEFAULTS = {
		getBegin: function(d){
			var domain = app.getDomain(d.domainName);
			var service = domain.getService('activity');

			return service.getBeginTime(d);
		},
		getEnd: function(d){
			var domain = app.getDomain(d.domainName);
			var service = domain.getService('activity');

			return service.getEndTime(d);
		},
		getLabel: function(d){
			var domain = app.getDomain(d.domainName);
			var service = domain.getService('description-manager');

			return service ? service.getShortDescription(d) : 'no label';
		},
	};

var HEADER_HEIGHT = 100;
module.exports = function(opts){
	opts = _.extend({}, DEFAULTS, opts);
	opts.height =  opts.height || window.innerHeight - HEADER_HEIGHT;
	return createTimeline(opts);
};
