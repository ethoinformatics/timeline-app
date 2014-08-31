var $ = window.$,
	_ = require('lodash');


module.exports = function(metadata, data){
	data = Object(data);

	var $root = $('<div></div')
		.text('i was built by the form builder');

	return {
		getData: function(){
			var formData = {};
			$root
				.find('*[data-name]')
				.each(function(){
					var $this = $(this),
						name = $this.data('name'),
						value = $this.val();

					formData[name] = value;
				});

			return _.extend({}, data, formData);
		},
		$element: $root,
	};
};

