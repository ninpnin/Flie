/* Muuttujien alustusta */

var map = null;
var directionsService = null;
var directionsDisplay = null;
var berlin = null;

var geocoder = null;

var start = null;
var end = null;

var line = null;
var route = null;

//Globaalit muuttujat viimeisimmän reitin pituudelle
var aerialDistance = null;
var drivenDistance = null;


/* Sivun ja kartan alustusta */
//Alusta kartta yms
function initMap() {

  //Reittiohjeet
  directionsService = new google.maps.DirectionsService;
  directionsDisplay = new google.maps.DirectionsRenderer;

  map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 52.516667, lng: 6.55 },
    zoom: 4,
    disableDefaultUI: true,
    //Ks. tyylit.js
    styles: mapStyles
	});
  
  //Tee kartasta staattinen
	map.setOptions({draggable: false});
  map.setOptions({keyboardShortcuts: false});
  map.setOptions({scrollwheel: false});

  directionsDisplay.setOptions( { suppressMarkers: true } );
  initService();
  setCarInfoVisibility(false);
  setPlaneInfoVisibility(false);

}

function initService() {
  //Lisää objekti paikkojen hakemiseen kartalta
  geocoder = new google.maps.Geocoder();
  console.log("Geocoder: " + geocoder);
}

//Apufunktio kartan keskittämiseen
function centerMap() {
  if (map != null) {
    map.panTo(new google.maps.LatLng(52.516667, 6.55));
    map.setZoom(4);
  }
}
//Kytke keskittäminen ikkunan koon muuttamiseen
window.addEventListener('resize', function(event){ centerMap(); });

/* Reitin hakeminen */
//Tyhjennä reitti ja siihen liittyvät muuttujat uutta hakua varten
function clearRoute() {
  //Tyhjennä muuttujat
  aerialDistance = null;
  drivenDistance = null;
  start = null;
  end = null;
  if (line != null) line.setMap(null);
  if (directionsDisplay != null) {
    directionsDisplay.setMap(null);
  }

}

function keyPressed(e) {
  var event = e || window.event;
  var charCode = event.which || event.keyCode;
  if (charCode == '13')
    searchRoute();
}

//Suorita haku kahden kaupungin välillä
function searchRoute() {
  //Poista markkerit
  clearRoute();
  var fromField = document.getElementById("start").value;
  //Aseta lähtöpaikan sijainti
  codeAddress(fromField, true);
  var toField = document.getElementById("end").value;
  //Aseta määränpään sijainti
  codeAddress(toField, false);

}

//Hae paikka sen nimen perusteella
function codeAddress(address, isStart) {
  geocoder.geocode( {address:address}, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      //place a marker at the location
      var point = results[0].geometry.location;
      if (isStart)
        start = point;
      else 
        end = point;
      //Jos kumpikin paikka on haettu, jatka reittien hakemiseen
      getBothRoutes();

    } else {
      alert("Paikkaa '" + address + "' ei löytynyt.");
      start = null;
      end = null;
   }
  });
}

//Kutsu lento- ja ajoreitin laskevia funktioita
function getBothRoutes() {
  if (start != null & end != null) {
    drawLine(start, end);
    calculateAndDisplayRoute(directionsService, directionsDisplay);
    document.getElementById("resultBox").style.visibility = "visible";

  } else {
    document.getElementById("resultBox").style.visibility = "hidden";
  }
}

//Hae ajoreitti
function calculateAndDisplayRoute(directionsService, directionsDisplay) {
  directionsService.route({
    origin: document.getElementById('start').value,
    destination: document.getElementById('end').value,
    travelMode: 'DRIVING'
  }, function(response, status) {
    if (status === 'OK') {
      console.log("OK...");
      directionsDisplay.setDirections(response);
      //Laske reitin kokonaispituus
      var routeDistance = 0.0
      for (x in response.routes[0].legs) {
        routeDistance += response.routes[0].legs[x].distance.value / 1000;
      }
      drivenDistance = routeDistance;
      directionsDisplay.setMap(map);
    } else {
      drivenDistance = null;
    }
    
    centerMap();
    printResults();

  });
}

//Piirrä lentoreitti kahden kaupungin välille
function drawLine(p0, p1) {
  //Poista edellinen reitti kartalta
  var flightPlanCoordinates = [ p0, p1 ];
  //Luo polku
  var flightPath = new google.maps.Polyline({
    path: flightPlanCoordinates,
    geodesic: true,
    strokeColor: '#980000',
    strokeOpacity: 0.75,
    strokeWeight: 5
  });
  //Aseta polku kartalle ja muuttujaan
  flightPath.setMap(map);
  line = flightPath;
  showDistance();
}

//Hae linnuntie-etäisyys kahden kaupungin välillä
function showDistance() {
  if (start != null && end != null) {
    console.log("Search distance...");
    var currentDistance = google.maps.geometry.spherical.computeDistanceBetween(start, end) / 1000.0;
    aerialDistance = currentDistance;
  }
}

