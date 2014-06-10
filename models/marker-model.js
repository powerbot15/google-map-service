var mongoose = require('mongoose'),
    MarkerSchema = mongoose.Schema({
            name: String,
            description: String,
            id: String,
            groupId: String,
            location: {
                latitude : Number,
                longitude : Number
            },
            user:String
        }
    );
module.exports = mongoose.model('Marker', MarkerSchema);