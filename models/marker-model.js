var mongoose = require('mongoose'),
    MarkerSchema = mongoose.Schema({
            name: String,
            description: String,
            location: Object,
            user:String
        }
    );
module.exports = mongoose.model('Marker', MarkerSchema);