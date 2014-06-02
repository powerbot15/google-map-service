var markersController = require('../controllers/markerController');

module.exports = function router(app){

    app.get('/groups', markersController.uploadGroups);

    app.get('/group/:groupId', markersController.uploadSpecifiedGroup);

    app.get('/markers', markersController.uploadUngroupedMarkers);

    app.post('/marker', markersController.saveMarker);

    app.post('/group', markersController.saveGroup);

};