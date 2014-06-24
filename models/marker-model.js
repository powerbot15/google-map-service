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
            user:String,
            imageUrl: String
        }
    );
module.exports = mongoose.model('Marker', MarkerSchema);