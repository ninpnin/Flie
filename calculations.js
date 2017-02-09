var bananaKg = 0.08;
var beefKg = 43.0;
var iPhone = 80.0;
var annual = 9500;

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