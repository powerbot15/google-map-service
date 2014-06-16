var mongoose = require('mongoose'),
MarkerGroup = mongoose.Schema({
        name: String,
        id: String,
        user:String,
        iconUrl:String
    }
);
module.exports = mongoose.model('MarkerGroup', MarkerGroup);