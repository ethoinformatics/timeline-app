var HockeyApp = {

    // initialises HockeyApp with args of: [ APP_ID, CHECK_CRASHES, CHECK_UPDATES ]
    init: function(args, successCallback, errorCallback) {
        cordova.exec(
            successCallback,        // success callback function
            errorCallback,          // error callback function
            'HockeyAppPlugin',      // map to java class
            'init',                 // action
            args                    // array of custom arguments
        );
    },

    // triggers the getfeedback activity (NB. HockeyApp must be initialised first!)
    getFeedback: function(successCallback, errorCallback) {
        cordova.exec(
            successCallback,        // success callback function
            errorCallback,          // error callback function
            'HockeyAppPlugin',      // map to java class
            'getFeedback',          // action
            []                      // no arguments
        );
    }
    
}

module.exports = HockeyApp;
