var _ = require('lodash'),
	q = require('q');


function DescriptionManager(domainName){
	var self = this;

	var app = require('app');
	var domain = app.getDomain(domainName),
		fields = domain.getService('form-fields');

	function getLabel(service, entity){
		

	}

	function getCodes(field){
		if (!field) return q.fcall(_.constant([]));

		var codeDomain = app.getDomain(field.domain);
		if (!codeDomain) return q.fcall(_.constant([]));

		var codeDescManager = codeDomain.getService('description-manager'),
			codeEntitymanager = codeDomain.getService('entity-manager');

		return codeEntitymanager
			.getAll()
			.then(function(codes){
				return codes.map(function(code){
					return {
						value: code._id,
						description: codeDescManager.getShortDescription(code),
					};
				});
			});
	}

	self.getShortDescription = function(entity){
		var service = domain.getService('short-description');

		if (_.isFunction(service)){
			return service(entity);
		} else if (_.isString(service)){
			return entity[service];
		}

		return '';
	};

	self.getLongDescription = function(entity){
		var service = domain.getService('long-description');

		// if it is not a function, then don't bother 
		// providing the ability to decode values
		if (!_.isFunction(service)){
			if (!service) 
				return q.fcall(_.constant('<h1>'+self.getShortDescription(entity)+'</h1>'));

			return q.fcall(_.constant(entity[service]));
		}

		var codedFields = _.chain(fields)
			.pluck('fields')
			.map(function(o){ return _.pairs(o); })
			.flatten(true)
			.map(function(pair){
				return _.extend({}, {name: pair[0]}, pair[1]);
			})
			.filter(function(field){
				return field.type == 'lookup';
			})
			.value();

		var loadCodePromises = codedFields
			.map(function(field){
				return getCodes(field);
			});

		return q.all(loadCodePromises)
			.then(function(results){
				var codeLookups = _.zip(codedFields, results);
				var self = {
					getDescription: function(fieldName, value){
						value = value || entity[fieldName];

						var codeLookup = _.find(codeLookups, function(pair){
								return pair[0].name == fieldName;
							});

						var code = _.find(codeLookup[1], function(code){
								return code.value == value;
							});

						return code ? code.description : 'invalid value';
					},
				};

				return service.call(self, entity);
			});
	};
}

module.exports = DescriptionManager;
