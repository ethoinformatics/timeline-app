require('./index.less');

var $ = require('jquery'),
  velocity = require('velocity-animate'),
  Hammer = require('hammerjs'),
  _ = require('lodash'),
  EditExistingForm = require('edit-existing-form'),
  tmpl = require('./index.vash'),
  inlineChildTmpl = require('./inline-child.vash'),
  PopupButtons = require('popup-buttons'),
  scrollTmpl = require('./scroll.vash'),
  Scroll = require('iscroll');

var CreateSelectMenu = require('../../../create-select-dialog');

var EventEmitter = require('events').EventEmitter;
var util = require('util');


function _createChildCollectionData(parentDomain, childDomains){
  console.log('_createChildCollectionData');
  console.log(parentDomain, childDomains);
  var lookup = _.chain(childDomains)
    .map(function(d){
      // sorry, cheap hack todo: hide this somewhere
      var parentPropertyName = d.getService('parent-'+parentDomain.name);

      return {
        collectionName: parentPropertyName,
        domain: d,
      };
    })
    .groupBy(function(d){return d.collectionName;})
    .value();

  return _.keys(lookup)
    .map(function(collectionName){
      return {
        collectionName: collectionName,
        domainNames:_.map(lookup[collectionName], function(d){return d.domain.name;}).join(','),
      };
    });
}

// this allows us to get child, grandchild, great-grandchild and so on for any entity 
function _findRecursiveByName(entity, name, results) {
  if(!results) results = [];
  
  for(var k in entity) {
    var v = entity[k];
    if(k == name) {
      for(var i = 0; i < v.length; i++) {
        results.push(v[i]);
      }
    }
    if(typeof v == 'object') {
      _findRecursiveByName(v, name, results);
    }
  }
  
  return results;
}



