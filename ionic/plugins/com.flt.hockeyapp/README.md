hockeyapp-phonegap
==================

This is a simple PhoneGap 3.0+ plugin to integrate with the HockeyApp Android SDK.

See here for more information:
http://support.hockeyapp.net/kb/client-integration-android-other-platforms/hockeyapp-for-android-sdk

Install by pointing phonegap/cordova/plugman at this repository, eg.
```
phonegap plugin add https://github.com/instantiator/hockeyapp-phonegap.git
```

The plugin creates a HockeyApp javascript object that's available to your application after deviceready has fired.

You should initialise HockeyApp when deviceready fires so that it's running from the word go.

To initialise the HockeyApp SDK with your APP_ID, call the init function with 3 parameters:

```
[ APP_ID, CHECK_CRASHES, CHECK_UPDATES ]
```

eg.

```javascript
    HockeyApp.init(
        [ 'YOUR_APP_ID_HERE', true, true ],
        function() { alert('hockeyapp initialised'); },
        function(msg) { alert(msg); });
```

To trigger the feedback activity, call the getFeedback function (this doesn't require parameters) eg.

```javascript
    HockeyApp.getFeedback(
        function() { alert('ok'); },
        function(msg) { alert(msg); });
```
