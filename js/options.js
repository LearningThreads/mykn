function clearAll() {
  var db = {
    nodes:[],
    edges:[],
    graphs:'[]'
  };
  chrome.storage.local.set({"ltdb":db,"currentThreadName": ""}, function() {
  });
}

function replaceInvalidChars(str) {
  return str.replace(/[\u00A0-\u2666]/g, function(c) {
    return '&#' + c.charCodeAt(0) + ';';
  });
}

// from http://stackoverflow.com/questions/7394748/whats-the-right-way-to-decode-a-string-that-has-special-html-entities-in-it
function decodeSpecialChars(str) {
  var t = document.createElement("textarea");
  t.innerHTML = str;
  return t.value;
}

// Export the network to a file.  Adopted from Rob W. StackOverflow answer:
// http://stackoverflow.com/questions/23160600/chrome-extension-local-storage-how-to-export
function exportNetwork() {
  chrome.storage.local.get(null, function(obj) {
    // Convert to a string
    var str = JSON.stringify(obj);
    str = replaceInvalidChars(str);
    var url = 'data:application/json;base64,' + btoa(str);
    chrome.downloads.download({
      url: url,
      filename: 'mykn_network.json',
      saveAs: true
    });
  });
}

// Add listeners
document.getElementById('clearAll').addEventListener('click', clearAll);
document.getElementById('exportNetwork').addEventListener('click', exportNetwork);

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
        }, function() {});
      });

    } else {
      console.log('This file is not the correct format');
    }
  };

  reader.readAsDataURL(file);

}

// detect a change in a file input with an id of “the-file-input”
$("#the-file-input").change(function() {
  importNetwork(this.files[0]);
});




