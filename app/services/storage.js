angular.module('popup', [])

  .service('Storage', ['$rootScope', function($rootScope) {

    return {
    };
  }])

  // Service to (re-)build the database (depends on taffy.js functions being available)
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

      var node_id_map={};
      var new_nodes = nodes().get();
      for (var i=0; i<nodesData.length; i++) {
        node_id_map[nodesData[i].___id] = new_nodes[i].___id;
      }

      return {
        nodes: nodes,
        map: node_id_map
      };
    };

    // Create Edges Collection
    //  - insert edge records based on edgesData
    //  - nodes
    var createEdgeCollection = function createEdgeCollection(edgesData, nodes) {

      // Create the collection with TAFFY
      var edges = TAFFY(edgesData);
      edges.collection_name = "yarns";

      // Define a template for the edges
      edges.settings().template = {
        to: "",
        from: "",
        type: ""
      };

      var edge_id_map = {};
      var new_edges = edges().get();
      for (i=0; i<edgesData.length; i++) {
        edge_id_map[edgesData[i].___id] = new_edges[i].___id;
      }

      return {
        edges: edges,
        map: edge_id_map
      }
    };

    // Create Graph Collection
    var createGraphCollection = function createGraphCollection(graphsData, nodes, edges) {

      console.log('The graph data being loaded is:');
      console.log(graphsData);
      console.log('The node map is:');
      console.log(nodes.map);

      // Create this collection with TAFFY
      var graphs = TAFFY();
      graphs.collection_name = "threads";

      // Define a template for the graphs
      graphs.settings().template = {
        title: "",
        description: "",
        rating: "",
        nodes: [],
        edges: []
      };

      // The master graph should include all nodes and edges (just recreate it)
      graphs.insert({
        title:'Master Thread',
        description: 'All resources and connections.',
        nodes: nodes.nodes().select('___id'),
        edges: edges.edges().select('___id')
      });

      if (typeof graphsData === 'string') {
        console.log('Hey! I am about to parse!');
        graphs.insert(JSON.parse(graphsData));
      }

      console.log('The inserted graph data is:');
      console.log(graphs().get());

      // Loop over each graph and fix the mapping of nodes and edges
      graphs().each(function (g,gIdx) {

        if (gIdx===0) return; // skip the master thread

        // Map node IDs
        var nodeIds = g.nodes;
        for (var s=0; s<nodeIds.length; s++) {
          nodeIds[s] = nodes.map[nodeIds[s]];
        }
        graphs(g.___id).update({nodes:nodeIds});

        // Map edge IDs
        var edgeIds = g.edges;
        for (var y=0; y< edgeIds.length; y++) {
          edgeIds[y] = edges.map[edgeIds[y]];
        }
        graphs(g.___id).update({edges:edgeIds});
      });

      console.log('After mapping, the graph data is:');
      console.log(graphs().get());

      var graph_id_map = {};
      var new_graphs = graphs().get();
      for (i=0; i<graphsData.length; i++) {
        graph_id_map[graphsData[i].___id] = new_graphs.___id;
      }

      return {
        graphs: graphs,
        map: graph_id_map
      };

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

      console.log('The db being loaded is:');
      console.log(db);

      var nodes = createNodeCollection(db.nodes);
      var edges = createEdgeCollection(db.edges, nodes);
      var graphs = createGraphCollection(db.graphs, nodes, edges);

      return {
        nodes: nodes.nodes,
        edges: edges.edges,
        graphs: graphs.graphs
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
      gs = graphs({title:{'!is':'Master Thread'}}).get();
      console.log('Prepping the data to save.');
      console.log('The graphs are currently:');
      console.log(gs);
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