//Tulosta tulokset konsoliin
function printResults() {
    console.log("DRIVEN/AERIAL: " + (drivenDistance/aerialDistance));
    console.log("AERIAL DISTANCE: " + aerialDistance);
    console.log("DRIVEN DISTANCE: " + (drivenDistance));

    var fuel = flightFuel(aerialDistance); // etäisyys * 1.9l/100km / 100km / 0.85 täyttöaste
    var co2 = fuel * 2.2;
    console.log(Math.floor(10*fuel)/10 + "l bensaa " + Math.floor(aerialDistance) + " km");
    console.log("CO2-päästöjä: " + Math.floor(10*co2)/10+ " kg ("+ Math.floor(20*co2)/10+ "kg jos edestakainen matka)")

    var carFuel = driveFuel(drivenDistance);//drivenDistance * 6 / 100 / 1.58;
    var carCo2 = carFuel * 2.2;

    var flightComparison = getComparison(co2 * 2);
    document.getElementById("planeStats").innerHTML = " 🛫 " + round(co2 * 2) + "kg " + anno(co2 * 2);
    document.getElementById("planeInfo").innerHTML = "Vastaa : <br>" + flightComparison[0] + "<br>"
    + flightComparison[1] + "<br>"
    + flightComparison[2] + "<br>"
    + flightComparison[3] + "<br>";

    var carComparison = getComparison(carCo2 * 2);
    document.getElementById("carStats").innerHTML = " 🚗 " + round(carCo2 * 2) + "kg " + anno(carCo2 * 2);
    document.getElementById("carInfo").innerHTML = "Vastaa : <br>" + carComparison[0] + "<br>"
    + carComparison[1] + "<br>"
    + carComparison[2] + "<br>"
    + carComparison[3] + "<br>";

    if (!carDefault)
      carDefault = true;
    if (!planeDefault)
      planeDefault = true;
}

function setCarInfoVisibility(visible) {
  var divOne = document.getElementById('carInfo');
  if (visible) {
    divOne.style.display = 'block';
  } else {
    divOne.style.display='none';
  }
}

function toggleCarInfoVisibility() {
  var divOne = document.getElementById("carInfo");
  var visibility = divOne.style.display;
  if (visibility != 'block') {
    divOne.style.display = 'block';
    console.log(divOne.style.display);
  } else {
    divOne.style.display = 'none';
  }
}

function setPlaneInfoVisibility(visible) {
  var divOne = document.getElementById('planeInfo');
  if (visible)
    divOne.style.display = 'block';
  else
    divOne.style.display='none';
}

function togglePlaneInfoVisibility() {
  var divOne = document.getElementById("planeInfo");
  var visibility = divOne.style.display;
  if (visibility != 'block') {
    divOne.style.display = 'block';
    console.log(divOne.style.display);
  } else {
    divOne.style.display = 'none';
  }
}

//Funktiot oikean alalaidan korttien "kääntämistä" varten; oletusnäkymässä info
//ja toisessa näkymässä täyttöasteen säätäminen

var planeDefault = true;
var carDefault = true;

var planeOptionElement = null;
function setPlaneOption() {
  var planeInfoElement = document.getElementById("planeInfo");
  if (planeOptionElement == null) { 
    var newHtml = "<div>Tämä on laskettu moderneille lentokoneille, kuten uudelle A320:lle tai 737 MAX:lle";
    newHtml = newHtml +
    "<select id='planeOccupancy' onchange='setPlaneOccupancy();' >" + 
      "<option value='1.0'>100%</option>" +
      "<option value='0.85' selected='selected'>85%</option>" +
      "<option value='0.75'>75%</option>" +
      "<option value='0.50'>50%</option>" +
    "</select></div>";
    planeInfoElement.innerHTML = newHtml;
    planeOptionElement = planeInfoElement.firstChild;
  } else {
    planeInfoElement.innerHTML = "";
    planeInfoElement.appendChild(planeOptionElement);
  }
}

function flipPlane() {
	console.log("Plane card flipped");
	planeDefault = !planeDefault;

	if (!planeDefault) {
    setPlaneOption();
	} else {
		printResults();
	}
  console.log("info visible: " + planeDefault)

}

var carOptionElement = null;
function setCarOption() {
  if (carOptionElement == null) { 
    var newHtml = "<div> Tämä on laskettu keskimääräiselle 2016 ostetulle autolle. Täyttöaste:";
    newHtml = newHtml +
    "<select id='carOccupancy' onchange='setCarPersons();'>" + 
      "<option value='4'>4hlö</option>" +
      "<option value='3'>3hlö</option>" +
      "<option value='2'>2hlö</option>" +
      "<option value='1.58' selected='selected'>1.58hlö (keskiarvo)</option>" +
      "<option value='1'>1hlö</option>" +
    "</select></div>";
    document.getElementById("carInfo").innerHTML = newHtml;
    carOptionElement = document.getElementById("carInfo").firstChild;
  } else {
    document.getElementById("carInfo").innerHTML = "";
    document.getElementById("carInfo").appendChild(carOptionElement);
  }
}

function flipCar() {
	console.log("Car card flipped,");
	carDefault = !carDefault

	if (!carDefault) {
    setCarOption()
	} else {
		printResults();
	}
	console.log("Info visible: " + carDefault)
}
