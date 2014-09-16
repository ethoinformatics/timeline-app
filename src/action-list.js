var angular = require('angular'),
	$ = require('jquery'),
	activityId,
	id = 0,
	EventEmitter = require('events').EventEmitter,
	eventEmitter = new EventEmitter();

angular.module('mySuperApp', ['ionic'])
	.run(['$ionicActionSheet', function($ionicActionSheet) {

		var hideSheet = $ionicActionSheet.show({
			buttons: [
				{ text: 'Edit' },
				{ text: 'Stop' },
			],
			titleText: 'Activity Menu',
			cancelText: 'Cancel',
			destructiveText:'Delete', 
			destructiveButtonClicked: function(){
				eventEmitter.emit('delete-activity', activityId);
				hideSheet();
			},
			buttonClicked: function(index) {
				switch (index){
					case 0:
						eventEmitter.emit('edit-activity', activityId);
						break;

					case 1:
						eventEmitter.emit('stop-activity', activityId);
						break;
				}

				return true;
			}
		});

}]);



module.exports.load = function(){
	return eventEmitter;
};

module.exports.show = function(myActivityId){
	activityId = myActivityId;
	var $el = $('<div></div>')
		.attr('id', 'my-div-div'+id++);
	$('body').append($el);

	angular.bootstrap($el[0], ['mySuperApp']);
};

