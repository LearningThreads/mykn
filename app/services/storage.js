angular.module('popup', [])

  // Service to (re-)build the database (depends on taffy.js functions being available)
  // Stuffs the taffy database data into simple arrays and removes gook

  .service('build_ltdb', ['$window', function($window) {

    return function(db) {

      // If the database is undefined, set the initialization data to be empty
      if (db == undefined) {
        db = {
          nodes:[],
          edges: [],
          graphs: ''  // this is set to a string because using stringify below (which may no longer be needed) @todo check it out
        }
      }

      var nodes = $window.learning_threads.createNodeCollection(db.nodes);
      var edges = $window.learning_threads.createEdgeCollection(db.edges, nodes);
      var graphs = $window.learning_threads.createGraphCollection(db.graphs, nodes, edges);

      return {
        nodes: nodes.nodes,
        edges: edges.edges,
        graphs: graphs.graphs
      }
    };

  }])
  .service('prepSave_ltdb', function() {

    var getNodeData = function getNodeData(nodes) {
      return nodes().get();
    };

    var getEdgeData = function getEdgeData(edges) {
      return edges().get();
    };

    var getGraphData = function getGraphData(graphs) {
      //gs = graphs({title:{'!is':'Master Thread'}}).get();
      // Remove the master graph from the array that gets stored.
      return JSON.stringify(graphs({'title':{'!is':'Master Thread'}}).get());
    };

    return function(db) {
      return {
        nodes:getNodeData(db.nodes),
        edges:getEdgeData(db.edges),
        graphs:getGraphData(db.graphs)
      }
    }

  });