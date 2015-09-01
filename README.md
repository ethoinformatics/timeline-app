timeline-app
============


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
