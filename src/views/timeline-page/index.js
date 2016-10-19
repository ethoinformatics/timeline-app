require('./index.less');

var $ = require('jquery'),
  _ = require('lodash'),
  q = require('q'),
  app = require('app')(),
  createTimeline = require('timeline'),
  CreateSelectMenu = require('../create-select-dialog'),
  ViewExistingDialog = require('../view-existing-dialog'),
  //FormDialog = require('form-dialog'),
  //sampleData = require('sample-data'),
  pageTemplate = require('./index.vash');


function _getTopLevelDomains(){
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

function TimelinePage(){
  var self = this;


  var timeline = createTimeline({
  });
  var createSelectMenu = new CreateSelectMenu({
      domains: _getTopLevelDomains(),
    });

  self.$element = $(pageTemplate({}));
  self.$element.find('#timeline-container').append(timeline.element);

  self.render = function(){
    console.log('timeline - render');
    timeline.clear();

    var fetchPromises = app.getDomains('get-start-time')
      .map(function(domain){
        var entityManager = domain.getService('entity-manager');
        return entityManager.getAll();
      });

    return q.all(fetchPromises)
      .then(function(results){
        var entities = _.flatten(results)
          .filter(function(d){ return d.domainName=='diary'; });

        timeline.add(_.sortBy(entities, 'eventDate'));
        
        return entities;
      })
      .done();
  };

  window.addEventListener('orientationchange', function(){
    self.render();
  });


  $('body').on('click','.js-btn-top-level-add', function(ev){
      createSelectMenu.on('created', function(entity){

        var domain = app.getDomain(entity.domainName);
        var entityManager = domain.getService('entity-manager');

        console.log('%%%%%%%%%% Attempting to save from timeline-page: ', entity);
        console.log('%%%%%%%%%% domain is: ', domain);
        console.log('%%%%%%%%%% entityManager is: ', entityManager);

        entityManager.save(entity)
          .then(function(info){
            entity._id = info.id;
            entity._rev = info.rev;

            timeline.add(entity);

            var dialog = new ViewExistingDialog({
              entity: entity,
            });

            dialog.on('removed', function(){
              setTimeout(function(){
                timeline.remove(entity);
              }, 400);
            });
            dialog.show();
          })
          .catch(function(err){
            console.dir(err);
          })
          .finally(function(){
            console.log('ok');
          });
      });

      createSelectMenu.show(ev);
    });

  timeline.on('activity-click', function(d){
    var domain = app.getDomain(d.domainName),
      entityManager = domain.getService('entity-manager');

    var m = new ViewExistingDialog({
      entity: d,
    });

    m.on('removed', function(){
      setTimeout(function(){
        timeline.remove(d);
      }, 400);
    });

    m.on('updated', function(){
      m.hide();
      self.render();

    });
    m.on('save', function(entity){
      entityManager.save(entity)
        .then(function(){

          m.hide();
          timeline.update();
        }).done();
    });

    m.on('delete', function(entity){
      if (!window.confirm('Are you sure?')) return;

      entityManager.remove(entity)
        .then(function(){
          m.hide();
          timeline.remove(entity);
        }).done();
    });

    m.on('closed', function(){
      m.remove();
    });

    m.show();
  });


  self.hide = self.$element.hide.bind(self.$element);
  self.show = function (){
    self.$element.show();
  };

  process.nextTick(function(){
    self.render();
  });
}

module.exports = TimelinePage;
