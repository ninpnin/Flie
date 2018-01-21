var bananaKg = 0.08;
var beefKg = 43.0;
var iPhone = 80.0;
var annual = 9500;

var planePerSeat = 1.9 / 100;
var planeOccupancy = 0.82;

var carPerSeat = 6 / (4 * 100);
var carOccupancy = 1;

function getComparison(emissions) {
	var kilosOfBeef = emissions / beefKg;
	var kilosOfBananas = emissions / bananaKg;
	var iPhones = emissions / iPhone;
	var annualPercentage = emissions / annual;

	var str1 = " " + round(kilosOfBeef) + " kiloa naudanlihaa.";
	var str2 = " " + round(kilosOfBananas) + " kiloa banaaneja.";
	var str3 = " " + round(iPhones) + " iPhonen tuottamista.";
	var str4 = round(annualPercentage * 100) + "% keskimääräisen suomalaisen vuosittaista päästöistä.";
	var array = [str1, str2 , str3, str4];

	return array;
}

function round(num) {
	return ("" + (Math.floor(10 * num) / 10));
}

function flightFuel(length) {
	var totalFuel = 0.0;
	if (length < 70) {
		totalFuel = length * 1.5 * planePerSeat / planeOccupancy;
	} else {
		totalFuel = length * planePerSeat / planeOccupancy;
		totalFuel += 70 * planePerSeat / planeOccupancy * 3;
	}
	return totalFuel;
}

function driveFuel(length) {
	console.log("Car occ " + carOccupancy);
	var totalFuel = 0.0;
	totalFuel = length * carPerSeat / carOccupancy;
	return totalFuel;
}

function anno(kg) {
	return "(" + round(kg / annual * 100) + "%)";
}

function setCarOccupancy(persons) {
	carOccupancy = persons / 4;
}

setCarOccupancy(1.58);

function setCarPersons() {
	var element = document.getElementById("carOccupancy");
	var persons = element.options[element.selectedIndex].value;
	setCarOccupancy(persons);
	//Vaihda näkyväksi
	toggleCarInfoVisibility();
	printResults();
}

function setPlaneOccupancy(persons) {
	var element = document.getElementById("planeOccupancy");
	var occupacy = element.options[element.selectedIndex].value;
	planeOccupancy = occupacy;
	//Vaihda näkyväksi
	toggleCarInfoVisibility();
	printResults();
	console.log("PLANE OCC " + planeOccupancy)

}

