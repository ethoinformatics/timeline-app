require('./index.less');

var DB_NAME = 'new_pp_db';
var PouchDb = require('pouchdb'),
	EventEmitter = require('events').EventEmitter,
	util = require('util'),
	template = require('./index.vash'),
	_ = require('lodash'),
	$ = require('jquery'),
	storage = require('jocal'),
	passwordStore = storage.bind(null, 'etho-pw'),
	app = require('app')(),
	q = require('q'),
	Modal = require('modal'),
	moment = require('moment');

function UploadDialog(){
	EventEmitter.call(this);
	var self = this,
		$element = $(template({
				url: app.setting('couch-base-url'),
				username: app.setting('couch-username'),
				password: passwordStore(),
			})),
		$status = $element.find('.js-status'),
		$userName = $element.find('.js-username'),
		$password = $element.find('.js-password'),
		$url = $element.find('.js-url'),
		modal = new Modal({
				title:'Data sync', 
				$content:$element, 
				hideOkay:true
			});

	modal.on('closed', function(){
		self.emit('closed');
	});

	self.zIndex = function( _newZ ){ 
		modal.modalElement.css('z-index', _newZ);
	};
	self.show = function(){
		modal.show();
	};

	function _showMessage(selector, text){
		$status.find('.message')
			.hide()
			.filter(selector)
			.show()
			.find('span')
			.text(text);
	}

	var _showWorking = _.partial(_showMessage, '.js-working'),
		_showSuccess = _.partial(_showMessage, '.js-success'),
		_showError = _.partial(_showMessage, '.js-failure');
		
	function _doSave(entity){
		var rootDomain = app.getDomain(entity.domainName),
			rootEntityManager = rootDomain.getService('entity-manager');


			return new Promise(function(resolve, reject) {
				rootEntityManager.save(entity)
					.then(function(info){
						console.log("_doSave response");
						console.log(info);
						console.log(entity);
						entity._id = info.id;
						entity._rev = info.rev;

						resolve(info);
					})
				});
	}

	function _getTopLevelDomains(){
		// get all domains except "code-domain" and those that start with an underscore
		var domains = app.getDomains()
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
	}

	function _getEntities(){
		// get all the entities from the entity-manager service:
		return _.chain(_getTopLevelDomains())
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

	function _getUrl(){
		var url = $url.val();
		url = url.replace('//', '//'+$userName.val() + ':' + $password.val() + '@');
		console.dir(url);

		return url;
	}

	$element.find('.js-upload').click(function(){
		var db = new PouchDb(DB_NAME),
			password = $password.val();
		_showWorking('Uploading...');

		console.log("getting entities");
		_getEntities()
			.then(function(entities){
				console.log("entities", entities);
				Promise.all(entities.map(function(entity) {
					console.log(entity);
					
					var cachedGeo = null;
					if(window.geo) {
						var key = moment(entity.eventDate).format('YYYYMMDD');
						console.log('key',key);
						
						console.log('window.geo', window.geo);
						console.log('window.localStorage', window.localStorage);
						
						if(window.geo[key]) {
							cachedGeo = window.geo[key];
						} else {
							var fromStorage = window.localStorage.getItem(key);
							if(fromStorage) {
								geo = JSON.parse(fromStorage);
							}
						}
					}
	
					if(cachedGeo) {
						console.log("updating diary geo from cache");
						entity.geo = cachedGeo;
						return _doSave(entity);
					} else {
						return Promise.resolve(null);
					}
				})).then(function(saveResponses) {
					console.log("all saved!");
					
					console.log("replicating");
				// TODO: Uncomment this
				db.replicate.to(_getUrl(), {live:false})
					.on('complete', function(info){
						if(_.isArray(info.errors) && info.errors.length > 0) {
							_showError(_.map(info.errors, 'message').join(', '));
						} else {
							passwordStore(password);
							if (info.docs_written === 0){
								_showSuccess('No new data to upload.');
							} else if (info.docs_written === 1){
								_showSuccess('Upload complete.  Sent 1 change.');
							} else {
								_showSuccess('Upload complete.  Sent ' + info.docs_written + ' changes.');
							}
						}
					})
					.on('error', function(err){
						_showError('Upload errror: ' + err.message);
					});
				});
			});

		
	});

	$element.find('.js-download').click(function(){
		var db = new PouchDb(DB_NAME),
			password = $password.val();

		_showWorking('Downloading...');
		db.replicate.from(_getUrl(), {live: false})
			.on('complete', function(info){
				if(_.isArray(info.errors) && info.errors.length > 0) {
					_showError(_.map(info.errors, 'message').join(', '));
				} else {
					passwordStore(password);					
					if (info.docs_written === 0){
						_showSuccess('Already up to date.');
					} else if (info.docs_written === 1){
						_showSuccess('Download complete.  Received 1 change.');
					} else {
						_showSuccess('Download complete.  Received ' + info.docs_written + ' changes.');
					}					
				}

			})
			.on('error', function(err){
				_showError('Download errror: ' + err.message);
			});
	});
}

util.inherits(UploadDialog, EventEmitter);
module.exports = UploadDialog;
