/////////////////////////////////
//
// ethoinfo-framework/src/views/view-existing-dialog/registrar/index.js
//
// Defines the app object
//
/////////////////////////////////


/* This file is the entry point for an app */
var _ = require('lodash'),
  q = require('q'),
  DOMAIN_SETTINGS_KEY = 'DOMAIN_SETTING_KEY',
  lookup = Object.create(null), 
  domainDefaults = Object.create(null),
  // entity manager handles the connection to DB
  EntityManager = require('../services/entity-manager'),
  uuidGenerator = require('../services/uuid-generator'),
  DescriptionManager = require('../services/description-manager');

// register global/default services here
domainDefaults['entity-manager'] = { ctor: EntityManager };
domainDefaults['description-manager'] = { ctor: DescriptionManager };
domainDefaults['uuid-generator'] = uuidGenerator;

function getService(domainName, serviceName){
  // console.log(">>> Registrar >>> getService(domainName, serviceName) >>", domainName, serviceName);

  var d = lookup[domainName],
    service = d[serviceName];

  //console.log('>>> service is: ', service);

  if (service && _.isFunction(service.ctor)){
    service = new service.ctor(registry, domainName);
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
  getTopLevelDomains: function(){
    var self = this;
    // get all domains except "code-domain" and those that start with an underscore
    var domains = self.getDomains()
      .filter(function(domain){
        return !domain.getService('code-domain') && !/^_/.test(domain.name);
      });

    return domains.filter(function(d){
      return !_.any(domains, function(otherDomain){
        return !!_.find(otherDomain.getChildren(), function(d2){
          return d2.name == d.name;
        });
      });
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
  setChildDomain: function(parentDomainName, propertyName, childDomain, options){
    options = Object(options);
    options.name = childDomain.name;

    lookup[parentDomainName]['children-domains'].push(options);

    // kind of bootleg...  entity-manager will reference
    // this sercret value...
    lookup[childDomain.name]['parent-'+parentDomainName] = propertyName;
  },
  getChildDomains: function(parentDomainName){
    var self = this;

    var domains = lookup[parentDomainName]['children-domains']
      .map(function(d){
        var childDomain = self.getDomain(d.name);
        var tmp  = _.extend(_.create(childDomain), d);
        return tmp;
      });

    return domains;
  },
  getEntities: function(){
    var self = this;
    // get all the entities from the entity-manager service:
    return _.chain(self.getTopLevelDomains())
      .map(function(domain){
        var entityManager = domain.getService('entity-manager');
        // this is connected to PouchDB, essentially getting all the records
        // for this domain:
        return entityManager.getAll();
      })
      .thru(q.all)
      // return their value when they're all registered:
      .value()
      // chain them as a chain of promise events:
      .then(function(results){
        return _.chain(results)
          // flatten them (presumably into an array?) and sort them:
          .flatten()
          .sortBy(function(d){
            var domain = app.getDomain(d.domainName);
            var sortBy = domain ? domain.getService('sort-by') : false;

            if (!sortBy) return d._id || d.id;
            // return the sorted array of entities:
            return d[sortBy];
          })
          // reverse the sort, and return the final value of that reversal:
          .reverse()
          .value();
      });
  }
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
      register: function(serviceName, service, relationshipOptions){
        relationshipOptions = Object(relationshipOptions);

        if (serviceName && serviceName._isEthoinfoDomain){
          registry.setChildDomain(opts.name, 'children', serviceName);
        } else if (service._isEthoinfoDomain){
          registry.setChildDomain(opts.name, serviceName, service, relationshipOptions);
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
    // instantiate the app, with the registry of services
    require('../app.js')(self.getRegistry());
    // build the DOM elements, and load Objects
    require('../main.js');
  };

}

var theApp = new App();

theApp.createDomain('_etho-settings');
/* projects will use app.run() to kick off use of etho-framework */
module.exports = theApp;
