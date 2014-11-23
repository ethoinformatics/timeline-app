var PouchDb = require('pouchdb'),
	ezuuid = require('ezuuid'),
	_ = require('lodash'),
	q = require('q');

function CrudManager(domainName){
	var db = new PouchDb(domainName),
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
				return _.pluck(result.rows, 'doc');
			});
	};

	self.upload = function(url){
		var d = q.defer();
		var opts = {live: false};

		db.replicate.to(url, opts, function(err, result){
			if (err) d.reject(err);
			d.resolve(result);
			//window.alert('oops');
			console.error(err);
		});

		return d.promise;
	};

	self.download = function(url){
		var d = q.defer();
		var opts = {live: false};

		db.replicate.from(url, opts, function(err, result){
			if (err) d.reject(err);
			d.resolve(result);
			//window.alert('oops');
			console.error(err);
		});

		return d.promise;
	};
}

module.exports = CrudManager;
