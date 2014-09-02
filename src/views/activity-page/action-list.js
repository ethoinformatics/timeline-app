var angular = require('angular'),
	EventEmitter = require('events').EventEmitter,
	loaded = false,
	eventEmitter = new EventEmitter(),
	$ = window.$;

angular.module('mySuperApp', ['ionic'])
	.controller('umm', function($scope, $ionicActionSheet, $timeout) {

	$scope.show = function(activityId) {
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
	};
});

module.exports.load = function(){
	if (loaded) return eventEmitter;
	loaded = true;

	angular.bootstrap($('#list-container'), ['mySuperApp']);

	return eventEmitter;
};

