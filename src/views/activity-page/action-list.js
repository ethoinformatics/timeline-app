var angular = require('angular'),
	$ = require('jquery'),
	q = require('q'),
	d = q.defer(),
	EventEmitter = require('events').EventEmitter,
	loaded = false,
	eventEmitter = new EventEmitter();

angular.module('mySuperApp', ['ionic'])
	.run(['$ionicActionSheet', function($ionicActionSheet) {

		console.log('hello');

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
		d.resolve($ionicActionSheet);

}]);


var id = 0;

module.exports = function(activityId){
	loaded = true;
	var $el = $('<div></div>').attr('id', 'my-div-div'+id++);
	$('body').append($el);
	angular.bootstrap($el[0], ['mySuperApp']);

	return d.promise
		.then(function($ionicActionSheet){

//			return hideSheet;
		});
};

