const svg = d3.select(".canvas").append('svg').attr("width",600).attr("height",600);


d3.json("menu.json").then((data)=>{
    const rects = svg.selectAll('rect').data(data);
    rects.attr('width',10).attr('height',d=>d.price).attr('fill','orange').attr('x',(data,index)=>index*20)
    rects.enter().append('rect').attr('width',10).attr('height',d=>d.price).attr('fill','orange').attr('x',(data,index)=>index*20);
})


//create margins and dimension
const margin = {top:20,right:20,bottom:100,left:100};
const graphWidth = 600 - margin.left - margin.right;
const graphHeight = 600 - margin.top - margin.bottom;

const graph = svg.append('g').attr('width',graphWidth).attr('height',graphHeight).attr('transform',`translate(${margin.left},${margin.top})`)

const xAxisGroup = graph.append('g')
const yAxisGroup = graph.append('g');

d3.json("menu.json").then((data)=>{
    const rects = graph.selectAll('rect').data(data);

    const min = d3.min(data,d=>d.orders);
    const max = d3.max(data,d=>d.orders);
    const extent = d3.extent(data,d=>d.orders);

    
    const y =  d3.scaleLinear().domain([0,max]).range([graphHeight,0])
    const x = d3.scaleBand().domain(data.map(item=>item.name)).range([0,500]).paddingInner(0.2).paddingOuter(0.2)
    

    rects.attr('width',x.bandwidth).attr('height',d=>graphHeight - y(d.orders)).attr('fill','orange').attr('x',(d)=>x(d.name)).attr('y',d=>y(d.orders))
    rects.enter().append('rect').attr('width',x.bandwidth).attr('height',d=>graphHeight - y(d.orders)).attr('fill','orange').attr('x',(d)=>x(d.name)).attr('y',d=>y(d.orders));



        // create axes
        const xAxis = d3.axisBottom(x)
        const yAxis = d3.axisLeft(y).ticks(3).tickFormat(d=>`${d} orders`);
    
        xAxisGroup.call(xAxis)
        yAxisGroup.call(yAxis)
})