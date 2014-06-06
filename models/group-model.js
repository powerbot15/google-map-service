var mongoose = require('mongoose'),
MarkerGroup = mongoose.Schema({
        name: String,
//        description: String,
        id: String,
        user:String,
        iconUrl:String,
        markers:Array
    }
);
module.exports = mongoose.model('MarkerGroup', MarkerGroup);