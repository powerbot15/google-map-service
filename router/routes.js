var MarkersController = require('../controllers/markerController'),
    markersController = new MarkersController();

module.exports = function router(app){

    app.get('/groups', markersController.uploadGroups);

    app.get('/group/:groupId', markersController.uploadSpecifiedGroup);

    app.get('/markers', markersController.uploadMarkers);

    app.post('/marker', markersController.saveMarker);

    app.post('/group', markersController.saveGroup);

    app.post('/file', markersController.getFile);

    app.put('/group/:id', markersController.updateGroup);

    app.delete('/group/:id', markersController.removeGroup);

    app.delete('/markers/:id', markersController.removeMarker);

};