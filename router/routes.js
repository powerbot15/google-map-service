markersController = new (require('../controllers/markerController'));

module.exports = function router(app){

    app.get('/group/:groupId', markersController.uploadSpecifiedGroup);

    app.get('/groups', markersController.uploadGroups);

    app.get('/markers', markersController.uploadUngroupedMarkers);

    app.post('/marker', markersController.saveMarker);

    app.post('/group', markersController.saveGroup);





};