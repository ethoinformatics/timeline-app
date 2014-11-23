var _ = require('lodash');

function getLabel(service, entity){
	if (_.isFunction(service)){
		return service(entity);
	} else if (_.isString(service)){
		return entity[service];
	}

	return '';
}

function DescriptionManager(domainName){
	var self = this;

	var app = require('app');
	var domain = app.getDomain(domainName);
	self.getShortDescription = function(entity){
		var service = domain.getService('short-description');
		return getLabel(service, entity);
	};

	self.getLongDescription = function(entity){
		var service = domain.getService('long-description');
		return getLabel(service, entity) || self.getShortDescription();
	};
}

module.exports = DescriptionManager;
