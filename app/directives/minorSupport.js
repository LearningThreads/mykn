// Load the tooltip (this is required for elements that are dynamically loaded/added)
// (found in answer from Dudi on StackOverflow)
angular.module('popup')
  .directive('tooltipLoader', function() {
    return function(scope, element, attrs) {
      element.tooltip();
    };
  })
  .directive('newThreadModal', function() {
    return {
      restrict: 'A',
      templateUrl: 'html/newThreadModal.html',
      link: function (scope, element, attrs) {

      }
    };
  })
  .directive('verifyModal', function() {
    return {
      restrict: 'A',
      templateUrl: 'html/verifyModal.html',
      link: function (scope, element, attrs) {

      }
    };
  })
  .directive('editStitchModal', function() {
    return {
      restrict: 'A',
      templateUrl: 'html/editStitchModal.html',
      //link: function (scope, element, attrs) {
      //}
    };
  })
  .directive('helpWindowModal', function() {
    return {
      restrict: 'A',
      templateUrl: 'html/helpWindowModal.html',
      link: function (scope, element, attrs) {

      }
    };
  })
  .directive('importPublicLearningThreadModal', function() {
    return {
      restrict: 'A',
      templateUrl: 'html/importPublicLearningThreadModal.html',
      link: function (scope, element, attrs) {

      }
    };
  });
  //.directive('transientScrollbar', ['$document', function($document) {
  //  return {
  //    restrict: 'A',
  //    link: function(scope, element, attrs) {
  //
  //      element.on('scroll', function(){
  //        scope.$apply(function() {
  //          $document.find('::-webkit-scrollbar').css('visibility', 'visible');
  //        })
  //      });
  //    }
  //  }
  //}]);
