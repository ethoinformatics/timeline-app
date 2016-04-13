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
	Modal = require('modal');

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

		db.replicate.to(_getUrl(), {live:false})
			.on('complete', function(info){
				passwordStore(password);
				if (info.docs_written === 0){
					_showSuccess('No new data to upload.');
				} else if (info.docs_written === 1){
					_showSuccess('Upload complete.  Sent 1 change.');
				} else {
					_showSuccess('Upload complete.  Sent ' + info.docs_written + ' changes.');
				}
			})
			.on('error', function(err){
				_showError('Upload errror: ' + err.message);
			});
	});

	$element.find('.js-download').click(function(){
		var db = new PouchDb(DB_NAME),
			password = $password.val();

		_showWorking('Downloading...');
		db.replicate.from(_getUrl(), {live: false})
			.on('complete', function(info){
				passwordStore(password);
				if (info.docs_written === 0){
					_showSuccess('Already up to date.');
				} else if (info.docs_written === 1){
					_showSuccess('Download complete.  Received 1 change.');
				} else {
					_showSuccess('Download complete.  Received ' + info.docs_written + ' changes.');
				}
			})
			.on('error', function(err){
				_showError('Download errror: ' + err.message);
			});
	});
}

util.inherits(UploadDialog, EventEmitter);
module.exports = UploadDialog;
