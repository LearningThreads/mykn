window.learning_threads = (function () {

  // The learning threads library uses IIFE to make the library
  // accessible to scripts that need to use it's functionality.
  //
  // This particular version of the library uses TAFFY as a client-side
  // java-script database. A future implementation may use a
  // different client-side database or may integrate with a service
  // to a server-side database.
  //
  // The library is encapsulated from any saving or loading of the
  // database itself.  It is responsible however for rebuilding the
  // database after loading and prepping the database for saving. This
  // functionality may go away if an integration with a server-side
  // database is implemented
  //

  // Node ("stitch") template
  var nodeTemplate = {
    title: "",
    description: "",
    url: "",
    favIconUrl: "",
    type: "",
    rating: "",
    tags: []
  };

  // Edge ("yarn") template
  var edgeTemplate = {
    to: "",
    from: "",
    type: ""
  };

  // Graph ("thread) template
  var graphTemplate = {
    title: "",
    description: "",
    rating: "",
    nodes: [],
    edges: []
  };

  // Apply node mapping. When an object (edge or graph) contains an
  // array of node ids, that array may need to be remapped when the database
  // is reconstructed on the fly.
  function applyNodeMapping(nodeIds, map) {
    for (var s=0; s<nodeIds.length; s++) {
      var newId = map.newIds[map.origIds.indexOf(nodeIds[s])];
      if (newId === undefined) throw new Error('Your database has been corrupted.');
      nodeIds[s] = newId;
    }
    return nodeIds;
  }

  // Create collection and an ID map. Because we're reconstructing
  // the database, we'll have to keep track of a mapping between the
  // old ___id values and the new ___id values.
  function createCollectionAndIdMap(data, name, template) {
    // Get the original IDs for the mapping
    var origIds = [];
    for (var o=0; o<data.length; o++) {
      origIds.push(data[o].___id);
    }

    // Create the collection with TAFFY
    var collection = TAFFY(data);
    collection.collection_name = name;

    // Define a template for the nodes
    collection.settings().template = template;

    // Get the new IDs for the ID mapping
    var newIds = [];
    var new_data = collection().get();
    for (var i=0; i<new_data.length; i++) {
      newIds[i] = new_data[i].___id;
    }

    // Define the map
    var id_map = {
      origIds:origIds,
      newIds:newIds
    };

    // Return the collection with the map
    return {
      collection: collection,
      map: id_map
    };
  }

  // Add nodes
  function addNodes(collection, data) {

    // Get the original IDs for the mapping
    var origIds = [];
    var newIds = [];

    // Loop over nodes to be added
    for (var o=0; o<data.length; o++) {
      // Save original ___id for the node
      origIds.push(data[o].___id);

      // Check for duplicate before inserting
      var dup = collection({url:data[o].url}).first();

      if (!dup) {
        // Insert data to the collection
        newIds.push(collection.insert(data[o]).first().___id);
      } else {
        newIds.push(dup.___id);
      }
    }

    // Define the map
    var id_map = {
      origIds:origIds,
      newIds:newIds
    };

    // Return the collection with the map
    return {
      collection: collection,
      map: id_map
    };
  }

  // Create the collection of nodes given an array of nodes data
  // from a previously stored database.
  function createNodeCollection(nodesData) {

    var nodes = createCollectionAndIdMap(nodesData, 'stitches', nodeTemplate);

    return {
      nodes: nodes.collection,
      map: nodes.map
    };
  }

  // Create the collection of edges given an array of edges data
  // from a previously stored database.
  function createEdgeCollection(edgesData, nodes) {
    var edges = createCollectionAndIdMap(edgesData, 'yarns', edgeTemplate);

    return {
      edges: edges.collection,
      map: edges.map
    };
  }

  // Create the collection of graphs given an array of graphs data
  // from a previously stored database. Unravel the appropirate mappings
  // to nodes and edges.
  function createGraphCollection(graphsData, nodes, edges) {

    //var graphs = createCollectionAndIdMap(graphsData, 'threads', graphTemplate);
    // Create this collection with TAFFY
    var graphs = TAFFY();
    graphs.collection_name = "threads";

    // Define a template for the graphs
    graphs.settings().template = graphTemplate;

    // The master graph should include all nodes and edges (just recreate it)
    graphs.insert({
      title:'Master Thread',
      description: 'All resources and connections.',
      nodes: nodes.nodes().select('___id'),
      edges: edges.edges().select('___id')
    });

    if (graphsData !== '') {
      var graphsObj = JSON.parse(graphsData);

      if (typeof graphsData === 'string') {
        for (var k = 0; k < graphsObj.length; k++) {
          graphs.insert(graphsObj[k]);
        }
      }

      // Loop over each graph and fix the mapping of nodes and edges
      graphs().each(function (g, gIdx) {

        if (gIdx === 0) return; // skip the master thread

        // Map node IDs
        var nodeIds = applyNodeMapping(g.nodes, nodes.map);
        graphs(g.___id).update({nodes: nodeIds});

        //// Map edge IDs
        //var edgeIds = g.edges;
        //for (var y=0; y< edgeIds.length; y++) {
        //  edgeIds[y] = edges.map[edgeIds[y]];
        //}
        //graphs(g.___id).update({edges:edgeIds});
      });
    }

    var graph_id_map = {};
    var new_graphs = graphs().get();
    for (i=0; i<graphsData.length; i++) {
      graph_id_map[graphsData[i].___id] = new_graphs.___id;
    }

    return {
      graphs: graphs,
      map: graph_id_map
    };
  }

  function addGraphs(collection, data, nodes, edges) {
    // Get the original IDs for the mapping
    var origIds = [];
    var newIds = [];

    // Loop over nodes to be added
    for (var o=0; o<data.length; o++) {
      // Save original ___id for the node
      origIds.push(data[o].___id);

      // Check for duplicate before inserting
      var dup = collection({title:data[o].title}).first();

      if (!dup) {
        // Insert data to the collection
        data[o].nodes = applyNodeMapping(data[o].nodes, nodes.map);
        newIds.push(collection.insert(data[o]).first().___id);
      } else {
        newIds.push(dup.___id);
      }
    }

    // Define the map
    var id_map = {
      origIds:origIds,
      newIds:newIds
    };

    // Return the collection with the map
    return {
      collection: collection,
      map: id_map
    };

  }

  // Rebuild the database based off of how the database was saved (see prepSave_ltdb)
  function build_ltdb(db) {

    // If the database is undefined, set the initialization data to be empty
    if (db === undefined) {
      db = {
        nodes:[],
        edges: [],
        graphs: ''  // this is set to a string because using stringify below (which may no longer be needed) @todo check it out
      };
    }

    var nodes = createNodeCollection(db.nodes);
    var edges = createEdgeCollection(db.edges, nodes);
    var graphs = createGraphCollection(db.graphs, nodes, edges);

    return {
      nodes: nodes.nodes,
      edges: edges.edges,
      graphs: graphs.graphs
    };
  }

  function prepSave_ltdb() {

    var getNodeData = function getNodeData(nodes) {
      return nodes().get();
    };

    var getEdgeData = function getEdgeData(edges) {
      return edges().get();
    };

    var getGraphData = function getGraphData(graphs) {
      //gs = graphs({title:{'!is':'Master Thread'}}).get();
      // Remove the master graph from the array that gets stored.
      return JSON.stringify(graphs({'title': {'!is': 'Master Thread'}}).get());
    };

    return function (db) {
      return {
        nodes: getNodeData(db.nodes),
        edges: getEdgeData(db.edges),
        graphs: getGraphData(db.graphs)
      };
    };
  }

  // Add data to an existing database
  function addData(db, data) {

    console.log(data);

    var nodes = addNodes(db.nodes, data.nodes);
    //var edges = addEdges(db.edges, data.edges, nodes);
    var edges = [];
    if (typeof data.graphs === 'string') {
      addGraphs(db.graphs, JSON.parse(data.graphs), nodes, edges);
    } else {
      addGraphs(db.graphs, data.graphs, nodes, edges);
    }
  }

  // Prepare a single graph for export
  function prepGraphForExport(db, graphId) {

    var graphData = db.graphs(graphId).first();
    var nodeData = db.nodes(graphData.nodes).get();
    var edgeData = db.nodes(graphData.edges).get();

    return {
      nodes: nodeData,
      edges: edgeData,
      graphs: graphData
    };

  }

  // Learning Threads library
  return  {
    build_ltdb:build_ltdb,
    prepSave_ltdb:prepSave_ltdb,
    addData:addData,
    prepGraphForExport:prepGraphForExport
  };

}());