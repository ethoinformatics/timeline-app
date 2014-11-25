require('./index.less');

var $ = require('jquery'),
	_ = require('lodash'),
	template = require('./index.vash'),
	vash = require('vash-runtime'),
	templates = {
		text: require('./text-field.vash'),
		'long-text': require('./long-text-field.vash'),
	};

vash.helpers.field = function(fieldName, field, data){
	var t = templates[field.type] || templates.text;

	return t({
		name: field.name,
		label: field.label || fieldName,
		value: data ? data[field.name] : undefined,
	});
};

module.exports = function(metadata, data){
	data = Object(data);

	console.dir(metadata);
	var $root = $(template({
		tabs: metadata,
	}));

	var $tabButtons = $root.find('.js-tabs *[data-index]');
	var $tabs = $root.find('.js-tab-container *[data-index]');
	$tabButtons.click(function(){
		var $this = $(this);

		$tabButtons.removeClass('active');
		$this.addClass('active');
		$tabs.hide();
		$($tabs[$this.data('index')]).show();
		
	});
	return {
		setData: function(formData){
			$root
				.find('*[data-name]')
				.each(function(){
					var $this = $(this),
						name = $this.data('name'),
						value = formData[name];

						$this.val(value);
				});
		},
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

