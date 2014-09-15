var $ = require('jquery'),
	_ = require('lodash'),
	walker = require('merle'),
	templates = {
		text: require('./text-field.vash'),
	};


module.exports = function(metadata, data){
	data = Object(data);

	var $root = $('<ul></ul')
		.addClass('list');

	walker(metadata, function(){
		if (!this.value.type) return;

		// just use text for everything at the moment
		var model = Object.create(this.value);
		model.name = this.name;
		model.label = model.label || model.name;
		model.value = data[model.name];

		var $input = templates.text(model);
			
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

