var mongoose = require('mongoose'),
MarkerGroupSchema = mongoose.Schema({
        name: String,
//        description: String,
        id: String,
        user:String
    }
);
module.exports = mongoose.model('MarkerGroupSchema', MarkerGroupSchema);