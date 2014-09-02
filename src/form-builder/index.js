var $ = window.$,
	_ = require('lodash'),
	walker = require('merle');


module.exports = function(metadata, data){
	data = Object(data);

	var $root = $('<ul></ul')

	walker(metadata, function(){
		if (!this.value.type) return;

		var $input = $('<input></input>');
		$input.attr('type', this.value.type);
		$input.attr('data-name', this.name);
		$input.attr('placeholder', this.value.label || this.name);

		$root.append($input);
	});

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

