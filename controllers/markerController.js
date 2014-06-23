

var MarkersGroup = require('../models/group-model'),
    Marker = require('../models/marker-model.js'),
    formidable = require('formidable'),
    fs = require('fs'),
    date;

var MarkersController = function(){
    console.log('new controller created');
};

MarkersController.prototype.getFile = function(request, responce){

    var form = new formidable.IncomingForm();

    form.parse(request, function(err, fields, files) {
        console.dir(files['file0']);
        fs.readFile(files['file0'].path, function(err, data){
            if(err){
                console.dir(err);
                responce.send('error');
                return;
            }
            fs.writeFile('public/img/uploaded/' + files['file0'].name, data, function(err){
                if(err){
                    console.dir(err);
                    responce.send('fail');
                }
                responce.send({src : '/img/uploaded/' + files['file0'].name});
            })
        });

    });



};

MarkersController.prototype.saveGroup = function(request, response){
    var date = new Date();
    console.log(request.param('id'));

    if(request.param('id') != 0){
        console.log('update group id:' + request.param('id') +  ' request ' + date.toDateString() + ' ' + date.toTimeString());
        MarkersGroup.findOneAndUpdate({id : request.param('id')}, { $set: {name : request.param('name'), iconUrl : request.param('iconUrl')}}, function(err, group){
            if(err){
                console.error(err);
                response.status(500);
                response.send('Did not updated');
                return false;
            }
            if(group){
                response.send(group);
            }
        });
    }
    else{
        console.log('save group request ' + date.toDateString() + ' ' + date.toTimeString());
        var newGroup = new MarkersGroup({
            name : request.param('name'),
            id : 0,
            user:'anonymous',
            iconUrl: request.param('iconUrl')
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
                response.send(group);
            }

        });
    }

};

MarkersController.prototype.removeGroup = function(request, response){
    var date = new Date();
    console.log('request remove group '  + date.toDateString() + ' ' + date.toTimeString());
    MarkersGroup.remove({id : request.param('id')}, function(err){
        if(!err){
            Marker.remove({groupId : request.param('id')}, function(err){
                if(!err) {
                    response.send({answer: 'ok'});
                }
                else{
                    response.send({answer: 'failremovemarkers'});
                }
            });

        }
        else{
            response.send({answer: 'failremovegroup'});
        }
    });
};

MarkersController.prototype.updateGroup = function(request, response){
    var date = new Date();
    console.log('request for group update id:' + request.param('id') + ' ' + date.toDateString() + ' ' + date.toTimeString());
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
    var date = new Date();
    console.log('request for groups '  + date.toDateString() + ' ' + date.toTimeString());
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
        else{
            response.send([]);
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
    var date = new Date();
    console.log('request specified group '  + date.toDateString() + ' ' + date.toTimeString());

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


MarkersController.prototype.uploadMarkers = function(request, response){
    var date = new Date();

    console.log('request for ungrouped markers '  + date.toDateString() + ' ' + date.toTimeString());

    Marker.find({}, function(err, markers){
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

    var newMarker,
        date = new Date();


    if(request.param('id')){ // ================ update existing marker ===================

        console.log('request update marker ' + request.param('id') + ' ' + date.toDateString() + ' ' + date.toTimeString());
        console.log(request.param('description'));

        Marker.findOneAndUpdate({id : request.param('id')}, { $set: {description : request.param('description'), groupId : request.param('groupId')}}, function(err, marker){
            if(err){
                console.error(err);
                response.status(500);
                response.send('Did not updated');
                return false;
            }
            if(marker){
                console.dir(marker);
                response.send(marker);
            }
        });
    }

    else{ // ================ save new marker ==============================

        console.log('request save marker '  + date.toDateString() + ' ' + date.toTimeString());
        newMarker = new Marker({
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
    }

};

MarkersController.prototype.removeMarker = function(request, response){
    var date = new Date();
    console.log('Request remove marker ' + request.param('id') + ' ' + date.toDateString() + ' ' + date.toTimeString());
    Marker.remove({id : request.param('id')}, function(err, doc){
        console.log(err + '     ' + doc);
    });
    response.send('ok');
};
module.exports = MarkersController;
