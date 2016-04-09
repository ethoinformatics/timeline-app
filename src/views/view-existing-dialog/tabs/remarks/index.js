var insertAtCaret = require('insert-at-caret'),
	tmpl = require('./index.vash'),
	$ = require('jquery'),
	moment = require('moment');


function Remarks(){
	var self = this,
		_entity;

	self.$element = $(tmpl({}));
	self.label = 'Remarks';

	var $remarks = self.$element.find('textarea');
		
	$remarks.css('height', (window.innerHeight-(88+49))+'px'); //sorry

	self.$element.find('.js-timestamp').click(function(){
		insertAtCaret($remarks[0], moment().format(' HH:mm '));	
	});

	self.setContext = function(ctx){
		_entity = ctx.entity;
	};

	self.loseFocus = function(){
		_entity.remarks = self.$element.find('textarea').val();
		// _doSave()
		// 	.then(function(){
		// 		_update(true);
		// 	})
		// 	.catch(function(err){
		// 		console.error(err);
		// 	});
	};
}

module.exports = Remarks;
