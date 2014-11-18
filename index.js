var _ = require('lodash'),
	DOMAIN_SETTINGS_KEY = 'DOMAIN_SETTING_KEY',
	lookup = Object.create(null),
	domainDefaults = Object.create(null),
	EntityManager = require('./src/services/entity-manager');

// register global/default services here
domainDefaults['entity-manager'] = { ctor: EntityManager };

function getService(domainName, serviceName){
	var d = lookup[domainName],
		service = d[serviceName];

	if (service && _.isFunction(service.ctor)){
		service = new service.ctor(domainName);
	}

	return service;
}


var registry = {
	setDomainService: function(domainName, serviceName, args){
		lookup[domainName][serviceName] = args;
	},
	getDomains: function(serviceName){
		var domainNames = Object.keys(lookup),
			self = this;

		return domainNames.filter(function(n){ 
				return !serviceName || !!lookup[n][serviceName];
			})
			.map(function(n){ 
				return self.createDomain(n);
			});
	},
	getDomain: function(domainName){
		var domain = this.getDomains()
			.filter(function(d){ return d.name === domainName; })[0];

		if (!domain) return;

		return this.createDomain(domainName);
	},
	getService: getService,
	createDomain: function(opts){
		if (!opts) return;
		if (typeof opts === 'string') opts = {name: opts};

		opts.label = opts.label || opts.name;

		lookup[opts.name] = lookup[opts.name] || Object.create(domainDefaults);
		lookup[opts.name].name = opts.name;
		lookup[opts.name][DOMAIN_SETTINGS_KEY] = opts;

		var domain = Object.create(opts);
		domain.getService = getService.bind(this, opts.name);

		return domain;
	},
};

function App(){
	var self = this,
		settings = Object.create(null);

	self.register = function(serviceName){
		var args = _.rest(arguments);
		registry.setGlobalService(serviceName, args);
	};

	self.createDomain = function(opts){
		if (typeof opts === 'string') opts = {name: opts};

		registry.createDomain(opts);

		return {
			register: function(serviceName, service){
				registry.setDomainService(opts.name, serviceName, service);
			},
		};

	};

	self.setting = function(settingName, value){
		if (value !== undefined){
			settings[settingName] = value;
		} 

		return settings[settingName];
	};

	self.getRegistry = function(){ 
		registry.setting = self.setting.bind(self);
		return registry; 
	};
}

module.exports = new App();
