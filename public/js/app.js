(function($){

    var mapOptions = {
        center: new google.maps.LatLng(49.4333300, 32.0666700),
        zoom: 13,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    },
    map = new google.maps.Map($('.map-container')[0], mapOptions);

})(jQuery);
