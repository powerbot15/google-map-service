define(['marker-model', 'backbone'], function(Marker, Backbone){

    var MarkerGroup = Backbone.Model.extend({
        model: Marker,
        url: '/group'
    });

    return MarkerGroup

});
