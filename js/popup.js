
// *** Turning off Google Analytics tracking *** //

// var service, tracker;
//
// function mykn_initialize() {
//   // You'll usually only ever have to create one service instance.
//   var service = analytics.getService('mykn');
//
//   // Ask the user if they would like to opt-out
//   service.getConfig().addCallback(mykn_analytics_config);
//
//   // You can create as many trackers as you want. Each tracker has its own state
//   // independent of other tracker instances.
//   tracker = service.getTracker('UA-70594003-2');  // Supply your GA Tracking ID.
//
//   // Report when the popup is loaded
//   tracker.sendAppView('Loaded');
//
//   // Add node listeners
//   //addStitchListeners();
//
// }
//
// function mykn_analytics_config(config) {
//
//   // Grab the checkbox
//   var checkboxTracking = document.getElementById('analyticsPermission');
//   checkboxTracking.checked = config.isTrackingPermitted();
//
//   // When the checkbox is changed, set the analytics tracking permission
//   checkboxTracking.onchange = function() {
//     config.setTrackingPermitted(checkboxTracking.checked);
//   };
// }
//
// window.onload = mykn_initialize;
//
// *** ***************************************** *** //

$(document).ready(function(){
  $('[data-toggle="tooltip"]').tooltip();
});

// from http://stackoverflow.com/questions/7394748/whats-the-right-way-to-decode-a-string-that-has-special-html-entities-in-it
function decodeSpecialChars(str) {
  var t = document.createElement("textarea");
  t.innerHTML = str;
  return t.value;
}

// Imports graph data from a file. The file must be encoded properly.
function importNetwork(file) {

  var reader = new FileReader();

  var header = 'data:application/json;base64,';

  reader.onload = function(event) {
    the_url = event.target.result;
    if (the_url.slice(0,header.length) === header) {
      var new_data = JSON.parse(
        decodeSpecialChars(atob(the_url.slice(header.length))));
      var dataToAdd = {};
      if (new_data.ltdb === undefined) {
        dataToAdd = new_data;  // this was a subset, possibly one graph, database export
        dataToAdd.graphs = [dataToAdd.graphs]; // right now we only support one graph
      } else {
        dataToAdd = new_data.ltdb; // this was a complete database export
      }

      // First load the existing database
      chrome.storage.local.get(["ltdb"], function(obj) {
        var db = window.learning_threads.build_ltdb(obj.ltdb);
        window.learning_threads.addData(db, dataToAdd);
        chrome.storage.local.set({
          "ltdb":window.learning_threads.prepSave_ltdb()(db)
        }, function() {
          window.close();
        });
      });

    } else {
      console.log('This file is not the correct format');
    }
  };

  reader.readAsDataURL(file);

}

// detect a change in a file input with an id of “the-file-input”
$("#fileForImport").change(function() {
  importNetwork(this.files[0]);
});




//function addStitchListeners() {
//  document.getElementById('stitches').addEventListener('dragstart', function(ev) {
//    event.dataTransfer.setData("Text", ev.target.id);
//    //var img = new Image();
//    //img.src = 'img/logo/16x16.png';  // @todo maybe a gif works better
//    //ev.dataTransfer.setDragImage(img, 16, 16);
//  });
//
//  //// While dragging, change the cursur to dragging
//  //document.getElementById('stitches').addEventListener("drag", function(event) {
//  //  event.target.style.cursor = 'grabbing';
//  //  //document.getElementById("demo").style.color = "red";
//  //});
//
//  document.getElementById('stitches').addEventListener("dragover", function(event) {
//    if ($(event.target).hasClass("droptarget")) {
//      event.preventDefault();
//      event.dataTransfer.dropEffect = 'link';
//    }
//  });
//
//  document.getElementById('stitches').addEventListener("drop", function(event) {
//    event.preventDefault();
//    if ( $(event.target).hasClass("droptarget") ) {
//      console.log('dropped');
//      //document.getElementById("demo").style.color = "";
//      //event.target.style.border = "";
//      var data = event.dataTransfer.getData("Text");
//      console.log(data);
//      console.log(event.target.id);
//      //event.target.appendChild(document.getElementById(data));
//      //createYarn(data, event.target.id);
//      console.log(window.angular.element($0).scope());
//    }
//  });
//}


