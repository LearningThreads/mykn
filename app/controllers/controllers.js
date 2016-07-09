angular.module('popup')
  .controller('MainController', [
    '$scope',
    'build_ltdb',
    'prepSave_ltdb',
    'prepGraphForExport',
    'forceLayout',
    function($scope,build_ltdb,prepSave_ltdb,prepGraphForExport,forceLayout) {

      // Local variables
      var masterThreadName = "Master Thread";

      // --- Local helper functions --- //
      function isEmpty(str) {
        return (!str || 0 === str.length);
      }

      function replaceInvalidChars(str) {
        return str.replace(/[\u00A0-\u2666]/g, function(c) {
          return '&#' + c.charCodeAt(0) + ';';
        });
      }


      // Variables defined on this scope
      $scope.db = undefined;
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
      $scope.getMasterThreadTitle = function() {return masterThreadName;};

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

      $scope.selectThread = function selectThread(thread) {
        $scope.currentThread = thread;
        $scope.currentThreadName = thread.title;
        $scope.setCurrentStitches();
      };

      // Save the database, which is maintained purely client-side
      var saveDB = function saveDB() {
        chrome.storage.local.set({"ltdb":prepSave_ltdb($scope.db)}, function() {});
      };

      var verifyFavIconUrl = function verifyFavIconUrl(favIconUrl) {
        if (!favIconUrl
          || isEmpty(favIconUrl)
          || favIconUrl.includes('chrome://theme')) {
          return '/img/logo/16x16.png';
        } else {
          return favIconUrl;
        }
      };

      $scope.addStitchById = function addStitchById(stitchId, threadId) {

        // Add the stitchId to the right thread
        if (threadId !== undefined) {
          stitchIds = $scope.db.graphs(threadId).first().nodes;
          if (stitchIds.indexOf(stitchId) == -1) {
            stitchIds.push(stitchId);
            $scope.db.graphs(threadId).update({nodes:stitchIds});
          }
        }
        //$scope.setCurrentStitches();

        saveDB();

      };

      $scope.addStitchObj = function addStitchObj(stitch, threadId) {

        var stitchId;

        // Look in the database to see if this is a unique stitch
        var dupStitch = $scope.db.nodes({url:stitch.url}).first();

        if (!dupStitch) {
          // Insert the stitch
          stitchId = $scope.db.nodes.insert({
            title: stitch.title,
            url: stitch.url,
            favIconUrl: verifyFavIconUrl('chrome://favicon/size/16@1x/' + stitch.url)
          }).first().___id;
        } else {
          stitchId = dupStitch.___id;
        }

        // Always add the stitch to the Master Thread
        var stitchIds = $scope.db.graphs({title:masterThreadName}).first().nodes;
        if (stitchIds.indexOf(stitchId) == -1) {
          stitchIds.push(stitchId);
          $scope.db.graphs({name:masterThreadName}).update({nodes:stitchIds});
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

      };

      // Add a stitch to the desired thread
      // (will just add to the master thread if threadId not defined)
      $scope.addStitch = function addStitch(threadId) {

        var stitchId;

        // Look in the database to see if this is a unique stitch
        var dupStitch = $scope.db.nodes({url:$scope.currentTab.url}).first();

        if (!dupStitch) {
          // Insert the stitch
          stitchId = $scope.db.nodes.insert({
            title: $scope.currentTab.title,
            url: $scope.currentTab.url,
            favIconUrl: verifyFavIconUrl($scope.currentTab.favIconUrl)
          }).first().___id;
        } else {
          stitchId = dupStitch.___id;
        }

        // Always add the stitch to the Master Thread
        var stitchIds = $scope.db.graphs({title:masterThreadName}).first().nodes;
        if (stitchIds.indexOf(stitchId) == -1) {
          stitchIds.push(stitchId);
          $scope.db.graphs({name:masterThreadName}).update({nodes:stitchIds});
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

      // Remove a stitch from the current thread
      // (right now it won't allow you to remove it from the master thread)
      $scope.removeStitch = function removeStitch(threadId, stitchId) {

        // get the thread
        var thisThread = $scope.db.graphs(threadId).first();

        // if master thread, just return without doing anything
        // else, find the stitchId and remove it from the array
        if (thisThread.title != masterThreadName) {
          var stitches = thisThread.nodes;
          var index = stitches.indexOf(stitchId);
          if (index > -1) {
            stitches.splice(index, 1);
          }

          // update the array of stitches, save the database and reset scope variables
          $scope.db.graphs(threadId).update({nodes: stitches});

          // @todo is there a way to watch for an update and trigger these actions?
          saveDB();
          $scope.currentThread = $scope.db.graphs(threadId).first();
          $scope.currentThreadName = $scope.currentThread.title;
          $scope.setCurrentStitches();
        }

      };

      // Delete a thread
      $scope.removeThread = function removeThread(threadId) {

        // get the thread
        var thisThread = $scope.db.graphs(threadId).first();

        // if master thread, just return without doing anything
        if (thisThread.title != masterThreadName) {
          $scope.db.graphs(threadId).remove();
          saveDB();

          // reset the current thread to the master thread
          $scope.currentThread = $scope.db.graphs({title:masterThreadName}).first();
          $scope.currentThreadName = $scope.currentThread.title;
          $scope.setCurrentStitches();

        }

      };



      // Export a thread to file
      $scope.exportGraph = function exportGraph(threadId) {
        var data = prepGraphForExport($scope.db, threadId);
        var title = $scope.db.graphs(threadId).first().title;
        var str = JSON.stringify(data);
        str = replaceInvalidChars(str);
        var url = 'data:application/json;base64,' + btoa(str);
        chrome.downloads.download({
          url: url,
          filename: title + '.json',
          saveAs: true
        })
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
      $scope.createYarn = function createYarn(fromStitchId, toStitchId, threadId) {

        var yarnId;

        // Look in the database to see if this is a unique yarn
        var dupYarn = $scope.db.edges({
            from:fromStitchId,
            to:toStitchId
          }).first() || $scope.db.edges({
            from:toStitchId,
            to:fromStitchId
          }).first();

        if (!dupYarn) {
          // Insert the yarn: for a sequential link it makes more sense from the user's
          // perspective to drag in the link that will follow the drop target.
          yarnId = $scope.db.edges.insert({
            from: toStitchId,
            to: fromStitchId,
            type: 'sequential'  // the only type allowed right now
          }).first().___id;
        } else {
          yarnId = dupYarn.___id;
        }

        // Always add the yarn to the Master Thread
        var yarnIds = $scope.db.graphs({title:masterThreadName}).first().edges;
        if (yarnIds.indexOf(yarnId) == -1) {
          yarnIds.push(yarnId);
          $scope.db.graphs({name:masterThreadName}).update({edges:yarnIds});
        }

        // ***
        // For now lets say that all yarns are implicitly included
        // in a graph if the two stitches are in the graph. This could
        // change in the future.
        // ***

        //// If threadId defined, add the yarnId to the right thread
        //if (threadId !== undefined) {
        //  yarnIds = $scope.db.graphs(threadId).first().edges;
        //  if (yarnIds.indexOf(yarnId) == -1) {
        //    yarnIds.push(yarnId);
        //    $scope.db.graphs(threadId).update({edges:yarnIds});
        //  }
        //}

        // Save the database whenever a yarn is added to the "popup copy"
        // This could probably be implemented a lot differently (i.e. better)
        saveDB();
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

      $scope.viewGraph = function viewGraph(threadId) {
        chrome.windows.create({
          url: 'graphViz.html',
          type: 'panel',
          width: 640,
          height: 480
        });
        //var fL = forceLayout;
        //fL(threadId);
      };

      // Watch the currentThread value to save it to storage when it changes. This enables us to
      // set the currentThread when the popup is re-opened.
      $scope.$watch("currentThread", function() {
        if ($scope.currentThread !== undefined) {
          chrome.storage.local.set({"currentThreadName": $scope.currentThread.title}, function () {
          });
        }
      });

      // Print out the bookmarks
      // Traverse the bookmark tree, and print the folder and nodes.
      $scope.printBookmarks = function dumpBookmarks() {
        chrome.bookmarks.getTree(
          function(bookmarkTreeNodes) {
            dumpTreeNodes(bookmarkTreeNodes);
            $scope.$apply(function() {
              saveDB();
            })
          });
      };

      function dumpTreeNodes(bookmarkNodes) {
        var i;
        for (i = 0; i < bookmarkNodes.length; i++) {
          dumpNode(bookmarkNodes[i]);
        }
      }

      function dumpNode(bookmarkNode) {
        if (bookmarkNode.children && bookmarkNode.children.length > 0) {
          // This is a directory, so recursively call
          dumpTreeNodes(bookmarkNode.children);
        } else {
          // Use the title and url to add a stitch
          $scope.addStitchObj(bookmarkNode);
        }
      }
    }
  ]);