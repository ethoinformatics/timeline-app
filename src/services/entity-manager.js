var PouchDb = require('pouchdb'),
	_ = require('lodash'),
	q = require('q');

PouchDb.plugin(require('pouchdb-upsert'));

function createDesignDoc(name, mapFunction) {
  var ddoc = {
    _id: '_design/' + name,
    views: {
    }
  };
  ddoc.views[name] = { map: mapFunction.toString() };
  return ddoc;
}

function CrudManager(domainName){
	var databaseName = 'hello',
		db = new PouchDb(databaseName),
		self = this;

	function createView(name, map){
		var designDoc = createDesignDoc(name, map);
		return db.putIfNotExists(designDoc);
	}

	var views = [
			['domain_name_index', function(d){return emit(d.domainName);}],
		];

	var viewsLoadedPromise = q.all(views.map(function(pair){ 
			return createView(pair[0], pair[1]); 
		}))
		.then(function(){
			return q.all(views.map(function(pair){
				return db.query(pair[0], {stale: 'update_after'});
			}));
		});

	self.save = function(entity){
		entity.domainName = entity.domainName || domainName;

		var app = require('app')(),
			domain = app.getDomain(domainName),
			uuidGenerator = domain.getService('uuid-generator');

		entity._id = entity._id || uuidGenerator(entity);

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
		return viewsLoadedPromise
			.then(function(){
				return q(db.query('domain_name_index', {key: domainName, include_docs:true}))
					.then(function(result){
						return _.map(result.rows, 'doc');
					});
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
