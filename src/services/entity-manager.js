var PouchDb = require('pouchdb'),
	ezuuid = require('ezuuid'),
	_ = require('lodash'),
	q = require('q');

function CrudManager(domainName){
	var databaseName = 'hello',
		db = new PouchDb(databaseName),
		self = this;

	self.save = function(entity){
		entity._id = entity._id || ezuuid();
		return q.denodeify(db.put.bind(db, entity))();
	};

	self.byId = function(id){
		return q.denodeify(db.allDocs.bind(db, {include_docs:true, key: id}))()
			.then(function(result){
				return result.rows[0].doc;
			});
	};

	self.remove = function(doc){
		return q.denodeify(db.remove.bind(db, doc, {}))();
	};

	self.getAll = function(){
		return q.denodeify(db.allDocs.bind(db, {include_docs: true, descending: true}))()
			.then(function(result){
				return _.chain(result.rows)
					.pluck('doc')
					.filter(function(row){
						// todo: don't fetch everything
						return row.domainName == domainName;
					})
					.value();
					
			});
	};
	self.addToParent = function(parent, child){

		var app = require('app')(),
			childDomain = app.getDomain(domainName);

		// sorry, cheap hack
		// todo: this isn't a service
		var parentPropertyName = childDomain.getService('parent-'+parent.domainName);
	
		parent[parentPropertyName] = _.chain(parent[parentPropertyName])
			.toArray()
			.push(child)
			.value();
	};
}

module.exports = CrudManager;
