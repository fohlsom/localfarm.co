var geocoder;
var map;
var marker;
var place;

function initialize() {

  geocoder = new google.maps.Geocoder();

  var mapOptions = {
    center: new google.maps.LatLng(37.6052668,-122.2342566),
    zoom: 10,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };

  var options = {
    types: ['(regions)'],
    componentRestrictions: {country: 'us'}
  };

  map = new google.maps.Map(document.getElementById('map-canvas'),
    mapOptions);

  var input = /** @type {HTMLInputElement} */(
      document.getElementById('pac-input'));

  map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

  var autocomplete = new google.maps.places.Autocomplete(input, options);
  autocomplete.bindTo('bounds', map);

  var infowindow = new google.maps.InfoWindow();
  marker = new google.maps.Marker({
    map: map,
    anchorPoint: new google.maps.Point(0, -29)
  });


  google.maps.event.addListener(autocomplete, 'place_changed', function() {
    infowindow.close();
    marker.setVisible(false);
    place = autocomplete.getPlace();
    // We remove the error class for proper results. 
    $( "input" ).removeClass("controls-error");
    // We add the error class for proper results. 
    if (!place.geometry) {
      console.log("Fel");
      $( ".controls" ).toggleClass("controls-error");
      return;
    }

    // If the place has a geometry, then present it on a map.
    if (place.geometry.viewport) {
      map.fitBounds(place.geometry.viewport);
    } else {
      map.setCenter(place.geometry.location);
      map.setZoom(17);  // Why 17? Because it looks good.
    }
    marker.setIcon(/** @type {google.maps.Icon} */({
      url: place.icon,
      size: new google.maps.Size(71, 71),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(17, 34),
      scaledSize: new google.maps.Size(35, 35),
      position: new google.maps.LatLng(lat,lng)
    }));
    marker.setPosition(place.geometry.location);
    marker.setVisible(true);
    
    var address = '';
    if (place.address_components) {
      address = [
        (place.address_components[0] && place.address_components[0].short_name || ''),
        (place.address_components[1] && place.address_components[1].short_name || ''),
        (place.address_components[2] && place.address_components[2].short_name || '')
      ].join(' ');
    }

    var lat = place.geometry.location["A"];
    var lng = place.geometry.location["F"];
    var latlng = lat + ", " + lng;
    console.log(lat + ", " + lng);
    
    placeMarkers(lat,lng);

    // We call the codeLatLng function to get the zip code from the 
    codeLatLng(latlng);
    infowindow.setContent('<div><strong>' + place.name + '</strong><br>' + address);
    infowindow.open(map, marker);
  });
}

function placeMarkers(lat, lng) {

  lat = lat * 1.001
  lng = lng * 1.001

  var markerPosition = new google.maps.LatLng(lat, lng);

  console.log("hander detta?")

  var marker1 = new google.maps.Marker({
    position: markerPosition,
    title:"Hello World!"
  });

  // To add the marker to the map, call setMap();
  marker1.setMap(map);
  console.log("marker lat: " + lat);
  console.log("marker lng: " + lng);


}

function codeLatLng(latlng) {
  var zipCode;
  var latlngStr = latlng.split(',', 2);
  var lat = parseFloat(latlngStr[0]);
  var lng = parseFloat(latlngStr[1]);
  latlng = new google.maps.LatLng(lat, lng);
  geocoder.geocode({'latLng': latlng}, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      if (results[0]) {
        var filterZip = results[0].address_components.filter(function(e){
          return (e.types[0] === 'postal_code');
        });
        zipCode = filterZip[0].short_name;
        console.log("Zip code is: " + zipCode);
      } else {
        console.log('No results found');
      }
    } else {
      console.log('Geocoder failed due to: ' + status);
    }
  });
}



google.maps.event.addDomListener(window, 'load', initialize);
