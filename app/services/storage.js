angular.module('popup', [])

  .service('Storage', ['$rootScope', function($rootScope) {

    return {
    };
  }])

  // Service to build the database (depends on taffy.js functions being available)
  .service('build_ltdb', function() {

    // Create Node Collection
    var createNodeCollection = function createNodeCollection(nodesData) {

      // Create the colleciton with TAFFY
      var nodes = TAFFY(nodesData);
      nodes.collection_name = "stitches";

      // Define a template for the nodes
      nodes.settings().template = {
        title: "",
        description: "",
        url: "",
        favIconUrl: "",
        type: "",
        rating: "",
        tags: []
      };

      return nodes;
    };

    // Create Edges Collection
    var createEdgeCollection = function createEdgeCollection(edgesData) {

      // Create the collection with TAFFY
      edges = TAFFY(edgesData);
      edges.collection_name = "yarns";

      // Define a template for the edges
      edges.settings().template = {
        to: "",
        from: "",
        type: ""
      };

      return edges
    };

    // Create Graph Collection
    var createGraphCollection = function createGraphCollection(graphsData) {

      // Create this collection with TAFFY
      var graphs = TAFFY(graphsData);
      graphs.collection_name = "threads";

      // Define a template for the graphs
      graphs.settings().template = {
        title: "",
        description: "",
        rating: "",
        nodes: [],
        edges: []
      };

      return graphs;
    };

    return function(db) {

      // If the database is undefined, set the initialization data to be empty
      if (db == undefined) {
        db = {
          nodes:[],
          edges: [],
          graphs: []
        }
      }

      return {
        nodes: createNodeCollection(db.nodes),
        edges: createEdgeCollection(db.edges),
        graphs: createGraphCollection(db.graphs)
      }
    };

  })

  // Stuffs the taffy database data into simple arrays and removes gook
  .service('prepSave_ltdb', function() {

    var getNodeData = function getNodeData(nodes) {
      return nodes().get();
    };

    var getEdgeData = function getEdgeData(edges) {
      return edges().get();
    };

    var getGraphData = function getGraphData(graphs) {
      return graphs().get();
    };

    return function(db) {
      return {
        nodes:getNodeData(db.nodes),
        edges:getEdgeData(db.edges),
        graphs:getGraphData(db.graphs)
      }
    }

});