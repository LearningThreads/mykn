
function addStitchListeners() {
  document.getElementById('stitches').addEventListener('dragstart', function(ev) {
    event.dataTransfer.setData("Text", ev.target.id);
    //var img = new Image();
    //img.src = 'img/logo/16x16.png';  // @todo maybe a gif works better
    //ev.dataTransfer.setDragImage(img, 16, 16);
  });

  //// While dragging, change the cursur to dragging
  //document.getElementById('stitches').addEventListener("drag", function(event) {
  //  event.target.style.cursor = 'grabbing';
  //  //document.getElementById("demo").style.color = "red";
  //});

  document.getElementById('stitches').addEventListener("dragover", function(event) {
    if ($(event.target).hasClass("droptarget")) {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'link';
    }
  });

  document.getElementById('stitches').addEventListener("drop", function(event) {
    event.preventDefault();
    if ( $(event.target).hasClass("droptarget") ) {
      console.log('dropped');
      //document.getElementById("demo").style.color = "";
      //event.target.style.border = "";
      var data = event.dataTransfer.getData("Text");
      console.log(data);
      //event.target.appendChild(document.getElementById(data));
    }
  });
}


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

  // Add node listeners
  addStitchListeners();

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






