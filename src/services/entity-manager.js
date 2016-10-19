var PouchDb       = require('pouchdb');
var _             = require('lodash');
var app           = require('app')();
var q             = require('q');
var uuid          = require('uuid');

  //console.log("app!");
  //console.log(app);
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
    
  var _getObject = function(theObject, id) {
    // console.log("_getObject()");
      var result = null;
      if(theObject instanceof Array) {
          for(var i = 0; i < theObject.length; i++) {
              result = _getObject(theObject[i], id);
              if (result) {
                  break;
              }   
          }
      }
      else
      {
          for(var prop in theObject) {
              // console.log(prop + ': ' + theObject[prop]);
              if(prop == '_id' || prop == 'id') {
                  // console.log(prop, theObject[prop], id);
                  if(theObject[prop] == id) {
                      return theObject;
                  }
              }
              if(theObject[prop] instanceof Object || theObject[prop] instanceof Array) {
                  result = _getObject(theObject[prop], id);
                  if (result) {
                      break;
                  }
              }
          }
      }
      return result;
  }
  
  self.retryUntilWritten = function(doc) {
    return db.get(doc._id).then(function (origDoc) {
      doc._rev = origDoc._rev;
      return db.put(doc);
    }).catch(function (err) {
      if (err.status === 409) {
        return self.retryUntilWritten(doc);
      } else { // new doc
        return db.put(doc);
      }
    });
  }

  self.save = function(entity){
    
    console.log("SAVESAVESAVESAVE");
    entity.domainName = entity.domainName || domainName;

    var domain = registry.getDomain(domainName),
      uuidGenerator = domain.getService('uuid-generator');

    entity._id = entity._id || uuidGenerator(entity);

    return self.retryUntilWritten(entity);

    // return q.denodeify(db.put.bind(db, entity))();
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
    console.log('>>>> addToParent');
    var childDomain = registry.getDomain(domainName);

    child.id = child.id || uuid.v4();

    // sorry, cheap hack
    // todo: hide this somewhere
    var parentPropertyName = childDomain.getService('parent-'+parent.domainName);

    console.log('>>>> addToParent');
    console.log('>>>> parent', parent);
    console.log('>>>> child', child);
    console.log('>>>> parentPropertyName', parentPropertyName);
  
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
  
  // returns a promise with the diary, if there is a match
  self.diaryByChildId = function(childId) {
    return new Promise(function(resolve, reject) {
      app.getEntities().then(function(entities) {
        var match = _.find(entities, function(_entity) {
          var result = _getObject(_entity, childId);
          return result != null;
        });
        
        resolve(match);
      });
    });
  };
  
  self.getDiary = function(entity){
    if(!app) {
      app = require('app')();
    }
    return new Promise(function(resolve, reject) {
      var id = entity._id || entity.id;
      if( entity.geo && entity.geo.footprint ) {
        resolve(entity);
        // return entity.geo.footprint;
      } else {
        self.diaryByChildId(id).then(function(diary) {        
          resolve(diary);
        });       
      }

    });
    
    //console.log("getGeo");
    //console.log(entity);
    // for(var i = 0; i < entities.length; i++) {
    //  var entity = entities[i];
    //  console.log(entity);
    // }
    


    // var arr = [[41.3839, -73.9405]]; // Garrison
    // if( arr.length > 1 ) return { "type": "LineString", "coordinates": arr };
    // else return { "type": "Point", "coordinates": arr[0] };
  };
}

module.exports = CrudManager;
