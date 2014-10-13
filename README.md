timeline-app
============

##Developing the app
  1. run `npm install` and then `npm start`
  2. when a js, vash or less file is changed, the project will be built to the `ionic/www` directory.
  3. start any local/static web server from `ionic/www` then you can view the app with your web-browser.

##Publishing the android app
  1. ensure that nodejs and android dev tools are installed
  2. cd to `timeline-app`.  Increament the version in ionic/config.xml 
  3. run `./build-app.sh`
  4. Now the app is built and can be published to hockey app.
  3. get the hockeyapp token and run `export HOCKEY_TOKEN='the toke here'`
  4. now run `./publish-app.sh`

##Structure of src/
- the entry point for our code is in `src/main.js`.
- `src/main.js` kicks off everything else through require statements and dom-manipulation. 

###Typical directory layout
- Larger UI components are put in to their own directory and have three files(js, less, vash).
  - js is the javascript
  - less is the css
  - vash is the html template
- typically, the js file exports a constructor and instances have a $element property that can be inserted in to the DOM.

###Example widget usage
  ```js
    var Widget = require('widget');
    var widget1 = new Widget();
    $('body').append(widget1.$element);
  ```
