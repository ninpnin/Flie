var map = null;
var directionsService = null;
var directionsDisplay = null;
var berlin = null;

var infowindow;
var geocoder = null;

var start = null;
var end = null;

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

  //Tyyliseikkoja; värit yms
  styles: [
    {elementType: 'geometry', stylers: [{color: '#242f3e'}]},
    {elementType: 'labels.text.stroke', stylers: [{color: '#242f3e'}]},
    {elementType: 'labels.text.fill', stylers: [{color: '#746855'}]},
    {
      featureType: 'administrative.locality',
      elementType: 'labels.text.fill',
      stylers: [{color: '#d59563'}]
    },
    {
      featureType: 'poi',
      elementType: 'labels.text.fill',
      stylers: [{color: '#d59563'}]
    },
    {
      featureType: 'poi.park',
      elementType: 'geometry',
      stylers: [{color: '#263c3f'}]
    },
    {
      featureType: 'poi.park',
      elementType: 'labels.text.fill',
      stylers: [{color: '#6b9a76'}]
    },
    {
      featureType: 'road',
      elementType: 'geometry',
      stylers: [{color: '#38414e'}]
    },
    {
      featureType: 'road',
      elementType: 'geometry.stroke',
      stylers: [{color: '#212a37'}]
    },
    {
      featureType: 'road',
      elementType: 'labels.text.fill',
      stylers: [{color: '#9ca5b3'}]
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry',
      stylers: [{color: '#746855'}]
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry.stroke',
      stylers: [{color: '#1f2835'}]
    },
    {
      featureType: 'road.highway',
      elementType: 'labels.text.fill',
      stylers: [{color: '#f3d19c'}]
    },
    {
      featureType: 'transit',
      elementType: 'geometry',
      stylers: [{color: '#2f3948'}]
    },
    {
      featureType: 'transit.station',
      elementType: 'labels.text.fill',
      stylers: [{color: '#d59563'}]
    },
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{color: '#ffffff'}]
    },
    {
      featureType: 'water',
      elementType: 'labels.text.fill',
      stylers: [{color: '#515c6d'}]
    },
    {
      featureType: 'water',
      elementType: 'labels.text.stroke',
      stylers: [{color: '#17263c'}]
    },
    {
      featureType: "administrative",
      elementType: "labels",
      stylers: [
        { visibility: "off" }
      ]
    },{
      featureType: "poi",
      elementType: "labels",
      stylers: [
        { visibility: "off" }
      ]
    },{
      featureType: "road",
      elementType: "labels",
      stylers: [
        { visibility: "off" }
      ]
    }
  ]
	});
  
  //Tee kartasta staattinen
	map.setOptions({draggable: false});
  map.setOptions({keyboardShortcuts: false});
  map.setOptions({scrollwheel: false});

  //zmap.disableScrollWheelZoom();

  var myPosition = {lat: 52.516667, lng: 13.38};
  var marker = new google.maps.Marker({
          position: myPosition,
          map: map,
          title: 'Hello World!'
  });

  initService();
}

function initService() {
/*
  infowindow = new google.maps.InfoWindow();
  var service = new google.maps.places.PlacesService(map);
  service.nearbySearch({
    location: helsinki,
    radius: 500,
    type: ['store']
  }, callback);
*/
  geocoder = new google.maps.Geocoder();
  console.log("GEOCODER: " + geocoder);

}

function callback(results, status) {
  if (status === google.maps.places.PlacesServiceStatus.OK) {
    for (var i = 0; i < results.length; i++) {
      createMarker(results[i]);
    }
  }
}

function createMarker(place) {
  var placeLoc = place.geometry.location;
  var marker = new google.maps.Marker({
    map: map,
    position: place.geometry.location
  });

  google.maps.event.addListener(marker, 'click', function() {
    infowindow.setContent(place.name);
    infowindow.open(map, this);
  });
}


//Apufunktio kartan keskittämiseen
function centerMap() {
  console.log("Center map");
  if (map != null)
    map.panTo(new google.maps.LatLng(52.516667, 6.55));
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
            directionsDisplay.setDirections(response);
          } else {
            window.alert('Directions request failed due to ' + status);
          }
        });
      }


$(document).keydown(function(e) {
    switch(e.which) {
        case 37: // left
        break;

        case 38: // up
        break;

        case 13: // enter
          searchRoute();
          break;

        case 40: // down
          console.log("MOIKKA. PAINOIT JUURI ALAS-NAPPULAA.");
          break;

        default: return; // exit this handler for other keys
    }
    e.preventDefault(); // prevent the default action (scroll / move caret)
});

function searchRoute() {
  //console.log("MOIKKA. PAINOIT JUURI ENTTERIÄ.");
  var fromField = document.getElementById("start").value;
  console.log(fromField);
  //Aseta lähtöpaikan sijainti
  codeAddress(fromField, true);
  var toField = document.getElementById("end").value;
  //Aseta määränpään sijainti
  end = codeAddress(toField, false);

}

function showDistance() {
  if (start != null && end != null) {
    console.log("Search distance...");
    var currentDistance = google.maps.geometry.spherical.computeDistanceBetween(start, end) / 1000.0;
    var fuel = currentDistance * 1.9 / 100;
    var co2 = fuel * 2.2;
    alert(Math.floor(10*fuel)/10 + "l bensaa " + Math.floor(currentDistance) + " km");
    alert("CO2-päästöjä: " + Math.floor(10*co2)/10+ " kg ("+ Math.floor(20*co2)/10+ "kg jos edestakainen matka)")

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
      if (isStart)
        start = point;
      else 
        end = point;
      showDistance();

    } else {
      alert("Paikkaa '" + address + "' ei löytynyt.");
      if (isStart)
        start = null;
      else
        end = null;
   }
  });
}