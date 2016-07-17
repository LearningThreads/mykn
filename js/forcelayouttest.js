
function buildSVG() {
  chrome.storage.local.get(["ltdb", "currentThreadName"], function (obj) {

    // Re-build the learning threads database with the database data
    var db = window.learning_threads.build_ltdb(obj.ltdb);

    // Grab the nodes associated with the currently selected thread
    var nodeIds = db.graphs({title:obj.currentThreadName}).first().nodes;
    var nodess = db.nodes(nodeIds).get();

    //console.log(nodeIds);
    //console.log(nodess);

    //nodes = db.nodes().get();
    //var nodeIds = [];
    //for (var i = 0; i < nodes.length; i++) {
    //  nodeIds.push(nodes[i].___id);
    //}

    edges = db.edges().get();
    for (var j = 0; j < edges.length; j++) {
      edges[j].source = nodeIds.indexOf(edges[j].from);
      edges[j].target = nodeIds.indexOf(edges[j].to);
    }
    var dataset = {
      nodes: nodess,
      edges: edges
    };

    var width = 450; // 620;
    var height = 400; // 440;

    var force = d3.layout.force()
      .nodes(dataset.nodes)
      .links(dataset.edges)
      .size([width, height])
      .linkDistance([100])
      .charge([-200]);

    //var svg = d3.select('body').append('svg')
    var svg = d3.select('#visualView').append('svg')
      .attr('width', width)
      .attr('height', height);

    var edges = svg.selectAll("line")
      .data(dataset.edges)
      .enter()
      .append("line")
      .style("stroke", "#ccc")
      .style("stroke-width", 1);

    var nodes = svg.selectAll("circle")
      .data(dataset.nodes)
      .enter()
      .append("circle")
      .attr("r", 10)
      //.style("fill", function(d,i) { return colors(i);})
      .call(force.drag);

    var text = svg.selectAll("text")
      .data(dataset.nodes)
      .enter()
      .append("a")
      .classed("a-stitch", true)
      .on('click', function(d) {
        chrome.tabs.create({
          url: d.url
        });
      })
      .append("text")
      .text(function(d) {
        return d.title;
      });

    force.on("tick", function () {
      edges
        .attr("x1", function (d) {
          return d.source.x;
        })
        .attr("y1", function (d) {
          return d.source.y;
        })
        .attr("x2", function (d) {
          return d.target.x;
        })
        .attr("y2", function (d) {
          return d.target.y;
        });

      nodes
        .attr("cx", function (d) {
          return d.x;
        })
        .attr("cy", function (d) {
          return d.y;
        });

      text
        .attr("x", function (d) {
          return d.x + 10;
        })
        .attr("y", function (d) {
          return d.y;
        });
    });

    force.start();

  });
}

chrome.storage.onChanged.addListener(function(changes,namespace) {
  d3.select("svg").remove();
  buildSVG();
});

//document.addEventListener('load', function() {
//  document.getElementById('visualViewButton').addEventListener("click", function() {
//    console.log("test this too");
//    buildSVG();
//  });
//});

// Do this once upon load.
//buildSVG();
