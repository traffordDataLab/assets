//horizontalBarChart d3 v4

/*data=[{name : "category1", value : 4},
      {name : "category2", value : 5},
      ...
    ]
*/
/*It accepts an object with the options below*/
function horizontalBarChart(obj){

  var data = (obj.data) ? obj.data:["",""];//data on the format described above *required
  var container = (obj.container) ? obj.container:"";//selector for the existing element that will contain the svg *required
  var barColour = (obj.barColour) ? obj.barColour:"#cccccc";
  var strokeColour = (obj.strokeColour) ? obj.strokeColour:"#fc6721";
  var title = (obj.title) ? obj.title:"";
  var source = (obj.source) ? obj.source:"";
  var width = (obj.width) ? obj.width:800; //optional width and height
  var height = (obj.height) ? obj.height:400;
  var clickFunction = (obj.clickFunction) ? obj.clickFunction:""
  var markClick  = (obj.markClick) ? obj.markClick:false
  var indexToMark = (obj.indexToMark) ? obj.indexToMark:""

  data.sort(function(a, b){
    if(a.name > b.name) { return -1; }
    if(a.name < b.name) { return 1; }
    return 0;
  })

  //define width height and margins

  var margin = {top: 50, right: 20, bottom: 20, left: 20};

  var widthG = width - margin.left - margin.right;
  var heightG = height - margin.top - margin.bottom;

  //setup SVG

  var svg = d3.select(container).append("svg")
  .attr("viewBox", "0 0 " + width + " " + height)
  .attr("preserveAspectRatio", "xMinYMin meet")

  var histo = svg.append("g")
  .attr("width", widthG)
  .attr("height", heightG)
  .attr("transform", "translate(" + (margin.left+widthG/4) + "," + margin.top + ")");

  //create Scales
  var hx = d3.scaleLinear()
  .range([0, 3*widthG/4-25])
  .domain([0, d3.max(data, function (d) {
    return +d.value;
  })]);
  var hy = d3.scaleBand()
  .rangeRound([heightG, 0])
  .padding(0.1)
  .domain(data.map(function (d) {
    return d.name;
  }));
  var yAxis = d3.axisLeft(hy)
  .tickSize(0)

  var numFormat = d3.format(",");

  var gy = histo.append("g")
  .attr("class", "y axis")
  .call(yAxis)

  gy.selectAll(".tick")
  .selectAll("text")
  .style("font-size", "15px")
  .attr("transform", "translate(-4," + 0 + ")")


  var barsg = histo.append("g")
  .attr("class", "bars")

  var bars = barsg.selectAll(".bar")
  .data(data)
  .enter()
  .append("g")
  //append rects
  bars.append("rect")
  .attr("class", "bar")
  .attr("id", function (d) {
    return d.name
  })
  .attr("y", function (d) {
    return hy(d.name)+3;
  })
  .attr("height", hy.bandwidth()-6)
  .attr("x", 2.5)
  .attr("width", function (d) {
    return hx(d.value);
  })
  .attr("fill",barColour)
  .style("opacity",0.8)
  .style("stroke", strokeColour)
  .style("stroke-width", "3px")
  .on("mouseover", function(d) {
    d3.select(this)
    .style("stroke-width", "4px");
  })
  .on("mouseout", function(d) {
    d3.select(this)
    .style("stroke-width", "3px")
  })
  .on("click", function(d) {
    d3.select(this).call(clickFunction,d)
    if(markClick){
      d3.selectAll(".bar")
      .style("fill", barColour)
      d3.select(this)
      .style("fill", strokeColour)
    }
  })

  if(clickFunction!=dummyFunction){
    d3.selectAll(".bar")
    .style("cursor","pointer")
  }

  if(markClick){
    if (indexToMark!=""){
      d3.select(".bars").selectAll("g:nth-child("+(indexToMark-1)+")").selectAll("rect")
      .style("fill", strokeColour)
    }
  }

  //add a value label to the right of each bar
  bars.append("text")
  .attr("class", "label")
  .attr("y", function (d) {
    return hy(d.name) + hy.bandwidth() -6;
  })
  //x position is 3 pixels to the right of the bar
  .attr("x", function (d) {
    return hx(d.value) + 5;
  })
  .text(function (d) {
    return numFormat(d.value);
  });

  //add title and source
  histo.append("text")
  .attr("class", "plot_title")
  .attr("x", -widthG/4-margin.left)
  .attr("y", 0 - (margin.top / 2))
  .attr("text-anchor", "start")
  .text(title)
  .style("font-size", "20px")

  histo.append("text")
  .attr("class", "source")
  .attr("x", -widthG/4-margin.left)
  .attr("y", heightG + (margin.bottom) - 2)
  .attr("text-anchor", "start")
  .text(source)
  .style("font-size", "12px")

  function dummyFunction(){
  }
}
