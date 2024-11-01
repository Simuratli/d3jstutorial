const margin = {
  top:40,
  right:20,
  bottom:50,
  left:100
}


const graphWidth = 560 - margin.left - margin.right
const grapHeight = 400 - margin.top - margin.bottom


const svg  = d3.select('.canvas').append('svg').attr('width',graphWidth + margin.left + margin.right).attr('height',grapHeight + margin.top + margin.bottom);


const graph = svg.append('g').attr('width',graphWidth).attr('height',grapHeight).attr('transform',`translate(${margin.left},${margin.top})`)


//scales
const x = d3.scaleTime().range([0,graphWidth]);
const y = d3.scaleLinear().range([grapHeight,0])


//axes groups 
const xAxisGroup = graph.append('g').attr('class','x-axis') .attr('transform',`translate(0,${grapHeight})`);
const yAxisGroup = graph.append('g').attr('class','y-axis');


// line path generator 
const line = d3.line().x(function(d){return x(new Date(d.date))}).y(function(d){return y(d.distance)})


// line path element 
const path = graph.append('path')


//dotted line group
const dottedLines = graph.append('g').attr('class','lines').style('opacity',0);

// create x dotted line and append dotted line grouop

const xDottedLine = dottedLines.append('line').attr("stroke",'#aaa').attr('stroke-width',1).attr('stroke-dasharray',4);

// create y dotted line and append dotted line grouop

const yDottedLine = dottedLines.append('line').attr("stroke",'#aaa').attr('stroke-width',1).attr('stroke-dasharray',4);

const update = (data) => {

  data = data.filter(item => item.activity === activity);
  
  // sort data based on date objects
  data.sort((a,b)=>new Date(a) - new Date(b))



  /// set scale domanins
  x.domain(d3.extent(data,d=> new Date(d.date)));
  y.domain([0,d3.max(data,d=> new Date(d.distance))])


  // updatepath data forline
  path.data([data]).attr('fill','none').attr('stroke',"#00bfa5").attr('stroke-width',2).attr('d',line)



  // create axes 
  const xAxes = d3.axisBottom(x).ticks(4).tickFormat(d3.timeFormat('%b %d'))
  const yAxes =d3.axisLeft(y).ticks(4).tickFormat(d=> d + 'm')

  // call axes placein screen

  xAxisGroup.call(xAxes)
  yAxisGroup.call(yAxes)


  //rotate axis text

  xAxisGroup.selectAll('text').attr('transform','rotate(-40)').attr("text-anchor","end")




  //create circles for objects
  const circles = graph.selectAll('circle').data(data);
  //update current points
  circles.attr('cx',d=>x(new Date(d.date))).attr('cy',d=>y(new Date(d.distance)))
  // add new points
  circles.enter().append('circle').attr("r",4).attr('cx',d=>x(new Date(d.date))).attr('cy',d=>y(new Date(d.distance))).attr('fill','#ccc');

  graph.selectAll('circle').on('mouseover',(d,i)=>{
    d3.select(d.currentTarget).transition().duration(100).attr('r',8).attr('fill','#fff').attr('cursor','pointer')
    xDottedLine
    .attr('x1',x(new Date(i.date)))
    .attr('x2',x(new Date(i.date)))
    .attr('y1',grapHeight)
    .attr('y2',y(i.distance))

    yDottedLine
    .attr('x1',0)
    .attr('x2',x(new Date(i.date)))
    .attr('y1',y(i.distance))
    .attr('y2',y(i.distance))

    dottedLines.style("opacity",1)

  })
  .on('mouseleave',(d,i)=>{
    d3.select(d.currentTarget).transition().duration(100).attr('r',4).attr('fill','#ccc').attr('cursor','pointer')
    dottedLines.style("opacity",0)
  })

  circles.exit().remove();


}


//data and firestore
var data = []

db.collection('activities').onSnapshot(response => {
  response.docChanges().forEach(change => {
      const doc = {
        ...change.doc.data(),
        id:change.doc.id
      }
      switch (change.type) {
        case 'added':
          data.push(doc)
          break;
        case "modified":
          const index = data.findIndex(item=>item.id === doc.id)
          data[index] = doc
          break;
        case "removed":
          data= data.filter(item=>item.id !== doc.id)
        default:
          break;
      }
  });

  update(data)
})
