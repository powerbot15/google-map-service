var mongoose = require('mongoose'),
    MarkerSchema = mongoose.Schema({
            name: String,
            description: String,
            id: String,
            groupId: String,
            location: Object,
            user:String
        }
    );
module.exports = mongoose.model('Marker', MarkerSchema);