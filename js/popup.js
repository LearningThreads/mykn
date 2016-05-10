
var service, tracker;

function mykn_initialize() {
  // You'll usually only ever have to create one service instance.
  var service = analytics.getService('mykn');

  // Ask the user if they would like to opt-out
  service.getConfig().addCallback(mykn_analytics_config);

  // You can create as many trackers as you want. Each tracker has its own state
  // independent of other tracker instances.
  tracker = service.getTracker('UA-70594003-2');  // Supply your GA Tracking ID.

  // Report when the popup is loaded
  tracker.sendAppView('Loaded');
}

function mykn_analytics_config(config) {

  // Grab the checkbox
  var checkboxTracking = document.getElementById('analyticsPermission');
  checkboxTracking.checked = config.isTrackingPermitted();

  // When the checkbox is changed, set the analytics tracking permission
  checkboxTracking.onchange = function() {
    config.setTrackingPermitted(checkboxTracking.checked);
  };
}

window.onload = mykn_initialize;



