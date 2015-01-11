var template = require('./index.vash'),
	$ = require('jquery'),
	app = require('app'),
	Modal = require('modal');

function UploadDialog(){
	var self = this,
		$element = $(template({
				url: app.setting('couch-base-url'),
				username: app.setting('couch-username'),
			})),
		modal = new Modal({
				title:'Upload', 
				$content:$element, 
				hideOkay:true
			});

	self.show = function(){
		modal.show();
	};

	$element.find('.js-upload').click(function(){
		var $userName = $element.find('.js-username'),
			$password = $element.find('.js-password'),
			$url = $element.find('.js-url');

		var url = $url.val();
		url = url.replace('//', '//'+$userName.val() + ':' + $password.val() + '@');
		console.dir(url);

		db.upload(url)
			.then(function(){
				window.alert('success');
				modal.hide();
			});

	});
}


module.exports = UploadDialog;
