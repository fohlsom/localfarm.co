var map;
var marker;
var markers = [];
var infowindow = null;
var timer;
var error_message;
var recentSearchesList = [];

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
        
        var lat = place.geometry.location.lat();
        var lng = place.geometry.location.lng();
        var latlng = lat + ", " + lng;
        console.log("Map is centered at: " + lat + ", " + lng + ".");

        clearMarkers(markers);

        showMarkerListHeader();
        
        recentSearches(place.formatted_address);
        
        removeSideBar();

        resetInputField()
        
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

                        placeMarkers(lat,lng, markers, fmList);

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

function createSidebarItem(marker) {
    //Creates a sidebar item
    var ul = document.getElementById("marker_list");
    var a = document.createElement("a");
    a.className = "list-group-item";
    a.setAttribute("id", "list-item");
    var title = marker.getTitle();
    a.innerHTML = title
    ul.appendChild(a);
    highlightSideBar(a,marker);

}

function resetInputField() {
    //Resets the input field after a search
    $('#pac-input').val('');
};

function showMarkerListHeader (){
    //Shows a header with the name of the location above the list of markets
    if ( $( "#marker_list_header" ).length ) {
        $( "#marker_list_header" ).html("Showing results for " + place.formatted_address);
        $( "#product_filter" ).html("<h5>Looking for something special? Use the filter.</h5><select id='product' onchange='filterMarkers(this.value);'><option value=''>Please select category</option><option value='Baked goods'>Baked goods</option><option value='Crafts and/or woodworking items'>Crafts and/or woodworking items</option><option value='Eggs'>Eggs</option></select>");
    }
};

function highlightSideBar(a,marker) {
    //Trigger a click event to marker when the sidebar item is clicked
    google.maps.event.addDomListener(a, "click", function(){
        google.maps.event.trigger(marker, "click");
        $('a.list-group-item').removeClass('active');
        $(this).addClass('active');
    });
    console.log(a);
}

function recentSearches(search) {
    //Populates the recent search list, shows last 10 searches
    if (recentSearchesList.length > 9){
        recentSearchesList.shift();
        recentSearchesList.push(search);
    } else {
        recentSearchesList.push(search);
    };
    var htmlString = "";
    for (var i = 0; i < recentSearchesList.length; i++) {
        htmlString += "<li>" + recentSearchesList[i] + "</li>";
    };
    $("#recent_searches_list").html(htmlString);
    console.log(recentSearchesList);
}

$(document).ready(function ($) {
    //Shows the result, filter and recent search tabs in the UI. 
        $('#tabs').tab();
    });


function clearMarkers(){
    //Clears the markers array
    for (var i = 0; i < markers.length; i++){
        markers[i].setMap(null);
    }
    markers = [];
}

function removeSideBar(){
    //Removes the sidebar
    $( ".list-group-item" ).remove();
}

function placeMarkers(lat, lng, markers, fmList) {
    //Places the markers on the map
    // console.log(fmList);
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
        marker = new google.maps.Marker({
            position: marketLatLng,
            map: map,
            title: market['marketname'],
            content: contentString,
            products: market['Products']
        });


        infowindow = new google.maps.InfoWindow({
            content: contentString
        });

        createSidebarItem(marker);
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

}


function filterMarkers () {
    var selectedProduct = document.getElementById("product").value;

    console.log(marker.products + ' FILTER');
    console.log(selectedProduct);

    for (i = 0; i < markers.length; i++) {
         marker = markers[i];
        // If is same selectedProduct or selectedProduct not picked
        if (marker.products.includes(selectedProduct) || selectedProduct.length === 0) {
            marker.setVisible(true);
        }
        // Categories don't match 
        else {
            marker.setVisible(false);
        }
    }

    
}



function getFarmersMarkets(lat,lng) {
    //Get list of farmers market from the USDA API.
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
    //Gets the details for each id returned in the getFarmersMarket function.
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
    //Gets the users widow height, used for dynamically setting the map height
    $(window).resize(function () {
        var h = $(window).height(),
        offsetTop = 60; // Calculate the top offset
        offsetBottom = 130;

        $('#map-canvas').css('height', (h - offsetTop));
        $('.tab-content').css('height', (h - offsetBottom));
    }).resize();
}

function showAlert(error_message) {
    //Shows alerts if there is an error
    $( ".error_message" ).append( $( "<div class='alert alert-warning " + 
        "alert-dismissible fade in' role='alert'><button type='button'" +
        "class='close' data-dismiss='alert' aria-label='Close'>" +
        "<span aria-hidden='true'>×</span></button><p><strong>Oops! </strong>" +
         error_message + "</p></div>"
    ));
}

google.maps.event.addDomListener(window, 'load', initialize);