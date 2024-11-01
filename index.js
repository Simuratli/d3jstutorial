// const canvas = d3.select('.canvas');
// const svg = canvas.append('svg').attr('height',600).attr('width',600);


// const group = svg.append('g').attr('transform','translate(0,100)');


// //append shapes
// group.append('rect').attr('height',100).attr('width',100).attr('fill','blue').attr('x',20).attr('y',20)
// group.append('circle').attr('r',50).attr('cx',300).attr('cy','70').attr('fill','red')
// group.append('line').attr('x1',370).attr('x2',400).attr('y1',20).attr('y2',120).attr('stroke','orange')


// svg.append('text').attr('x',20).attr('y',200).attr("fill",'gray').text('Hrllo ninjas').style('font-family','Ariel')

// const data = [
//     {width:200,height:300,fill:"purple"},
//     {width:1000,height:500,fill:"pink"},
//     {width:50,height:100,fill:"orange"},
// ]

// const svg = d3.select('svg');


// //join data to rects
// const rects = svg.selectAll("rect").data(data)



// rects.attr('width',(d,i,n)=>d.width)
// .attr('height',(d)=>d.height)
// .attr('fill',(d)=>d.fill)


// rects.enter().append('rect').attr('width',(d,i,n)=>d.width)
// .attr('height',(d)=>d.height)
// .attr('fill',(d)=>d.fill)

// console.log(rect,'rectangele')


const svg  = d3.select("svg");
d3.json('planets.json').then(data=>{
    const  circles = svg.selectAll("circle").data(data);
    circles.attr('cy',200)
    .attr('cx',d=>d.distance)
    .attr('r',d=>d.radius)
    .attr('fill',d=>d.fill)

    circles.enter().append('circle')
    .attr('cy',200)
    .attr('cx',d=>d.distance)
    .attr('r',d=>d.radius)
    .attr('fill',d=>d.fill)
})
