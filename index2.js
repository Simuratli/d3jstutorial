// select the svg container first
const svg = d3.select('.canvas')
  .append('svg')
    .attr('width', 600)
    .attr('height', 600);


const t = d3.transition().duration(500)
// create margins & dimensions
const margin = {top: 20, right: 20, bottom: 100, left: 100};
const graphWidth = 600 - margin.left - margin.right;
const graphHeight = 600 - margin.top - margin.bottom;

const graph = svg.append('g')
  .attr('width', graphWidth)
  .attr('height', graphHeight)
  .attr('transform', `translate(${margin.left}, ${margin.top})`);

// create axes groups
const xAxisGroup = graph.append('g')
  .attr('transform', `translate(0, ${graphHeight})`)

xAxisGroup.selectAll('text')
  .attr('fill', 'orange')
  .attr('transform', 'rotate(-40)')
  .attr('text-anchor', 'end');

const yAxisGroup = graph.append('g');

const y = d3.scaleLinear()
    .range([graphHeight, 0]);

const x = d3.scaleBand()
  .range([0, graphWidth])
  .paddingInner(0.2)
  .paddingOuter(0.2);

// create & call axes
const xAxis = d3.axisBottom(x);
const yAxis = d3.axisLeft(y)
  .ticks(3)
  .tickFormat(d => d + ' orders');

// the update function
const update = (data) => {

  // join the data to circs
  const rects = graph.selectAll('rect')
    .data(data);


    ///remove all first

    rects.exit().remove()

  // update the domains
  y.domain([0, d3.max(data, d => d.orders)]);
  x.domain(data.map(item => item.name));

  // add attrs to rects already in the DOM
  rects.attr('width', x.bandwidth)
    .attr('fill', 'orange')
    .attr('x', d => x(d.name))
    .transition(t)
    .attr("height", d => graphHeight - y(d.orders))
    .attr('y', d => y(d.orders));

  // append the enter selection to the DOM
  rects.enter()
    .append('rect')
      .attr('width', x.bandwidth)
      .attr("height", 0)
      .attr('fill', 'orange')
      .attr('x', (d) => x(d.name))
      .attr('y', graphHeight)
      .transition(t)
      .attr('y', d => y(d.orders))
      .attr("height", d => graphHeight - y(d.orders))

  xAxisGroup.call(xAxis);
  yAxisGroup.call(yAxis);

};

d3.json('menu.json').then((data)=>{

    d3.interval(()=>{
        data.pop()
        // data[0].orders += 50;
        update(data);
    },3000)

    update(data);

    
})