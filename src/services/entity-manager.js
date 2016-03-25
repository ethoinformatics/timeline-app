var PouchDb = require('pouchdb'),
	_ = require('lodash'),
	q = require('q');

var DB_NAME = 'new_pp_db';

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

function CrudManager(registry, domainName){
	var db = new PouchDb(DB_NAME),
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

		var domain = registry.getDomain(domainName),
			uuidGenerator = domain.getService('uuid-generator');

		entity._id = entity._id || uuidGenerator(entity);

		return q.denodeify(db.put.bind(db, entity))();
	};

	self.byId = function(id){
		return q.denodeify(db.get.bind(db, id))();
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
		var childDomain = registry.getDomain(domainName);

		child.id = child.id || PouchDb.utils.uuid();

		// sorry, cheap hack
		// todo: hide this somewhere
		var parentPropertyName = childDomain.getService('parent-'+parent.domainName);
	
		parent[parentPropertyName] = _.chain(parent[parentPropertyName])
			.toArray()
			.push(child)
			.value();

		// by default no events in the same collection can have overlapping times
		_.chain(parent[parentPropertyName])
			.toArray()
			.reject(function(c){return c== child;})
			.value()
			.forEach(function(c){
				c.endTime = c.endTime || child.beginTime;
			});

	};
	
	self.getGeo = function(entity){
		//console.log("getGeo");
		//console.log(entity);
		if( entity.geo && entity.geo.footprint ) return entity.geo.footprint;		 
		var arr = [[41.3839, -73.9405]]; // Garrison
		if( arr.length > 1 ) return { "type": "LineString", "coordinates": arr };
		else return { "type": "Point", "coordinates": arr[0] };
	};
}

module.exports = CrudManager;
