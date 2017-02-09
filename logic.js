var map = null;
var directionsService = null;
var directionsDisplay = null;
var berlin = null;

var infowindow;
var geocoder = null;

var start = null;
var end = null;

var markers = [];
var line = null;
//Alusta kartta yms
function initMap() {

  //Reittiohjeet
  directionsService = new google.maps.DirectionsService;
  directionsDisplay = new google.maps.DirectionsRenderer;
  //Itse kartta
  map = new google.maps.Map(document.getElementById('map'), {
  center: {
  	lat: 52.516667, lng: 6.55
  },
  zoom: 4,
  disableDefaultUI: true,

  //Ks. tyylit.js
  styles: mapStyles
	});
  
  //Tee kartasta staattinen
	map.setOptions({draggable: false});
  map.setOptions({keyboardShortcuts: false});
  map.setOptions({scrollwheel: false});

  //zmap.disableScrollWheelZoom();
  directionsDisplay.setMap(map);

  initService();
}

function initService() {
  //Lisää objekti paikkojen hakemiseen kartalta
  geocoder = new google.maps.Geocoder();
  console.log("GEOCODER: " + geocoder);

}

function keyPressed(e) {
  var event = e || window.event;
  var charCode = event.which || event.keyCode;

  if ( charCode == '13' ) {
    // Enter pressed
    searchRoute();
    return false;
  }
}

//Apufunktio kartan keskittämiseen
function centerMap() {
  //console.log("Center map");
  if (map != null) {
    map.panTo(new google.maps.LatLng(52.516667, 6.55));
    map.setZoom(4);
  }

}

//Kytke keskittäminen ikkunan koon muuttamiseen
window.addEventListener('resize', function(event){
  centerMap();
});

//Reitin hakeminen
function calculateAndDisplayRoute(directionsService, directionsDisplay) {
  directionsService.route({
    origin: document.getElementById('start').value,
    destination: document.getElementById('end').value,
    travelMode: 'DRIVING'
  }, function(response, status) {
    if (status === 'OK') {
      console.log("OK...");
      directionsDisplay.setDirections(response);
      centerMap();
    } else {
      window.alert('Directions request failed due to ' + status);
      centerMap();
    }
  });
}

function searchRoute() {
  //console.log("MOIKKA. PAINOIT JUURI ENTTERIÄ.");
  clearMarkers();
  var fromField = document.getElementById("start").value;
  console.log(fromField);
  //Aseta lähtöpaikan sijainti
  codeAddress(fromField, true);
  var toField = document.getElementById("end").value;
  //Aseta määränpään sijainti
  codeAddress(toField, false);
  calculateAndDisplayRoute(directionsService, directionsDisplay);

}

function showDistance() {
  if (start != null && end != null) {
    console.log("Search distance...");
    var currentDistance = google.maps.geometry.spherical.computeDistanceBetween(start, end) / 1000.0;
    var fuel = currentDistance * 1.9 / 100 / 0.85; // etäisyys * 1.9l/100km / 100km / 0.85 täyttöaste
    var co2 = fuel * 2.2;
    alert(Math.floor(10*fuel)/10 + "l bensaa " + Math.floor(currentDistance) + " km");
    alert("CO2-päästöjä: " + Math.floor(10*co2)/10+ " kg ("+ Math.floor(20*co2)/10+ "kg jos edestakainen matka)")
    getComparison(co2);

  }
}

function codeAddress(address, isStart) {

  geocoder.geocode( {address:address}, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      //place a marker at the location
      var point = results[0].geometry.location;
      var marker = new google.maps.Marker(
      {
          map: map,
          position: point
      });
      markers.push(marker);
      if (isStart)
        start = point;
      else 
        end = point;

      showDistance();
      drawLine(start, end);

    } else {
      alert("Paikkaa '" + address + "' ei löytynyt.");
      if (isStart)
        start = null;
      else
        end = null;
   }
  });
}

function clearMarkers() {
  for (x in markers){
    markers[x].setMap(null);
  }
  markers = [];
}

//Piirrä lentoreitti kahden kaupungin välille
function drawLine(p0, p1) {
  //Poista edellinen reitti kartalta
  if (line != null) line.setMap(null);
  var flightPlanCoordinates = [ p0, p1 ];
  //Luo polku
  var flightPath = new google.maps.Polyline({
    path: flightPlanCoordinates,
    geodesic: true,
    strokeColor: '#980000',
    strokeOpacity: 0.75,
    strokeWeight: 4
  });
  //Aseta polku kartalle ja muuttujaan
  flightPath.setMap(map);
  line = flightPath;
}