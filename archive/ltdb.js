
'use strict';

// taffyjs used for collections
var TAFFY = require('./taffy.js').taffy;

// collections used by this database (only 1 collection of each type is allowed)
var
  nodeCollection=[],
  edgeCollection=[],
  graphCollection=[];

// Create Node Collection
var createNodeCollection = function createNodeCollection() {

  // Create the colleciton with TAFFY
  var nodes = TAFFY();
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
var createEdgeCollection = function createEdgeCollection() {

  // Create the collection with TAFFY
  var edges = TAFFY();
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
// There can be various types of graphs, each needing its own collection
var createGraphCollection = function createGraphCollection() {

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

  return graphs;
};

// Creates the database
var createDB = function createDB() {
  this.nodes = createNodeCollection();
  this.edges = createEdgeCollection();
  this.graphs = createGraphCollection();
};

var SaltWater = {
  createDB: createDB,
  nodes: nodeCollection,
  edges: edgeCollection,
  graphs: graphCollection
};

module.exports = SaltWater;