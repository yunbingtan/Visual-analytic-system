function drawTimeline(data) {
    // Define the dimensions and margins
    d3.select("#timeline")
    .selectAll("svg")
    .remove();

    const margin = {top: 20, right: 0, bottom: 50, left: 80},
        width = 530 - margin.left - margin.right,
        height = 240 - margin.top - margin.bottom;

    // Define the x and y scales
    const x = d3.scaleTime()
    .domain(d3.extent(data, d => new Date(d.date)))
    .range([0, width]);

    const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.count)]).nice()
    .range([height, 0]);

    // Create the line generator function
    const line = d3.line()
    .x(d => x(new Date(d.date)))
    .y(d => y(d.count));

    // Create the SVG container
    const svg = d3.select("#timeline")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Add the x-axis
    svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .style("font", "16px sans-serif")
    .call(d3.axisBottom(x).ticks(d3.timeMonth.every(2)).tickFormat(d3.timeFormat("%m-%y"))); // Updated this line

    // Add the y-axis
    svg.append("g")
        .style("font", "16px sans-serif")
        .call(d3.axisLeft(y).ticks(5)); // Limit the number of ticks to 5
    
      // x_axis title  
    svg.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "end")
        .attr("x", width/2+70)
        .attr("y", height+45)
        .style("font", "18px sans-serif")
        .text("Time (month-year)");

    // // y_axis title
    svg.append("text")
        .attr("class", "y label")
        .attr("text-anchor", "end")
        .attr("x", -height/2+75)
        .attr("y", -55)
        .attr("transform", "rotate(-90)")
        .style("font", "18px sans-serif")
        .text("Number of vehicles");
    
    // Draw the line
    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", d3.schemeTableau10[0])
        .attr("stroke-width", 1.5)
        .attr("d", line);
    
    const brush = d3.brushX()
        .extent([[0, 0], [width, height]])
        .on("end", brushend);

    svg.append("g")
        .attr("class", "brush")
        .call(brush);

    var updateFunction = function (resultSet) {
        allData = JSON.parse(resultSet)
        var barData = allData[1]
        var pieData = allData[2]
        var mapData = allData[3]
        // var timeLineData = allData[4]

        drawBarChart(barData)
        createPieChart1(allData[0])
        createPieChart2(pieData)
        drawDensityMap(mapData)
    };

    // async function brushed() {
    //         const selection = d3.brushSelection(d3.select(".brush").node());
    //         if (selection) {
    //             const [start, end] = selection.map(x.invert);
    //             seasonCheckboxes.forEach(checkbox => checkbox.checked = true);
    //             carTypeCheckboxes.forEach(checkbox => checkbox.checked = true);
                
    //             const sqlString = `SELECT * FROM sensor_data WHERE TimeStamp BETWEEN '${start.toISOString()}' AND '${end.toISOString()}';`;
    //             executeQuery (sqlString, updateFunction)
    //         }
    //     };
    
    function brushend() {
        const selection = d3.brushSelection(d3.select(".brush").node());

        if (selection) {
            const [start, end] = selection.map(x.invert);
            seasonCheckboxes.forEach(checkbox => checkbox.checked = true);
            carTypeCheckboxes.forEach(checkbox => checkbox.checked = true);
            
            const sqlString = `SELECT * FROM sensor_data WHERE TimeStamp BETWEEN '${start.toISOString()}' AND '${end.toISOString()}';`;
            executeQuery (sqlString, updateFunction)
        }else{
            executeQuery(constructSQL(), updateFunction)
        }
    }
}