// http://stackoverflow.com/questions/21792565/how-to-open-a-mailto-link-from-a-chrome-extension

function sendEmail(emailAddress) {
  var emailUrl = "mailto:" + emailAddress;
  chrome.tabs.create({ url: emailUrl }, function(tab) {
    setTimeOut(function() {
      chrome.tabs.remove(tab.id);
    }, 500);
  });
}