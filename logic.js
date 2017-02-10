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
}

function initService() {
  //Lisää objekti paikkojen hakemiseen kartalta
  geocoder = new google.maps.Geocoder();
  console.log("GEOCODER: " + geocoder);
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
    document.getElementById("hakukentta2").style.visibility = "visible";

  } else {
    document.getElementById("hakukentta2").style.visibility = "hidden";
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
      window.alert('Directions request failed due to ' + status);
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
    getComparison(co2);

    var carFuel = driveFuel(drivenDistance);//drivenDistance * 6 / 100 / 1.58;
    var carCo2 = carFuel * 2.2;

    document.getElementById("start2").innerHTML = " 🛫 " + round(co2 * 2) + "kg " + anno(co2 * 2);
    document.getElementById("end2").innerHTML = " 🚗 " + round(carCo2 * 2) + "kg " + anno(carCo2 * 2);


}