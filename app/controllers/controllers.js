angular.module('popup')
  .controller('MainController', [
    '$scope',
    'build_ltdb',
    'prepSave_ltdb',
    function($scope,build_ltdb,prepSave_ltdb) {

      // Local variables
      var masterThreadName = "Master Thread";

      // Variables defined on this scope
      $scope.title = "MYKN - My Knowledge Network";
      $scope.companyName = "Learning Threads Corporation";
      $scope.companyShortName = "Learning Threads";
      $scope.currentThread = undefined;
      $scope.currentThreadName = "";
      $scope.currentStitches = [];
      $scope.currentTab = {};
      $scope.newThreadTitle = "";
      $scope.newThreadDescription = "";
      $scope.stitchesExist = false;

      // Set the current tab so we know what to add if a stitch is added
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        $scope.$apply(function(){
          $scope.currentTab = tabs[0];
        });
      });

      // Get the database, which is maintained purely client-side. Right now, because
      // we're just using a popup, the database is re-built whenever the popup is
      // loaded. This is terribly innefficient, but should work for us for initial
      // small-scale testing.
      chrome.storage.local.get(["ltdb", "currentThreadName"], function(obj) {
        $scope.$apply(function() {
          $scope.db = build_ltdb(obj.ltdb);
          $scope.threadsExist = $scope.db.graphs().first() !== undefined;
          var tempName = "";
          if (obj.currentThreadName !== undefined) {
            tempName = obj.currentThreadName;
          }
          if (tempName == "") {
            tempName = masterThreadName;
          }
          $scope.currentThreadName = tempName;
          $scope.currentThread = $scope.db.graphs({'title': tempName}).first();
          $scope.setCurrentStitches();
        });
      });

      // Save the database, which is maintained purely client-side
      var saveDB = function saveDB() {
        chrome.storage.local.set({"ltdb":prepSave_ltdb($scope.db)}, function() {});
      };

      // Add a stitch to the desired thread (master thread if not defined)
      $scope.addStitch = function addStitch(threadId) {

        var stitchId;

        // Look in the database to see if this is a unique stitch
        var dupStitch = $scope.db.nodes({url:$scope.currentTab.url}).first();

        if (!dupStitch) {
          // Insert the stitch
          stitchId = $scope.db.nodes.insert({
            title: $scope.currentTab.title,
            url: $scope.currentTab.url,
            favIconUrl: $scope.currentTab.favIconUrl
          }).first().___id;
        } else {
          stitchId = dupStitch.___id;
        }

        // Always add the stitch to the Master Thread
        var stitchIds = $scope.db.graphs({title:"Master Thread"}).first().nodes;
        if (stitchIds.indexOf(stitchId) == -1) {
          stitchIds.push(stitchId);
          $scope.db.graphs({name:"Master Thread"}).update({nodes:stitchIds});
        }

        // If threadId defined, add the stitchId to the right thread
        if (threadId !== undefined) {
          stitchIds = $scope.db.graphs(threadId).first().nodes;
          if (stitchIds.indexOf(stitchId) == -1) {
            stitchIds.push(stitchId);
            $scope.db.graphs(threadId).update({nodes:stitchIds});
          }
        }
        $scope.setCurrentStitches();

        // Save the database whenever a stitch is added to the "popup copy"
        // This could probably be implemented a lot differently (i.e. better)
        saveDB();
      };

      // Define an array of stitches for the viewer
      $scope.setCurrentStitches = function setCurrentStitches() {
        $scope.currentStitches = $scope.getStitches();
        $scope.stitchesExist = $scope.currentStitches.length > 0;
      };

      // Get an array of stitches based on whichever thread is active.
      // If no thread is active, then just show all of the stitches
      $scope.getStitches = function getStitches() {
        var threadId;
        if (!($scope.currentThread)) {
          threadId = undefined;
        } else if ($scope.currentThread.___id === undefined) {
          threadId = undefined;
        } else {
          threadId = $scope.currentThread.___id;
        }
        if (threadId === undefined) {
          return $scope.db.nodes().get();
        } else {
          var nodeIds = $scope.db.graphs({___id:threadId}).first().nodes;
          var nodeArr = $scope.db.nodes(nodeIds).get();
          if (nodeIds.indexOf(undefined) >= 0) throw new Error('Whoops!');
          return nodeArr;
        }
      };

      // Get the stitch from the database
      $scope.getStitch = function getStitch(id) {
        return $scope.db.nodes(id).get();
      };

      // Add a thread to the database
      $scope.addThread = function() {

        var threadTitle = "A New Thread";
        var threadDescription = "The default thread description for a new thread.";

        if ($scope.newThreadTitle !== undefined) {
          if ($scope.newThreadTitle !== "") {
            threadTitle = $scope.newThreadTitle;
          }
        }

        if ($scope.newThreadDescription !== undefined) {
          if ($scope.newThreadDescription !== "") {
            threadDescription = $scope.newThreadDescription;
          }
        }

        $scope.currentThread = $scope.db.graphs.insert({
          title:threadTitle,
          description:threadDescription
        }).first();
        $scope.setCurrentStitches();
        saveDB();
      };

      // Get an array of threads from the database
      $scope.getThreads = function getThreads() {
        if ($scope.db === undefined) return [];
        return $scope.db.graphs().get();
      };

      // Get the thread from the database
      $scope.getThread = function getThread(id) {
        return $scope.db.graphs(id).get();
      };


      // --- Yarns --- //
      $scope.addYarn = function addYarn(fromStitchId, toStitchId) {
        var yarn = getEmptyYarn();
        yarn.id = $scope.nextID;
        yarn.type = "sequence";
        yarn.fromStitch = fromStitchId;
        yarn.toStitch = toStitchId;
        $scope.yarns.push(yarn);
        chrome.storage.local.set({"yarns":$scope.yarns}, function() {
          setNextID();
        });
      };

      $scope.loadTab = function(url) {
        chrome.tabs.create( {
          url: url
        });
      };

      $scope.showPlans = function() {
        chrome.tabs.create({
          url: 'https://www.learningthreads.co'
        })
      };

      // Watch the currentThread value to save it to storage when it changes. This enables us to
      // set the currentThread when the popup is re-opened.
      $scope.$watch("currentThread", function() {
        if ($scope.currentThread !== undefined) {
          chrome.storage.local.set({"currentThreadName": $scope.currentThread.title}, function () {
          });
        }
      });
    }
  ]);