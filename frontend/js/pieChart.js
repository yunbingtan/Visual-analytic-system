function processDataPieChart1(data) {
  const counts = {
    "Stay": 0,
    "Leave": 0
  };

  const carIdCounts = {};

  data.forEach(d => {
    const carId = d["car_id"];
    if (!carIdCounts[carId]) {
      carIdCounts[carId] = 0;
    }
    carIdCounts[carId]++;
  });

  for (const carId in carIdCounts) {
    if (carIdCounts[carId] % 2 === 0) {
      counts["Leave"]++;
    } else {
      counts["Stay"]++;
    }
  }

  const pieChartData = [];
  for (const key in counts) {
    pieChartData.push({ "label": key, "count": counts[key] });
  }
  return pieChartData;
}

// function processDataPieChart2(data) {
//   const numIntervals = 6;

//   // Find the minimum and maximum stayed-time values
//   const minStayedTime = Math.min(...data.map(d => d["time_duration_seconds"]));
//   const maxStayedTime = Math.max(...data.map(d => d["time_duration_seconds"]));

//   // Calculate the interval size
//   const intervalSize = (maxStayedTime - minStayedTime) / numIntervals;

//   // Initialize the counts array
//   const counts = Array(numIntervals).fill(0);

//   // Count the data points that fall into each interval
//   data.forEach(d => {
//     const index = Math.floor((d["time_duration_seconds"] - minStayedTime) / intervalSize);
//     counts[index]++;
//   });

  // Generate the final data array with labels and counts
//   return counts.map((count, i) => {
//     const rangeStart = minStayedTime + i * intervalSize;
//     const rangeEnd = rangeStart + intervalSize;
//     return { "label": `${rangeStart.toFixed(1)} - ${rangeEnd.toFixed(1)}`, "count": count };
//   });
// }


