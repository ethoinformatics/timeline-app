require('./index.less');

var $ = require('jquery'),
  EventEmitter = require('events').EventEmitter,
  _ = require('lodash'),
  util = require('util'),
  template = require('./index.vash'),
  app = require('app')(),
  CreateNewDialog = require('create-new-dialog');

function CreateSelectDialog(opt) {
  var self = this;
  EventEmitter.call(self);
  opt = Object(opt);

  var formDomains = opt.domains || app.getDomains('form-fields');

  var crumbs = opt.crumbs || [];
  
  // Create element
  var html = template({
    activityTypes: formDomains
  })
  var $element = $(html);
  
  var createNewDialog; // ???
  
  // Append element to document body
  $('body').append($element);

  // Find activity button
  var activityButton = $element.find('.js-new-activity');

  // Bind button click to anonymous function that:
  // Reads domain name from the "value" attribute of the button ("observer-activity")
  // Retrieves the domain via app.getDomain(domainName)
  // Shows create dialog for the domain.
  activityButton.on('click', function() {
    var domainName = $(this).val();
    var domain = app.getDomain(domainName);

    _showCreateForm(domain);
  });

  // Shows create form for a specific domain
  function _showCreateForm(domain) {
    createNewDialog = new CreateNewDialog({
      domain: domain,
      backAction: opt.backAction,
    });

    var myCrumbs = _.chain(crumbs)
      .clone()
      .value();

    createNewDialog.setCrumbs(myCrumbs);

    createNewDialog.on('created', function(data) {
      console.log("CreateSelect >>>>> created: ", data)
      createNewDialog.remove();
      self.emit('created', data);
    });

    createNewDialog.on('closed', function() {
      createNewDialog.remove();
    });

    createNewDialog.show();
  }

  function _showMenu(ev) {
    $element
      .css('top', ev.pageY)
      .css('right', window.innerWidth - ev.pageX)
      .show();

    setTimeout(function() {
      $('body').one('click', function() {
        $element.hide();
        self.emit('closed');
      });
    },0);
  }

  // Public methods
  
  // Show dialog
  this.show = function(ev) {
    if (_.size(formDomains) === 1) {
      _showCreateForm(formDomains[0]);
    } else {
      _showMenu(ev);
    }
  };

  // Hide dialog
  this.hide = function() {
    $element.hide();
    if (createNewDialog) createNewDialog.hide();
  };

  // Remove dialog?
  this.remove = function() {
    $element.remove();
    if (createNewDialog) createNewDialog.remove();
  };
}

util.inherits(CreateSelectDialog, EventEmitter);
module.exports = CreateSelectDialog;
