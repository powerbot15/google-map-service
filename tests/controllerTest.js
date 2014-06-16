var should = require('should'),
    express = require('express'),
    app = express(),
    Controller = require('../controllers/markerController');
    controller = new Controller();

describe('Controller', function(){

    it('Should be property saveMarker in controller object', function(){
        controller.should.have.property('saveMarker').and.should.be.a.function;
    });

    it('Should be property saveGroup in controller object', function(){
        controller.should.have.property('saveGroup').and.should.be.a.function;
    });

    it('Should be property removeGroup in controller object', function(){
        controller.should.have.property('removeGroup').and.should.be.a.function;
    });
    it('Should be property saveMarker in controller object', function(){
        controller.should.have.property('saveMarker').and.should.be.a.function;
    });
    it('Should be property removeMarker in controller object', function(){
        controller.should.have.property('removeMarker').and.should.be.a.function;
    });
    it('Should be property updateGroup in controller object', function(){
        controller.should.have.property('updateGroup').and.should.be.a.function;
    });

});
