var should = require('should'),
    mongoose = require("mongoose"),
    MarkerGroup = require("../models/group-model");
//tell Mongoose to use a different DB - created on the fly
mongoose.connect('mongodb://localhost/models_test');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
    describe("Markers", function() {

        var testGroup = new MarkerGroup({
            name : "noName",
            id : "abcdef123456",
            user: "anonymous",
            iconUrl: 'http://somepath'

        });

        it("Saves a new group", function(done){
            //add some test data
            testGroup.save(
                function (err, doc) { //callback

                    doc.name.should.equal('noName').and.should.be.string;
                    doc.user.should.equal('anonymous').and.should.be.string;
                    doc.iconUrl.should.equal('http://somepath').and.should.be.string;
                    doc.should.have.property('_id');
                    done();
                });
        });
    });

});

