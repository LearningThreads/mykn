// Tests for the learning threads JavaScript library.

var lt = window.learning_threads;

// Uses the chai.js TDD-style assertion library
var assert = chai.assert;

var masterThreadTitle = 'Master Thread';

describe('Learing Threads Library API Tests', function() {

  // ***  Set up test fixtures ***
  var dbDataEmpty, dbDataFull, numberOfNodes, numberOfEdges;

  beforeEach(function() {

    // Empty data set
    dbDataEmpty = {
      nodes: [],
      edges: [],
      graphs: ''
    };

    // Full data set
    // @todo There is something peculiar here; if this variable is just set once, the values of the ___id values get modified... what is TAFFYDB doing under the hood? See if this could explain other future issues
    // @todo Think about converting ___id values to id values when saving --> This will cause incompatibility issues
    dbDataFull = {
      nodes: [
        {title: "Stitch 1", ___id: "s1"},
        {title: "Stitch 2", ___id: "s2"}
      ],
      edges: [
        {to: "s1", from:"s2", ___id: "e1"}
      ],
      graphs: ''
    };

    numberOfNodes = dbDataFull.nodes.length;
    numberOfEdges = dbDataFull.edges.length;
  });

  describe('masterTitle', function() {
    it('should be appropriately descriptive', function(done) {
      assert.equal(lt.masterTitle,masterThreadTitle,'The master thread name has changed in the library');
      done();
    });
  });

  // The build_ltdb allows the user data to be instantiated
  // locally as a client-side taffydb database.
  describe('build_ltdb', function() {

    it('should gracefully handle an empty set of data', function(done) {
      var db = lt.build_ltdb(dbDataEmpty);

      assert.isTrue(db.nodes.TAFFY, 'nodes should be a TAFFY db collection');
      assert.isTrue(db.edges.TAFFY, 'edges should be a TAFFY db collection');
      assert.isTrue(db.graphs.TAFFY, 'graphs should be a TAFFY db collection');
      done();
    });

    it('should build the master thread from all of the nodes', function(done) {
      var db = lt.build_ltdb(dbDataFull);

      assert.equal(db.graphs({title:masterThreadTitle}).get().length, 1);
      assert.equal(db.graphs({title:masterThreadTitle}).first().nodes.length, numberOfNodes);
      done();

    })

  });

  describe('prepSave_ltdb', function() {

    var db,dbData;

    before(function() {
      db = lt.build_ltdb(dbDataFull);
      dbData = lt.prepSave_ltdb()(db);
    });

    it('should get all of the nodes', function(done) {
      // var db = lt.build_ltdb(dbDataFull);
      // var dbData = lt.prepSave_ltdb()(db);
      assert.deepEqual(dbData.nodes, dbDataFull.nodes, 'Not grabbing all node data');
      done();
    });
    it('should get all of the edges', function(done) {
      // var db = lt.build_ltdb(dbDataFull);
      // var dbData = lt.prepSave_ltdb()(db);
      console.log(dbData.edges);
      console.log(dbDataFull.edges);
      assert.deepEqual(dbData.edges, dbDataFull.edges, 'Not grabbing all edge data');
      done();
    });
    it('should get all of the non-master graphs');
    it('should stringify the graphs', function(done) {
      assert.typeOf(dbData.graphs,'string',masterThreadTitle + ' must be stringified');
      done();
    })
  });

  describe('addData', function() {
    it('is not being tested yet');
  });

  describe('prepGraphForExport', function() {
    it('is not being tested yet');
  });

  describe('getInclusiveEdges', function() {
    it('is not being tested yet');
  });

});