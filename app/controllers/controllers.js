angular.module('popup')
  .controller('MainController', ['$scope', function($scope) {
    $scope.title = "MYKN - My Knowledge Network";
    $scope.companyName = "Learning Threads Corporation";

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      var currentTab = tabs[0];
      $scope.$apply(function(){
        $scope.currentTabURL = currentTab.url;
        console.log($scope.currentTabURL);
      });
    });

    $scope.showPlans = function() {
      chrome.tabs.create({
        url: 'https://www.learningthreads.co'
      })
    }
  }])
;
