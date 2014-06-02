

var MarkersGroup = require('../models/group-model'),
    Marker = require('../models/marker-model.js'),
    date;

var MarkersController = function(){
    console.log('new controller created');
};


MarkersController.saveGroup = function(request, response){

    var newGroup = new Marker({
        name : request.param('name'),
        id : undefined,
        user:'anonymous'
    });
    newGroup.id = newGroup._id;
    newGroup.save(function(err, group){
        if(err){
            console.error(err);
            response.status(501);
            response.send('Did not saved');
            return false;
        }
        if(group){
//            marker.id = marker._id;
            response.send(group);
        }

    });

};

MarkersController.uploadGroups = function(request, response){

    MarkersGroup.find({}, function(err, groups){
        if(err){
            console.error(err);
            response.status(501);
            response.send('Collection not found');
            return false;
        }
        if(groups){
            response.send(groups);
        }
    });

};

MarkersController.uploadSpecifiedGroup = function (request, response){
    var markerGroup = {};
    date = (new Date()).toTimeString();
    console.log(date);

    MarkersGroup.find({'id' : request.param('groupId')}, function(err, group){

        if(err){
            console.error(err);
            response.status(501);
            response.send('Collection not found');
            return false;
        }
        if(group){
            markerGroup = group;
            Marker.find({'groupId' : markerGroup.id}, function(err, markers){
                if(err){
                    console.error(err);
                    response.status(501);
                    response.send('Collection not found');
                    return false;
                }
                if(markers){
                    markerGroup.markers = markers;
                    response.send(markerGroup);
                }
            });
//            response.send(group);
        }

    });
};


MarkersController.uploadUngroupedMarkers = function(request, response){

    Marker.find({
        groupId : 'undefined'
    }, function(err, markers){
        if(err){
            console.error(err);
            response.status(404);
            response.send('Collection not found');
            return false;
        }
        if(markers){
            response.send(markers);
        }
    });

};


MarkersController.updateMarker = function(request, response){

    console.log(request.param('id'));

};



MarkersController.saveMarker = function(request, response){

    var newMarker = new Marker({
        name : request.param('name'),
        description : request.param('description'),
        id : undefined,
        groupId: request.param('groupId'),
        location: request.param('location'),
        user:'anonymous'
    });
    newMarker.id = newMarker._id;
    newMarker.save(function(err, marker){
        if(err){
            console.error(err);
            response.status(501);
            response.send('Did not saved');
            return false;
        }
        if(marker){
//            marker.id = marker._id;
            response.send(marker);
        }

    });

};


module.exports = MarkersController;
