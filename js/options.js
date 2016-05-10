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




