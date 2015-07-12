var map;
var marker;
var markers = [];

function initialize() {

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


    clearMarkers(markers);
    markers = placeMarkers(lat,lng, markers);
    var count = getFarmersMarkets(lat,lng);

    // We call the codeLatLng function to get the zip code from the 
    // codeLatLng(latlng).then(function(zipCode){
    //     console.log("Zip code returned is: " + zipCode);
    // }, function(err){
    //     console.log("Not working", err);
    // });

        

    infowindow.setContent('<div><strong>' + place.name + '</strong><br>' + address +
     '<br>' + count);
    infowindow.open(map, marker);
});
}

function clearMarkers(){

  for (var i = 0; i < markers.length; i++){
    markers[i].setMap(null);
}
markers = [];
}

function placeMarkers(lat, lng, markers) {

  var marketList = [
  ['Market Divis', lat * 1.0001, lng * 1.0001],
  ['Market Kongo', lat * 1.00015, lng * 1.00015],
  ['Market Bongo', lat * 1.00017, lng * 1.00017],
  ['Market China', lat * 1.00019, lng * 1.00019],
  ['Market Indo', lat * 1.00021, lng * 1.00021]
  ];

  for (var i = 0; i < marketList.length; i++) {
    var market = marketList[i];
    var marketLatLng = new google.maps.LatLng(market[1], market[2]);
    var marker = new google.maps.Marker({
        position: marketLatLng,
        map: map,
        title: market[0]
    });
    markers.push(marker);
}
console.log(markers);

return markers;
}

// function codeLatLng(latlng) {

//     var deferred = $.Deferred(),
//         geocoder = new google.maps.Geocoder();

//     var latlngStr = latlng.split(',', 2);
//     var lat = parseFloat(latlngStr[0]);
//     var lng = parseFloat(latlngStr[1]);
//     latlng = new google.maps.LatLng(lat, lng);

//     geocoder.geocode({'latLng': latlng}, function(results, status) {
//         if (status == google.maps.GeocoderStatus.OK) {
//             if (results[0]) {
//                 filterZip = results[0].address_components.filter(function(e){
//                     return (e.types[0] === 'postal_code');
//                 });
//                 console.log("Zip code in function: " + filterZip[0].short_name)
//                 deferred.resolve(filterZip[0].short_name);
//             } else {
//                 deferred.reject(console.log('No results found'));
//             }
//         } else {
//             deferred.reject(console.log('Geocoder failed due to: ' + status));
//         }
//     });
//     return deferred.promise();
// }

// function getFarmersMarkets(zip) {
//     $.ajax({
//         url: wikiUrl,
//         dataType: 'jsonp',
//         success: function ( response ) {
//             var articleList = response[1];
//             console.log("wikipedia: " + articleList);

//             for(var i = 0; i < articleList.length; i++){
//                 var articleStr = articleList[i];
//                 var url ='http;//en.wikipedia.org/wiki/' + articleStr;
//                 $wikiElem.append('<li><a href="' + url + '">' +
//                     articleStr + '</a></li>'); 
//             }
//             clearTimeout(wikiRequestSlow);
//             clearTimeout(wikiRequestTimeout);

//         }
//     });
// }


function getFarmersMarkets(lat,lng) {
    var count;
    // or
    // function getResults(lat, lng) {
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        // submit a get request to the restful service zipSearch or locSearch.
        // url: "http://search.ams.usda.gov/farmersmarkets/v1/data.svc/zipSearch?zip=" + zip,
        // or
        url: "http://search.ams.usda.gov/farmersmarkets/v1/data.svc/locSearch?lat=" + lat + "&lng=" + lng,
        dataType: 'jsonp',
        success: function (response){
            count = response.length;
            console.log(response);
        }
    });
    return count;
    // console.log(searchResultsHandler)
}
// //iterate through the JSON result object.
// function searchResultsHandler(searchResults) {
//     for (var key in searchresults) {
//         alert(key);
//         var results = searchresults[key];
//         for (var i = 0; i < results.length; i++) {
//             var result = results[i];
//             for (var key in result) {
//                 //only do an alert on the first search result
//                 if (i == 0) {
//                     alert(result[key]);
//                 }
//             }
//         }
//     }
// }



google.maps.event.addDomListener(window, 'load', initialize);
