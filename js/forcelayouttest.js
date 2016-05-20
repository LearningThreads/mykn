var dataset = {
  nodes: [
    {name: "Adam"},
    {name: "Bob"},
    {name: "Chanrda"},
    {name: "Diana"},
    {name: "Ebert"},
    {name: "Fred"},
    {name: "Georgette"},
    {name: "Henry"},
    {name: "Isabelle"},
    {name: "Jenkins"}
  ],
  edges: [
    {source: 0, target: 1},
    {source: 0, target: 2},
    {source: 0, target: 3},
    {source: 0, target: 4},
    {source: 1, target: 5},
    {source: 2, target: 5},
    {source: 2, target: 5},
    {source: 3, target: 4},
    {source: 5, target: 8},
    {source: 5, target: 9},
    {source: 6, target: 7},
    {source: 7, target: 8},
    {source: 8, target: 9}
  ]
};

chrome.storage.local.get(["ltdb"], function(obj) {
  var db = window.learning_threads.build_ltdb(obj.ltdb);
  nodes = db.nodes().get();
  var nodeIds=[];
  for (var i=0;i<nodes.length;i++) {
    nodeIds.push(nodes[i].___id);
  }
  edges = db.edges().get();
  for (var j=0;j<edges.length;j++) {
    edges[j].source = nodeIds.indexOf(edges[j].from);
    edges[j].target = nodeIds.indexOf(edges[j].to);
  }
  var dataset = {
    nodes:nodes,
    edges:edges
  };

  var width = 620;
  var height = 440;

  var force = d3.layout.force()
    .nodes(dataset.nodes)
    .links(dataset.edges)
    .size([width, height])
    .linkDistance([50])
    .charge([-100]);

  var svg = d3.select('body').append('svg')
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

  force.on("tick", function() {
    edges
      .attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });

    nodes
      .attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) {return d.y; });
  });

  force.start();

});

