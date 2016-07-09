angular.module('popup')
.directive('dragEffects', function() {
  return {
    restrict: 'A',
    scope: true,
    link: function($scope, elem, attr) {

      // when dragging starts, set the text data to the stitch id
      elem.bind('dragstart', function(ev) {
        ev.originalEvent.dataTransfer.setData("Text", ev.target.id);
      });

      // when hovering over somewhere that can dropped to, change the cursor icon
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

      // when dropping, behavior depends on the drop target
      //   - create a yarn if a stitch is dropped on a stitch (default)
      //   - add to thread if a stitch is dropped on a thread
      elem.bind('drop', function (ev) {
        ev.preventDefault();
        ev.stopPropagation();
        if ($(event.target).hasClass("droptarget")) {
          if ($(event.target).hasClass("isthread")) {
            var threadId = ev.target.id.slice(7);
            var stitchId = ev.originalEvent.dataTransfer.getData("Text").slice(7);
            $scope.addStitchById(stitchId, threadId);
          } else {
            var fromId = ev.originalEvent.dataTransfer.getData("Text").slice(7);
            var toId = ev.target.id.slice(7);
            $scope.createYarn(fromId, toId);
          }
        }
      });
    }
  }
});