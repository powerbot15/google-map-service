
var should = require('should'),
    request = require('supertest'),
    express = require('express'),
    app = express(),
    router = require('../router/routes');
    router(app);


describe('GET', function(){

    it('respond with json', function(done){
        request(app)
            .get('/groups')
            .expect('Content-Type', /json/)
            .expect(200, done);
    });

    it('respond with json', function(done){
        request(app)
            .get('/markers')
            .expect('Content-Type', /json/)
            .expect(200, done);
    });

});
