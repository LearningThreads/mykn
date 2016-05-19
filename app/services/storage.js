angular.module('popup', [])

  .service('build_ltdb', ['$window', function($window) {
    return $window.learning_threads.build_ltdb;
  }])

  .service('prepSave_ltdb', ['$window', function($window) {
    return $window.learning_threads.prepSave_ltdb();
  }])

  .service('prepGraphForExport', ['$window', function($window) {
    return $window.learning_threads.prepGraphForExport;
  }]);
