var mongoose = require('mongoose');

var schema = new mongoose.Schema ({
	title: {type: String, unique: true},
    content: {type: String},
    author: {type: String},
    source: {type: String},
    url: {type: String},
    category: {type: String},
    image: {type: String},
    userVotes: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    count: {type: Number}
});

module.exports = mongoose.model('Post', schema);
