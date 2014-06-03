define(['jquery'], function($){

    var Marker = function(){
        this.description = '';
        this.location = {
            latitude: 0,
            longitude: 0
        };
        this.groupId = 0;
        this.id = 0;

    };
    Marker.prototype.save = function(){
        $.ajax().done(function(){});
    }
});
