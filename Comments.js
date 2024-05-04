var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.connect(process.env.DB);

var CommentSchema = new Schema({
    videoId : { type: mongoose.Schema.Types.ObjectId, ref: 'Video' },
    username : String,
    text : String
});

// return the model
module.exports = mongoose.model('Comment', CommentSchema);