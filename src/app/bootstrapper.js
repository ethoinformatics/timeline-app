/**
 * ethoinfo-framework/src/main.js
 *
 * Sets up DOM on app launch
 * Creates menus, list views, etc, and appends them to DOM for launch state
 *
 */

// Libs
import $ from 'jquery';
import fastclick from 'fastclick';

// Components
import SideMenu from '../components/SideMenu/SideMenu';

// import GlobalAddButton from './controls/global-add-button/';
// import UploadDialog from './views/upload-dialog/';
// import CodeManager from './views/code-manager/';
// import Settings from './views/settings/';
// import GeolocationViewer from './views/geolocation-viewer/';
// import SideMenu from './views/side-menu/';
// import ListView from './views/list-view/';

import ready from '../dom-ready';

import mainTemplate from './app.pug';
import './app.less';

// import locationWatch from './activity-location-watch';


// require('../node_modules/leaflet/dist/leaflet.css');

// Unknown functionality?
// function keepAppAlive(){
//  if (typeof cordova == 'undefined') return;

//  try {
//    cordova.plugins.backgroundMode.setDefaults({
//      title: 'Ethoinformatics',
//      text:'The app is in background mode.',
//      ticker:'Ethoinformatics is still running.',
//    });
//    cordova.plugins.backgroundMode.enable();
//  } catch (e){
//  }
// }

const bootstrapper = {};

bootstrapper.bootstrap = () => {
  ready(() => {
    // Get reference to page body element
    const $body = $('body');

    // Render main container template
    const mainHTML = mainTemplate({});
    const $mainContainer = $(mainHTML);

    // Append main app container to page body
    $body.append($mainContainer);

    // Offset main container height by height of navbar.
    // Todo: This should be moved to CSS
    $mainContainer.css('height', window.innerHeight - 44.0);

    // Polyfill to remove click delays on browsers with touch UIs.
    fastclick.attach(document.body);

    // Reference to container DOM element.
    // const $content = $mainContainer.find('#main-content');

    // Render component templates
    const sideMenu = new SideMenu({ content: $mainContainer });
    // const uploadDialog = new UploadDialog();
    // const codeManager = new CodeManager();
    // const settings = new Settings();
    // const listView = new ListView();
    // const addButton = new GlobalAddButton();
    // const geolocationViewer = new GeolocationViewer();

    // Append components to document body
    // Todo: Cleanup the view hierarchy
    $body.append(sideMenu.$element);

    // Append add button to menu
    // $body.find('.js-menu').append(addButton.$element);

    // $content.append(listView.$element);

    // Setup listeners

    // When "created" event is emitted by addButton, refresh listView
    // addButton.on('created', () => {
    //  listView.refresh();
    // });

    // When a users clicks an item in the sideMenu:
    /* sideMenu.on('click', (moduleName) => {
      // Close sideMenu
      sideMenu.close();

      // ???
      listView.restoreExistingDialog();

      // Todo: Refactor this imperative code.
      switch (moduleName) {
        case 'code-manager':
          codeManager.zIndex(10000); // Bring codeManager to front?
          codeManager.show(); // Show
          break;
        case 'sync':
          uploadDialog.zIndex(10000);
          uploadDialog.show();
          break;
        case 'settings':
          settings.zIndex(10000);
          settings.show();
          break;
        case 'geolocation-viewer':
          geolocationViewer.zIndex(10000);
          geolocationViewer.show();
          break;
        default:
          break;
      }
    });*/

    // When upload dialog is closed
    // Currently a noop
    // uploadDialog.on('closed', () => {
      // activityPage.render();
    // });

    // Close side menu when main area is clicked
    // $content.click(() => {
      // sideMenu.close();
    // });

    // locationWatch(); // ?
    // keepAppAlive();
  });
};

module.exports = bootstrapper;
