var EditExistingForm = require('edit-existing-form');
var tmpl = require('./index.vash');

function EditTab(){
	var self = this, editForm;

	self.$element = tmpl({});

	self.show = function(entity){
		editForm = new EditExistingForm({entity: entity});
		editForm.updateFields();

		self.$element.find('.tab-edit')
			.empty()
			.append(editForm.$element);
	};

}

module.exports = EditTab;
