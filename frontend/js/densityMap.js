function drawDensityMap(sensorData) {
    var vis = this;
    const mapWidth = 982;
    const mapHeight = 982;
    const scaleFactor = 0.5;
    const mapX = 0;
    const mapY = 0;

    d3.select("#densityMap")
    .selectAll("svg")
    .remove();

    // const sensorData =
    //     [{ "gate": "gate2", "x": 126, "y": 265, "recordCount": 1000 },
    //     { "gate": "general-gate0", "x": 544, "y": 52, "recordCount": 3000 },
    //     { "gate": "ranger-stop1", "x": 99, "y": 126, "recordCount": 1300 }];
    
    const svg = d3.select("#densityMap")
        .append("svg")
        .attr("width", mapWidth * scaleFactor)
        .attr("height", mapHeight * scaleFactor);
    
    const density = d3.contourDensity()
        .x(d => d.x * scaleFactor)
        .y(d => d.y * scaleFactor)
        .weight(d => d.recordCount)
        .size([mapWidth, mapHeight])
        .bandwidth(16)
        .thresholds(30)
        (sensorData);

    const contourDensity = d3.contourDensity()
        .x(d => d.x) // Set the x-coordinate accessor function
        .y(d => d.y) // Set the y-coordinate accessor function
        .size([mapWidth, mapHeight]) // Set the size of the density grid
        .weight(d => d.recordCount)
        .bandwidth(10) // Set the bandwidth of the kernel density estimator
        .thresholds([0.1, 0.2, 0.3, 0.4, 0.5]) // Set the density thresholds for generating contours
        (sensorData);

    const colorScale = d3.scaleSequential()
        .domain([0, d3.max(density, d => d.value)])
        .interpolator(d3.interpolateGreens);

    const image = new Image();
    image.src = "./Lekagul Roadways labeled v2.jpg";

    svg.append("image")
        .attr("xlink:href", image.src)
        .attr("width", mapWidth * scaleFactor)
        .attr("height", mapHeight * scaleFactor)
        .attr("x", mapX)
        .attr("y", mapY);

    // console.log(contourDensity)
    svg.append("g")
        .selectAll("path")
        .data(density)
        .join("path")
        .attr("d", d3.geoPath())
        .attr("fill", d => colorScale(d.value))
        .attr("fill-opacity", 0.08)
        // .attr("stroke", "black");

    const brush = d3.brush()
        .extent([[0, 0], [mapWidth * scaleFactor, mapWidth * scaleFactor]])
        .on("end", brushend);

    svg.append("g")
        .attr("class", "brush")
        .call(brush);
    
    var updateFunction = function (resultSet) {
        allData = JSON.parse(resultSet)
        var barData = allData[1]
        var pieData = allData[2]
        var mapData = allData[3]
        var timeLineData = allData[4]
        
        drawBarChart(barData)
        createPieChart1(allData[0])
        createPieChart2(pieData)
        const parsedData = JSON.parse(timeLineData);
        drawTimeline(parsedData)
        };
    

    function brushend() {
        const selection = d3.brushSelection(d3.select(".brush").node());
        
        if (selection) {
            seasonCheckboxes.forEach(checkbox => checkbox.checked = true);
            carTypeCheckboxes.forEach(checkbox => checkbox.checked = true);
            
            const sqlString = "SELECT * FROM sensor_data WHERE x >= " + selection[0][0]*2 +
            " AND x <= " + selection[1][0]*2 + " AND y >=" + selection[0][1]*2 + " AND y<=" +  selection[1][1]*2 + ";"
            executeQuery (sqlString, updateFunction)
        }else{
            executeQuery(constructSQL(), updateFunction)
        }
        }
    
}