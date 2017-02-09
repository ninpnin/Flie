var bananaKg = 0.08;
var beefKg = 43.0;

function getComparison(emissions) {
	var kilosOfBeef = emissions / beefKg;
	console.log("Vastaa " + round(kilosOfBeef) + " kiloa naudanlihaa.");
}

function round(num) {
	return ("" + (Math.floor(10 * num) / 10));
}