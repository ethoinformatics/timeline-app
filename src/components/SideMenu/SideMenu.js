import $ from 'jquery';
import util from 'util';
import { EventEmitter } from 'events';
import velocity from 'velocity-animate';

import template from './SideMenu.pug';
// import deviceSettings from '../../device-settings';

// Require styles
// import styles from './index.less'; // eslint-disable-line no-unused-vars

function SideMenu(args) {
  EventEmitter.call(this);

  let isOpen = false;
  const $content = $(args.content);
  const $mask = $('.mask'); // Todo: Don't grab this from DOM.

  this.$element = $(template({})); // username: ''
  const $showLeftMenu = $('.js-show-left-menu');

  function updateMenu() {
    // Toggle flag.
    isOpen = !isOpen;

    console.log('Update menu: >>>>', isOpen);

    // Apply styles based on new state.
    // Animate menu position
    const windowWidth = $(window).width().toString();
    const contentOffset = parseInt(windowWidth, 10);

    velocity($content, { left: isOpen ? contentOffset : '0' }, {
      duration: 140.0,
      complete: () => {}
    });

    // Change menu icon.
    if (isOpen) {
      $showLeftMenu.removeClass('ion-navicon');
      $showLeftMenu.addClass('ion-close');
      $showLeftMenu.css('left', '-60px');
    } else {
      $showLeftMenu.addClass('ion-navicon');
      $showLeftMenu.removeClass('ion-close');
      $showLeftMenu.css('left', '0px');
    }

    // Not sure what this is atm.
    if (isOpen === true) {
      $mask.fadeIn(140);
    } else {
      $mask.fadeOut(140);
    }
  }

  this.displayUser = () => {
    /* deviceSettings()
    .then((settings) => {
      if (settings.user) {
        $('#left-title').text(settings.settings);
      }
    }); */
  };

  this.displayUser();

  this.$element.on('click', '.js-upload', () => {
    this.emit('click', 'sync');
  });

  this.$element.on('click', '.js-code-manager', () => {
    this.emit('click', 'code-manager');
  });

  this.$element.on('click', '.js-settings', () => {
    this.emit('click', 'settings');
  });

  this.$element.on('click', '.js-geolocation-viewer', () => {
    this.emit('click', 'geolocation-viewer');
  });

  // Public close function.
  // noop if menu is not open.
  this.close = () => {
    if (!isOpen) return;
    updateMenu();
  };

  // Simple event handler.
  $showLeftMenu.click((ev) => {
    console.log('Show menu menu: >>>>', isOpen);
    ev.stopPropagation();
    updateMenu();
  });

  return this;
}

util.inherits(SideMenu, EventEmitter);
module.exports = SideMenu;
