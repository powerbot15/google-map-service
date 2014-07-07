

var MarkersGroup = require('../models/group-model'),
    Marker = require('../models/marker-model.js'),
    formidable = require('formidable'),
    fs = require('fs'),
    gm = require('gm'),
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
    var date = new Date(),
        groupIdToRemove = request.param('id');
    console.log('request remove group '  + date.toDateString() + ' ' + date.toTimeString());
    MarkersGroup.remove({id : groupIdToRemove}, function(err){
        if(!err){
            Marker.find({groupId : groupIdToRemove}, function(err, markers){
                if(err){
                    response.send('no markers in deleted group');
                }
                if(markers){
                    console.dir(markers);
                    for(var i = 0; i < markers.length; i++){
                        if(fs.existsSync('public' + markers[i].imageUrl)){
                            fs.unlinkSync('public' + markers[i].imageUrl);
                        }
                    }
                    Marker.remove({groupId : request.param('id')}, function(err){
                        if(!err) {
                            response.send({answer: 'ok'});
                        }
                        else{
                            response.send({answer: 'failremovemarkers'});
                        }
                    });

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
        date = new Date(),
        markerIsNew,
        updateOptions;

    var form = new formidable.IncomingForm();


    form.parse(request, function(err, fields, files) {
//        console.dir(files['image']);
        markerIsNew = fields['id'] && fields['id'] != 'none' ? false : true;
        if(files['image']){
            if(!markerIsNew){
                Marker.findOne({id : fields['id']}, function(err, marker){
                    if(err){
                        console.dir(err);
                    }
                    if(marker){
                        fs.exists('public' + marker.imageUrl, function(exists){
                            exists ? fs.unlink('public' + marker.imageUrl) : false;
                        });
                    }
                });
            }
            if(!fs.existsSync('public/img/uploaded')){
                fs.mkdirSync('public/img/uploaded', 777);
            }
            gm(files['image'].path).resize(250).write('public/img/uploaded/' + files['image'].name, function(err){
                console.dir(err);
            });

//            fs.readFile(files['image'].path, function(err, data){
//                if(err){
//                    console.dir(err);
//                    return;
//                }
//                if(!fs.existsSync('public/img/uploaded')){
//                    fs.mkdirSync('public/img/uploaded', 777);
//                }
//                fs.writeFile('public/img/uploaded/' + files['image'].name, data, function(err){
//                    if(err){
//                        console.dir(err);
//                    }
//                    else{
//
//                    }
//                })
//            });
        }




    if(fields['id'] && fields['id'] != 'none'){ // ================ update existing marker ===================

        console.log('request update marker ' + fields['id'] + ' ' + date.toDateString() + ' ' + date.toTimeString());
        if(files['image']){
            updateOptions = {
                description : fields['description'],
                groupId : fields['groupId'],
                imageUrl : '/img/uploaded/' + files['image'].name
            }
        }
        else{
            updateOptions = {
                description : fields['description'],
                groupId : fields['groupId']
            }

        }

        Marker.findOneAndUpdate({id : fields['id']}, {
                $set: updateOptions
            },
            function(err, marker){
                if(err){
                    console.error(err);
                    response.status(500);
                    response.send('Did not updated');
                    return false;
                }
                if(marker){
    //                console.dir(marker);
                    response.send(marker);
                }
            });
    }

    else{ // ================ save new marker ==============================

        console.log('request save marker '  + date.toDateString() + ' ' + date.toTimeString());
        newMarker = new Marker({
            name : fields['name'],
            description : fields.description,
            id : undefined,
            groupId: fields.groupId,
            location: {
                latitude : fields.latitude,
                longitude : fields.longitude
            },
            user:'anonymous',
            imageUrl: files['image'].name ? '/img/uploaded/' + files['image'].name : undefined
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
                console.dir(marker);
                response.send(marker);
            }

        });
    }
    });
//    if(request.param('id')){ // ================ update existing marker ===================
//
//        console.log('request update marker ' + request.param('id') + ' ' + date.toDateString() + ' ' + date.toTimeString());
//        console.log(request.param('description'));
//
//        Marker.findOneAndUpdate({id : request.param('id')}, { $set: {description : request.param('description'), groupId : request.param('groupId')}}, function(err, marker){
//            if(err){
//                console.error(err);
//                response.status(500);
//                response.send('Did not updated');
//                return false;
//            }
//            if(marker){
//                console.dir(marker);
//                response.send(marker);
//            }
//        });
//    }
//
//    else{ // ================ save new marker ==============================
//
//        console.log('request save marker '  + date.toDateString() + ' ' + date.toTimeString());
//        newMarker = new Marker({
//            name : request.param('name'),
//            description : request.param('description'),
//            id : undefined,
//            groupId: request.param('groupId'),
//            location: request.param('location'),
//            user:'anonymous'
//        });
//        newMarker.id = newMarker._id;
//        newMarker.save(function(err, marker){
//            if(err){
//                console.error(err);
//                response.status(500);
//                response.send('Did not saved');
//                return false;
//            }
//            if(marker){
////            marker.id = marker._id;
//                response.send(marker);
//            }
//
//        });
//    }

};

MarkersController.prototype.removeMarker = function(request, response){
    var date = new Date();
    console.log('Request remove marker ' + request.param('id') + ' ' + date.toDateString() + ' ' + date.toTimeString());
    Marker.find({id : request.param('id')}, function(err, doc){

        if(doc){
            console.dir(doc);
            if(fs.existsSync('public' + doc[0].imageUrl)){
                console.log('exists');
                fs.unlinkSync('public' + doc[0].imageUrl);
            }

            Marker.remove({id : request.param('id')}, function(err, doc){
                console.log(err + '     ' + doc);
            });
        }
    });
    response.send('ok');
};


MarkersController.prototype.getImageExtension = function(fileName){

    return fileName.match(/\.\w+$/)[0];

};

module.exports = MarkersController;
