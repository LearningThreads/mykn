// You'll usually only ever have to create one service instance.
var service = analytics.getService('mykn');

// Ask the user if they would like to opt-out
service.getConfig().addCallback(
  /** @param {!analytics.Config} config */
  function(config) {
    //var permitted = myApp.askUser('Allow anonymous usage tracking?');
    var permitted = true;
    config.setTrackingPermitted(permitted);
    // If "permitted" is false the library will automatically stop
    // sending information to Google Analytics and will persist this
    // behavior automatically.
  });

// You can create as many trackers as you want. Each tracker has its own state
// independent of other tracker instances.
var tracker = service.getTracker('UA-70594003-2');  // Supply your GA Tracking ID.

// Report when the popup is loaded
tracker.sendAppView('Loaded');

