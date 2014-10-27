var PouchDb = require('pouchdb'),
	ezuuid = require('ezuuid'),
	_ = require('lodash'),
	q = require('q');

var db = new PouchDb('activities');

module.exports.saveActivity = function(activity){
	activity._id = activity._id || ezuuid();
	return q.denodeify(db.put.bind(db, activity))();
};

module.exports.getActivityById = function(id){
	return q.denodeify(db.allDocs.bind(db, {include_docs:true, key: id}))()
		.then(function(result){
			return result.rows[0].doc;
		});
};

module.exports.getActivities = function(){
	return q.denodeify(db.allDocs.bind(db, {include_docs: true, descending: true}))()
		.then(function(result){
			return _.pluck(result.rows, 'doc');
		});
};

module.exports.upload = function(url){
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
