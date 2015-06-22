var _ = require('lodash'),
	DOMAIN_SETTINGS_KEY = 'DOMAIN_SETTING_KEY',
	lookup = Object.create(null),
	domainDefaults = Object.create(null),
	EntityManager = require('./services/entity-manager'),
	uuidGenerator = require('./services/uuid-generator'),
	DescriptionManager = require('./services/description-manager');

// register global/default services here
domainDefaults['entity-manager'] = { ctor: EntityManager };
domainDefaults['description-manager'] = { ctor: DescriptionManager };
domainDefaults['uuid-generator'] = uuidGenerator;

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

		var domainData = lookup[opts.name];
		if (domainData){
			opts = _.extend(domainData[DOMAIN_SETTINGS_KEY] || {}, opts);
		}

		opts.label = opts.label || opts.name;

		lookup[opts.name] = lookup[opts.name] || Object.create(domainDefaults);
		lookup[opts.name].name = opts.name;
		lookup[opts.name][DOMAIN_SETTINGS_KEY] = opts;
		lookup[opts.name]['children-domains'] = lookup[opts.name]['children-domains'] || [];

		var domain = Object.create(opts);
		domain.getService = getService.bind(this, opts.name);
		domain.getChildren = this.getChildDomains.bind(this, opts.name);

		return domain;
	},
	setChildDomain: function(parentDomainName, propertyName, childDomain){
		lookup[parentDomainName]['children-domains'].push(childDomain.name);

		// kind of bootleg...  entity-manager will reference
		// this sercret value...
		lookup[childDomain.name]['parent-'+parentDomainName] = propertyName;
	},
	getChildDomains: function(parentDomainName){
		return lookup[parentDomainName]['children-domains'].map(this.getDomain.bind(this));
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

		var domain = registry.createDomain(opts);

		return {
			_isEthoinfoDomain: true,
			name: domain.name,
			register: function(serviceName, service){
				if (serviceName && serviceName._isEthoinfoDomain){
					registry.setChildDomain(opts.name, 'children', serviceName);
				} else if (service._isEthoinfoDomain){
					registry.setChildDomain(opts.name, serviceName, service);
				} else {
					registry.setDomainService(opts.name, serviceName, service);
				}
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

	self.run = function(){
		require('./app.js')(self.getRegistry());
		require('./main.js');
	};

}

var theApp = new App();

theApp.createDomain('_etho-settings');

module.exports = theApp;
