var map;
var marker;
var markers = [];
var infowindow = null;
var timer;
var error_message;

function initialize() {

    getWindowHeight();

    var mapOptions = {
        center: new google.maps.LatLng(37.6052668,-122.2342566),
        zoom: 10,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeControl: false
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

    // var legend = document.getElementById('legend');
    // map.controls[google.maps.ControlPosition.TOP_RIGHT].push(legend);

    var autocomplete = new google.maps.places.Autocomplete(input, options);

    marker = new google.maps.Marker({
        map: map,
        anchorPoint: new google.maps.Point(0, -29)
    });


    google.maps.event.addListener(autocomplete, 'place_changed', function() {
        place = autocomplete.getPlace();
        
        // We remove the error class for proper results. 
        $( "input" ).removeClass("controls-error");

        // We add the error class for proper results. 
        if (!place.geometry) {
            console.log("Fel");
            $( ".controls" ).toggleClass("controls-error");
            document.getElementById("pac-input").value = "";
            $("input").attr("placeholder", "Select a location from the drop-down list.");
            return;
        }

        console.log(place.geometry);
        var lat = place.geometry.location["H"];
        var lng = place.geometry.location["L"];
        var latlng = lat + ", " + lng;
        console.log("Map is centered at: " + lat + ", " + lng + ".");

        clearMarkers(markers);
        removeSideBar();
        
        google.maps.event.addListener(map, "click", function(){
            infowindow.close();
            $('a.list-group-item').removeClass('active');
        });
        

        getFarmersMarkets(lat,lng).then(function (results) {
            var fmList = [];
            var fmMList = [];

            var marketListLength = results.results.length;

            if (results.results[0].id === "Error"){
                error_message = "There is a problem with the USDA API at the moment. Please try again later.";
                showAlert(error_message);
            };

            console.log("Farmersmarket list(" + marketListLength + ") has been returned.");

            for (var key in results) {
                fmMList = results[key];
                for (var i = 0; i < fmMList.length; i++) {

                    getDetails(fmMList[i].id, fmMList[i].marketname).then(function (results, id, marketname){
                        for (var key in results) {
                            var fmDList = results[key];
                            fmDList['id'] = id;
                            fmDList['marketname'] = marketname

                            var re = /(\d{1,2}[.]\d+)%[A-Z0-9]{2}%[A-Z0-9]{2}([-+]\d{1,3}[.]\d+)/;
                            var latlng = fmDList['GoogleLink'].match(re);
                            fmDList['lat'] = latlng[1];
                            fmDList['lng'] = latlng[2];
                        }

                    fmList.push(fmDList);

                    if (fmList.length === marketListLength){

                        markers = placeMarkers(lat,lng, markers, fmList);

                    }
                    }, function (error){
                        console.log("No market details returned. ", error);
                        
                        error_message = "No info about the farmers markets were returned. Strange...";
                        showAlert(error_message);
                    });
                }
            }
        }, function (error) {
            console.error("Farmersmarket list not returned. Error: ", error);
            error_message = "No farmers markets were returned. Where do you live?";
            showAlert(error_message);
        });
    });
}

function createMarkerButton(marker) {

    //Creates a sidebar button
    var ul = document.getElementById("marker_list");
    var a = document.createElement("a");
    a.className = "list-group-item";
    a.setAttribute("id", "list-item");
    var title = marker.getTitle();
    a.innerHTML = title
    ul.appendChild(a);

    highlightSideBar(a,marker);

}

function highlightSideBar(a,marker) {

    //Trigger a click event to marker when the button is clicked.
    google.maps.event.addDomListener(a, "click", function(){
        google.maps.event.trigger(marker, "click");
        $('a.list-group-item').removeClass('active');
        $(this).addClass('active');
    });

    console.log(a);

}

$(document).ready(function ($) {
        $('#tabs').tab();
    });


function clearMarkers(){
    for (var i = 0; i < markers.length; i++){
        markers[i].setMap(null);
    }
    markers = [];
}

function removeSideBar(){
    $( ".list-group-item" ).remove();
}

function placeMarkers(lat, lng, markers, fmList) {

    console.log(fmList);
    var bounds = new google.maps.LatLngBounds();

    for (var i = 0; i < fmList.length; i++) {
        
        var market = fmList[i];

        if (market['marketname'] == '') {
            market['marketname'] = "Information missing."
        }
        if (market['Address'] == '') {
            market['Address'] = "Address missing."
        }
        if (market['Products'] == '') {
            market['Products'] = "Product information missing."
        }
        if (market['Schedule'] == ' <br> <br> <br> ') {
            market['Schedule'] = "Schedule missing."
        }        
        var marketLatLng = new google.maps.LatLng(market['lat'], market['lng']);
        var contentString = '<h4>' + market['marketname'] + '</h4>' +
                            '<dl class="dl-horizontal"><dt>Address</dt><dd>' + market['Address'] + '</dd>' +
                            '<dt>Products</dt><dd>' + market['Products'] + '</dd>' +
                            '<dt>Schedule</dt><dd>' + market['Schedule'] + '</dd></dl>'
        var marker = new google.maps.Marker({
            position: marketLatLng,
            map: map,
            title: market['marketname'],
            content: contentString
        });


        infowindow = new google.maps.InfoWindow({
            content: contentString
        });

        createMarkerButton(marker);
        google.maps.event.addListener(marker, 'click', function () {
            // where I have added content to the marker object.
            infowindow.setContent(this.content);
            infowindow.open(map, this);
        });

        bounds.extend(marker.getPosition());

        markers.push(marker);
    }

    map.fitBounds(bounds);
    map.setCenter(bounds.getCenter());
    
    return markers;

}

function getFarmersMarkets(lat,lng) {

    var deferred = $.Deferred();

    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: "http://search.ams.usda.gov/farmersmarkets/v1/data.svc/locSearch?lat=" + lat + "&lng=" + lng,
        dataType: 'jsonp',
    }).then(function(data){
        deferred.resolve(data);
    });
    return deferred.promise();
}


function getDetails(id, marketname) {

    var deferred = $.Deferred();

    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        // submit a get request to the restful service mktDetail.
        url: "http://search.ams.usda.gov/farmersmarkets/v1/data.svc/mktDetail?id=" + id,
        dataType: 'jsonp',
    }).then(function(data){
        deferred.resolve(data, id, marketname);
    });
    return deferred.promise();
}

function getWindowHeight() {
    $(window).resize(function () {
        var h = $(window).height(),
        offsetTop = 60; // Calculate the top offset
        offsetBottom = 130;

        $('#map-canvas').css('height', (h - offsetTop));
        $('.tab-content').css('height', (h - offsetBottom));
    }).resize();
}

function showAlert(error_message) {

    $( ".error_message" ).append( $( "<div class='alert alert-warning " + 
        "alert-dismissible fade in' role='alert'><button type='button'" +
        "class='close' data-dismiss='alert' aria-label='Close'>" +
        "<span aria-hidden='true'>×</span></button><p><strong>Oops! </strong>" +
         error_message + "</p></div>"
    ));
}



google.maps.event.addDomListener(window, 'load', initialize);