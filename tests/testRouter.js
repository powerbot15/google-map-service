
var should = require('should'),
    express = require('express'),
    app = express(),
    router = require('../router/routes');
    router(app);
//    app = require('../app');

describe('app', function(){
    it('Router should be a function', function () {
//        (5).should.be.exactly(5).and.be.a.Number;
        router.should.be.a.function;
    });

});
