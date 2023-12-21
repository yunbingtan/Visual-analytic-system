function drawBarChart(data) {
  d3.select("#bar-chart")
    .selectAll("svg")
    .remove();
  d3.select("#bar-chart-legend")
    .selectAll("svg")
    .remove();

  const barMargin = { top: 10, right: 70, bottom: 50, left: 70 },
      barWidth = 600 - barMargin.left - barMargin.right,
      barHeight = 400 - barMargin.top - barMargin.bottom;
    
  const x = d3.scaleBand().rangeRound([0, barWidth]).padding(0.1),
      yLeft = d3.scaleLinear().rangeRound([barHeight, 0]),
      yRight = d3.scaleLinear().rangeRound([barHeight, 0]);
   
  const barLegend = d3.select("#bar-chart-legend")
                  .append("svg")
                  .attr("width", 600)
                  .attr("height", 30)
                  .append("g")
                  .attr("transform", `translate(${barMargin.left + 55},${barMargin.top - 10})`);
  
  const barChart = d3
      .select("#bar-chart")
      .append("svg")
      .attr("width", barWidth + barMargin.left + barMargin.right)
      .attr("height", barHeight + barMargin.top + barMargin.bottom)
      .append("g")
      .attr("transform", "translate(" + barMargin.left + "," + barMargin.top + ")");
    
  x.domain(data.map((d) => d.season));
  yLeft.domain([0, Math.floor(d3.max(data, (d) => d.total)/10000)*10 + 10]);
  yRight.domain([0, Math.floor(d3.max(data, (d) => d.avgTime)/10)*10 + 10]);
  // colorScale.domain([0, d3.max(barData, (d) => d.total)]);
    
  // x_axis title
  barChart
    .append("g")
    .attr("class", "axis axis--x")
    .style("font", "16px sans-serif")
    .attr("transform", "translate(0," + barHeight + ")")
    .call(d3.axisBottom(x));

  barChart.append("text")
    .attr("class", "x label")
    .attr("text-anchor", "end")
    .attr("x", barWidth/2+20)
    .attr("y", barHeight+45)
    .style("font", "18px sans-serif")
    .text("Season");
  
  // y_axis_1 title
  barChart
    .append("g")
    .attr("class", "axis axis--y")
    .style("font", "16px sans-serif")
    .call(d3.axisLeft(yLeft).ticks(4));
  
  barChart.append("text")
    .attr("class", "y label")
    .attr("text-anchor", "end")
    .attr("x", -barHeight/2+115)
    .attr("y", -40)
    .attr("transform", "rotate(-90)")
    .attr("font-weight", "10")
    .style("font", "18px sans-serif")
    .text("Number of vehicles (x 1,000)");

  // const line1 = barChart.append("line")
  // .attr("x1", -50)
  // .attr("y1", 104)
  // .attr("x2", -40)
  // .attr("y2", 114)
  // .attr("stroke", "black")
  // .attr("stroke-width", 2);

  // const line2 = barChart.append("line")
  // .attr("x1", -40)
  // .attr("y1", 104)
  // .attr("x2", -50)
  // .attr("y2", 114)
  // .attr("stroke", "black")
  // .attr("stroke-width", 2);

        // y_axis_2 title
  barChart
    .append("g")
    .attr("class", "axis axis--y")
    .style("font", "16px sans-serif")
    .attr("transform", "translate(" + barWidth + ", 0)")
    .call(d3.axisRight(yRight).ticks(5));

  barChart.append("text")
    .attr("class", "y label")
    .attr("text-anchor", "end")
    .attr("x", -barHeight/2+95)
    .attr("y", barWidth+60)
    .attr("transform", "rotate(-90)")
    .attr("font-weight", "10")
    .style("font", "18px sans-serif")
    .text("Average stay time (min)")
  
    // Legend
  var y1_classes = [{type: "Number of vehicles (day)", color:d3.schemePastel1[8]} , 
      {type:"Number of vehicles (night)", color:d3.schemeTableau10[0]}]
  

  // draw the colored dots
  barLegend.append("g")
    .selectAll("foo")
    .data(y1_classes)
    .join("rect")
    // TO DO: FINISH THESE
    // Hint for cx: you might want to utilize i (the index being iterated on for the current datum)
    // .attr("cx", function(d, i) {return 50+i*10})
    .attr("x", function (d, i) {return i * 170-50})
    .attr("y", 2)
    .attr("width", 10)
    .attr("height", 10)
    .attr("stroke", "black")
    .attr("stroke-weight", 1)
    // .style("fill", "#1f78b4")
    .style("fill", function (d) { return d["color"]})

  barLegend.selectAll("legend.label")
      .data(y1_classes)
      .enter()
      .append("text")
      .attr("x", function(d, i) {return i * 170-35})             
      .attr("y", 8)
      .style("font", "12px sans-serif")
      .attr("alignment-baseline","middle")
      .text(function (d) { return d["type"];
      });

  barLegend.append("circle")
      // TO DO: FINISH THESE
      // Hint for cx: you might want to utilize i (the index being iterated on for the current datum)
      // .attr("cx", function(d, i) {return 50+i*10})
      .attr("cx", 300)
      .attr("cy", 8)
      .attr("r", 5)
      .style("fill", d3.schemeTableau10[1])

  barLegend.append("line")
    .attr("x1", 290)
    .attr("y1", 8)
    .attr("x2", 310)
    .attr("y2", 8)
    .attr("stroke-width", 2)
    .attr("stroke", d3.schemeTableau10[1])
  
  barLegend.append("text")
    .attr("x", 315)
    .attr("y", 8)
    .style("font", "12px sans-serif")
    .attr("alignment-baseline","middle")
    .text("Average stay time");
  
  const dayBars = barChart
    .selectAll(".total")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "total")
    .attr("x", (d) => x(d.season) +27)
    .attr("y", (d) => yLeft((d.total-d.night)/1000))
    .attr("width", x.bandwidth() / 2)
    .attr("height", (d) => barHeight - yLeft((d.total-d.night)/1000))
    .attr("stroke", "black")
    .attr("fill", y1_classes[0].color);
  
  const  nightBars = barChart
    .selectAll(".night")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "night")
    .attr("x", (d) => x(d.season) +27)
    .attr("y", (d) => yLeft(d.total/1000))
    .attr("width", x.bandwidth() / 2)
    .attr("height", (d) => barHeight - yLeft(d.night/1000))
    .attr("stroke", "black")
    .attr("fill", y1_classes[1].color);
  
  // Line chart for the average time
  const line = d3
    .line()
    .x((d) => x(d.season) + x.bandwidth() / 2)
    .y((d) => yRight(d.avgTime));
  
  barChart
    .append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", d3.schemeTableau10[1])
    .attr("stroke-width", 3)
    .attr("d", line);
  
  barChart.append("g")
    .selectAll("dot")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", (d) => x(d.season) + x.bandwidth() / 2)
    .attr("cy", (d) => yRight(d.avgTime))
    .attr("r", 5)
    .attr("fill", d3.schemeTableau10[1]);
        };