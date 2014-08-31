sample-ui-browserify
====================

This sample uses browserify to organize the code in to modules and vash for client side rendering of templates.

##Installation
To get started you'll first need to install node: http://nodejs.org/

Now to install the dependencies go to the `sample-ui-browserify` directory and run the command below.

```
npm install
```

##Building the code

Now that we have all our dependencies installed, we are ready to build our bundles.
```
npm start
```

You can now open up public/index.html and use the UI.  Also, you may have noticed that the process never ended after running `npm start`.  This is because the process is monitoring the files for changes and will rebuild if any changes are detected.  This helps to eliminate the hassle of the build step.

##Adding new dependencies
npm is a pretty okay tool that makes adding new dependencies easy most of the time.  For example, if we want to start using d3 we would just run `npm install d3 --save` and in our js modules we can do the following:
```js
var d3 = require('d3');
```
