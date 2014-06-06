

var MarkersGroup = require('../models/group-model'),
    Marker = require('../models/marker-model.js'),
    date;

var MarkersController = function(){
    console.log('new controller created');
};


MarkersController.prototype.saveGroup = function(request, response){
    console.log('save group request');
    var newGroup = new MarkersGroup({
        name : request.param('name'),
        id : null,
        markers: request.param('markers') || [],
        user:'anonymous'
    });
    newGroup.id = newGroup._id;
    newGroup.save(function(err, group){
        if(err){
            console.error(err);
            response.status(500);
            response.send('Did not saved');
            return false;
        }
        if(group){
//            marker.id = marker._id;
            response.send(group);
        }

    });

};

MarkersController.prototype.removeGroup = function(request, response){
    console.log('request remove group');
    MarkersGroup.remove({id : request.param('id')}, function(err){
        if(!err){
            response.send({answer: 'ok'});
        }
        else{
            response.send({answer: 'fail'});
        }
    });
};


MarkersController.prototype.updateGroup = function(request, response){

    console.log('request for group update id:' + request.param('id'));
    console.dir(request.params);
    MarkersGroup.findOneAndUpdate({id: request.param('id')}, { markers: request.param('markers') }, function(err, group){
        if(err){
            console.error(err);
            response.status(500);
            response.send('Did not saved');
        }
        if(group){
            response.send(group);
        }
    });

};
MarkersController.prototype.uploadGroups = function(request, response){
    console.log('request for groups');
    MarkersGroup.find({}, function(err, groups){
        if(err){
            console.error(err);
            response.status(500);
            response.send('Collection not found');
            return false;
        }
        if(groups.length){
            response.send(groups);
        }
    });
    function findCollectionMarkers(collection){
        Marker.find({groupId : collection._id}, function(err, markers){
            if(err){
                return false;
            }
            collection.markers = markers;
            console.dir(markers);

        })
    }
};

MarkersController.prototype.uploadSpecifiedGroup = function (request, response){
    console.log('request specified group');

    var markerGroup = {};
    date = (new Date()).toTimeString();
    console.log(date);

    MarkersGroup.find({'id' : request.param('groupId')}, function(err, group){

        if(err){
            console.error(err);
            response.status(500);
            response.send('Collection not found');
            return false;
        }
        if(group){
            markerGroup = group;
            Marker.find({'groupId' : markerGroup.id}, function(err, markers){
                if(err){
                    console.error(err);
                    response.status(500);
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


MarkersController.prototype.uploadUngroupedMarkers = function(request, response){

    console.log('request for ungrouped markers');

    Marker.find({
        groupId : 'none'
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


MarkersController.prototype.updateMarker = function(request, response){

    console.log(request.param('id'));

};



MarkersController.prototype.saveMarker = function(request, response){

//    console.dir(request.param('longitude'));
//    response.send('ok');
//    return;
    console.log('request save marker');
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
            response.status(500);
            response.send('Did not saved');
            return false;
        }
        if(marker){
//            marker.id = marker._id;
            response.send(marker);
        }

    });

};

MarkersController.prototype.removeMarker = function(request, response){

};
module.exports = MarkersController;
