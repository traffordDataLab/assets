//timeline for multiple series d3 v4
/*data format example

 [  [ {serie: "Greater Manchester", date: "2015-02", value: "2.6"},
      {serie: "Greater Manchester", date: "2015-03", value: "2.6"},
      ...
    ],
    [ {serie: "Bolton", date: "2015-01", value: "3.0"},
      {serie: "Bolton", date: "2015-02", value: "3.1"},
      ...
    ],
    ...
  ]
*/
/*It accepts an object with the options below*/
function timeSeries(obj){

  var data = (obj.data) ? obj.data:["",""];//data on the format described above *required
  var dateFormat = (obj.dateFormat) ? data.dateFormat:"%Y-%m";//date format *required
  var container = (obj.container) ? obj.container:"";//selector for the existing element that will contain the svg *required
  var palette = (obj.palette) ? obj.palette:d3.schemeCategory10;//array, example ["#fdbe85","#fd8d3c","#e6550d"]
  var title = (obj.title) ? obj.title:"";
  var xtitle = (obj.xtitle) ? obj.xtitle:"";
  var ytitle = (obj.ytitle) ? obj.ytitle:"";
  var source = (obj.source) ? "Source: "+obj.source:"";
  var width = (obj.width) ? obj.width:800; //optional width and height
  var height = (obj.height) ? obj.height:350;
  var clickFunction = (obj.clickFunction) ? obj.clickFunction:dummyFunction
  var markClick  = (obj.markClick) ? obj.markClick:false //for one series timeline, mark a circle when clicked
  var indexToMark = (obj.indexToMark) ? obj.indexToMark:"" //for one series timeline mark a circle with the given index


  //define width height and margins

  var margin = {top: 70, right: 20, bottom: 70, left: 60};

  var widthG = width - margin.left - margin.right;
  var heightG = height - margin.top - margin.bottom;

  //setup SVG

  var svg = d3.select(container).append("svg")
  .attr("viewBox", "0 0 " + width + " " + height)
  .attr("preserveAspectRatio", "xMinYMin meet")

  var g = svg.append("g")
  .attr("width", widthG)
  .attr("height", heightG)
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  //data formating
  var parseTime = d3.timeParse(dateFormat);
  var formatTime = d3.timeFormat("%Y-%m");
  var formatTimeTooltip = d3.timeFormat("%b %Y");

  var series=data.map(function (d){return d.map(function(r,i){
    var mark=false
    if (i== +indexToMark)mark=true
    return {serie:r["serie"],
    date:parseTime(r["date"]),
    value:+r["value"],
    mark:mark}
    });
  })

  series.map(function (d){d.sort(function (a, b) {
    return a.date - b.date;
    });
  })

  var extents = series.map(function(r){
    return d3.extent(r, function(d) { return d["date"]; });
  });

  var yDomain=d3.max(series, function(s) { return d3.max(s, function(d) {return d.value; })+0.5; })

  //create Scales
  var x = d3.scaleTime()
  .domain(extents[0])
  .range([0,widthG]);

  var y = d3.scaleLinear()
  .domain([0, yDomain])
  .range([heightG,0]);

  var z = d3.scaleOrdinal()
  .range(palette)
  .domain(series.map(function(d) {return d[0].serie; }))

  //add axes
  g.append("g")
  .attr("class", "x axis")
  .attr("transform", "translate(0," + heightG + ")")
  .call(d3.axisBottom(x))
  .selectAll("text")
  .style("text-anchor", "end")
  .attr("dx", "-.9em")
  .attr("dy", "-.55em")
  .attr("transform", "rotate(-90)" );

  g.append("g")
  .attr("class", "y axis")
  .call(d3.axisLeft(y)
  .ticks(4))

  //add axes titles

  g.append("text")
  .attr("class", "titleX")
  .attr("x", widthG / 2 )
  .attr("y",  heightG + margin.top - 10)
  .style("text-anchor", "middle")
  .style("font-size", "12px")
  .text(xtitle);

  g.append("text")
  .attr("class", "titleY")
  .attr("transform", "rotate(-90)")
  .attr("y", 0 - margin.left + 10)
  .attr("x",0 - (heightG / 2))
  .attr("dy", "1em")
  .style("text-anchor", "middle")
  .style("font-size", "12px")
  .text(ytitle);

  //add gridlines and additional styling
  g.append("g")
  .attr("class", "grid")
  .attr("transform", "translate(0," + heightG + ")")
  .call(d3.axisBottom(x)
  .ticks(3)
  .tickSize(-heightG)
  .tickFormat(""))

  g.append("g")
  .attr("class", "grid")
  .call(d3.axisLeft(y)
  .ticks(3)
  .tickSize(-widthG)
  .tickFormat(""))

  d3.selectAll(".grid")
  .style("stroke-dasharray", "2,2")
  .style("stroke-opacity", 0.7)
  .selectAll("path")
  .style("stroke-width", 0)

  //Add chart title and Source

  g.append("text")
  .attr("class", "plot_title")
  .attr("x", 0)
  .attr("y", 0 - (margin.top / 2))
  .attr("text-anchor", "start")
  .text(title)
  .style("font-size", "18px")

  g.append("text")
  .attr("class", "source")
  .attr("x", -(margin.left/2))
  .attr("y", heightG + (margin.bottom) - 2)
  .attr("text-anchor", "start")
  .text(source)
  .style("font-size", "10px")

  //Add paths and circles

  var serie = g.selectAll(".serie")
  .data(series)
  .enter().append("g")
  .attr("class", "serie");

  serie.append("path")
  .attr("fill","none")
  .attr("stroke-width","2px")
  .style("stroke",  function(d) {return z(d[0].serie); })
  .attr("d", d3.line()
  .x(function(d) { return x(d.date); })
  .y(function(d) { return y(d.value) }));

  serie.append("g")
  .attr("class","circles")
  .selectAll("circle")
  .data(function(d){return d})
  .enter().append("circle")
  .attr("r", 3)
  .attr("cx",function(d){return x(d.date);})
  .attr("cy",function(d){return y(d.value);})
  .style("stroke", function(d) { return z(d.serie); })
  .style("stroke-width", "2px")
  .style("fill", "white")
  .on("mouseenter", hover)
  .on("touchstart", hover)
  .on("mouseleave", mouseout)
  .on("touchmove", mouseout)
  .on("click", click)

  if(clickFunction!=dummyFunction){
    d3.selectAll(".circles").selectAll("circle")
    .style("cursor","pointer")
  }

  if(markClick){
    if (indexToMark==""){
      d3.select(".circles").selectAll("circle:last-of-type")
      .style("fill",function(d) { return z(d.serie); })
      .attr("r",4)
      .on("mouseleave", mouseout2)
      .on("touchmove", mouseout2)
    }else {
      for(i=0;i<series[0].length;i++){
        if(series[0][i].mark==true){
          d3.select(".circles").selectAll("circle:nth-child("+(i+1)+")")
          .style("fill",function(d) { return z(d.serie); })
          .attr("r",4)
          .on("mouseleave", mouseout2)
          .on("touchmove", mouseout2)
          break
        }
      }
    }
  }

  //Add legend

  var legendg= g.append("g")
  .attr("width", widthG)
  .attr("transform", "translate(0,-10)");

  var legend = legendg.selectAll('.legends')
  .data(series)
  .enter().append('g')
  .attr("class", "legends")

  legend.append("circle")
  .attr("cx", 0)
  .attr("cy", 0)
  .attr("r", 5)
  .style("fill", function(d) { return z(d[0].serie); })

  legend.append('text')
  .attr("x", 8)
  .attr("y", 4)
  .attr("dy", ".03em")
  .style("font-size", "12px")
  .text(function (d) {return d[0]["serie"]})
  .style("text-anchor", "start")
  .style("font-size", 12)

  var offsets = [0];
  legendg.selectAll(".legends").nodes().map(function(d){
    var textBBox=d.getElementsByTagName("text")[0].getBBox()
    offsets.push(textBBox.width)
  })

  var totalOffset = 0;
  legendg.selectAll(".legends")
  .attr("transform", function (d, i) {
    if(i>0) totalOffset = totalOffset+offsets[i]+25
    return  "translate(" + totalOffset + ",0)"
  })

    //Add tooltip

  var tooltipDiv = d3.select(container).append("div")
  .attr("class", "tooltip")
  .style("opacity", 0)
  .style("position", "absolute")
  .style("text-align", "center")
  .style("height", "28px")
  .style("padding", "2px")
  .style("background", "white")
  .style("border", "1px")
  .style("border-color", "#757575")
  .style("border-style", "solid")
  .style("pointer-events", "none")
  .style("font-size", "10px")
  .style("text-align", "left")

  function mouseout(d) {
    tooltipDiv.style("opacity", 0);
    d3.select(this).style("fill","white")
    .attr("r", 3)
  }
  function mouseout2(d) {
    tooltipDiv.style("opacity", 0);
  }
  function click(d) {
    d.date=formatTime(d.date)
    d3.select(this).call(clickFunction,d)
    d.date=parseTime(d.date)
      if(markClick){
        d3.selectAll(".circles").selectAll("circle")
        .style("fill", "white")
        .attr("r", 3)
        .on("mouseleave", mouseout)
        .on("touchmove", mouseout)

        d3.select(this)
        .style("fill",function(d) { return z(d.serie); })
        .attr("r", 4)
        .on("mouseleave", mouseout2)
        .on("touchmove", mouseout2)
      }
    }
    function hover(d,i) {
      var matrix = this.getScreenCTM()
      .translate(+ this.getAttribute("cx"), + this.getAttribute("cy"));

      showTooltip(d,i,matrix)

      d3.select(this)
      .style("fill",function(d) { return z(d.serie); })
      .attr("r", 4)
    }
    function showTooltip(d,i,matrix){
      tooltipDiv.html("Date: "+ formatTimeTooltip(d.date) + "<br/>Value: " + d.value)
      var offsetLeft=-5
      var offsetUp=tooltipDiv.node().getBoundingClientRect().height+5
      if (i>series[0].length/2){
        offsetLeft=tooltipDiv.node().getBoundingClientRect().width+5
      }
      tooltipDiv.style("opacity", .9)
      .style("left", (window.pageXOffset + matrix.e - offsetLeft)+ "px")
      .style("top", (window.pageYOffset + matrix.f) - offsetUp+ "px");
    }
    function dummyFunction(){
    }

}
