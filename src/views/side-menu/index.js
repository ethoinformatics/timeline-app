var velocity = require('velocity-animate');
var $ = require('jquery');
var EventEmitter = require('events').EventEmitter;
var template = require('./index.vash');
var deviceSettings = require('device-settings');
var app = require('app')();
  
function SideMenu(opt){
  var $content = $(opt.content);
  var $mask = $('.mask');
  var self = new EventEmitter();

  self.$element = $(template({})); //username:''
  
  self.displayUser = function(){
    deviceSettings()
      .then(function(settings){     
        if( settings['user'] ){
          $('#left-title').text(settings['user']);
      }
    }); 
  }
  self.displayUser(); 

  self.$element.on('click', '.js-upload', function(){
      self.emit('click', 'sync');
    });

  self.$element.on('click', '.js-code-manager', function(){
      self.emit('click', 'code-manager');
    });

  self.$element.on('click', '.js-settings', function(){
      self.emit('click', 'settings');
    });

  self.$element.on('click', '.js-geolocation-viewer', function(){
      self.emit('click', 'geolocation-viewer');
    });

  var $showLeftMenu = $('.js-show-left-menu');
  
  var isOpen = false;

  // Public close function.
  // noop if menu is not open.
  self.close = function(){
    if (!isOpen) return;
    updateMenu();
  };

  // Private close function.
  function updateMenu(){
    // Toggle flag.
    isOpen = !isOpen;

    console.log("Update menu: >>>>", isOpen);
    
    // Apply styles based on new state.
    // Animate menu position
    var contentOffset = parseInt( $( window ).width() ).toString();
    velocity($content, {left: isOpen? contentOffset: '0' }, {
      duration:140,
      complete: function(){}
    });
    
    // Change menu icon.
    if( isOpen ) {
      $showLeftMenu.removeClass('ion-navicon');
      $showLeftMenu.addClass('ion-close');  
      $showLeftMenu.css('left', '-60px');   
    }else{
      $showLeftMenu.addClass('ion-navicon');
      $showLeftMenu.removeClass('ion-close');     
      $showLeftMenu.css('left', '0px');   
    }

    // Not sure what this is atm.
    if(isOpen) {
      $mask.fadeIn(140);
    } else {
      $mask.fadeOut(140);
    }
  }

  // Simple event handler.
  $showLeftMenu.click(function(ev){
    console.log("Show menu menu: >>>>", isOpen);
    ev.stopPropagation();
    updateMenu();
  });

  return self;
}

module.exports = SideMenu;
