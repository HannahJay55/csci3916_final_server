var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.connect(process.env.DB);

// Review schema
var VideoSchema = new Schema({
    url: String,
    channel: String,
    description: String,
    song: String,
    likes: Number,
    shares: Number,
    messages: Number
});

// return the model
module.exports = mongoose.model('Video', VideoSchema);