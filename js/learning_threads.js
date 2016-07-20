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

  var masterTitle = "Master Thread";

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

  // Apply ID mapping. When objects contain arrays of ids, that array
  // may need to be remapped when the database is reconstructed
  // on the fly.
  function applyIdMapping(ids, map) {
    for (var s=0; s<ids.length; s++) {
      var newId = map.newIds[map.origIds.indexOf(ids[s])];
      if (newId === undefined) throw new Error('Your database has been corrupted.');
      ids[s] = newId;
    }
    return ids;
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

    // Loop over each edge and remap the to and from nodes
    edges.collection().each(function(edge,idx) {

      // Map the to node
      edges.collection(edge.___id).update({
        to: applyIdMapping([edge.to], nodes.map)[0]});

      // Map the from node
      edges.collection(edge.___id).update({
        from: applyIdMapping([edge.from], nodes.map)[0]});
    });

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
        var nodeIds = applyIdMapping(g.nodes, nodes.map);
        graphs(g.___id).update({nodes: nodeIds});

        // Map edge IDs
        var edgeIds = applyIdMapping(g.edges, edges.map);
        graphs(g.___id).update({edges: edgeIds});

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

  function addEdges(collection, data, nodes) {
    // Get the original IDs for the mapping
    var origIds = [];
    var newIds = [];

    // Loop over edges to be added
    for (var o=0; o<data.length; o++) {
      // Save original ___id for the edge
      origIds.push(data[o].___id);

      // Check for duplicate before inserting
      var dup = collection({
          from:data[o].from,
          to:data[o].to
        }).first() || collection({
          from:data[o].to,
          to:data[o].from
        }).first();

      if (!dup) {
        data[o].from = applyIdMapping([data[o].from], nodes.map)[0];
        data[o].to = applyIdMapping([data[o].to], nodes.map)[0];
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

  function addGraphs(collection, data, nodes, edges) {
    // Get the original IDs for the mapping
    var origIds = [];
    var newIds = [];

    // Loop over graphs to be added
    for (var o=0; o<data.length; o++) {
      // Save original ___id for the graph
      origIds.push(data[o].___id);

      // Check for duplicate before inserting
      var dup = collection({title:data[o].title}).first();

      if (!dup) {
        // Insert data to the collection
        data[o].nodes = applyIdMapping(data[o].nodes, nodes.map);
        data[o].edges = applyIdMapping(data[o].edges, edges.map);
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
      return JSON.stringify(graphs({'title': {'!is': masterTitle}}).get());
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

    var nodes = addNodes(db.nodes, data.nodes);
    var edges = addEdges(db.edges, data.edges, nodes);
    if (typeof data.graphs === 'string') {
      addGraphs(db.graphs, JSON.parse(data.graphs), nodes, edges);
    } else {
      addGraphs(db.graphs, data.graphs, nodes, edges);
    }
  }

  // Get all of the edgeIDs of edges that exist in the master database that are
  // inclusive based on an array of node IDs
  function getInclusiveEdges(db, nodeIds) {
    var edgeIDs = [];
    var edges = db.edges().get(); // grab all of the edges (this is just one database call)
    for (var i=0; i<nodeIds.length; i++) {
      for (var j=i+1; j<nodeIds.length; j++) {
        for (var k=0; k<edges.length; k++) {
          var e = edges[k];
          if ((e.from === nodeIds[i] && e.to === nodeIds[j]) ||
            (e.from === nodeIds[j] && e.to === nodeIds[i])) {
            edgeIDs.push(e.___id);
          }
        }
        //var yarn = db.edges({
        //    from:nodeIds[i],
        //    to:nodeIds[j]
        //  }).first() || db.edges({
        //    from:nodeIds[j],
        //    to:nodeIds[i]
        //  }).first();
        //if (yarn) edgeIDs.push(yarn.___id);
      }
    }
    return edgeIDs;
  }


  // Prepare a single graph for export
  function prepGraphForExport(db, graphId) {

    var graphData = db.graphs(graphId).first();
    var nodeData = db.nodes(graphData.nodes).get();
    //var edgeData = db.nodes(graphData.edges).get();

    // Ok, so right now we're not saving the edges per graph, but
    // we still need a way to export the right edges.
    var edgeData = getInclusiveEdges(db, db.graphs({title:masterTitle}).first().nodes);

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
    prepGraphForExport:prepGraphForExport,
    masterTitle:masterTitle,
    getInclusiveEdges:getInclusiveEdges
  };

}());