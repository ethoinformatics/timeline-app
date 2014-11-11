var _ = require('lodash'),
	GLOBAL_KEY = 'GLOBAL_KEY',
	DOMAIN_SETTINGS_KEY = 'DOMAIN_SETTING_KEY',
	lookup = Object.create(null);

lookup[GLOBAL_KEY] = Object.create(null);

var registry = {
	setDomainService: function(domainName, serviceName, args){
		lookup[domainName][serviceName] = args;
	},
	setGlobalService: function(serviceName, args){
		lookup[GLOBAL_KEY][serviceName] = args;
	},
	getService: function(domainName, serviceName){
		var d = lookup[domainName];
		if (d && serviceName in d) return d[serviceName];

		return lookup[GLOBAL_KEY].serviceName;
	},
	getDomains: function(serviceName){
		var domainNames = Object.keys(lookup)
			.filter(function(k){ return k!=GLOBAL_KEY; });

		return domainNames.filter(function(n){ 
				return !serviceName || !!lookup[n][serviceName];
			})
			.map(function(n){ 
				return lookup[n][DOMAIN_SETTINGS_KEY];
			});
	},
	getDomain: function(domainName){
		var domain = this.getDomains()
			.filter(function(d){ return d.name === domainName; })[0];

		if (!domain) return;

		domain = _.cloneDeep(domain);
		var myLookup = lookup[domainName];
		domain.getService = function(serviceName){
			return myLookup[serviceName];
		};

		return domain;
	},
	createDomain: function(opts){
		opts.label = opts.label || opts.name;

		lookup[opts.name] = lookup[opts.name] || {name: opts.name};
		lookup[opts.name][DOMAIN_SETTINGS_KEY] = opts;
	},
};

function App(){
	var self = this;

	self.register = function(serviceName){
		var args = _.rest(arguments);
		registry.setGlobalService(serviceName, args);
	};

	self.createDomain = function(opts){
		if (typeof opts === 'string') opts = {name: opts};

		registry.createDomain(opts);

		return {
			register: function(serviceName){
				var args = _.rest(arguments);

				registry.setDomainService(opts.name, serviceName, args);
			},
		};

	};

	self.set = function(setting, value){
		// todo
	};
	self.getRegistry = function(){ return registry; };
}

module.exports = new App();
