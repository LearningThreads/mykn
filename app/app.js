"use strict"

var app = angular.module('popup', [
  'popup.services',
  'popup.controllers'
]);

// Check out http://www.slideshare.net/benlau/making-chrome-extension-with-angularjs for help

app.run(function($rootScope) {
  // Initialization
  $rootScope.data = localStorage.data;
  $rootScope.watch("data", function(val) {
    // If the "data" field is changed, save to localStorage
    localStorage.data = val;
  });
});

