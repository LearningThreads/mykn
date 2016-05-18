function clearAll() {
  var db = {
    nodes:[],
    edges:[],
    graphs:'[]'
  };
  chrome.storage.local.set({"ltdb":db,"currentThreadName": ""}, function() {
  });
}

// Export the network to a file.  Adopted from Rob W. StackOverflow answer:
// http://stackoverflow.com/questions/23160600/chrome-extension-local-storage-how-to-export
function exportNetwork() {
  chrome.storage.local.get(null, function(obj) {
    // Convert to a string
    var str = JSON.stringify(obj);
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
      console.log(JSON.parse(atob(the_url.slice(header.length))));
    } else {
      console.log('This file is not the correct format');
    }
  };

  reader.readAsDataURL(file);

}

// detect a change in a file input with an id of “the-file-input”
$("#the-file-input").change(function() {
  // will log a FileList object, view gifs below
  importNetwork(this.files[0]);
  //console.log(this.files);
});




