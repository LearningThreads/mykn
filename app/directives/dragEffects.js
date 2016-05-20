angular.module('popup')
.directive('dragEffects', function() {
  return {
    restrict: 'A',
    scope: true,
    link: function($scope, elem, attr) {
      elem.bind('dragstart', function(ev) {
        ev.originalEvent.dataTransfer.setData("Text", ev.target.id);
      });
      elem.bind('dragover', function (ev) {
        if ($(event.target).hasClass('droptarget')) {
          ev.preventDefault();
          ev.originalEvent.dataTransfer.dropEffect = 'link';
        }
      });
      //elem.bind('dragenter', function (e) {
      //  e.stopPropagation();
      //  e.preventDefault();
      //  $scope.$apply(function () {
      //    $scope.divClass = 'on-drag-enter';
      //  });
      //});
      //elem.bind('dragleave', function (e) {
      //  e.stopPropagation();
      //  e.preventDefault();
      //  $scope.$apply(function () {
      //    $scope.divClass = '';
      //  });
      //});
      elem.bind('drop', function (ev) {
        ev.preventDefault();
        ev.stopPropagation();
        if ($(event.target).hasClass("droptarget")) {
          var fromId = ev.originalEvent.dataTransfer.getData("Text").slice(7);
          var toId = ev.target.id.slice(7);
          $scope.createYarn(fromId, toId);
        }
      });
    }
  }
});