function EditTab(opts, listViewReference){

  console.log('Edittab');
  console.log(opts);
  EventEmitter.call(this);

  var self = this, editForm;
  var _context; 
  self.label = 'Data';
  self.$element = $(scrollTmpl({}));
  var rootEntity = opts.rootEntity || opts.entity;

  self.listViewReference = listViewReference;


  self.setContext = function(ctx){
    _context = ctx;
    
    console.log('EditTab _context');
    console.log(_context);
    if(_context.entity.subjectId) {
      console.log('_context.entity.subjectId');     
      console.log(_context.entity.subjectId);     
    }

  
    editForm = new EditExistingForm({entity: ctx.entity});
    // Do not use updateFields() because it probably will not yet have the data.
    // Plus, you don't need it anyway (at this point).
    // updateFields() gets the data FROM the form and uses it to 
    // update the entity.     
    // editForm.updateFields();
    
    if(_context.entity.subjectId) {
      console.log('_context.entity.subjectId');     
      console.log(_context.entity.subjectId);     
    } else {
      console.log('_context.entity.subjectId not set');           
    }


    var childDomains = ctx.domain.getChildren();

    var inlineChildDomains = childDomains.filter(function(d){return d.inline;});
    var inlineChildren = _createChildCollectionData(ctx.domain, inlineChildDomains);

    var standardChildDomains = childDomains.filter(function(d){return !d.inline;});
    var standardChildren = _createChildCollectionData(ctx.domain, standardChildDomains);
    console.log("ctx", ctx);
    standardChildren.forEach(function(item){

      // var results = _findRecursiveByName(ctx.entity, item.collectionName);
      // console.log('RECURSIVE RESULTS');
      // console.log(results);
      
        

        // item.entities = (ctx.entity[item.collectionName] || [])
      item.entities = _findRecursiveByName(ctx.entity, item.collectionName)
          .map(function(child){
            // TODO: Use description manager
            var title = child.name;
            if(!_.isString(title) || title.length == 0) {
              title = child.title;
            }
            if(!_.isString(title) || title.length == 0) {
              title = child.subjectId;
            }
            if(!_.isString(title) || title.length == 0) {
              title = child.location;
            }
            if(!_.isString(title) || title.length == 0) {
              title = child._id || child.id;
            }


            return {
              _id: child._id || child.id,
              domainLabel: child.domainName,
              entityLabel: ctx.getShortDescription(child),
              truncatedName: title // ctx.descManager.getLongDescription(child)// child.name || child.title || child._id
            };
          });

          // so the header know whether or not it has a triangle  
          item.collectionHeaderData = {
            collectionHeaderName: item.collectionName,
            triangleDisplay: (item.entities < 1) ? 'none' : 'inline-block',
            triangleOpacity: (item.entities < 1) ? '0.2' : '1.0',
            itemCount: item.entities.length,
          };
          
      });

    self.$element
      .find('.scroller')
      .empty()
      .append(tmpl({
        childData: inlineChildren,
        standardChildren: standardChildren,
        label: ctx.domain.label,
      }));
      
    self.$element
      .find('.iScrollVerticalScrollbar').remove();

    self.$element
      .find('.edit-form')
      .empty()
      .append(editForm.$element);

    self.$element
      .css('width', window.innerWidth)
      .css('height', window.innerHeight-(96+44));

    self.$element
      .find('.float-right')
      .css('float', 'right');





      
    // give the browser a chance to reflow the new elements
    setTimeout(function() {
      var scroll = new Scroll(self.$element[0], {
          mouseWheel: true,
          scrollbars: true,
          tap:true
        });
    
        console.log(scroll);        
    },100);

    function _doSave(){
      console.log("_doSave in tab -- this is empty!");
      // var rootDomain = app.getDomain(rootEntity.domainName),
      //  rootEntityManager = rootDomain.getService('entity-manager');
      //
      //  console.log("DO SAVE");
      //
      // return rootEntityManager.save(rootEntity)
      //  .then(function(info){
      //    rootEntity._id = info.id;
      //    rootEntity._rev = info.rev;
      //
      //    return info;
      //  });
    }
    function _collapseChildren(collectionName){
      var $accordians = self.$element.find('.js-collection-'+ collectionName);

      var $icons = $accordians.find('i.js-expand-icon');
      var $itemContainers = $accordians.find('.item-container');

      $itemContainers.find('.js-expand-toggle').data('collapsed', true);
      velocity($itemContainers.find('.js-fields'), 'slideUp', {duration: 300});
      $icons.removeClass('ion-arrow-down-b').addClass('ion-arrow-right-b');
    }

    function _addInlineChild(collectionName, domainName){

      _collapseChildren(collectionName);
      var domain = _.find(childDomains, function(d){return d.name == domainName;}),
        $containerLi = $('<li></li>')
        .addClass('item')
        .addClass('item-container')
        //.addClass('header')
        .append(inlineChildTmpl({domainLabel: domain.label || domain.name}));

      var childForm = new EditExistingForm({entity: {domainName: domain.name}});
      childForm.$element.addClass('js-fields');
      $containerLi.append(childForm.$element);
    
      var $ul = self.$element.find('.js-collection-'+ collectionName);
      $ul.closest('ul')
        .append($containerLi);

      var $header = $containerLi.find('.js-expand-toggle');

      var headerHammer = new Hammer($header[0]);
      headerHammer.on('press', function(ev){
        headerHammer.on('pressup', function(){
          setTimeout(function(){
            popupButtons.opened();
          }, 10);
        });

        var popupButtons = new PopupButtons({
          items: [{ value: 'remove', label: 'Remove', 'class': 'button-assertive'}],
        });

        popupButtons.on('click', function(key){
          if (key == 'remove')
            velocity($header.closest('.item-container'), 'fadeOut', {duration:400});

          popupButtons.remove();
        });

        popupButtons.show(ev.pointers[0], true);
      });

      headerHammer
        .on('tap', function(){
          var DURATION = 200;
          var $this = $header,
            $icon = $this.find('i'),
            $accordian = $this.closest('.accordian');

          var $allIcons = $accordian.find('i.js-expand-icon').not($icon);
          var $allItemContainers = $accordian
            .find('.item-container')
            .not($containerLi);

          $allItemContainers.find('.js-expand-toggle').data('collapsed', true);
          velocity($allItemContainers.find('.js-fields'), 'slideUp', {duration: DURATION});
          $allIcons.removeClass('ion-arrow-down-b').addClass('ion-arrow-right-b');

          var isCollapsed = $this.data('collapsed');
          if (isCollapsed) {
            velocity(childForm.$element, 'slideDown', {duration: DURATION});
            $icon.addClass('ion-arrow-down-b').removeClass('ion-arrow-right-b');
          } else {
            velocity(childForm.$element, 'slideUp', {duration: DURATION});
            $icon.removeClass('ion-arrow-down-b').addClass('ion-arrow-right-b');
          }

          $this.data('collapsed', !isCollapsed);
        });

      setTimeout(function(){
        
        var scroll = new Scroll(self.$element[0], {
            mouseWheel: true,
            scrollbars: true,
            tap:true
          });
        scroll.refresh();
      }, 100);
    }
    
    var $btnAddChild = self.$element.find('.js-child-add');

    console.log("$btnAddChild");
    console.log($btnAddChild);


    // This adds a drop down to any add (+) button
    self.$element.find('.js-child-add').each(function( index ){
      
      $(this).on('click', function(ev){

        var $this = $(this),
          collectionName = $this.data('collection'),
          domainNames = $this.data('domains').split(','),
          domains = childDomains.filter(function(d){return _.contains(domainNames, d.name);});


        var popupButtons = new PopupButtons({
          items: domains.map(function(d){ return {value: d.name, label: d.label};}),
        });

        popupButtons.on('click', function(domainName){
          //_addInlineChild(collectionName, domainName);
          // var descMgr = domain.getService('description-manager');
          // var title = 'Add a child to ' + descMgr.getShortDescription(entity);

          console.log('@@@ popupButtons click(domainName):', domainName);
          
          
          var m = new CreateSelectMenu({
            title: domainName,
            domains: domains.filter(function(d){return !d.inline;}),
            //crumbs: _.chain(crumbs).clone().push({label: 'Add child'}).value(),
          });

          console.log('@@@ create select menu: ', m);

          m.on('created', function(child){
            console.log('@@@ created callback: ', child);
            // This seems to never get called
            var childDomain = app.getDomain(child.domainName),
              entityManager = childDomain.getService('entity-manager');

            //console.log('created child');
            //console.log(_context. entity, entityManager);
            //console.log(child);
            console.log('@@@ child domain:', childDomain);
            console.log('@@@ entityManager:', entityManager);
            entityManager.addToParent(_context.entity, child);
            self.saveAndReloadDiary();          
          });




          m.show(ev);

          // popupButtons.remove(); !!!!! THIS CALL IS CRAZY!
        });

        popupButtons.show(ev);
      });

    });



    self.$element.find('.js-inline-add').on('click', function(ev){
        var $this = $(this),
          collectionName = $this.data('collection'),
          domainNames = $this.data('domains').split(','),
          domains = childDomains.filter(function(d){return _.contains(domainNames, d.name);});


        var popupButtons = new PopupButtons({
          items: domains.map(function(d){ return {value: d.name, label: d.label};}),
        });

        popupButtons.on('click', function(domainName){
          _addInlineChild(collectionName, domainName);
          popupButtons.remove();
        });

        popupButtons.show(ev);
    });

  };

  
  self.saveAndReloadDiary = function(){
    console.log('saveAndReloadDiary');
    var rootDomain = app.getDomain(rootEntity.domainName),
      rootEntityManager = rootDomain.getService('entity-manager');
      rootEntityManager.save(rootEntity) // was diary
        .then(function(info){
          console.log("Save success");
          // diary._id = info.id;
          // diary._rev = info.rev;
          self.listViewReference.itemReload("diary", info.id);
          return info;
        }).catch(function(err) {
          console.error(err);
        });   
  };


  self.$element.on('tap', '.js-child-link', function(){
    var $this = $(this),
      collectionName = $this.data('collection'),
      _id = $this.data('id');

    var child = _.find(_context.entity[collectionName], function(c){
      return (c._id || c.id) == _id;
    });
    self.loseFocus();
    _context.descend(child);
  });

  
  // triangle / accordian controls
  console.log('make toggleTriangle');
  // self.$element.on('tap', '.item.item-divider.header', function(){
  //
  //  $( this ).nextAll().toggle();
  //  if( $( this ).next().is(":visible") ) {
  //    $( this ).find('.tri0').addClass('toggleTriangle');
  //  }else{
  //    $( this ).find('.tri0').removeClass('toggleTriangle');
  //  }
  //
  // });
  
  
  self.addTriangleHandlers = function(){
    console.log('addTriangleHandlers');
//    self.$element.off('touchstart', '.item.item-divider.header');
//    var tapCount = 0;
//    self.$element.on('touchstart', '.item.item-divider.header', function(e){
//        // if(tapCount > 0){
//        //  tapCount = 0;
//        //  return false;
//        // }
//      // e.preventDefault();
//      //     e.stopImmediatePropagation();
//
//      console.log('tap me?');
//      console.log(this);
//      $( this ).nextAll().toggle();
//      if( $( this ).next().is(":visible") ) {
//        $( this ).find('.tri0').addClass('toggleTriangle');
//      }else{
//        $( this ).find('.tri0').removeClass('toggleTriangle');
//      }
// //     tapCount++;
//    });
    
    
    self.$element.find('.item.item-divider.header').each(function( index ){

      console.log('make touch');
      $(this).off('touchstart');
      $(this).off('touchstart').on('touchstart', function(e){
        // e.preventDefault();
        //     e.stopImmediatePropagation();

        $( this ).nextAll().toggle();
        if( $( this ).next().is(":visible") ) {
          $( this ).find('.tri0').addClass('toggleTriangle');
        }else{
          $( this ).find('.tri0').removeClass('toggleTriangle');
        }

        if(e.handled !== true) // This will prevent event triggering more then once
            {
                //alert('Clicked');
                e.handled = true;
            }
      });
    });
  };
  
  
  self.toggleAccordian = function(){
    $( this ).nextAll().toggle();
    if( $( this ).next().is(":visible") ) {
      $( this ).find('.tri0').addClass('toggleTriangle');
    }else{
      $( this ).find('.tri0').removeClass('toggleTriangle');
    }
  };

  self.loseFocus = function(){
    console.log("loseFocus");
    console.log("Root entity before updateFields:");
    console.log(rootEntity);
    
    // This gets the data FROM the form and uses it to 
    // update the entity. Bad name! 
    editForm.updateFields();
    
    var rootDomain = app.getDomain(rootEntity.domainName),
      rootEntityManager = rootDomain.getService('entity-manager');

      console.log("DO SAVE");
      console.log("Root entity:");
      console.log(rootEntity);

      // rootEntityManager.getDiary(rootEntity).then(function(diary) {
      rootEntityManager.save(rootEntity) // was diary
        .then(function(info){
          console.log("Save success");
          // diary._id = info.id;
          // diary._rev = info.rev;
          return info;
        }).catch(function(err) {
          console.error(err);
        });     
      // });
  
    
//rootEntity    //
    // _doSave().then(function(){
    //    _update(true);
    //  }).catch(function(err){
    //    console.error(err);
    //  });
  };

}

util.inherits(EditTab, EventEmitter);
module.exports = EditTab;
