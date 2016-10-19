require('./index.less');

var Modal = require('modal');
var geolocation = require('geolocation');
var _ = require('lodash');
var q = require('q');
var $ = require('jquery');
var deviceSettings = require('device-settings');
var formBuilder = require('form-builder');
var geolocation = require('geolocation');
var util = require('util');
var app = require('app')();
var EventEmitter = require('events').EventEmitter;
var template = require('./index.vash');

function getTemplate(){ return template; }

function CreateNewDialog(opt){
  var domain = opt.domain;

  var self = this;
  EventEmitter.call(self);

  var modal, crumbs = [];

  this.setCrumbs = function(myCrumbs){
    crumbs = myCrumbs || [];
  };

  var title =  'Create '+ domain.label;

  var form = formBuilder.buildDataEntryForm(domain);

  var template = getTemplate(domain);
  var $content = $(template({
      isNew: true,
      crumbs: crumbs,
    }));

  $content.find('.js-form').append(form.$element);

  var $btnSave = $content.find('.js-save');

  modal = new Modal({
      title: title,
      $content: $content,
      hideOkay: true,
      backAction: opt.backAction,
    });

  function _handleSave(keepOpen){
    console.log("CreateNewDialog >> _handleSave(keepOpen) >>", keepOpen);
    var now = Date.now();

    var entity = {
      domainName: domain.name,
      beginTime: now,
      endTime: keepOpen ? null : now,
    };

    // Merge form data with entity
    entity = _.extend(entity, form.getData());

    var activityService = domain.getService('activity');
    console.log(">>>> activityService:", activityService);
    if (activityService){
      activityService.start(entity);
    }

    var activityService = domain.getService('activity');
    var eventService = domain.getService('event');
    if (eventService){
      console.log("Creating via event service:", eventService)
      eventService.create(entity);
    }

    return q.all([
        deviceSettings(),
        geolocation.once(),
      ])
      .spread(function(settings, locationData){
        console.log(">>> Save entity result:")
        console.log("settings: ", settings)
        console.log("locationData: ", locationData)
        entity.observerId = settings.user;
        // entity.geo.create = {
//          type: 'Point',
//          coordinates: [
//            locationData.coords.longitude,
//            locationData.coords.latitude,
//            locationData.coords.altitude,
//          ],
//          properties: {
//            timestamp: Date.now(),
//          },
//        };
        return entity;
      });
  }

  function _createButtonClick(keepActivityRunning, ev){
    console.log('gotta click');

    var $this = $(this),
      oldText = $this.text();

      console.log("parent analysis jrc");
      console.log($this);
      
    $this.parent()
      .find('input,button')
      .attr('disabled', 'disabled');

    $this.text('Please wait...');

    ev.preventDefault();
    return _handleSave(keepActivityRunning)
      .then(function(data) {
        console.log("Emitting created: ", data);
        self.emit('created', data);
      })
      .catch(function(err) {
        console.dir('error in CreateNewDialog');
        console.error(err);
      })
      .finally(function() {
        $this.text(oldText);
        $this.parent()
          .find('input,button')
          .removeAttr('disabled');
      });
  }

  $btnSave.click(_.partial(_createButtonClick, true));
  modal.on('closed', function(){
    self.emit('closed');
  });

  this.show = function(){
    modal.show();
  };

  this.hide = function(){
    modal.hide();
  };
  this.remove = function(){
    modal.remove();
  };
  this.zIndex = function(_newZ) {
    modal.modalElement.css('z-index', _newZ);
  };
}


util.inherits(CreateNewDialog, EventEmitter);
module.exports = CreateNewDialog;
