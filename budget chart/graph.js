const dims = { height: 300, width: 300, radius: 150 };
const cent = { x: dims.width / 2 + 5, y: dims.height / 2 + 5 };

// Create SVG container
const svg = d3
  .select(".canvas")
  .append("svg")
  .attr("width", dims.width + 150)
  .attr("height", dims.height + 150);

const graph = svg
  .append("g")
  .attr("transform", `translate(${cent.x}, ${cent.y})`);

// Pie configuration
const pie = d3
  .pie()
  .sort(null)
  .value((d) => d.cost);

// Arc configuration
const arcPath = d3
  .arc()
  .outerRadius(dims.radius)
  .innerRadius(dims.radius / 2);

// Ordinal color scale
const colour = d3.scaleOrdinal(d3["schemeSet3"]);

// Legend setup
const legendGroup = svg
  .append("g")
  .attr("transform", `translate(${dims.width + 40},10)`);
const legend = d3.legendColor().shape("circle").shapePadding(10).scale(colour);

// Create a tooltip div
const tooltip = d3
  .select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0)
  .style("position", "absolute")
  .style("background", "#fff")
  .style("border", "1px solid #ccc")
  .style("padding", "5px")
  .style("border-radius", "3px");

// Update function
const update = (data) => {
  // Update color scale domain
  colour.domain(data.map((d) => d.name));

  // Update and call legend
  legendGroup.call(legend);
  legendGroup.selectAll("text").attr("fill", "white");

  // Join enhanced (pie) data to path elements
  const paths = graph.selectAll("path").data(pie(data));

  // Handle the exit selection
  paths.exit().transition().duration(750).attrTween("d", arcTweenExit).remove();

  // Handle the current DOM path updates
  paths
    .attr("d", arcPath)
    .transition()
    .duration(750)
    .attrTween("d", arcTweenUpdate);

  paths
    .enter()
    .append("path")
    .attr("class", "arc")
    .attr("stroke", "#fff")
    .attr("stroke-width", 3)
    .attr("fill", (d) => colour(d.data.name))
    .each(function (d) {
      this._current = d;
    })
    .transition()
    .duration(750)
    .attrTween("d", arcTweenEnter);

  // Add event listeners for tooltip
  graph
    .selectAll("path")
    .on("mouseover", handleMouseOver)
    .on("mouseout", handleMouseOut)
    .on("click", handleClick);
};

// Data array and Firestore
var data = [];

db.collection("expenses")
  .orderBy("cost")
  .onSnapshot((res) => {
    res.docChanges().forEach((change) => {
      const doc = { ...change.doc.data(), id: change.doc.id };

      switch (change.type) {
        case "added":
          data.push(doc);
          break;
        case "modified":
          const index = data.findIndex((item) => item.id == doc.id);
          data[index] = doc;
          break;
        case "removed":
          data = data.filter((item) => item.id !== doc.id);
          break;
        default:
          break;
      }
    });

    // Call the update function
    update(data);
  });

// Arc tween functions
const arcTweenEnter = (d) => {
  var i = d3.interpolate(d.endAngle, d.startAngle);
  return function (t) {
    d.startAngle = i(t);
    return arcPath(d);
  };
};

const arcTweenExit = (d) => {
  var i = d3.interpolate(d.startAngle, d.endAngle);
  return function (t) {
    d.startAngle = i(t);
    return arcPath(d);
  };
};

// Arc update function
function arcTweenUpdate(d) {
  var i = d3.interpolate(this._current, d);
  this._current = i(1);
  return function (t) {
    return arcPath(i(t));
  };
}

// Event handlers
const handleMouseOver = (event, d) => {
  tooltip.transition().duration(200).style("opacity", 1);
  tooltip
    .html(`Name: ${d.data.name}<br>Cost: $${d.data.cost}`)
    .style("left", `${event.pageX + 5}px`) // Adjust tooltip position
    .style("top", `${event.pageY - 28}px`); // Adjust tooltip position

  d3.select(d.currentTarget)
    .transition('changeSliceFill')
    .duration(500)
    .attr("fill", "#fff")
    .attr("transform", 'scale(1.01)');
};

const handleMouseOut = (d) => {
  tooltip.transition().duration(500).style("opacity", 0);

  d3.select(d.currentTarget)
    .transition('changeSliceFill')
    .duration(500)
    .attr("fill", colour(d.data.name))
    .attr("transform", 'scale(1)');
};

const handleClick = (d, i) => {
  const id = i.data.id;
  db.collection("expenses").doc(id).delete();
};
