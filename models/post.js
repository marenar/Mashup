var mongoose = require('mongoose');

var schema = new mongoose.Schema ({
	name: {type: String, required: true },
    content: {type: String, required: true },
    upvoteUsers: {[type: mongoose.Schema.Types.ObjectId, ref: 'User']},
    downvoteUsers: {[type: mongoose.Schema.Types.ObjectId, ref: 'User']}
});

module.exports.User = mongoose.model('Post', schema);
