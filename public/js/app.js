(function($){

    var mapOptions = {
        center: new google.maps.LatLng(49.4333300, 32.0666700),
        zoom: 13,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    },
    map = new google.maps.Map($('.map-container')[0], mapOptions);
//    $('.active-edit').css('active-edit');

    $('.btn-slide').on('click', function(event){
        var slideContent = $(this).parent().find('.slide');
        if(slideContent.hasClass('hidden')){
            slideContent.removeClass('hidden')
        }
        else{
            slideContent.addClass('hidden')
        }
    });

    google.maps.event.addListener(map, 'click', function(event) {
        $('#marker-latitude')[0].value = event.latLng.k;
        $('#marker-longitude')[0].value = event.latLng.A;
    });
})(jQuery);
