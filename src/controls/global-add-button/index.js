var $ = require('jquery');
var _ = require('lodash');
var q = require('q');
var app = require('app')();
var CreateSelectMenu = require('../../views/create-select-dialog');
var ViewExistingDialog = require('../../views/view-existing-dialog');
var tmpl = require('./index.vash');
var EventEmitter = require('events').EventEmitter;
var util = require('util');

// This probably belongs in another module
function _getTopLevelDomains() {
  var domains = app.getDomains()
  .filter(function(domain){
    return !domain.getService('code-domain') && !/^_/.test(domain.name);
  });

  return domains.filter(function(d){
    return !_.any(domains, function(otherDomain){
      return !!_.find(otherDomain.getChildren(), function(d2){
        return d2.name == d.name;
      });
    });
  });
}

// GlobalAddButton constructor
// Inherits from EventEmitter,
function GlobalAddButton() {
  EventEmitter.call(this);
  var self = this;

  // Components
  var createSelectMenu = new CreateSelectMenu({
    domains: _getTopLevelDomains()
  });

  // Create an empty element
  var emptyHTML = tmpl({})
  console.log("element: ", emptyHTML);
  self.$element = $(emptyHTML);

  // Bind to 
  self.$element.on('click', function(ev) {

    // Bind an anonymous function to createSelectMenu
    // Retrieve domainName for entity (e.g. "diary")
    // Retrieve entity manager for the domainName
    createSelectMenu.on('created', function(entity) {
      var domain = app.getDomain(entity.domainName);
      var entityManager = domain.getService('entity-manager');

      // Forward event with new entity
      self.emit('created', entity);

      entityManager.save(entity)
      .then(function(info) {

        console.log("Entity manager save:", entity);

        entity._id = info.id;
        entity._rev = info.rev;

        var dialog = new ViewExistingDialog({
          entity: entity,
        });

        dialog.show();
      })
      .catch(function(err) {
        console.error(err);
      });

    });

      createSelectMenu.show(ev);
    });
}

util.inherits(GlobalAddButton, EventEmitter);
module.exports = GlobalAddButton;
