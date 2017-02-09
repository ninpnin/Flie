var bananaKg = 0.08;
var beefKg = 43.0;
var iPhone = 80.0;
var annual = 9500;

var planePerSeat = 1.9 / 100;
var planeOccupancy = 0.82;

var carPerSeat = 6 / (4 * 100);
var carOccupancy = 1.58 / 4;

function getComparison(emissions) {
	var kilosOfBeef = emissions / beefKg;
	var kilosOfBananas = emissions / bananaKg;
	var iPhones = emissions / iPhone;
	var annualPercentage = emissions / annual;

	console.log("Vastaa " + round(kilosOfBeef) + " kiloa naudanlihaa.");
	console.log("Vastaa " + round(kilosOfBananas) + " kiloa banaaneja.");
	console.log("Vastaa " + round(iPhones) + " iPhonen tuottamista.");
	console.log(round(annualPercentage * 100) + "% keskimääräistä vuosittaista päästöistä.");

}

function round(num) {
	return ("" + (Math.floor(10 * num) / 10));
}

function flightFuel(length) {
	var totalFuel = 0.0;
	if (length < 100) {
		totalFuel = length * 2 * planePerSeat / planeOccupancy;
	} else {
		totalFuel = length * planePerSeat / planeOccupancy;
		totalFuel += 100 * planePerSeat / planeOccupancy * 3;
	}
	return totalFuel;
}

function driveFuel(length) {
	var totalFuel = 0.0;
	totalFuel = length * carPerSeat / carOccupancy;
	return totalFuel;
}