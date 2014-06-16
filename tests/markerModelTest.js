var should = require('should'),
    mongoose = require("mongoose"),
    Marker = require("../models/marker-model");
    //tell Mongoose to use a different DB - created on the fly
    mongoose.connect('mongodb://localhost/models_test');
    var db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function callback () {
        console.log('DB connected');
        describe("Markers", function() {

            var testMarker = new Marker({
                name : "noName",
                description : "test description",
                id : "abcdef123456",
                groupId: "654321fedcba",
                location: {
                    latitude : 44.44444444444,
                    longitude: 22.22222222222
                },
                user: "anonymous"

            });

            it("Saves a new marker", function(done){
                //add some test data
                testMarker.save(
                    function (err, doc) { //callback

                        doc.name.should.equal('noName').and.should.be.string;
                        doc.description.should.equal('test description').and.should.be.string;
                        doc.should.have.property('_id');
                        doc.should.have.property('location');
                        doc.location.latitude.should.equal(44.44444444444).and.should.be.number;
                        doc.location.longitude.should.equal(22.22222222222).and.should.be.number;
                        done();
                    });
            });
        });

    });
