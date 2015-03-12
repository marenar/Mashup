var mongoose = require('mongoose');

var schema = new mongoose.Schema ({
	name: String
});

module.exports.User = mongoose.model('User', schema);
