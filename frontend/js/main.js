var seasons = ['spring', 'summer', 'fall', 'winter'], carType = ['3', '1', '2', '2P', '4', '5', '6'];
var allData = [];

const seasonCheckboxes = document.querySelectorAll('input[name="season"]');
const carTypeCheckboxes = document.querySelectorAll('input[name="car_type"]');

seasonCheckboxes.forEach(checkbox => {
	checkbox.addEventListener('change', event => {
		if(checkbox.checked){
			seasons.push(checkbox.value);
			executeQuery (constructSQL(), checkboxupdate);
		}else{
			var index = seasons.indexOf(checkbox.value);
            if (index > -1) {
            	seasons.splice(index, 1);
            	executeQuery (constructSQL(), checkboxupdate);
			}
		}
	});
});

carTypeCheckboxes.forEach(checkbox => {
	checkbox.addEventListener('change', event => {
		if(checkbox.checked){
			if(checkbox.value == "ranger"){
			carType.push('2P');}
			else{
			carType.push("1");
			carType.push("2");
			carType.push("3");
			carType.push("4");
			carType.push("5");
			carType.push("6");
			}
			executeQuery (constructSQL(), checkboxupdate);
		}else{
			if(checkbox.value == "ranger"){
				carType = ['3', '1', '2', '4', '5', '6'];}
			else{
				carType = ['2P'];
				}
			executeQuery (constructSQL(), checkboxupdate)
		}
	});
});

seasonCheckboxes.forEach(checkbox => checkbox.checked = true);
carTypeCheckboxes.forEach(checkbox => checkbox.checked = true);

var checkboxupdate = function (resultSet) {
	allData = JSON.parse(resultSet)

	var barData = allData[1]
	var pieData = allData[2]
	var mapData = allData[3]
	var timeLineData = allData[4]

	drawBarChart(barData)
	createPieChart1(allData[0])
	createPieChart2(pieData)
	drawDensityMap(mapData)
	const parsedData = JSON.parse(timeLineData);
	drawTimeline(parsedData)
}

var myFunction = function (resultSet) {
	resultSet = JSON.parse(resultSet)
		draw(resultSet);
}

function draw(allData) {
	// Instantiate visualization objects
	// console.log("all", allData)
	var barData = allData[1]
	var pieData = allData[2]
	var mapData = allData[3]
	var timeLineData = allData[4]

	drawBarChart(barData)
	createPieChart1(allData[0])
	createPieChart2(pieData)
	drawDensityMap(mapData)
	const parsedData = JSON.parse(timeLineData);
	drawTimeline(parsedData)

	// const parsedData = JSON.parse(allData[4]);
}


function httpPostAsync(url, data, callback) {
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.onreadystatechange = function () {
		if (xmlHttp.readyState == 4 && xmlHttp.status == 201) {
			callback(xmlHttp.responseText);
		}
	}
	xmlHttp.open("POST", url, true); // true for asynchronous
	xmlHttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
	xmlHttp.send(data)
}


// the following function gets a sql query, sends it to backend 
var executeQuery = function (queryString, functionCB) {
	httpPostAsync("http://localhost:6969/sqlquery",
		JSON.stringify(queryString),
		functionCB)
}


var constructSQL = function () {

	var sqlString = "select * from sensor_data " +
     "where season IN ('" + seasons.join("','") + "')"
     + " AND car_type IN ('" + carType.join("','") + "');"

	// The following line will print the SQL query to the html page
	// document.getElementById('sql').innerHTML = sqlString.toString();

	return sqlString;
}

executeQuery(constructSQL(), myFunction)