function drawPieChart(data, chartId) {
  const width  = (chartId === 'pieChart1' ? 250 : 360)
  const height = 250;
  const margin = 0;
  const radius = height / 2 - margin;

  const color = d3.scaleOrdinal(d3.schemeTableau10);

  d3.select("#" + chartId)
    .selectAll("svg")
    .remove();

  const svg = d3.select("#" + chartId)
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${(chartId === 'pieChart1' ? width / 2 : (width ) / 2-60)}, ${height / 2})`);
  
    const arc = d3.arc()
    .outerRadius(radius * 0.8) // Adjust the outer radius to create more space for text
    .innerRadius(radius * 0.3);

  const pie = d3.pie()
      .startAngle((chartId === 'pieChart1' ?  0 : Math.PI / 2.5) )
      .endAngle((chartId === 'pieChart1' ?  Math.PI * 2 : Math.PI * 2 + Math.PI / 2.5))
      .value(d => d.count)
      .sort((chartId === 'pieChart1' ?  null : function(a, b) { return d3.ascending(a.count, b.count);}))

  const g = svg.selectAll(".arc")
    .data(pie(data))
    .enter().append("g")
    .attr("class", "arc");

  // Add tooltip div
  const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  if (chartId === 'pieChart1') {
  g.append("path")
    .attr("d", arc)
    .style("fill", d => color(d.data.label))
    .attr("stroke", "white")
    .style("stroke-width", "1px")
  } else if (chartId === 'pieChart2') {
      g.append("path")
      .attr("d", arc)
      .style("fill", d => color(d.data.label))
      .attr("stroke", "white")
      .style("stroke-width", "1px")
      .on("mouseover", (event, d) => {
        const content = chartId === 'pieChart1'
          ? `number of ${d.data.label}: ${d.data.count}`
          : `car counts in interval of ${d.data.label}: ${d.data.count}`;
  
        tooltip.transition()
          .duration(200)
          .style("opacity", 0.9);
        tooltip.html(content)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 10) + "px");
      })
      .on("mouseout", () => {
        tooltip.transition()
          .duration(500)
          .style("opacity", 0);
    })}
  ;

  if (chartId === 'pieChart1') {
    // svg.selectAll('allPolylines')
    // .data(pie(data))
    // .enter()
    // .append('polyline')
    //   .attr("stroke", "black")
    //   .style("fill", "none")
    //   .attr("stroke-width", 2)
    //   .attr('points', function(d) {
    //     const posA = arc.centroid(d) // line insertion in the slice
    //     const posC = arc.centroid(d); // Label position = almost the same as posB
    //     const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2 // we need the angle to see if the X position will be at the extreme right or extreme left
    //     posC[0] = radius * 0.9 * (midangle < Math.PI ? 1 : -1); // multiply by 1 or -1 to put it on the right or on the left
    //     return [posA, posC]
    //   })
  
    svg
      .selectAll('allLabels')
      .data(pie(data))
      .enter()
      .append('text')
      .text(d => d.data.label)
      .style("font", "18px sans-serif")
      .style("font-weight", 700)
      .attr('transform', function(d) {
            var pos = arc.centroid(d);
            var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
            pos[0] = pos[0] - 25 * (midangle < Math.PI ? 1 : -1);
            pos[1] = pos[1] -4
            return 'translate(' + pos + ')'}
        )
      .style('text-anchor', function(d) {
            var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
            return (midangle < Math.PI ? 'start' : 'end')
        })

    svg
      .selectAll('allLabels')
      .data(pie(data))
      .enter()
      .append('text')
      .text(d => d.data.count)
      .style("font", "16px sans-serif")
      .attr('transform', function(d) {
            var pos = arc.centroid(d);
            var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
            pos[0] = pos[0] - 25 * (midangle < Math.PI ? 1 : -1);
            pos[1] = pos[1] +15
            return 'translate(' + pos + ')';
        })
      .style('text-anchor', function(d) {
            var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
            return (midangle < Math.PI ? 'start' : 'end')
        })

    } else if (chartId === 'pieChart2') {
      addLegend(svg, color, data, 110, -50);
    } 

    function addLegend(svg, color, data, xOffset = 100, yOffset = -100) {
      const legend = svg.selectAll(".legend")
        .data(pie(data))
        .enter()
        .append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => `translate(${xOffset}, ${yOffset + i * 20})`);
    
      legend.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", d => color(d.data.label));
    
      legend.append("text")
        .attr("x", 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .text(d => d.data.label)
        .style("font", "16px sans-serif");
    
    }
}




// const data = [
//   { "seasons": "spring", "car-type": "1", "car-id": "1", "stayed-time": 10 },
//   { "seasons": "spring", "car-type": "1", "car-id": "1", "stayed-time": 12 },
//   { "seasons": "spring", "car-type": "1", "car-id": "2", "stayed-time": 13 },
//   { "seasons": "summer", "car-type": "1", "car-id": "2", "stayed-time": 24 },
//   { "seasons": "summer", "car-type": "1", "car-id": "3", "stayed-time": 35 },
//   { "seasons": "autumn", "car-type": "1", "car-id": "3", "stayed-time": 46 },
//   { "seasons": "autumn", "car-type": "1", "car-id": "4", "stayed-time": 57 },
//   { "seasons": "winter", "car-type": "1", "car-id": "4", "stayed-time": 77 },
//   { "seasons": "winter", "car-type": "1", "car-id": "5", "stayed-time": 89 },
// ];


var createPieChart1 = function (data) {
  const processedData = processDataPieChart1(data);
  drawPieChart(processedData, "pieChart1");
}

var createPieChart2 = function(data) {
  drawPieChart(data, "pieChart2");
}



// let pieChartData1 = processDataPieChart1(data);
// drawPieChart(pieChartData1, "pieChart1");

// let pieChartData2 = processDataPieChart2(data);
// drawPieChart(pieChartData2, "pieChart2");
