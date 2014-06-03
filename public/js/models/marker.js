//
define(['backbone'], function(Backbone){

    var Marker = Backbone.Model.extend({
        url: '/marker'
    });

    return Marker;
});